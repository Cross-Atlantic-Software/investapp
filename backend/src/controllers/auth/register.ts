import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import sendMail, { createOTPEmailTemplate } from "../../utils";

export class RegisterService {
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
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
