import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { db } from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

// Extend Request interface to include file property from multer
interface MulterRequest extends Request {
  file?: any;
  files?: any[] | { [fieldname: string]: any[] };
}

export class HomeInsightController {
  private homeInsightModel = db.HomeInsight;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all home insights with pagination and search
  getAllHomeInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'updated_at', sort_order = 'DESC' } = req.query as Record<string, string>;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: homeInsights } = await this.homeInsightModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Home insights fetched successfully",
        data: {
          homeInsights,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all home insights error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Get home insight by ID
  getHomeInsightById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const id = req.params.id as string;

      const homeInsight = await this.homeInsightModel.findByPk(id as string);

      if (!homeInsight) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Home insight not found"
        });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Home insight fetched successfully",
        data: { homeInsight },
      });
    } catch (error: any) {
      console.error("Get home insight by ID error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Create home insight
  createHomeInsight = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { title } = req.body;

      if (!title) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Title is required"
        });
        return;
      }

      // Handle file upload to S3 (same pattern as product logos)
      let fileUrl: string | undefined = undefined;
      if (req.file) {
        const s3File = req.file as any;
        // Extract S3 URL - same pattern as product logo uploads
        fileUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
      }

      if (!fileUrl) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "File is required"
        });
        return;
      }

      const newHomeInsight = await this.homeInsightModel.create({
        title,
        file: fileUrl,
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Home insight created successfully",
        data: { homeInsight: newHomeInsight },
      });
    } catch (error: any) {
      console.error("Create home insight error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Update home insight
  updateHomeInsight = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const id = req.params.id as string;
      const { title, existing_file } = req.body;

      const homeInsight = await this.homeInsightModel.findByPk(id as string);

      if (!homeInsight) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Home insight not found"
        });
        return;
      }

      // Handle file upload to S3 (same pattern as product logos)
      let fileUrl: string | undefined = undefined;
      if (req.file) {
        const s3File = req.file as any;
        // Extract S3 URL - same pattern as product logo uploads
        fileUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
      }

      // Use new file if uploaded, otherwise keep existing
      const finalFileUrl = fileUrl || existing_file || homeInsight.file;

      // Update fields
      const updateData: any = {};
      if (title !== undefined) {
        updateData.title = title;
      }
      if (finalFileUrl) {
        updateData.file = finalFileUrl;
      }

      await homeInsight.update(updateData);

      const updatedHomeInsight = await this.homeInsightModel.findByPk(id as string);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Home insight updated successfully",
        data: { homeInsight: updatedHomeInsight },
      });
    } catch (error: any) {
      console.error("Update home insight error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Delete home insight
  deleteHomeInsight = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const id = req.params.id as string;

      const homeInsight = await this.homeInsightModel.findByPk(id as string);

      if (!homeInsight) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Home insight not found"
        });
        return;
      }

      await homeInsight.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Home insight deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete home insight error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Get all home insights for public display (no pagination, sorted by latest)
  getAllPublicHomeInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const homeInsights = await this.homeInsightModel.findAll({
        order: [['created_at', 'DESC']],
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Home insights fetched successfully",
        data: { homeInsights },
      });
    } catch (error: any) {
      console.error("Get public home insights error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };
}

