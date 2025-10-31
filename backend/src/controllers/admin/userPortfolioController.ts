import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Op, QueryTypes } from "sequelize";

export class UserPortfolioController {
  // Get current user's portfolio data (for dashboard)
  static async getCurrentUserPortfolio(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      // Get user ID from JWT token
      const userId = (req as any).user?.user_id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      // Get the portfolio for the authenticated user
      const portfolio = await db.UserPortfolio.findOne({
        where: {
          user_id: userId
        },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        order: [['updated_at', 'DESC']]
      });

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: "Portfolio not found"
        });
      }

      res.json({
        success: true,
        data: {
          total_investment: portfolio.total_investment,
          price_change: portfolio.price_change,
          percentage_change: portfolio.percentage_change,
          portfolio_performance_score: portfolio.portfolio_performance_score,
          updated_at: portfolio.updated_at
        }
        
      });
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user portfolio'
      });
    }
  }

  // Get all user portfolios with pagination
  static async getAllUserPortfolios(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const sortBy = req.query.sort_by as string || 'total_investment';
      const sortOrder = req.query.sort_order as string || 'DESC';

      // Validate sort fields
      const allowedSortFields = ['total_investment', 'holding_number', 'price_change', 'percentage_change', 'portfolio_performance_score', 'created_at', 'updated_at'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'total_investment';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      const { count, rows: portfolios } = await db.UserPortfolio.findAndCountAll({
        limit,
        offset,
        order: [[validSortBy, validSortOrder]],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          portfolios,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user portfolios:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user portfolios'
      });
    }
  }

  // Get portfolio by user ID
  static async getUserPortfolioById(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      const { userId } = req.params;
      
      const portfolio = await db.UserPortfolio.findOne({
        where: { user_id: userId },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found for this user'
        });
      }

      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user portfolio'
      });
    }
  }

  // Get portfolio statistics
  static async getPortfolioStatistics(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      const stats = await db.sequelize.query(`
        SELECT 
          COUNT(*) as total_portfolios,
          AVG(total_investment) as avg_investment,
          SUM(total_investment) as total_market_investment,
          AVG(holding_number) as avg_holdings,
          AVG(portfolio_performance_score) as avg_performance_score,
          SUM(CASE WHEN price_change > 0 THEN 1 ELSE 0 END) as profitable_portfolios,
          SUM(CASE WHEN price_change <= 0 THEN 1 ELSE 0 END) as loss_portfolios,
          AVG(percentage_change) as avg_percentage_change,
          MAX(total_investment) as max_investment,
          MIN(total_investment) as min_investment
        FROM user_portfolio
      `, {
        type: QueryTypes.SELECT
      }) as any[];

      res.json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      console.error('Error fetching portfolio statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio statistics'
      });
    }
  }

  // Refresh all portfolios (admin only)
  static async refreshAllPortfolios(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      console.log('Starting portfolio refresh...');
      
      // Get all users
      const users = await db.User.findAll({
        attributes: ['id']
      });

      for (const user of users) {
        await UserPortfolioController.refreshSingleUserPortfolio(user.id);
      }
      
      res.json({
        success: true,
        message: 'All portfolios refreshed successfully'
      });
    } catch (error) {
      console.error('Error refreshing portfolios:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh portfolios'
      });
    }
  }

  // Refresh specific user portfolio
  static async refreshUserPortfolioById(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      const { userId } = req.params;
      
      await UserPortfolioController.refreshSingleUserPortfolio(parseInt(userId));
      
      res.json({
        success: true,
        message: `Portfolio refreshed successfully for user ${userId}`
      });
    } catch (error) {
      console.error('Error refreshing user portfolio:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh user portfolio'
      });
    }
  }

  // Method to refresh a single user's portfolio
  static async refreshSingleUserPortfolio(userId: number) {
    try {
      console.log(`Refreshing portfolio for user ${userId}...`);

      // Get user's buy requests
      const buyRequests = await db.BuyRequest.findAll({
        where: { user_id: userId },
        include: [
          {
            model: db.Product,
            as: 'Product',
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
          percentage_change: 0
        });
        console.log(`Portfolio updated for user ${userId} (no holdings)`);
        return;
      }

      // Calculate portfolio metrics
      const totalInvestment = buyRequests.reduce((sum, req) => sum + parseFloat(req.total_amount.toString()), 0);
      const holdingNumber = buyRequests.length;

      // Calculate price change (difference between current price and purchase price)
      let priceChange = 0;
      for (const buyRequest of buyRequests) {
        // Get current price from Product
        const product = await db.Product.findByPk(buyRequest.stock_id);
        if (product && product.price_per_share) {
          const currentPrice = parseFloat(product.price_per_share.toString());
          const purchasePrice = parseFloat(buyRequest.price.toString());
          
          // Calculate price change: (current_price - purchase_price)
          priceChange += (currentPrice - purchasePrice);
        }
      }

      // Calculate percentage change
      const percentageChange = totalInvestment > 0 ? (priceChange / totalInvestment) * 100 : 0;

      // Calculate average performance score
      let avgPerformanceScore: number | undefined = undefined;
      if (buyRequests.length > 0) {
        const stockIds = buyRequests.map(req => req.stock_id);
        const performanceScores = await db.StockPerformanceScore.findAll({
          where: {
            stock_id: {
              [Op.in]: stockIds
            }
          },
          attributes: ['score']
        });

        if (performanceScores.length > 0) {
          const totalScore = performanceScores.reduce((sum, score) => sum + (parseInt(score.score) || 0), 0);
          avgPerformanceScore = totalScore / performanceScores.length;
        }
      }

      // Upsert portfolio data
      const portfolioData: any = {
        user_id: userId,
        total_investment: totalInvestment,
        holding_number: holdingNumber,
        price_change: priceChange,
        percentage_change: percentageChange
      };
      
      // Only include portfolio_performance_score if it has a value
      if (avgPerformanceScore !== undefined) {
        portfolioData.portfolio_performance_score = avgPerformanceScore;
      }
      
      await db.UserPortfolio.upsert(portfolioData);

      console.log(`Portfolio updated for user ${userId}: Investment: ₹${totalInvestment.toFixed(2)}, Holdings: ${holdingNumber}, Change: ${percentageChange.toFixed(2)}%`);
    } catch (error) {
      console.error(`Error refreshing portfolio for user ${userId}:`, error);
      throw error;
    }
  }

  // Get top performing portfolios
  static async getTopPerformingPortfolios(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      const limit = parseInt(req.query.limit as string) || 10;
      
      const portfolios = await db.UserPortfolio.findAll({
        limit,
        order: [['portfolio_performance_score', 'DESC']],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: portfolios
      });
    } catch (error) {
      console.error('Error fetching top performing portfolios:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top performing portfolios'
      });
    }
  }

  // Get portfolios by performance range
  static async getPortfoliosByPerformanceRange(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      const { minScore, maxScore } = req.query;
      
      if (!minScore || !maxScore) {
        return res.status(400).json({
          success: false,
          message: 'minScore and maxScore are required'
        });
      }

      const portfolios = await db.UserPortfolio.findAll({
        where: {
          portfolio_performance_score: {
            [Op.between]: [parseFloat(minScore as string), parseFloat(maxScore as string)]
          }
        },
        order: [['portfolio_performance_score', 'DESC']],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: portfolios
      });
    } catch (error) {
      console.error('Error fetching portfolios by performance range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolios by performance range'
      });
    }
  }
}
