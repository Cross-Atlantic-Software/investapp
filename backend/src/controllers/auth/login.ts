import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";

export class LoginService {
  private model = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

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
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
