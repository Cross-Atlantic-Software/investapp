import { Request, Response } from "express";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import sendMail from "../../utils";
import { EmailTemplateService } from "../../utils/emailTemplateService";
import { BuyRequest } from "../../Models/BuyRequest";
import Product from "../../Models/Product";
import { Op } from "sequelize";

export class BuyStockService {
  private userModel = db.User;
  private cmsUserModel = db.CmsUser;
  
  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  buyStock = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 Backend buyStock controller called');
      await this.ensureDbReady();
      
      // Get user from JWT token (set by middleware)
      const userId = (req.user as any)?.user_id;
      console.log('🔍 User ID from token:', userId, 'Type:', typeof userId);
      
      if (!userId) {
        return (res as any).error("User not authenticated", HttpStatusCode.UNAUTHORIZED);
      }

      const { companyName, quantity, price, totalAmount } = req.body;

      // Validate required fields
      if (!companyName || !quantity || !price || !totalAmount) {
        return (res as any).error("Missing required fields", HttpStatusCode.BAD_REQUEST);
      }

      // Get user details - try both string and number
      console.log('🔍 Searching for user with ID:', userId, 'as integer:', parseInt(userId));
      let user = await this.userModel.findByPk(parseInt(userId));
      if (!user) {
        console.log('🔍 User not found with parseInt, trying with string ID');
        user = await this.userModel.findByPk(userId);
      }
      
      if (!user) {
        console.log('❌ User not found in database with ID:', userId);
        // Let's check if there are any users in the database
        const allUsers = await this.userModel.findAll({ limit: 5 });
        console.log('🔍 Available users in database:', allUsers.map(u => ({ id: u.id, email: u.email })));
        return (res as any).error("User not found", HttpStatusCode.NOT_FOUND);
      }
      
      console.log('✅ User found:', user.email);

      // Add buy request to the buy_requests table
      try {
        // Find the stock/product by company name
        const stock = await Product.findOne({
          where: {
            company_name: companyName
          }
        });

        if (!stock) {
          console.error('❌ Stock not found for company:', companyName);
          return (res as any).error("Stock not found", HttpStatusCode.NOT_FOUND);
        }

        // Check if user already has a buy request for this stock
        const existingBuyRequest = await BuyRequest.findOne({
          where: {
            user_id: parseInt(userId),
            stock_id: stock.id
          }
        });

        if (existingBuyRequest) {
          // Update existing buy request by adding new quantity
          const newQuantity = existingBuyRequest.quantity + quantity;
          const newTotalAmount = existingBuyRequest.total_amount + totalAmount;
          
          await existingBuyRequest.update({
            quantity: newQuantity,
            total_amount: newTotalAmount,
            price: price // Update to latest price
          });
          
          console.log(`✅ Updated existing buy request: ${existingBuyRequest.quantity} -> ${newQuantity} shares`);
        } else {
          // Create new buy request record
          await BuyRequest.create({
            user_id: parseInt(userId),
            stock_id: stock.id,
            stock_name: companyName,
            quantity: quantity,
            price: price,
            total_amount: totalAmount
          });
          
          console.log('✅ Created new buy request record');
        }
        
        console.log('✅ Buy request saved to buy_requests table');
        
        // Refresh user's portfolio after buy order
        try {
          await this.refreshUserPortfolio(parseInt(userId));
          console.log('✅ User portfolio refreshed after buy order');
        } catch (portfolioError) {
          console.error('❌ Failed to refresh user portfolio:', portfolioError);
          // Don't fail the transaction if portfolio refresh fails
        }
      } catch (buyRequestError) {
        console.error('❌ Failed to save buy request:', buyRequestError);
        // Don't fail the transaction if buy request save fails
      }

      // Send confirmation email
      try {
        const emailTemplate = await EmailTemplateService.getBuyConfirmationEmail(
          user.email,
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
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

  // Private method to refresh a single user's portfolio
  private async refreshUserPortfolio(userId: number) {
    try {
      console.log(`Refreshing portfolio for user ${userId}...`);

      // Get user's buy requests
      const buyRequests = await db.BuyRequest.findAll({
        where: { user_id: userId },
        include: [
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name']
          }
        ]
      });

      if (buyRequests.length === 0) {
        // User has no holdings - create/update portfolio with zero values
        await db.UserPortfolio.upsert({
          user_id: userId,
          total_investment: 0,
          holding_number: 0,
          price_change: 0,
          percentage_change: 0,
          portfolio_performance_score: undefined
        });
        console.log(`Portfolio updated for user ${userId} (no holdings)`);
        return;
      }

      // Calculate portfolio metrics
      const totalInvestment = buyRequests.reduce((sum, req) => sum + parseFloat(req.total_amount.toString()), 0);
      const holdingNumber = buyRequests.length;

      // Calculate price change (sum of price differences per share)
      let priceChange = 0;
      for (const buyRequest of buyRequests) {
        const currentPrice = parseFloat(buyRequest.price.toString());
        const purchasePrice = parseFloat(buyRequest.price.toString());
        priceChange += (currentPrice - purchasePrice);
      }

      // Calculate percentage change
      const percentageChange = totalInvestment > 0 ? (priceChange / totalInvestment) * 100 : 0;

      // Calculate average performance score
      let avgPerformanceScore: number | undefined = undefined;
      if (buyRequests.length > 0) {
        const stockIds = buyRequests.map(req => req.stock_id);
        const performanceScores = await db.StockPerformanceScore.findAll({
          where: {
            stock_id: { [Op.in]: stockIds }
          },
          attributes: ['score']
        });

        if (performanceScores.length > 0) {
          const totalScore = performanceScores.reduce((sum, score) => sum + parseInt(score.score), 0);
          avgPerformanceScore = totalScore / performanceScores.length;
        }
      }

      // Upsert portfolio data
      await db.UserPortfolio.upsert({
        user_id: userId,
        total_investment: totalInvestment,
        holding_number: holdingNumber,
        price_change: priceChange,
        percentage_change: percentageChange,
        portfolio_performance_score: avgPerformanceScore
      });

      console.log(`Portfolio updated for user ${userId}: Investment: ₹${totalInvestment.toFixed(2)}, Holdings: ${holdingNumber}, Change: ${percentageChange.toFixed(2)}%`);
    } catch (error) {
      console.error(`Error refreshing portfolio for user ${userId}:`, error);
      throw error;
    }
  }
}
