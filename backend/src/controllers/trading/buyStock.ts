import { Request, Response } from "express";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { createBuyConfirmationEmailTemplate, createSuperAdminNotificationTemplate } from "../../utils";
import sendMail from "../../utils";

export class BuyStockService {
  private userModel = db.User;
  private cmsUserModel = db.CmsUser;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  buyStock = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Get user from JWT token (set by middleware)
      const userId = (req.user as any)?.user_id;
      if (!userId) {
        return (res as any).error("User not authenticated", HttpStatusCode.UNAUTHORIZED);
      }

      const { companyName, quantity, price, totalAmount } = req.body;

      // Validate required fields
      if (!companyName || !quantity || !price || !totalAmount) {
        return (res as any).error("Missing required fields", HttpStatusCode.BAD_REQUEST);
      }

      // Get user details
      const user = await this.userModel.findByPk(parseInt(userId));
      if (!user) {
        return (res as any).error("User not found", HttpStatusCode.NOT_FOUND);
      }

      // Send confirmation email
      try {
        const emailSubject = `Buy Order Confirmed - ${companyName}`;
        const emailContent = createBuyConfirmationEmailTemplate(
          user.email,
          companyName,
          quantity,
          price,
          totalAmount
        );
        
        await sendMail(user.email, emailSubject, emailContent);
        console.log(`Buy confirmation email sent to: ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send buy confirmation email:", emailError);
        // Don't fail the transaction if email fails
      }

      // Send notification to super admin (CMS user with id=3)
      try {
        const superAdmin = await this.cmsUserModel.findByPk(3);
        if (superAdmin) {
          const adminEmailSubject = `New Stock Purchase - ${companyName}`;
          const adminEmailContent = createSuperAdminNotificationTemplate(
            user.email,
            `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
            companyName,
            quantity,
            price,
            totalAmount
          );
          
          await sendMail(superAdmin.email, adminEmailSubject, adminEmailContent);
          console.log(`Super admin notification sent to: ${superAdmin.email}`);
        } else {
          console.warn("Super admin (CMS user id=2) not found");
        }
      } catch (adminEmailError) {
        console.error("Failed to send super admin notification:", adminEmailError);
        // Don't fail the transaction if admin email fails
      }

      // Here you would typically save the transaction to database
      // For now, we'll just return success
      
      res.status(200).json({
        status: true,
        message: "Buy order placed successfully",
        data: {
          companyName,
          quantity,
          price,
          totalAmount,
          userEmail: user.email
        }
      });
    } catch (error: any) {
      console.error("Buy stock error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
