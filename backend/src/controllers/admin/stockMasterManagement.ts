import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class StockMasterManagementController {
  private stockMasterModel = db.StockMaster;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  getAllStockMasters = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'created_at', sort_order = 'DESC' } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }

      const { count, rows: stockMasters } = await this.stockMasterModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        message: "Stock masters fetched successfully",
        data: {
          stockMasters,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all stock masters error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getStockMasterById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const stockMaster = await this.stockMasterModel.findByPk(id);

      if (!stockMaster) {
        return (res as any).error("Stock master not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Stock master fetched successfully",
        data: { stockMaster },
      });
    } catch (error: any) {
      console.error("Get stock master by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createStockMaster = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { name } = req.body;

      if (!name) {
        return (res as any).error("Name is required", HttpStatusCode.BAD_REQUEST);
      }

      // Check if stock master name already exists
      const existingStockMaster = await this.stockMasterModel.findOne({
        where: { name }
      });

      if (existingStockMaster) {
        return (res as any).error("Stock master name already exists", HttpStatusCode.CONFLICT);
      }

      const newStockMaster = await this.stockMasterModel.create({
        name,
      });

      res.status(201).json({
        success: true,
        message: "Stock master created successfully",
        data: { stockMaster: newStockMaster },
      });
    } catch (error: any) {
      console.error("Create stock master error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updateStockMaster = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { name } = req.body;

      const stockMaster = await this.stockMasterModel.findByPk(id);
      if (!stockMaster) {
        return (res as any).error("Stock master not found", HttpStatusCode.NOT_FOUND);
      }

      // Check if new name conflicts with existing stock master (excluding current one)
      if (name && name !== stockMaster.name) {
        const existingStockMaster = await this.stockMasterModel.findOne({
          where: { 
            name,
            id: { [Op.ne]: id }
          }
        });

        if (existingStockMaster) {
          return (res as any).error("Stock master name already exists", HttpStatusCode.CONFLICT);
        }
      }

      await stockMaster.update({
        name: name !== undefined ? name : stockMaster.name,
      });

      res.status(200).json({
        success: true,
        message: "Stock master updated successfully",
        data: { stockMaster },
      });
    } catch (error: any) {
      console.error("Update stock master error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deleteStockMaster = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const stockMaster = await this.stockMasterModel.findByPk(id);
      if (!stockMaster) {
        return (res as any).error("Stock master not found", HttpStatusCode.NOT_FOUND);
      }

      await stockMaster.destroy();

      res.status(200).json({
        success: true,
        message: "Stock master deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete stock master error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getStockMasterStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalStockMasters = await this.stockMasterModel.count();

      res.status(200).json({
        success: true,
        message: "Stock master stats fetched successfully",
        data: {
          total: totalStockMasters,
        },
      });
    } catch (error: any) {
      console.error("Get stock master stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getAllStockMastersForSelect = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const stockMasters = await this.stockMasterModel.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'created_at', 'updated_at'],
      });

      res.status(200).json({
        success: true,
        message: "Stock masters fetched successfully",
        data: { stockMasters },
      });
    } catch (error: any) {
      console.error("Get stock masters error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
