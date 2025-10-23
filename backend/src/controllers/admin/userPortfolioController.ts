import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Op, QueryTypes } from "sequelize";

export class UserPortfolioController {
  // Get current user's portfolio data (for dashboard)
  static async getCurrentUserPortfolio(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      // Get the portfolio with the highest percentage change
      const portfolio = await db.UserPortfolio.findOne({
        where: {
          total_investment: { [Op.gt]: 0 } // Has investment
        },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        order: [['percentage_change', 'DESC'], ['updated_at', 'DESC']]
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
      // Note: Portfolio refresh functionality needs to be reimplemented
      // For now, just return success message
      
      res.json({
        success: true,
        message: 'Portfolio refresh functionality is being updated'
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
      
      // Note: Individual portfolio refresh functionality needs to be reimplemented
      // For now, just return success message
      
      res.json({
        success: true,
        message: `Portfolio refresh functionality is being updated for user ${userId}`
      });
    } catch (error) {
      console.error('Error refreshing user portfolio:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh user portfolio'
      });
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
