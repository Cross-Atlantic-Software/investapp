import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class ValuationRangeController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  static async getAllValuationRanges(req: Request, res: Response) {
    try {
      const controller = new ValuationRangeController();
      await controller.ensureDbReady();

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const offset = (page - 1) * limit;

      const whereClause = search ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { value: { [Op.like]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: valuationRanges } = await db.ValuationRange.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'name', 'value', 'sort_order', 'created_at', 'updated_at'],
        order: [['sort_order', 'ASC'], ['name', 'ASC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(count / limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation ranges fetched successfully',
        data: {
          valuationRanges,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching valuation ranges:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation ranges',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationRangeById(req: Request, res: Response) {
    try {
      const controller = new ValuationRangeController();
      await controller.ensureDbReady();

      const { id } = req.params;
      const valuationRange = await db.ValuationRange.findByPk(id, {
        attributes: ['id', 'name', 'value', 'sort_order', 'created_at', 'updated_at']
      });

      if (!valuationRange) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation range not found'
        });
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation range fetched successfully',
        data: { valuationRange }
      });
    } catch (error) {
      console.error('Error fetching valuation range:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation range',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createValuationRange(req: Request, res: Response) {
    try {
      const controller = new ValuationRangeController();
      await controller.ensureDbReady();

      const { name, value, sort_order } = req.body;

      if (!name || !value) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Name and value are required'
        });
      }

      // Check if valuation range with same value already exists
      const existingRange = await db.ValuationRange.findOne({
        where: { value: value.trim() }
      });

      if (existingRange) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Valuation range with this value already exists'
        });
      }

      const valuationRange = await db.ValuationRange.create({
        name: name.trim(),
        value: value.trim(),
        sort_order: sort_order || 0
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Valuation range created successfully',
        data: { valuationRange }
      });
    } catch (error) {
      console.error('Error creating valuation range:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create valuation range',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateValuationRange(req: Request, res: Response) {
    try {
      const controller = new ValuationRangeController();
      await controller.ensureDbReady();

      const { id } = req.params;
      const { name, value, sort_order } = req.body;

      if (!name || !value) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Name and value are required'
        });
      }

      const valuationRange = await db.ValuationRange.findByPk(id);

      if (!valuationRange) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation range not found'
        });
      }

      // Check if another valuation range with the same value exists
      const existingRange = await db.ValuationRange.findOne({
        where: { 
          value: value.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingRange) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Valuation range with this value already exists'
        });
      }

      await valuationRange.update({
        name: name.trim(),
        value: value.trim(),
        sort_order: sort_order || 0
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation range updated successfully',
        data: { valuationRange }
      });
    } catch (error) {
      console.error('Error updating valuation range:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update valuation range',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteValuationRange(req: Request, res: Response) {
    try {
      const controller = new ValuationRangeController();
      await controller.ensureDbReady();

      const { id } = req.params;

      const valuationRange = await db.ValuationRange.findByPk(id);

      if (!valuationRange) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation range not found'
        });
      }

      await valuationRange.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation range deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting valuation range:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete valuation range',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationRangesForFilters(req: Request, res: Response) {
    try {
      const controller = new ValuationRangeController();
      await controller.ensureDbReady();

      const valuationRanges = await db.ValuationRange.findAll({
        attributes: ['id', 'name', 'value'],
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation ranges fetched successfully',
        data: { valuationRanges }
      });
    } catch (error) {
      console.error('Error fetching valuation ranges for filters:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation ranges',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
