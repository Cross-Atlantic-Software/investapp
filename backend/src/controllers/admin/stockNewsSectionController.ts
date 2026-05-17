import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { uploadBanner } from '../../utils/middlewares/s3Upload';

export class StockNewsSectionController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all news sections for a specific stock
  static async getStockNewsSections(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const stockId = req.params.stockId as string;
      const { page = 1, limit = 10, search = '' } = req.query as Record<string, string>;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const whereClause: any = {
        stock_id: stockId
      };
      
      if (search) {
        whereClause.title = {
          [Op.like]: `%${search}%`
        };
      }
      
      const { count, rows } = await db.StockNewsSection.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: offset,
        include: [{
          model: db.Product,
          as: 'stock',
          attributes: ['id', 'company_name']
        }]
      });

      res.json({
        success: true,
        data: {
          newsSections: rows,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalCount: count,
            limit: Number(limit),
            hasNext: offset + Number(limit) < count,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching stock news sections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news sections',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get a specific news section by ID
  static async getNewsSectionById(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const id = req.params.id as string;
      
      const newsSection = await db.StockNewsSection.findByPk(id as string, {
        include: [{
          model: db.Product,
          as: 'stock',
          attributes: ['id', 'company_name']
        }]
      });

      if (!newsSection) {
        return res.status(404).json({
          success: false,
          message: 'News section not found'
        });
      }

      res.json({
        success: true,
        data: newsSection
      });
    } catch (error) {
      console.error('Error fetching news section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news section',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create a new news section
  static async createNewsSection(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const { title, stock_id, url, banner } = req.body;

      // Validate required fields
      if (!title || !stock_id || !url) {
        return res.status(400).json({
          success: false,
          message: 'Title, stock_id, and url are required'
        });
      }

      // Check if stock exists
      const stock = await db.Product.findByPk(stock_id);
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }

      const newsSection = await db.StockNewsSection.create({
        title: title.trim(),
        stock_id: parseInt(stock_id),
        url: url.trim(),
        banner: banner || null
      });

      res.status(201).json({
        success: true,
        message: 'News section created successfully',
        data: newsSection
      });
    } catch (error) {
      console.error('Error creating news section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create news section',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update a news section
  static async updateNewsSection(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const id = req.params.id as string;
      const { title, stock_id, url, banner } = req.body;

      const newsSection = await db.StockNewsSection.findByPk(id as string);
      if (!newsSection) {
        return res.status(404).json({
          success: false,
          message: 'News section not found'
        });
      }

      // If stock_id is being updated, check if new stock exists
      if (stock_id && stock_id !== newsSection.stock_id) {
        const stock = await db.Product.findByPk(stock_id);
        if (!stock) {
          return res.status(404).json({
            success: false,
            message: 'Stock not found'
          });
        }
      }

      const updateData: any = {};
      if (title) updateData.title = title.trim();
      if (stock_id) updateData.stock_id = parseInt(stock_id);
      if (url) updateData.url = url.trim();
      if (banner !== undefined) updateData.banner = banner;

      await newsSection.update(updateData);

      res.json({
        success: true,
        message: 'News section updated successfully',
        data: newsSection
      });
    } catch (error) {
      console.error('Error updating news section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update news section',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete a news section
  static async deleteNewsSection(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const id = req.params.id as string;

      const newsSection = await db.StockNewsSection.findByPk(id as string);
      if (!newsSection) {
        return res.status(404).json({
          success: false,
          message: 'News section not found'
        });
      }

      await newsSection.destroy();

      res.json({
        success: true,
        message: 'News section deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting news section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete news section',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Upload banner image
  static async uploadBanner(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'Banner uploaded successfully',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: (req.file as any).location
        }
      });
    } catch (error) {
      console.error('Error in upload banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all news sections (for admin listing)
  static async getAllNewsSections(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const { page = 1, limit = 20, search = '', stock_id } = req.query as Record<string, string>;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const whereClause: any = {};
      
      if (search) {
        whereClause.title = {
          [Op.like]: `%${search}%`
        };
      }
      
      if (stock_id) {
        whereClause.stock_id = stock_id;
      }
      
      const { count, rows } = await db.StockNewsSection.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: offset,
        include: [{
          model: db.Product,
          as: 'stock',
          attributes: ['id', 'company_name']
        }]
      });

      res.json({
        success: true,
        data: {
          newsSections: rows,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalCount: count,
            limit: Number(limit),
            hasNext: offset + Number(limit) < count,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching all news sections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news sections',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Bulk delete news sections
  static async bulkDeleteNewsSections(req: Request, res: Response) {
    try {
      const controller = new StockNewsSectionController();
      await controller.ensureDbReady();
      
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'IDs array is required'
        });
      }

      const deletedCount = await db.StockNewsSection.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });

      res.json({
        success: true,
        message: `${deletedCount} news sections deleted successfully`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('Error bulk deleting news sections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete news sections',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
