import { Request, Response } from 'express';
import { Op } from 'sequelize';
import StockShareholding from '../../Models/StockShareholding';
import db from '../../utils/database';

export class StockShareholdingController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get shareholding data for a specific stock
  static async getStockShareholding(req: Request, res: Response) {
    try {
      const controller = new StockShareholdingController();
      await controller.ensureDbReady();
      
              const { id } = req.params;

              const shareholdingData = await StockShareholding.findAll({
                where: { stock_id: id },
                order: [['percentage', 'DESC']] // Higher percentage on top
              });

      res.json({
        success: true,
        data: shareholdingData
      });
    } catch (error) {
      console.error('Error fetching stock shareholding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shareholding data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new shareholding entry
  static async createShareholding(req: Request, res: Response) {
    try {
      const controller = new StockShareholdingController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      const { holder_name, percentage, shareholder_type_id } = req.body;

              // Validate percentage doesn't exceed 100%
              const existingTotal = await StockShareholding.sum('percentage', {
                where: { stock_id: id }
              });
      
      if (existingTotal + percentage > 100) {
        return res.status(400).json({
          success: false,
          message: `Total percentage cannot exceed 100%. Current total: ${existingTotal}%, trying to add: ${percentage}%`
        });
      }

      const newShareholding = await StockShareholding.create({
        stock_id: parseInt(id),
        holder_name,
        percentage: parseFloat(percentage),
        shareholder_type_id: shareholder_type_id ? parseInt(shareholder_type_id) : undefined,
        display_order: 0
      });

      res.json({
        success: true,
        message: 'Shareholding entry created successfully',
        data: newShareholding
      });
    } catch (error) {
      console.error('Error creating shareholding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create shareholding entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update shareholding entry
  static async updateShareholding(req: Request, res: Response) {
    try {
      const controller = new StockShareholdingController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      const { holder_name, percentage, shareholder_type_id } = req.body;

      const shareholding = await StockShareholding.findByPk(id);
      if (!shareholding) {
        return res.status(404).json({
          success: false,
          message: 'Shareholding entry not found'
        });
      }

      // Validate percentage doesn't exceed 100%
      const existingTotal = await StockShareholding.sum('percentage', {
        where: { 
          stock_id: shareholding.stock_id,
          id: { [Op.ne]: id } // Exclude current entry
        }
      });
      
      if (existingTotal + parseFloat(percentage) > 100) {
        return res.status(400).json({
          success: false,
          message: `Total percentage cannot exceed 100%. Current total: ${existingTotal}%, trying to set: ${percentage}%`
        });
      }

      await shareholding.update({
        holder_name,
        percentage: parseFloat(percentage),
        shareholder_type_id: shareholder_type_id ? parseInt(shareholder_type_id) : undefined
      });

      res.json({
        success: true,
        message: 'Shareholding entry updated successfully',
        data: shareholding
      });
    } catch (error) {
      console.error('Error updating shareholding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update shareholding entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete shareholding entry
  static async deleteShareholding(req: Request, res: Response) {
    try {
      const controller = new StockShareholdingController();
      await controller.ensureDbReady();
      
      const { id } = req.params;

      const shareholding = await StockShareholding.findByPk(id);
      if (!shareholding) {
        return res.status(404).json({
          success: false,
          message: 'Shareholding entry not found'
        });
      }

      await shareholding.destroy();

      res.json({
        success: true,
        message: 'Shareholding entry deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting shareholding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shareholding entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
