import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class ValuationController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  static async getAllValuations(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const offset = (page - 1) * limit;

      const whereClause = search ? {
        valuation_name: {
          [Op.like]: `%${search}%`
        }
      } : {};

      const { count, rows: valuations } = await db.Valuation.findAndCountAll({
        where: whereClause,
        order: [['valuation_name', 'ASC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(count / limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuations fetched successfully',
        data: {
          valuations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching valuations:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationById(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const { id } = req.params;
      const valuation = await db.Valuation.findByPk(id);

      if (!valuation) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation not found'
        });
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation fetched successfully',
        data: { valuation }
      });
    } catch (error) {
      console.error('Error fetching valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createValuation(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const { valuation_name } = req.body;

      if (!valuation_name || valuation_name.trim() === '') {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Valuation name is required'
        });
      }

      // Check if valuation already exists
      const existingValuation = await db.Valuation.findOne({
        where: { valuation_name: valuation_name.trim() }
      });

      if (existingValuation) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Valuation with this name already exists'
        });
      }

      const valuation = await db.Valuation.create({
        valuation_name: valuation_name.trim()
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Valuation created successfully',
        data: { valuation }
      });
    } catch (error) {
      console.error('Error creating valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateValuation(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const { id } = req.params;
      const { valuation_name } = req.body;

      if (!valuation_name || valuation_name.trim() === '') {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Valuation name is required'
        });
      }

      const valuation = await db.Valuation.findByPk(id);

      if (!valuation) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation not found'
        });
      }

      // Check if another valuation with the same name exists
      const existingValuation = await db.Valuation.findOne({
        where: { 
          valuation_name: valuation_name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingValuation) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Valuation with this name already exists'
        });
      }

      await valuation.update({
        valuation_name: valuation_name.trim()
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation updated successfully',
        data: { valuation }
      });
    } catch (error) {
      console.error('Error updating valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteValuation(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const { id } = req.params;

      const valuation = await db.Valuation.findByPk(id);

      if (!valuation) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation not found'
        });
      }

      // Check if valuation is being used by any products
      const productsUsingValuation = await db.Product.count({
        where: { valuation_id: id }
      });

      if (productsUsingValuation > 0) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: `Cannot delete valuation. It is being used by ${productsUsingValuation} product(s).`
        });
      }

      await valuation.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationsForSelect(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const valuations = await db.Valuation.findAll({
        attributes: ['id', 'valuation_name'],
        order: [['valuation_name', 'ASC']]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuations fetched successfully',
        data: { valuations }
      });
    } catch (error) {
      console.error('Error fetching valuations for select:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

