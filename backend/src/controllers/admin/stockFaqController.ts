import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';

export class StockFaqController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all FAQs for a specific stock
  static async getStockFaqs(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { stockId } = req.params;
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const whereClause: any = {
        stock_id: stockId,
        is_active: true
      };
      
      if (search) {
        whereClause[Op.or] = [
          { question: { [Op.like]: `%${search}%` } },
          { answer: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await db.StockFaq.findAndCountAll({
        where: whereClause,
        order: [['display_order', 'ASC'], ['created_at', 'ASC']],
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
          faqs: rows,
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
      console.error('Error fetching stock FAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch FAQs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get a specific FAQ by ID
  static async getFaqById(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      
      const faq = await db.StockFaq.findByPk(id, {
        include: [{
          model: db.Product,
          as: 'stock',
          attributes: ['id', 'company_name']
        }]
      });

      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      res.json({
        success: true,
        data: { faq }
      });
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch FAQ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create a new FAQ
  static async createFaq(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { stock_id, question, answer, display_order, is_active } = req.body;

      if (!stock_id || !question || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID, question, and answer are required'
        });
      }

      // Get the highest order index for this stock
      const lastFaq = await db.StockFaq.findOne({
        where: {
          stock_id: parseInt(stock_id),
        },
        order: [['display_order', 'DESC']],
      });

      // Set display_order: 0 for first item, +1 for subsequent items
      const autoDisplayOrder = lastFaq ? lastFaq.display_order + 1 : 0;
      
      // Use provided display_order if specified, otherwise use auto-assigned order
      const finalDisplayOrder = display_order !== undefined ? parseInt(display_order) : autoDisplayOrder;

      // Handle order conflicts if display_order is being set manually
      if (display_order !== undefined) {
        const conflictingFaq = await db.StockFaq.findOne({
          where: {
            stock_id: parseInt(stock_id),
            display_order: parseInt(display_order),
          },
        });

        if (conflictingFaq) {
          // Move the conflicting FAQ to the auto-assigned position
          await conflictingFaq.update({ display_order: autoDisplayOrder });
        }
      }

      const faq = await db.StockFaq.create({
        stock_id,
        question,
        answer,
        display_order: finalDisplayOrder,
        is_active: is_active !== undefined ? is_active : true
      });

      res.status(201).json({
        success: true,
        message: 'FAQ created successfully',
        data: { faq }
      });
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create FAQ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update an existing FAQ
  static async updateFaq(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      const { question, answer, display_order, is_active } = req.body;

      const faq = await db.StockFaq.findByPk(id);
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      // Handle order conflicts if display_order is being updated
      if (display_order !== undefined && display_order !== faq.display_order) {
        // Check if another FAQ already has this display_order for the same stock
        const conflictingFaq = await db.StockFaq.findOne({
          where: {
            stock_id: faq.stock_id,
            display_order: parseInt(display_order),
            id: { [Op.ne]: id },
          },
        });

        if (conflictingFaq) {
          // Move the conflicting FAQ to the old position of the current FAQ
          await conflictingFaq.update({ display_order: faq.display_order });
        }
      }

      await faq.update({
        question: question || faq.question,
        answer: answer || faq.answer,
        display_order: display_order !== undefined ? parseInt(display_order) : faq.display_order,
        is_active: is_active !== undefined ? is_active : faq.is_active
      });

      res.json({
        success: true,
        message: 'FAQ updated successfully',
        data: { faq }
      });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update FAQ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete an FAQ
  static async deleteFaq(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { id } = req.params;

      const faq = await db.StockFaq.findByPk(id);
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      const stockId = faq.stock_id;
      const deletedOrder = faq.display_order;

      // Delete the FAQ
      await faq.destroy();

      // Reorder remaining FAQs for the same stock
      await StockFaqController.reorderFaqsAfterDeletion(stockId, deletedOrder);

      res.json({
        success: true,
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete FAQ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all FAQs (admin)
  static async getAllFaqs(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { page = 1, limit = 10, search = '', stock_id } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const whereClause: any = {};
      
      if (stock_id) {
        whereClause.stock_id = stock_id;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { question: { [Op.like]: `%${search}%` } },
          { answer: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await db.StockFaq.findAndCountAll({
        where: whereClause,
        order: [['stock_id', 'ASC'], ['display_order', 'ASC'], ['created_at', 'ASC']],
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
          faqs: rows,
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
      console.error('Error fetching all FAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch FAQs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Bulk delete FAQs
  static async bulkDeleteFaqs(req: Request, res: Response) {
    try {
      const controller = new StockFaqController();
      await controller.ensureDbReady();
      
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'FAQ IDs array is required'
        });
      }

      // Get FAQs to be deleted to track their stock_id and orders
      const faqsToDelete = await db.StockFaq.findAll({
        where: {
          id: {
            [Op.in]: ids
          }
        },
        attributes: ['id', 'stock_id', 'display_order']
      });

      // Group by stock_id to handle reordering for each stock
      const stockGroups = faqsToDelete.reduce((acc, faq) => {
        if (!acc[faq.stock_id]) {
          acc[faq.stock_id] = [];
        }
        acc[faq.stock_id].push(faq.display_order);
        return acc;
      }, {} as Record<number, number[]>);

      // Delete the FAQs
      const deletedCount = await db.StockFaq.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });

      // Reorder remaining FAQs for each affected stock
      for (const [stockId, deletedOrders] of Object.entries(stockGroups)) {
        // Sort deleted orders to process from highest to lowest
        const sortedDeletedOrders = deletedOrders.sort((a, b) => b - a);
        
        for (const deletedOrder of sortedDeletedOrders) {
          await StockFaqController.reorderFaqsAfterDeletion(parseInt(stockId), deletedOrder);
        }
      }

      res.json({
        success: true,
        message: `${deletedCount} FAQ(s) deleted successfully`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('Error bulk deleting FAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete FAQs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper method to reorder FAQs after deletion
  private static async reorderFaqsAfterDeletion(stockId: number, deletedOrder: number): Promise<void> {
    try {
      // Get all remaining FAQs for this stock with order greater than the deleted order
      const remainingFaqs = await db.StockFaq.findAll({
        where: {
          stock_id: stockId,
          display_order: {
            [Op.gt]: deletedOrder
          }
        },
        order: [['display_order', 'ASC']]
      });

      // Decrement the order of all FAQs that had higher order than the deleted one
      for (let i = 0; i < remainingFaqs.length; i++) {
        await remainingFaqs[i].update({
          display_order: deletedOrder + i
        });
      }
    } catch (error) {
      console.error('Error reordering FAQs after deletion:', error);
      // Don't throw error here as deletion was successful
    }
  }
}

