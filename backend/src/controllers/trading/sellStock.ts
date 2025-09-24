import { Request, Response } from "express";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import sendMail from "../../utils";
import { EmailTemplateService } from "../../utils/emailTemplateService";

export class SellStockService {
  private userModel = db.User;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  sellStock = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Get user from JWT token (set by middleware)
      const userId = (req.user as any)?.user_id;
      if (!userId) {
        return (res as any).error("User not authenticated", HttpStatusCode.UNAUTHORIZED);
      }

      const { companyName, quantity, sellingPrice, totalAmount, message } = req.body;

      // Validate required fields
      if (!companyName || !quantity || !sellingPrice || !totalAmount) {
        return (res as any).error("Missing required fields", HttpStatusCode.BAD_REQUEST);
      }

      // Get user details
      const user = await this.userModel.findByPk(parseInt(userId));
      if (!user) {
        return (res as any).error("User not found", HttpStatusCode.NOT_FOUND);
      }

      // Send confirmation email
      try {
        const emailTemplate = await EmailTemplateService.getSellConfirmationEmail(
          user.email,
          companyName,
          quantity,
          sellingPrice,
          totalAmount,
          message
        );
        
        if (emailTemplate) {
          await sendMail(user.email, emailTemplate.subject, emailTemplate.body);
          console.log(`Sell confirmation email sent to: ${user.email}`);
        } else {
          console.error("Sell confirmation email template not found");
        }
      } catch (emailError) {
        console.error("Failed to send sell confirmation email:", emailError);
        // Don't fail the transaction if email fails
      }

      // Here you would typically save the transaction to database
      // For now, we'll just return success
      
      res.status(200).json({
        status: true,
        message: "Sell order placed successfully",
        data: {
          companyName,
          quantity,
          sellingPrice,
          totalAmount,
          message,
          userEmail: user.email
        }
      });
    } catch (error: any) {
      console.error("Sell stock error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
