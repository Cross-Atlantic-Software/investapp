import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ShareholderType from '../../Models/ShareholderType';
import db from '../../utils/database';

export class ShareholderTypeController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all shareholder types
  static async getAllShareholderTypes(req: Request, res: Response) {
    try {
      const controller = new ShareholderTypeController();
      await controller.ensureDbReady();
      
      const shareholderTypes = await ShareholderType.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: shareholderTypes
      });
    } catch (error) {
      console.error('Error fetching shareholder types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shareholder types',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all shareholder types (including inactive) for admin
  static async getAllShareholderTypesAdmin(req: Request, res: Response) {
    try {
      const controller = new ShareholderTypeController();
      await controller.ensureDbReady();
      
      const shareholderTypes = await ShareholderType.findAll({
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: shareholderTypes
      });
    } catch (error) {
      console.error('Error fetching shareholder types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shareholder types',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new shareholder type
  static async createShareholderType(req: Request, res: Response) {
    try {
      const controller = new ShareholderTypeController();
      await controller.ensureDbReady();
      
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Shareholder type name is required'
        });
      }

      // Check if name already exists
      const existingType = await ShareholderType.findOne({
        where: { name: name.trim() }
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          message: 'Shareholder type with this name already exists'
        });
      }

      const newShareholderType = await ShareholderType.create({
        name: name.trim(),
        is_active: true
      });

      res.json({
        success: true,
        message: 'Shareholder type created successfully',
        data: newShareholderType
      });
    } catch (error) {
      console.error('Error creating shareholder type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create shareholder type',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update shareholder type
  static async updateShareholderType(req: Request, res: Response) {
    try {
      const controller = new ShareholderTypeController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      const { name, is_active } = req.body;

      const shareholderType = await ShareholderType.findByPk(id);
      if (!shareholderType) {
        return res.status(404).json({
          success: false,
          message: 'Shareholder type not found'
        });
      }

      if (name && name.trim()) {
        // Check if name already exists (excluding current record)
        const existingType = await ShareholderType.findOne({
          where: { 
            name: name.trim(),
            id: { [Op.ne]: id }
          }
        });

        if (existingType) {
          return res.status(400).json({
            success: false,
            message: 'Shareholder type with this name already exists'
          });
        }
      }

      await shareholderType.update({
        name: name?.trim() || shareholderType.name,
        is_active: is_active !== undefined ? is_active : shareholderType.is_active
      });

      res.json({
        success: true,
        message: 'Shareholder type updated successfully',
        data: shareholderType
      });
    } catch (error) {
      console.error('Error updating shareholder type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update shareholder type',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete shareholder type (soft delete by setting is_active to false)
  static async deleteShareholderType(req: Request, res: Response) {
    try {
      const controller = new ShareholderTypeController();
      await controller.ensureDbReady();
      
      const { id } = req.params;

      const shareholderType = await ShareholderType.findByPk(id);
      if (!shareholderType) {
        return res.status(404).json({
          success: false,
          message: 'Shareholder type not found'
        });
      }

      // Check if this type is being used in any shareholding records
      const StockShareholding = db.StockShareholding;
      const usageCount = await StockShareholding.count({
        where: { shareholder_type_id: id }
      });

      if (usageCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete shareholder type. It is being used in ${usageCount} shareholding record(s). Please deactivate instead.`
        });
      }

      await shareholderType.destroy();

      res.json({
        success: true,
        message: 'Shareholder type deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting shareholder type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shareholder type',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Toggle active status
  static async toggleActiveStatus(req: Request, res: Response) {
    try {
      const controller = new ShareholderTypeController();
      await controller.ensureDbReady();
      
      const { id } = req.params;

      const shareholderType = await ShareholderType.findByPk(id);
      if (!shareholderType) {
        return res.status(404).json({
          success: false,
          message: 'Shareholder type not found'
        });
      }

      await shareholderType.update({
        is_active: !shareholderType.is_active
      });

      res.json({
        success: true,
        message: `Shareholder type ${shareholderType.is_active ? 'activated' : 'deactivated'} successfully`,
        data: shareholderType
      });
    } catch (error) {
      console.error('Error toggling shareholder type status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle shareholder type status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
