import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail, { createOTPEmailTemplate } from "../utils";
import randomstring from "randomstring";
import db, { sequelizePromise } from "../utils/database"; // Import the initialized database
import { HttpStatusCode } from "../utils/httpStatusCode";
export default class AuthController {
  private model = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { email } = req.body;
      // Check if user already exists
      const existingUser = await this.model.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          status: false,
          message: "User with this email already exists"
        });
        return;
      }

      // Create new user
      const newUser = await this.model.create(req.body);
      const emailToken = randomstring.generate({
        length: 6,
        charset: "numeric", // only numbers
      });

      await db.UserVerification.create({
        user_id: newUser.id,
        token: emailToken,
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour expiry
        type: "email"
      });
      let mailSubject = "Verification - Invest App";
      let content = createOTPEmailTemplate(newUser.email, emailToken);
      await sendMail(newUser.email, mailSubject, content);

      // Generate JWT token
      const payload = { user_id: newUser.id, role: newUser.role };
      const tokenSecret = process.env.TOKEN_SECRET;
      if (!tokenSecret) {
        res.status(500).json({ status: false, message: "Server misconfigured: TOKEN_SECRET is missing" });
        return;
      }
      const token = jwt.sign(payload, tokenSecret, { expiresIn: "365d" });

      // Remove password from response
      const userResponse = { ...newUser.toJSON() } as any;
      delete userResponse.password;

      res.status(200).json({
        status: true,
        message: "User registered successfully",
        data: userResponse,
        token,
      });
    } catch (error: any) {
      return res.error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);

    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { email, password } = req.body;

      const user = await this.model.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({ status: false, message: "User Not Exist" });
        return;
      }

      if (user.email_verified !== 1) {
      res.status(403).json({
      status: false,
      message: "Please verify your email before logging in",
       });
       return;
     }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ status: false, message: "Incorrect Password!" });
        return;
      }

      const payload = { user_id: user.id, role: user.role };
      const tokenSecret = process.env.TOKEN_SECRET;
      if (!tokenSecret) {
        res.status(500).json({ status: false, message: "Server misconfigured: TOKEN_SECRET is missing" });
        return;
      }
      const token = jwt.sign(payload, tokenSecret, { expiresIn: "365d" });

      res.json({
        status: true,
        message: "User logged in successfully",
        data: user,
        token,
      });
    } catch (error: any) {
      return res.error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { email, code } = req.body;
      // find user by email
      const user = await this.model.findOne({ where: { email } });
      if (!user) {
        return res.error("User not found", HttpStatusCode.NOT_FOUND);
      }

      // Check token in DB
      const record = await db.UserVerification.findOne({
        where: { token: code, user_id: user.id },
      });
      if (!record || record.expires_at < new Date()) {
        return res.error("Invalid or expired token", HttpStatusCode.NOT_FOUND);
      }

      // Update user email_verified = 1
      await this.model.update(
        { email_verified: 1 },
        { where: { id: record.user_id } }
      );

      // Delete code after verification
      await db.UserVerification.destroy({
        where: { token: code, user_id: user.id },
      });
      return res.success("Email verified successfully");
    } catch (error: any) {
      return res.error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  completeProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Debug logging for complete profile endpoint
      console.log('🔍 Complete Profile - Received headers:', req.headers);
      console.log('🔍 Authorization header:', req.headers.authorization);
      console.log('🔍 Request body:', req.body);
      
      // Get user ID from the authenticated token
      const userId = req.user?.user_id;
      console.log('🔍 User ID from token:', userId);
      
      if (!userId) {
        res.status(401).json({
          status: false,
          error: {
            code: 401,
            message: "User not authenticated",
            details: "No valid user ID found in token"
          }
        });
        return;
      }

      const { first_name, last_name, email, phone, source } = req.body;
      console.log('🔍 Profile data received:', { first_name, last_name, email, phone, source });

      // Find the user by ID
      const user = await this.model.findByPk(userId);
      if (!user) {
        res.status(404).json({
          status: false,
          error: {
            code: 404,
            message: "User not found",
            details: `No user found with ID: ${userId}`
          }
        });
        return;
      }

      // Check if user's email is verified
      if (user.email_verified !== 1) {
        res.status(403).json({
          status: false,
          error: {
            code: 403,
            message: "Email verification required",
            details: "Please verify your email before completing your profile"
          }
        });
        return;
      }

      // Update user profile with the provided information
      await this.model.update(
        {
          first_name,
          last_name,
          email,
          phone,
          // Note: source is not a field in the User model, so we'll skip it
          // If you need to store source, you might want to add it to the User model
        },
        { where: { id: userId } }
      );

      // Get the updated user data
      const updatedUser = await this.model.findByPk(userId);
      if (!updatedUser) {
        res.status(500).json({
          status: false,
          error: {
            code: 500,
            message: "Failed to retrieve updated user data",
            details: "Database error occurred while fetching updated user information"
          }
        });
        return;
      }

      // Remove password from response
      const userResponse = { ...updatedUser.toJSON() } as any;
      delete userResponse.password;

      console.log('✅ Profile completed successfully for user:', userId);
      return res.success(`Welcome ${first_name} ${last_name}! Your profile has been completed successfully.`, userResponse);
    } catch (error: any) {
      console.log('❌ Complete profile error:', error.message);
      res.status(500).json({
        status: false,
        error: {
          code: 500,
          message: "Internal server error",
          details: error.message || 'An unexpected error occurred'
        }
      });
      return;
    }
  };
}
