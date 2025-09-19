import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { OAuth2Client } from "google-auth-library";

export class GoogleCallbackService {
  private model = db.User;
  private googleClient: OAuth2Client;
  
  constructor() {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  // Google OAuth - Handle callback
  googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 Google OAuth Callback Started');
      console.log('🔍 Query parameters:', JSON.stringify(req.query, null, 2));
      
      await this.ensureDbReady();
      const { code } = req.query;

      if (!code) {
        console.log('❌ Authorization code is missing');
        return (res as any).error("Authorization code is missing", HttpStatusCode.BAD_REQUEST);
      }

      console.log('🔍 Authorization code received:', code);

      // Exchange code for tokens
      const { tokens } = await this.googleClient.getToken(code as string);
      this.googleClient.setCredentials(tokens);

      // Get user info from Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return (res as any).error("Failed to get user information from Google", HttpStatusCode.BAD_REQUEST);
      }

      // Log the complete Google payload for debugging
      console.log('🔍 Google OAuth Payload:', JSON.stringify(payload, null, 2));

      const googleUser = {
        email: payload.email!,
        first_name: payload.given_name || '',
        last_name: payload.family_name || '',
        google_id: payload.sub,
        profile_picture: payload.picture || '',
        phone: '', // Phone number not available from Google OAuth
      };

      // Log the processed Google user data
      console.log('🔍 Processed Google User Data:', JSON.stringify(googleUser, null, 2));

      // Check if user already exists
      let user = await this.model.findOne({ where: { email: googleUser.email } });
      let isNewUser = false;
      let needsProfileCompletion = false;

      if (user) {
        console.log('🔍 Existing user found:', {
          id: user.id,
          email: user.email,
          auth_provider: user.auth_provider,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone
        });

        // Check if user needs profile completion
        if (!user.first_name || !user.last_name || !user.phone) {
          needsProfileCompletion = true;
          console.log('🔍 User needs profile completion - missing required fields');
        }

        // Update existing user with Google info if needed
        if (user.auth_provider === 'Email') {
          console.log('🔍 Updating Email user to Google provider');
          await this.model.update(
            { 
              auth_provider: 'Google',
              first_name: user.first_name || googleUser.first_name,
              last_name: user.last_name || googleUser.last_name,
              phone: user.phone || googleUser.phone,
              email_verified: 1, // Google accounts are pre-verified
            },
            { where: { id: user.id } }
          );
          const refreshedUser = await this.model.findByPk(user.id);
          if (refreshedUser) {
            user = refreshedUser;
          }
        } else if (user.auth_provider === 'Google') {
          console.log('🔍 Existing Google user - updating profile info if needed');
          // Update Google user info if we have better data
          await this.model.update(
            {
              first_name: user.first_name || googleUser.first_name,
              last_name: user.last_name || googleUser.last_name,
              phone: user.phone || googleUser.phone,
            },
            { where: { id: user.id } }
          );
          const refreshedUser = await this.model.findByPk(user.id);
          if (refreshedUser) {
            user = refreshedUser;
          }
        }
      } else {
        console.log('🔍 New user - creating with Google info');
        isNewUser = true;
        needsProfileCompletion = true;
        
        // Create new user with Google info
        user = await this.model.create({
          email: googleUser.email,
          first_name: googleUser.first_name,
          last_name: googleUser.last_name,
          phone: '', // Phone number will be collected in step-3
          auth_provider: 'Google',
          email_verified: 1, // Google accounts are pre-verified
          password: randomstring.generate(32), // Generate random password for Google users
        });
      }

      if (!user) {
        return (res as any).error("Failed to create or update user", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      // Log the final user data from database
      console.log('🔍 Final User Data from Database:', JSON.stringify({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        auth_provider: user.auth_provider,
        email_verified: user.email_verified
      }, null, 2));

      // Generate JWT token
      const jwtPayload = { user_id: user.id, role: user.role };
      const tokenSecret = process.env.TOKEN_SECRET;
      if (!tokenSecret) {
        return (res as any).error("Server misconfigured: TOKEN_SECRET is missing", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }
      const token = jwt.sign(jwtPayload, tokenSecret, { expiresIn: "365d" });

      // Remove password from response
      const userResponse = { ...user.toJSON() } as any;
      delete userResponse.password;

      // Redirect to step-3 with pre-filled user data
      const userData = {
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        phone: user.phone || '',
        token: token
      };

      // Determine redirect based on user status
      let frontendUrl;
      
      if (needsProfileCompletion) {
        // User needs to complete profile - redirect to step-3
        console.log('🔍 User needs profile completion - redirecting to step-3');
        console.log('🔍 Data being sent to frontend:', JSON.stringify({
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          token: '[REDACTED]'
        }, null, 2));
        frontendUrl = `http://localhost:3000/register/step-3?data=${encodeURIComponent(JSON.stringify(userData))}`;
      } else {
        // User has complete profile - redirect to dashboard
        console.log('🔍 User has complete profile - redirecting to dashboard');
        console.log('🔍 User data for dashboard:', JSON.stringify({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          token: '[REDACTED]'
        }, null, 2));
        frontendUrl = `http://localhost:3000/login/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }))}`;
      }
      
      console.log('🔍 Redirecting to:', frontendUrl);
      res.redirect(frontendUrl);
    } catch (error: any) {
      console.error('Google OAuth callback error:', error);
      // Redirect to frontend with error
      const frontendUrl = `http://localhost:3000/login/auth/google/error?message=${encodeURIComponent(error.message || 'Authentication failed')}`;
      res.redirect(frontendUrl);
    }
  };
}
