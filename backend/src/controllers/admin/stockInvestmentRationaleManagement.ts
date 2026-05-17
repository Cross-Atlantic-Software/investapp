import { Request, Response } from 'express';
import { StockInvestmentRationaleModel } from '../../Models/StockInvestmentRationale';
import { Op } from 'sequelize';
import { uploadIcon } from '../../utils/middlewares/s3Upload';

export class StockInvestmentRationaleManagementController {
  // Get all investment rationales for a specific stock
  static async getRationalesByStockId(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;
      const { page = 1, limit = 10, sort_by = 'order_index', sort_order = 'ASC' } = req.query as Record<string, string>;

      const offset = (Number(page) - 1) * Number(limit);
      const validSortFields = ['id', 'type', 'title', 'order_index', 'created_at', 'updated_at'];
      const validSortOrder = ['ASC', 'DESC'];

      const sortBy = validSortFields.includes(sort_by as string) ? sort_by as string : 'order_index';
      const sortOrder = validSortOrder.includes((sort_order as string).toUpperCase()) ? (sort_order as string).toUpperCase() : 'ASC';

      const { count, rows: rationales } = await StockInvestmentRationaleModel.findAndCountAll({
        where: {
          stock_id: stockId,
        },
        order: [[sortBy, sortOrder]],
        limit: Number(limit),
        offset: offset,
      });

      // Group by type
      const groupedRationales = {
        pros: rationales.filter(r => r.type === 'pros'),
        risks: rationales.filter(r => r.type === 'risks')
      };

      res.json({
        success: true,
        data: {
          rationales: groupedRationales,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalItems: count,
            itemsPerPage: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching investment rationales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch investment rationales',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get a specific investment rationale by ID
  static async getRationaleById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const rationale = await StockInvestmentRationaleModel.findByPk(id as string);

      if (!rationale) {
        return res.status(404).json({
          success: false,
          message: 'Investment rationale not found',
        });
      }

      res.json({
        success: true,
        data: rationale,
      });
    } catch (error) {
      console.error('Error fetching investment rationale:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch investment rationale',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create a new investment rationale
  static async createRationale(req: Request, res: Response) {
    try {
      const { stock_id, type, title, description } = req.body;

      // Validation
      if (!stock_id || !type || !title || !description) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      if (!['pros', 'risks'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either pros or risks',
        });
      }

      // Check if title already exists for this stock and type
      const existingRationale = await StockInvestmentRationaleModel.findOne({
        where: {
          stock_id,
          type,
          title,
        },
      });

      if (existingRationale) {
        return res.status(400).json({
          success: false,
          message: 'Title already exists for this stock and type',
        });
      }

      // Get the highest order index for this stock and type
      const lastRationale = await StockInvestmentRationaleModel.findOne({
        where: {
          stock_id,
          type,
        },
        order: [['order_index', 'DESC']],
      });

      // Set order index: 0 for first item, +1 for subsequent items
      const order_index = lastRationale ? lastRationale.order_index + 1 : 0;

      // Handle icon upload if provided
      let iconUrl = null;
      if (req.file) {
        const s3File = req.file as any;
        iconUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
      }

      const rationale = await StockInvestmentRationaleModel.create({
        stock_id,
        type,
        title,
        description,
        icon: iconUrl,
        order_index,
      });

      res.status(201).json({
        success: true,
        message: 'Investment rationale created successfully',
        data: rationale,
      });
    } catch (error) {
      console.error('Error creating investment rationale:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create investment rationale',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update an investment rationale
  static async updateRationale(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { type, title, description, order_index } = req.body;

      const rationale = await StockInvestmentRationaleModel.findByPk(id as string);

      if (!rationale) {
        return res.status(404).json({
          success: false,
          message: 'Investment rationale not found',
        });
      }

      // Validation
      if (type && !['pros', 'risks'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either pros or risks',
        });
      }

      // Check if title already exists for this stock and type (if title is being updated)
      if (title && title !== rationale.title) {
        const existingRationale = await StockInvestmentRationaleModel.findOne({
          where: {
            stock_id: rationale.stock_id,
            type: type || rationale.type,
            title,
            id: { [Op.ne]: id },
          },
        });

        if (existingRationale) {
          return res.status(400).json({
            success: false,
            message: 'Title already exists for this stock and type',
          });
        }
      }

      // Handle order index conflicts if order_index is being updated
      if (order_index !== undefined && order_index !== rationale.order_index) {
        const currentType = type || rationale.type;
        
        // Check if another item already has this order index
        const conflictingItem = await StockInvestmentRationaleModel.findOne({
          where: {
            stock_id: rationale.stock_id,
            type: currentType,
            order_index: order_index,
            id: { [Op.ne]: id },
          },
        });

        if (conflictingItem) {
          // Move the conflicting item to the old position of the current item
          await conflictingItem.update({ order_index: rationale.order_index });
        }
      }

      // Handle icon upload if provided
      let iconUrl = rationale.icon; // Keep existing icon by default
      if (req.file) {
        const s3File = req.file as any;
        iconUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
      }

      await rationale.update({
        type: type || rationale.type,
        title: title || rationale.title,
        description: description || rationale.description,
        icon: iconUrl,
        order_index: order_index !== undefined ? order_index : rationale.order_index,
      });

      res.json({
        success: true,
        message: 'Investment rationale updated successfully',
        data: rationale,
      });
    } catch (error) {
      console.error('Error updating investment rationale:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update investment rationale',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete an investment rationale
  static async deleteRationale(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const rationale = await StockInvestmentRationaleModel.findByPk(id as string);

      if (!rationale) {
        return res.status(404).json({
          success: false,
          message: 'Investment rationale not found',
        });
      }

      const stockId = rationale.stock_id;
      const rationaleType = rationale.type;
      const deletedOrder = rationale.order_index;

      await rationale.destroy();

      // Reorder remaining rationales for the same stock and type
      await StockInvestmentRationaleManagementController.reorderRationalesAfterDeletion(stockId, rationaleType, deletedOrder);

      res.json({
        success: true,
        message: 'Investment rationale deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting investment rationale:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete investment rationale',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk create investment rationales for a stock
  static async bulkCreateRationales(req: Request, res: Response) {
    try {
      const { stock_id, rationales } = req.body;

      if (!stock_id || !Array.isArray(rationales) || rationales.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID and rationales array are required',
        });
      }

      // Validate each rationale
      for (const rationale of rationales) {
        if (!rationale.type || !rationale.title || !rationale.description) {
          return res.status(400).json({
            success: false,
            message: 'All rationale fields are required',
          });
        }

        if (!['pros', 'risks'].includes(rationale.type)) {
          return res.status(400).json({
            success: false,
            message: 'Type must be either pros or risks',
          });
        }
      }

      // Check for duplicate titles
      const titles = rationales.map(r => `${r.type}-${r.title}`);
      const uniqueTitles = [...new Set(titles)];
      if (titles.length !== uniqueTitles.length) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate titles found in rationales',
        });
      }

      // Check if any title already exists for this stock
      const existingRationales = await StockInvestmentRationaleModel.findAll({
        where: {
          stock_id,
          [Op.or]: rationales.map(r => ({
            type: r.type,
            title: r.title,
          })),
        },
      });

      if (existingRationales.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some titles already exist for this stock',
        });
      }

      // Group rationales by type and assign proper order indices
      const rationalesByType = rationales.reduce((acc, rationale) => {
        if (!acc[rationale.type]) {
          acc[rationale.type] = [];
        }
        acc[rationale.type].push(rationale);
        return acc;
      }, {} as Record<string, any[]>);

      // Get current highest order index for each type
      const orderIndices: Record<string, number> = {};
      for (const type of ['pros', 'risks']) {
        const lastRationale = await StockInvestmentRationaleModel.findOne({
          where: { stock_id, type },
          order: [['order_index', 'DESC']],
        });
        orderIndices[type] = lastRationale ? lastRationale.order_index + 1 : 0;
      }

      // Create all rationales with proper order indices
      const rationalesToCreate: Array<{
        stock_id: number;
        type: 'pros' | 'risks';
        title: string;
        description: string;
        order_index: number;
      }> = [];
      for (const type of ['pros', 'risks']) {
        if (rationalesByType[type]) {
          rationalesByType[type].forEach((rationale: any, index: number) => {
            rationalesToCreate.push({
              stock_id,
              type: rationale.type as 'pros' | 'risks',
              title: rationale.title,
              description: rationale.description,
              order_index: orderIndices[type] + index,
            });
          });
        }
      }

      const createdRationales = await StockInvestmentRationaleModel.bulkCreate(rationalesToCreate);

      res.status(201).json({
        success: true,
        message: 'Investment rationales created successfully',
        data: createdRationales,
      });
    } catch (error) {
      console.error('Error bulk creating investment rationales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create investment rationales',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get investment rationale statistics
  static async getRationaleStats(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;

      const totalRationales = await StockInvestmentRationaleModel.count({
        where: { stock_id: stockId },
      });

      const prosCount = await StockInvestmentRationaleModel.count({
        where: { stock_id: stockId, type: 'pros' },
      });

      const risksCount = await StockInvestmentRationaleModel.count({
        where: { stock_id: stockId, type: 'risks' },
      });

      res.json({
        success: true,
        data: {
          totalRationales,
          prosCount,
          risksCount,
        },
      });
    } catch (error) {
      console.error('Error fetching investment rationale stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch investment rationale statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Helper method to reorder rationales after deletion
  private static async reorderRationalesAfterDeletion(stockId: number, rationaleType: string, deletedOrder: number): Promise<void> {
    try {
      // Get all remaining rationales for this stock and type with order greater than the deleted order
      const remainingRationales = await StockInvestmentRationaleModel.findAll({
        where: {
          stock_id: stockId,
          type: rationaleType,
          order_index: {
            [Op.gt]: deletedOrder
          }
        },
        order: [['order_index', 'ASC']]
      });

      // Decrement the order of all rationales that had higher order than the deleted one
      for (let i = 0; i < remainingRationales.length; i++) {
        await remainingRationales[i].update({
          order_index: deletedOrder + i
        });
      }
    } catch (error) {
      console.error('Error reordering rationales after deletion:', error);
      // Don't throw error here as deletion was successful
    }
  }
}
