import { Request, Response } from "express";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";

export class VerifyEmailService {
  private model = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { email, code } = req.body;
      
      // find user by email
      const user = await this.model.findOne({ where: { email } });
      if (!user) {
        return (res as any).error("User not found", HttpStatusCode.NOT_FOUND);
      }

      // Check token in DB
      const record = await db.UserVerification.findOne({
        where: { token: code, user_id: user.id },
      });
      if (!record || record.expires_at < new Date()) {
        return (res as any).error("Invalid or expired token", HttpStatusCode.NOT_FOUND);
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
      
      return (res as any).success("Email verified successfully");
    } catch (error: any) {
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
