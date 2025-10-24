import { Request, Response } from "express";
import { db } from "../utils/database";
import { QueryTypes } from "sequelize";

export class UserHoldingsController {
  // Get current user's holdings data (for dashboard)
  static async getUserHoldings(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      // For now, get holdings for a specific user (you can modify this based on your auth system)
      // In a real implementation, you would get the user ID from the JWT token
      const userId = 53; // User with 2 buy requests
      
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
}
