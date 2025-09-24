import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";

export class ResetPasswordService {
  private userModel = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return (res as any).error("Token and new password are required", HttpStatusCode.BAD_REQUEST);
      }

      if (newPassword.length < 6) {
        return (res as any).error("Password must be at least 6 characters long", HttpStatusCode.BAD_REQUEST);
      }

      // Find valid reset token
      const resetRecord = await db.UserVerification.findOne({
        where: {
          token,
          type: "password_reset",
          expires_at: {
            [Op.gt]: new Date() // Token not expired
          }
        }
      });

      if (!resetRecord) {
        return (res as any).error("Invalid or expired reset token", HttpStatusCode.BAD_REQUEST);
      }

      // Find user
      const user = await this.userModel.findByPk(resetRecord.user_id);
      if (!user) {
        return (res as any).error("User not found", HttpStatusCode.NOT_FOUND);
      }

      // Update user password (User model will hash it automatically via beforeUpdate hook)
      await user.update({ password: newPassword });
      console.log('Password updated for user:', user.email);

      // Verify the password was saved correctly
      const updatedUser = await this.userModel.findByPk(resetRecord.user_id);
      if (updatedUser) {
        const isPasswordCorrect = await bcrypt.compare(newPassword, updatedUser.password);
        console.log('Password verification after update:', isPasswordCorrect);
      } else {
        console.log('Error: Could not find updated user');
      }

      // Delete the used reset token
      await resetRecord.destroy();

      res.status(200).json({
        status: true,
        message: "Password has been reset successfully"
      });

    } catch (error: any) {
      console.error("Reset password error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
