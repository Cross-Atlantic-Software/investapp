import { Request, Response } from "express";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { OAuth2Client } from "google-auth-library";

export class GoogleAuthService {
  private googleClient: OAuth2Client;
  
  constructor() {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Google OAuth - Initiate authentication
  googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ];

      const authUrl = this.googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: req.query.state as string || 'default',
      });

      res.json({
        status: true,
        message: "Google OAuth URL generated successfully",
        authUrl,
      });
    } catch (error: any) {
      return (res as any).error(error.message || 'Failed to generate Google OAuth URL', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
