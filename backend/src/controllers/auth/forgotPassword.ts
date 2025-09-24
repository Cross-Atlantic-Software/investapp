import { Request, Response } from "express";
import randomstring from "randomstring";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import sendMail from "../../utils/index";
import { EmailTemplateService } from "../../utils/emailTemplateService";

export class ForgotPasswordService {
  private userModel = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { email } = req.body;

      if (!email) {
        return (res as any).error("Email is required", HttpStatusCode.BAD_REQUEST);
      }

      // Check if user exists
      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        // For security, don't reveal if email exists or not
        res.status(200).json({
          status: true,
          message: "If the email exists, a password reset link has been sent"
        });
        return;
      }

      // Generate reset token
      const resetToken = randomstring.generate({
        length: 32,
        charset: "alphanumeric"
      });

      // Store reset token in database (expires in 30 minutes)
      await db.UserVerification.create({
        user_id: user.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        type: "password_reset"
      });

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      // Send password reset email
      try {
        const emailTemplate = await EmailTemplateService.getPasswordResetEmail(
          user.email,
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
          resetLink
        );
        
        if (emailTemplate) {
          await sendMail(user.email, emailTemplate.subject, emailTemplate.body);
          console.log(`Password reset email sent to: ${user.email}`);
        } else {
          // Fallback email
          await sendMail(
            user.email, 
            "Password Reset Request - Invest App",
            `Hello ${user.first_name || user.email.split('@')[0]},\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this password reset, please ignore this email.`
          );
          console.log(`Password reset email sent to: ${user.email} (fallback template)`);
        }
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return (res as any).error("Failed to send password reset email", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      res.status(200).json({
        status: true,
        message: "If the email exists, a password reset link has been sent"
      });

    } catch (error: any) {
      console.error("Forgot password error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
