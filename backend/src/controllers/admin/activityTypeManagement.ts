import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class ActivityTypeManagementController {
  private activityTypeModel = db.ActivityType;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  getAllActivityTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'created_at', sort_order = 'DESC' } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }

      const { count, rows: activityTypes } = await this.activityTypeModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        message: "Activity types fetched successfully",
        data: {
          activityTypes,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all activity types error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getActivityTypeById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const activityType = await this.activityTypeModel.findByPk(id);

      if (!activityType) {
        return (res as any).error("Activity type not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Activity type fetched successfully",
        data: { activityType },
      });
    } catch (error: any) {
      console.error("Get activity type by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createActivityType = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { name } = req.body;

      if (!name) {
        return (res as any).error("Name is required", HttpStatusCode.BAD_REQUEST);
      }

      // Check if activity type name already exists
      const existingActivityType = await this.activityTypeModel.findOne({
        where: { name }
      });

      if (existingActivityType) {
        return (res as any).error("Activity type name already exists", HttpStatusCode.CONFLICT);
      }

      const newActivityType = await this.activityTypeModel.create({
        name,
      });

      res.status(201).json({
        success: true,
        message: "Activity type created successfully",
        data: { activityType: newActivityType },
      });
    } catch (error: any) {
      console.error("Create activity type error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updateActivityType = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { name } = req.body;

      const activityType = await this.activityTypeModel.findByPk(id);
      if (!activityType) {
        return (res as any).error("Activity type not found", HttpStatusCode.NOT_FOUND);
      }

      // Check if new name conflicts with existing activity type (excluding current one)
      if (name && name !== activityType.name) {
        const existingActivityType = await this.activityTypeModel.findOne({
          where: { 
            name,
            id: { [Op.ne]: id }
          }
        });

        if (existingActivityType) {
          return (res as any).error("Activity type name already exists", HttpStatusCode.CONFLICT);
        }
      }

      await activityType.update({
        name: name !== undefined ? name : activityType.name,
      });

      res.status(200).json({
        success: true,
        message: "Activity type updated successfully",
        data: { activityType },
      });
    } catch (error: any) {
      console.error("Update activity type error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deleteActivityType = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const activityType = await this.activityTypeModel.findByPk(id);
      if (!activityType) {
        return (res as any).error("Activity type not found", HttpStatusCode.NOT_FOUND);
      }

      await activityType.destroy();

      res.status(200).json({
        success: true,
        message: "Activity type deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete activity type error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getActivityTypeStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalActivityTypes = await this.activityTypeModel.count();

      res.status(200).json({
        success: true,
        message: "Activity type stats fetched successfully",
        data: {
          total: totalActivityTypes,
        },
      });
    } catch (error: any) {
      console.error("Get activity type stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getAllActivityTypesForSelect = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const activityTypes = await this.activityTypeModel.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name'],
      });

      res.status(200).json({
        success: true,
        message: "Activity types fetched successfully",
        data: { activityTypes },
      });
    } catch (error: any) {
      console.error("Get activity types error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
