import { Request, Response } from "express";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import sendMail from "../../utils";
import { EmailTemplateService } from "../../utils/emailTemplateService";

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
        const emailTemplate = await EmailTemplateService.getBuyConfirmationEmail(
          user.email,
          companyName,
          quantity,
          price,
          totalAmount
        );
        
        if (emailTemplate) {
          await sendMail(user.email, emailTemplate.subject, emailTemplate.body);
          console.log(`Buy confirmation email sent to: ${user.email}`);
        } else {
          console.error("Buy confirmation email template not found");
        }
      } catch (emailError) {
        console.error("Failed to send buy confirmation email:", emailError);
        // Don't fail the transaction if email fails
      }

      // Send notification to super admin (CMS user with id=1)
      try {
        const superAdmin = await this.cmsUserModel.findByPk(1);
        if (superAdmin) {
          const adminEmailTemplate = await EmailTemplateService.getAdminPurchaseNotificationEmail(
            user.email,
            `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
            companyName,
            quantity,
            price,
            totalAmount
          );
          
          if (adminEmailTemplate) {
            await sendMail(superAdmin.email, adminEmailTemplate.subject, adminEmailTemplate.body);
            console.log(`Super admin notification sent to: ${superAdmin.email}`);
          } else {
            console.error("Admin purchase notification template not found");
          }
        } else {
          console.warn("Super admin (CMS user id=1) not found");
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
