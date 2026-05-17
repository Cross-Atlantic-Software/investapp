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

  // Get current user's transactions
  static async getUserTransactions(req: Request, res: Response) {
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

      const { page = 1, limit = 50, status = '', transaction_type = '' } = req.query as Record<string, string>;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = `WHERE t.user_id = :userId`;
      const replacements: any = { userId: parseInt(userId as string) };

      if (status) {
        whereClause += ` AND t.status = :status`;
        replacements.status = status;
      }

      if (transaction_type) {
        whereClause += ` AND t.transaction_type = :transaction_type`;
        replacements.transaction_type = transaction_type;
      }

      // Get transactions with stock details
      const transactions = await db.sequelize.query(`
        SELECT 
          t.id,
          t.transaction_id,
          t.transaction_type,
          t.status,
          t.quantity,
          t.price_per_unit,
          t.total_amount,
          t.fees,
          t.taxes,
          t.net_amount,
          t.order_date,
          t.execution_date,
          t.settlement_date,
          t.payment_method,
          t.payment_status,
          t.rejection_reason,
          t.notes,
          t.created_at,
          p.company_name,
          p.logo,
          p.price_per_share as current_price
        FROM transactions t
        INNER JOIN products p ON t.stock_id = p.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT :limit OFFSET :offset
      `, {
        replacements: { ...replacements, limit: Number(limit), offset },
        type: QueryTypes.SELECT
      }) as any[];

      // Get total count
      const [countResult] = await db.sequelize.query(`
        SELECT COUNT(*) as total
        FROM transactions t
        ${whereClause}
      `, {
        replacements,
        type: QueryTypes.SELECT
      }) as any[];

      const total = countResult?.total || 0;

      res.json({
        success: true,
        data: transactions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user transactions'
      });
    }
  }
}
