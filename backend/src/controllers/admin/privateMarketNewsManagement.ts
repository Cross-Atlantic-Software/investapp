import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

// Extend Request interface to include files property from multer
interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class PrivateMarketNewsManagementController {
  private privateMarketNewsModel = db.PrivateMarketNews;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  getAllPrivateMarketNews = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'id', sort_order = 'DESC' } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause.title = { [Op.like]: `%${search}%` };
      }

      const { count, rows: news } = await this.privateMarketNewsModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        message: "Private market news fetched successfully",
        data: {
          news,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all private market news error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getPrivateMarketNewsById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const news = await this.privateMarketNewsModel.findByPk(id);

      if (!news) {
        return (res as any).error("Private market news not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Private market news fetched successfully",
        data: { news },
      });
    } catch (error: any) {
      console.error("Get private market news by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createPrivateMarketNews = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { title, url, taxonomy_ids } = req.body;

      if (!title || !url) {
        return (res as any).error("Title and URL are required", HttpStatusCode.BAD_REQUEST);
      }

      // Parse taxonomy_ids if it's a string
      let parsedTaxonomyIds = [];
      if (taxonomy_ids) {
        try {
          parsedTaxonomyIds = typeof taxonomy_ids === 'string' ? JSON.parse(taxonomy_ids) : taxonomy_ids;
        } catch (e) {
          return (res as any).error("Invalid taxonomy_ids format", HttpStatusCode.BAD_REQUEST);
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

      const newNews = await this.privateMarketNewsModel.create({
        title,
        url,
        icon: iconUrl || '',
        taxonomy_ids: JSON.stringify(parsedTaxonomyIds),
      });

      res.status(201).json({
        success: true,
        message: "Private market news created successfully",
        data: { news: newNews },
      });
    } catch (error: any) {
      console.error("Create private market news error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updatePrivateMarketNews = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { title, url, taxonomy_ids } = req.body;

      const news = await this.privateMarketNewsModel.findByPk(id);
      if (!news) {
        return (res as any).error("Private market news not found", HttpStatusCode.NOT_FOUND);
      }

      // Parse taxonomy_ids if it's a string
      let parsedTaxonomyIds = news.taxonomy_ids;
      if (taxonomy_ids !== undefined) {
        try {
          parsedTaxonomyIds = typeof taxonomy_ids === 'string' ? JSON.parse(taxonomy_ids) : taxonomy_ids;
        } catch (e) {
          return (res as any).error("Invalid taxonomy_ids format", HttpStatusCode.BAD_REQUEST);
        }
      }

      // Handle icon upload to S3
      let iconUrl = news.icon; // Keep existing icon by default
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

      await news.update({
        title: title !== undefined ? title : news.title,
        url: url !== undefined ? url : news.url,
        icon: iconUrl,
        taxonomy_ids: JSON.stringify(parsedTaxonomyIds),
      });

      res.status(200).json({
        success: true,
        message: "Private market news updated successfully",
        data: { news },
      });
    } catch (error: any) {
      console.error("Update private market news error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deletePrivateMarketNews = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const news = await this.privateMarketNewsModel.findByPk(id);
      if (!news) {
        return (res as any).error("Private market news not found", HttpStatusCode.NOT_FOUND);
      }

      await news.destroy();

      res.status(200).json({
        success: true,
        message: "Private market news deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete private market news error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getPrivateMarketNewsStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalNews = await this.privateMarketNewsModel.count();

      res.status(200).json({
        success: true,
        message: "Private market news stats fetched successfully",
        data: {
          total: totalNews,
        },
      });
    } catch (error: any) {
      console.error("Get private market news stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
