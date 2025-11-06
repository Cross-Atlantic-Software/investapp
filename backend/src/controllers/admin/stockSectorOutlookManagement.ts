import { Request, Response } from 'express';
import { StockSectorOutlookModel } from '../../Models/StockSectorOutlook';
import { StockSectorOutlookAccordionModel } from '../../Models/StockSectorOutlookAccordion';
import { Op } from 'sequelize';

export class StockSectorOutlookManagementController {
  // Get Sector & Comapany outlook for a specific stock
  static async getSectorOutlookByStockId(req: Request, res: Response) {
    try {
      const { stockId } = req.params;

      const sectorOutlook = await StockSectorOutlookModel.findOne({
        where: { stock_id: parseInt(stockId) },
        include: [
          {
            model: StockSectorOutlookAccordionModel,
            as: 'accordions',
            order: [['order_index', 'ASC']],
          },
        ],
      });

      if (!sectorOutlook) {
        return res.json({
          success: true,
          data: null,
          message: 'No Sector & Comapany outlook found for this stock',
        });
      }

      res.json({
        success: true,
        data: sectorOutlook,
      });
    } catch (error) {
      console.error('Error fetching Sector & Comapany outlook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Sector & Comapany outlook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create or update Sector & Comapany outlook
  static async createOrUpdateSectorOutlook(req: Request, res: Response) {
    try {
      const { stock_id, description, accordions } = req.body;

      if (!stock_id) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID is required',
        });
      }

      // Find or create Sector & Comapany outlook
      let sectorOutlook = await StockSectorOutlookModel.findOne({
        where: { stock_id: parseInt(stock_id) },
      });

      if (sectorOutlook) {
        // Update existing
        await sectorOutlook.update({
          description: description || sectorOutlook.description,
        });
      } else {
        // Create new
        sectorOutlook = await StockSectorOutlookModel.create({
          stock_id: parseInt(stock_id),
          description: description || '',
        });
      }

      // Handle accordions if provided
      if (accordions && Array.isArray(accordions)) {
        // Delete existing accordions
        await StockSectorOutlookAccordionModel.destroy({
          where: { sector_outlook_id: sectorOutlook.id },
        });

        // Create new accordions
        for (const accordion of accordions) {
          await StockSectorOutlookAccordionModel.create({
            sector_outlook_id: sectorOutlook.id,
            title: accordion.title,
            analysis: accordion.analysis,
            order_index: accordion.order_index || 0,
          });
        }
      }

      // Fetch updated data with accordions
      const updatedSectorOutlook = await StockSectorOutlookModel.findByPk(sectorOutlook.id, {
        include: [
          {
            model: StockSectorOutlookAccordionModel,
            as: 'accordions',
            order: [['order_index', 'ASC']],
          },
        ],
      });

      res.json({
        success: true,
        message: sectorOutlook.id ? 'Sector & Comapany outlook updated successfully' : 'Sector & Comapany outlook created successfully',
        data: updatedSectorOutlook,
      });
    } catch (error) {
      console.error('Error creating/updating Sector & Comapany outlook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create/update Sector & Comapany outlook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete Sector & Comapany outlook
  static async deleteSectorOutlook(req: Request, res: Response) {
    try {
      const { stockId } = req.params;

      const sectorOutlook = await StockSectorOutlookModel.findOne({
        where: { stock_id: stockId },
      });

      if (!sectorOutlook) {
        return res.status(404).json({
          success: false,
          message: 'Sector & Comapany outlook not found',
        });
      }

      // Delete accordions first (cascade should handle this, but being explicit)
      await StockSectorOutlookAccordionModel.destroy({
        where: { sector_outlook_id: sectorOutlook.id },
      });

      // Delete Sector & Comapany outlook
      await sectorOutlook.destroy();

      res.json({
        success: true,
        message: 'Sector & Comapany outlook deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting Sector & Comapany outlook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete Sector & Comapany outlook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get Sector & Comapany outlook for a specific stock (Public API - uses :id parameter)
  static async getSectorOutlookByStockIdPublic(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sectorOutlook = await StockSectorOutlookModel.findOne({
        where: { stock_id: parseInt(id) },
        include: [
          {
            model: StockSectorOutlookAccordionModel,
            as: 'accordions',
            order: [['order_index', 'ASC']],
          },
        ],
      });

      if (!sectorOutlook) {
        return res.status(404).json({
          success: false,
          message: 'Sector & Comapany outlook not found for this stock',
        });
      }

      res.json({
        success: true,
        data: sectorOutlook,
      });
    } catch (error) {
      console.error('Error fetching Sector & Comapany outlook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Sector & Comapany outlook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get Sector & Comapany outlook statistics
  static async getSectorOutlookStats(req: Request, res: Response) {
    try {
      const { stockId } = req.params;

      const totalAccordions = await StockSectorOutlookAccordionModel.count({
        include: [
          {
            model: StockSectorOutlookModel,
            where: { stock_id: stockId },
            required: true,
          },
        ],
      });

      res.json({
        success: true,
        data: {
          totalAccordions,
        },
      });
    } catch (error) {
      console.error('Error fetching Sector & Comapany outlook stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Sector & Comapany outlook statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
