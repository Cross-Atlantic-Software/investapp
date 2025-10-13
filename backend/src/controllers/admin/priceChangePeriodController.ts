import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class PriceChangePeriodController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all price change periods
  static async getAllPriceChangePeriods(req: Request, res: Response) {
    try {
      const controller = new PriceChangePeriodController();
      await controller.ensureDbReady();

      const { search, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      if (search) {
        whereClause.period = {
          [Op.like]: `%${search}%`
        };
      }

      const { count, rows: periods } = await db.PriceChangePeriod.findAndCountAll({
        where: whereClause,
        order: [['period', 'ASC']],
        limit: Number(limit),
        offset: offset
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Price change periods fetched successfully',
        data: {
          periods,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching price change periods:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch price change periods',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get price change period by ID
  static async getPriceChangePeriodById(req: Request, res: Response) {
    try {
      const controller = new PriceChangePeriodController();
      await controller.ensureDbReady();

      const { id } = req.params;
      const period = await db.PriceChangePeriod.findByPk(id);

      if (!period) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Price change period not found'
        });
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Price change period fetched successfully',
        data: { period }
      });
    } catch (error) {
      console.error('Error fetching price change period:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch price change period',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new price change period
  static async createPriceChangePeriod(req: Request, res: Response) {
    try {
      const controller = new PriceChangePeriodController();
      await controller.ensureDbReady();

      const { period } = req.body;

      if (!period) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Period is required'
        });
      }

      // Check if period already exists
      const existingPeriod = await db.PriceChangePeriod.findOne({
        where: { period }
      });

      if (existingPeriod) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Price change period already exists'
        });
      }

      const newPeriod = await db.PriceChangePeriod.create({ period });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Price change period created successfully',
        data: { period: newPeriod }
      });
    } catch (error) {
      console.error('Error creating price change period:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create price change period',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update price change period
  static async updatePriceChangePeriod(req: Request, res: Response) {
    try {
      const controller = new PriceChangePeriodController();
      await controller.ensureDbReady();

      const { id } = req.params;
      const { period } = req.body;

      if (!period) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Period is required'
        });
      }

      const existingPeriod = await db.PriceChangePeriod.findByPk(id);
      if (!existingPeriod) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Price change period not found'
        });
      }

      // Check if period already exists (excluding current record)
      const duplicatePeriod = await db.PriceChangePeriod.findOne({
        where: { 
          period,
          id: { [Op.ne]: id }
        }
      });

      if (duplicatePeriod) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Price change period already exists'
        });
      }

      await existingPeriod.update({ period });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Price change period updated successfully',
        data: { period: existingPeriod }
      });
    } catch (error) {
      console.error('Error updating price change period:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update price change period',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete price change period
  static async deletePriceChangePeriod(req: Request, res: Response) {
    try {
      const controller = new PriceChangePeriodController();
      await controller.ensureDbReady();

      const { id } = req.params;

      const period = await db.PriceChangePeriod.findByPk(id);
      if (!period) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Price change period not found'
        });
      }

      await period.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Price change period deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting price change period:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete price change period',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all periods for dropdown (no pagination)
  static async getPriceChangePeriodsForSelect(req: Request, res: Response) {
    try {
      const controller = new PriceChangePeriodController();
      await controller.ensureDbReady();

      const periods = await db.PriceChangePeriod.findAll({
        order: [['period', 'ASC']],
        attributes: ['id', 'period']
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Price change periods fetched successfully',
        data: { periods }
      });
    } catch (error) {
      console.error('Error fetching price change periods for select:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch price change periods',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
