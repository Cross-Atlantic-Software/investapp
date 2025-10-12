import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';

export class ContactFaqController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all contact FAQs (admin - shows all FAQs)
  static async getAllContactFaqs(req: Request, res: Response) {
    try {
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const whereClause: any = {
        // Admin should see ALL FAQs (both active and inactive)
      };
      
      if (search) {
        whereClause[Op.or] = [
          { question: { [Op.like]: `%${search}%` } },
          { answer: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await db.ContactFaq.findAndCountAll({
        where: whereClause,
        order: [['display_order', 'ASC'], ['createdAt', 'ASC']],
        limit: Number(limit),
        offset: offset,
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
      console.error('Error fetching contact FAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch FAQs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all contact FAQs (public - shows only active FAQs)
  static async getContactFaqs(req: Request, res: Response) {
    try {
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const whereClause: any = {
        is_active: true // Public should only see active FAQs
      };
      
      if (search) {
        whereClause[Op.or] = [
          { question: { [Op.like]: `%${search}%` } },
          { answer: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await db.ContactFaq.findAndCountAll({
        where: whereClause,
        order: [['display_order', 'ASC'], ['createdAt', 'ASC']],
        limit: Number(limit),
        offset: offset,
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
      console.error('Error fetching contact FAQs:', error);
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
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      
      const faq = await db.ContactFaq.findByPk(id);

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
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { question, answer, is_active } = req.body;

      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Question and answer are required'
        });
      }

      // Get the highest order index
      const lastFaq = await db.ContactFaq.findOne({
        order: [['display_order', 'DESC']],
      });

      // Auto-assign order as last highest order + 1 (comes at the bottom)
      const autoDisplayOrder = lastFaq ? lastFaq.display_order + 1 : 0;

      const faq = await db.ContactFaq.create({
        question,
        answer,
        display_order: autoDisplayOrder,
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
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { id } = req.params;
      const { question, answer, display_order, is_active } = req.body;

      const faq = await db.ContactFaq.findByPk(id);
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      // Handle order conflicts if display_order is being updated
      if (display_order !== undefined && display_order !== faq.display_order) {
        const newOrder = parseInt(display_order);
        const oldOrder = faq.display_order;

        if (newOrder < oldOrder) {
          // Moving to a lower order (e.g., from 3 to 1)
          // Shift all FAQs with order >= newOrder and < oldOrder up by 1
          const faqsToShift = await db.ContactFaq.findAll({
            where: {
              display_order: {
                [Op.gte]: newOrder,
                [Op.lt]: oldOrder
              },
              id: { [Op.ne]: id }
            },
            order: [['display_order', 'ASC']]
          });

          for (const faqToShift of faqsToShift) {
            await faqToShift.update({
              display_order: faqToShift.display_order + 1
            });
          }
        } else {
          // Moving to a higher order (e.g., from 1 to 3)
          // Shift all FAQs with order > oldOrder and <= newOrder down by 1
          const faqsToShift = await db.ContactFaq.findAll({
            where: {
              display_order: {
                [Op.gt]: oldOrder,
                [Op.lte]: newOrder
              },
              id: { [Op.ne]: id }
            },
            order: [['display_order', 'ASC']]
          });

          for (const faqToShift of faqsToShift) {
            await faqToShift.update({
              display_order: faqToShift.display_order - 1
            });
          }
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
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { id } = req.params;

      const faq = await db.ContactFaq.findByPk(id);
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      const deletedOrder = faq.display_order;

      // Delete the FAQ
      await faq.destroy();

      // Reorder remaining FAQs
      await ContactFaqController.reorderFaqsAfterDeletion(deletedOrder);

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

  // Bulk delete FAQs
  static async bulkDeleteFaqs(req: Request, res: Response) {
    try {
      const controller = new ContactFaqController();
      await controller.ensureDbReady();
      
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'FAQ IDs array is required'
        });
      }

      // Get FAQs to be deleted to track their orders
      const faqsToDelete = await db.ContactFaq.findAll({
        where: {
          id: {
            [Op.in]: ids
          }
        },
        attributes: ['id', 'display_order']
      });

      const deletedOrders = faqsToDelete.map(faq => faq.display_order);

      // Delete the FAQs
      const deletedCount = await db.ContactFaq.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });

      // Reorder remaining FAQs
      await ContactFaqController.reorderFaqsAfterDeletion(0);

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
  private static async reorderFaqsAfterDeletion(deletedOrder: number): Promise<void> {
    try {
      // Get all remaining FAQs, ordered by their current order
      const remainingFaqs = await db.ContactFaq.findAll({
        order: [['display_order', 'ASC']]
      });

      // Reorder all remaining FAQs numerically starting from 0
      for (let i = 0; i < remainingFaqs.length; i++) {
        await remainingFaqs[i].update({
          display_order: i
        });
      }
    } catch (error) {
      console.error('Error reordering FAQs after deletion:', error);
      // Don't throw error here as deletion was successful
    }
  }
}
