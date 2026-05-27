import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { OAuth2Client } from "google-auth-library";

export class GoogleTokenVerifyService {
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

  // Google OAuth - Verify token (for frontend direct authentication)
  googleTokenVerify = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 Google Token Verification Started');
      console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
      
      await this.ensureDbReady();
      const { idToken } = req.body;

      if (!idToken) {
        console.log('❌ ID token is missing');
        return (res as any).error("ID token is required", HttpStatusCode.BAD_REQUEST);
      }

      console.log('🔍 ID token received:', idToken.substring(0, 50) + '...');

      // Verify the ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return (res as any).error("Invalid ID token", HttpStatusCode.BAD_REQUEST);
      }

      // Log the complete Google payload for debugging
      console.log('🔍 Google Token Verification Payload:', JSON.stringify(payload, null, 2));

      const googleUser = {
        email: payload.email!,
        first_name: payload.given_name || '',
        last_name: payload.family_name || '',
        google_id: payload.sub,
        profile_picture: payload.picture || '',
      };

      // Log the processed Google user data
      console.log('🔍 Processed Google User Data (Token Verify):', JSON.stringify(googleUser, null, 2));

      // Check if user already exists
      let user = await this.model.findOne({ where: { email: googleUser.email } });
      let isNewUser = false;
      let needsProfileCompletion = false;

      if (user) {
        console.log('🔍 Existing user found (Token Verify):', {
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
          console.log('🔍 User needs profile completion - missing required fields (Token Verify)');
        }

        // Update existing user with Google info if needed
        if (user.auth_provider === 'Email') {
          console.log('🔍 Updating Email user to Google provider (Token Verify)');
          await this.model.update(
            { 
              auth_provider: 'Google',
              first_name: user.first_name || googleUser.first_name,
              last_name: user.last_name || googleUser.last_name,
              email_verified: 1, // Google accounts are pre-verified
            },
            { where: { id: user.id } }
          );
          const refreshedUser = await this.model.findByPk(user.id);
          if (refreshedUser) {
            user = refreshedUser;
          }
        } else if (user.auth_provider === 'Google') {
          console.log('🔍 Existing Google user - updating profile info if needed (Token Verify)');
          // Update Google user info if we have better data
          await this.model.update(
            {
              first_name: user.first_name || googleUser.first_name,
              last_name: user.last_name || googleUser.last_name,
            },
            { where: { id: user.id } }
          );
          const refreshedUser = await this.model.findByPk(user.id);
          if (refreshedUser) {
            user = refreshedUser;
          }
        }
      } else {
        console.log('🔍 New user - creating with Google info (Token Verify)');
        isNewUser = true;
        needsProfileCompletion = true;
        
        // Create new user with Google info
        user = await this.model.create({
          email: googleUser.email,
          first_name: googleUser.first_name,
          last_name: googleUser.last_name,
          auth_provider: 'Google',
          email_verified: 1, // Google accounts are pre-verified
          password: randomstring.generate(32), // Generate random password for Google users
        });
      }

      if (!user) {
        return (res as any).error("Failed to create or update user", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      // Log the final user data from database
      console.log('🔍 Final User Data from Database (Token Verify):', JSON.stringify({
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

      // Log the response being sent
      const responseData = {
        status: true,
        message: "Google authentication successful",
        data: userResponse,
        token,
        needsProfileCompletion,
        isNewUser
      };
      console.log('🔍 Token Verification Response:', JSON.stringify(responseData, null, 2));

      // For direct token verification, return JSON response (used by frontend API calls)
      res.json(responseData);
    } catch (error: any) {
      console.error('Google token verification error:', error);
      return (res as any).error(error.message || 'Google authentication failed', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
