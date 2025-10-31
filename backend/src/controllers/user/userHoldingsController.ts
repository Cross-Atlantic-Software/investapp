import { Request, Response } from "express";
import { db } from "../../utils/database";
import { QueryTypes } from "sequelize";

export class UserHoldingsController {
  // Get current user's holdings data (for dashboard)
  static async getUserHoldings(req: Request, res: Response) {
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
      
      const holdings = await db.sequelize.query(`
        SELECT 
          br.id,
          p.company_name,
          br.quantity,
          br.price as purchase_price,
          br.total_amount,
          p.price_change,
          p.percentage_change,
          p.price_per_share,
          p.min_units,
          p.lot_size
        FROM buy_requests br
        INNER JOIN products p ON br.stock_id = p.id
        WHERE br.user_id = :userId
        ORDER BY br.created_at DESC
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as any[];

      res.json({
        success: true,
        data: holdings
      });
    } catch (error) {
      console.error('Error fetching user holdings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user holdings'
      });
    }
  }

  // Get current user's buy requests
  static async getUserBuyRequests(req: Request, res: Response) {
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
      
      const buyRequests = await db.sequelize.query(`
        SELECT 
          br.id,
          br.stock_id,
          br.stock_name,
          br.quantity,
          br.price,
          br.total_amount,
          br.created_at,
          p.company_name,
          p.logo,
          p.price_per_share
        FROM buy_requests br
        INNER JOIN products p ON br.stock_id = p.id
        WHERE br.user_id = :userId
        ORDER BY br.created_at DESC
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as any[];

      res.json({
        success: true,
        data: buyRequests
      });
    } catch (error) {
      console.error('Error fetching user buy requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user buy requests'
      });
    }
  }
}
