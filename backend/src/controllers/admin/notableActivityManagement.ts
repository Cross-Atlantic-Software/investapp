import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

// Extend Request interface to include files property from multer
interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class NotableActivityManagementController {
  private notableActivityModel = db.NotableActivity;
  private activityTypeModel = db.ActivityType;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  getAllNotableActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'id', sort_order = 'DESC' } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause.description = { [Op.like]: `%${search}%` };
      }

      const { count, rows: activities } = await this.notableActivityModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      // Fetch activity type names for each activity
      const activitiesWithTypes = await Promise.all(
        activities.map(async (activity) => {
          let activityTypeIds = [];
          try {
            const parsed = JSON.parse(activity.activity_type_ids || '[]');
            
            // Ensure it's an array
            if (Array.isArray(parsed)) {
              activityTypeIds = parsed;
            } else if (typeof parsed === 'number') {
              activityTypeIds = [parsed];
            } else if (typeof parsed === 'string' && parsed.includes(',')) {
              activityTypeIds = parsed.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
              activityTypeIds = [];
            }
          } catch (error) {
            console.error('Error parsing activity_type_ids:', activity.activity_type_ids, error);
            activityTypeIds = [];
          }
          
          const activityTypes = await this.activityTypeModel.findAll({
            where: { id: { [Op.in]: activityTypeIds } },
            attributes: ['id', 'name'],
          });
          
          return {
            ...activity.toJSON(),
            activity_types: activityTypes,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: "Notable activities fetched successfully",
        data: {
          activities: activitiesWithTypes,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all notable activities error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getNotableActivityById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const activity = await this.notableActivityModel.findByPk(id);

      if (!activity) {
        return (res as any).error("Notable activity not found", HttpStatusCode.NOT_FOUND);
      }

      // Fetch activity type names
      let activityTypeIds = [];
      try {
        const parsed = JSON.parse(activity.activity_type_ids || '[]');
        
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          activityTypeIds = parsed;
        } else if (typeof parsed === 'number') {
          activityTypeIds = [parsed];
        } else if (typeof parsed === 'string' && parsed.includes(',')) {
          activityTypeIds = parsed.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        } else {
          activityTypeIds = [];
        }
      } catch (error) {
        console.error('Error parsing activity_type_ids:', activity.activity_type_ids, error);
        activityTypeIds = [];
      }
      
      const activityTypes = await this.activityTypeModel.findAll({
        where: { id: { [Op.in]: activityTypeIds } },
        attributes: ['id', 'name'],
      });

      const activityWithTypes = {
        ...activity.toJSON(),
        activity_types: activityTypes,
      };

      res.status(200).json({
        success: true,
        message: "Notable activity fetched successfully",
        data: { activity: activityWithTypes },
      });
    } catch (error: any) {
      console.error("Get notable activity by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createNotableActivity = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { activity_type_ids, description } = req.body;

      if (!description) {
        return (res as any).error("Description is required", HttpStatusCode.BAD_REQUEST);
      }

      // Parse activity_type_ids if it's a string
      let parsedActivityTypeIds = [];
      if (activity_type_ids) {
        try {
          parsedActivityTypeIds = typeof activity_type_ids === 'string' ? JSON.parse(activity_type_ids) : activity_type_ids;
        } catch (e) {
          return (res as any).error("Invalid activity_type_ids format", HttpStatusCode.BAD_REQUEST);
        }
      }

      // Handle icon upload to S3
      let iconUrl: string | undefined = undefined;
      if (req.files) {
        let file: Express.Multer.File | undefined;
        
        // Handle both array and object formats
        if (Array.isArray(req.files)) {
          file = req.files[0];
        } else {
          // Get the first file from any field
          const fileArrays = Object.values(req.files);
          file = fileArrays.length > 0 ? fileArrays[0][0] : undefined;
        }
        
        if (file) {
          const s3File = file as any;
          iconUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
        }
      }

      const newActivity = await this.notableActivityModel.create({
        activity_type_ids: JSON.stringify(parsedActivityTypeIds),
        icon: iconUrl || '',
        description,
      });

      res.status(201).json({
        success: true,
        message: "Notable activity created successfully",
        data: { activity: newActivity },
      });
    } catch (error: any) {
      console.error("Create notable activity error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updateNotableActivity = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { activity_type_ids, description } = req.body;

      const activity = await this.notableActivityModel.findByPk(id);
      if (!activity) {
        return (res as any).error("Notable activity not found", HttpStatusCode.NOT_FOUND);
      }

      // Parse activity_type_ids if it's a string
      let parsedActivityTypeIds = activity.activity_type_ids;
      if (activity_type_ids !== undefined) {
        try {
          parsedActivityTypeIds = typeof activity_type_ids === 'string' ? JSON.parse(activity_type_ids) : activity_type_ids;
        } catch (e) {
          return (res as any).error("Invalid activity_type_ids format", HttpStatusCode.BAD_REQUEST);
        }
      }

      // Handle icon upload to S3
      let iconUrl = activity.icon; // Keep existing icon by default
      if (req.files) {
        let file: Express.Multer.File | undefined;
        
        // Handle both array and object formats
        if (Array.isArray(req.files)) {
          file = req.files[0];
        } else {
          // Get the first file from any field
          const fileArrays = Object.values(req.files);
          file = fileArrays.length > 0 ? fileArrays[0][0] : undefined;
        }
        
        if (file) {
          const s3File = file as any;
          iconUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
        }
      }

      await activity.update({
        activity_type_ids: JSON.stringify(parsedActivityTypeIds),
        icon: iconUrl,
        description: description !== undefined ? description : activity.description,
      });

      res.status(200).json({
        success: true,
        message: "Notable activity updated successfully",
        data: { activity },
      });
    } catch (error: any) {
      console.error("Update notable activity error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deleteNotableActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const activity = await this.notableActivityModel.findByPk(id);
      if (!activity) {
        return (res as any).error("Notable activity not found", HttpStatusCode.NOT_FOUND);
      }

      await activity.destroy();

      res.status(200).json({
        success: true,
        message: "Notable activity deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete notable activity error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getNotableActivityStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalActivities = await this.notableActivityModel.count();

      res.status(200).json({
        success: true,
        message: "Notable activity stats fetched successfully",
        data: {
          total: totalActivities,
        },
      });
    } catch (error: any) {
      console.error("Get notable activity stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Public endpoint for home page display
  getPublicNotableActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { limit = 4 } = req.query;

      const activities = await this.notableActivityModel.findAll({
        order: [['created_at', 'DESC']],
        limit: Number(limit),
      });

      // Fetch activity type names for each activity
      const activitiesWithTypes = await Promise.all(
        activities.map(async (activity) => {
          let activityTypeIds = [];
          try {
            const parsed = JSON.parse(activity.activity_type_ids || '[]');
            
            // Ensure it's an array
            if (Array.isArray(parsed)) {
              activityTypeIds = parsed;
            } else if (typeof parsed === 'number') {
              activityTypeIds = [parsed];
            } else if (typeof parsed === 'string' && parsed.includes(',')) {
              activityTypeIds = parsed.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
              activityTypeIds = [];
            }
          } catch (error) {
            console.error('Error parsing activity_type_ids:', activity.activity_type_ids, error);
            activityTypeIds = [];
          }
          
          const activityTypes = await this.activityTypeModel.findAll({
            where: { id: { [Op.in]: activityTypeIds } },
            attributes: ['id', 'name'],
          });
          
          return {
            id: activity.id,
            title: activityTypes.length > 0 ? activityTypes[0].name : 'Activity',
            description: activity.description,
            created_at: activity.created_at,
            icon: activity.icon,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: "Notable activities fetched successfully",
        data: { activities: activitiesWithTypes },
      });
    } catch (error: any) {
      console.error("Get public notable activities error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
