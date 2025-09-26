import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

// Extend Request interface to include files property from multer
interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class BulkDealsManagementController {
  private async ensureDbReady(): Promise<void> {
    await db.sequelizePromise;
  }

  private get bulkDealsModel() {
    return db.BulkDeals;
  }

  // Get all bulk deals with pagination
  getAllBulkDeals = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search as string || "";
      const sortBy = req.query.sort_by as string || 'created_at';
      const sortOrder = req.query.sort_order as string || 'DESC';

      let whereClause: any = {};
      
      // Add search functionality
      if (search) {
        whereClause = {
          [Op.or]: [
            { value: { [Op.like]: `%${search}%` } },
            { label: { [Op.like]: `%${search}%` } }
          ]
        };
      }

      // Validate sort fields to prevent SQL injection
      const allowedSortFields = ['id', 'value', 'label', 'created_at', 'updated_at'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      const { count, rows: bulkDeals } = await this.bulkDealsModel.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [[validSortBy, validSortOrder]]
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: "Bulk deals fetched successfully",
        data: {
          bulkDeals,
          pagination: {
            currentPage: page,
            totalPages,
            totalBulkDeals: count,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error: any) {
      console.error("Get all bulk deals error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Get bulk deal by ID
  getBulkDealById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const bulkDeal = await this.bulkDealsModel.findByPk(id);

      if (!bulkDeal) {
        return (res as any).error("Bulk deal not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Bulk deal fetched successfully",
        data: { bulkDeal },
      });
    } catch (error: any) {
      console.error("Get bulk deal by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Create new bulk deal
  createBulkDeal = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { value, label } = req.body;

      if (!value || !label) {
        return (res as any).error("Value and label are required", HttpStatusCode.BAD_REQUEST);
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

      const newBulkDeal = await this.bulkDealsModel.create({
        icon: iconUrl || '',
        value,
        label,
      });

      res.status(201).json({
        success: true,
        message: "Bulk deal created successfully",
        data: { bulkDeal: newBulkDeal },
      });
    } catch (error: any) {
      console.error("Create bulk deal error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Update bulk deal
  updateBulkDeal = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { value, label } = req.body;

      const bulkDeal = await this.bulkDealsModel.findByPk(id);
      if (!bulkDeal) {
        return (res as any).error("Bulk deal not found", HttpStatusCode.NOT_FOUND);
      }

      // Handle icon upload to S3
      let iconUrl = bulkDeal.icon; // Keep existing icon by default
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

      // Update bulk deal
      await bulkDeal.update({
        icon: iconUrl,
        value: value !== undefined ? value : bulkDeal.value,
        label: label !== undefined ? label : bulkDeal.label,
      });

      res.status(200).json({
        success: true,
        message: "Bulk deal updated successfully",
        data: { bulkDeal },
      });
    } catch (error: any) {
      console.error("Update bulk deal error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Delete bulk deal
  deleteBulkDeal = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const bulkDeal = await this.bulkDealsModel.findByPk(id);
      if (!bulkDeal) {
        return (res as any).error("Bulk deal not found", HttpStatusCode.NOT_FOUND);
      }

      await bulkDeal.destroy();

      res.status(200).json({
        success: true,
        message: "Bulk deal deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete bulk deal error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Get bulk deals statistics
  getBulkDealsStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const totalBulkDeals = await this.bulkDealsModel.count();
      
      // Calculate 30-day percentage changes
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalBulkDeals30DaysAgo = await this.bulkDealsModel.count({
        where: {
          created_at: {
            [Op.lte]: thirtyDaysAgo
          }
        }
      });

      // Calculate percentage change (growth in last 30 days)
      const totalBulkDealsChange = totalBulkDeals30DaysAgo > 0 ? 
        ((totalBulkDeals - totalBulkDeals30DaysAgo) / totalBulkDeals30DaysAgo * 100) : 
        (totalBulkDeals > 0 ? 100 : 0);

      // Get recent bulk deals
      const recentBulkDeals = await this.bulkDealsModel.findAll({
        limit: 5,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: "Bulk deals statistics fetched successfully",
        data: {
          totalBulkDeals,
          recentBulkDeals,
          totalBulkDealsChange: Math.round(totalBulkDealsChange * 100) / 100
        }
      });
    } catch (error: any) {
      console.error("Get bulk deals stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Bulk delete bulk deals
  bulkDeleteBulkDeals = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { bulkDealIds } = req.body;

      if (!bulkDealIds || !Array.isArray(bulkDealIds) || bulkDealIds.length === 0) {
        return (res as any).error("Bulk deal IDs array is required", HttpStatusCode.BAD_REQUEST);
      }

      const deletedCount = await this.bulkDealsModel.destroy({
        where: {
          id: {
            [Op.in]: bulkDealIds
          }
        }
      });

      res.status(200).json({
        success: true,
        message: `${deletedCount} bulk deals deleted successfully`,
      });
    } catch (error: any) {
      console.error("Bulk delete bulk deals error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
