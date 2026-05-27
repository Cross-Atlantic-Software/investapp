import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db, { sequelizePromise } from "../../utils/database";

export class CompleteProfileService {
  private model = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  completeProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Debug logging for complete profile endpoint
      console.log('🔍 Complete Profile - Received headers:', req.headers);
      console.log('🔍 Authorization header:', req.headers.authorization);
      console.log('🔍 Request body:', req.body);
      
      // Get user ID from the authenticated token
      const userId = (req as any).user?.user_id;
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

      // Generate a new JWT token for the user
      const jwtPayload = { user_id: updatedUser.id, role: updatedUser.role };
      const tokenSecret = process.env.TOKEN_SECRET;
      if (!tokenSecret) {
        res.status(500).json({
          status: false,
          error: {
            code: 500,
            message: "Server misconfigured: TOKEN_SECRET is missing",
            details: "Authentication token generation failed"
          }
        });
        return;
      }
      const token = jwt.sign(jwtPayload, tokenSecret, { expiresIn: "365d" });

      // Remove password from response
      const userResponse = { ...updatedUser.toJSON() } as any;
      delete userResponse.password;

      console.log('✅ Profile completed successfully for user:', userId);
      console.log('🔍 Generated new token for user:', userId);
      
      // Return success response with user data and token
      res.json({
        status: true,
        message: `Welcome ${first_name} ${last_name}! Your profile has been completed successfully.`,
        data: userResponse,
        token: token
      });
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
