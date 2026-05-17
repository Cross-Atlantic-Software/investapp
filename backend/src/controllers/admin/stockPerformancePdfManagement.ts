import { Request, Response } from 'express';
import { StockPerformancePdfModel } from '../../Models/StockPerformancePdf';
import { Op } from 'sequelize';
import { uploadPdf } from '../../utils/middlewares/s3Upload';

export const uploadMiddleware = uploadPdf.single('pdf');

export class StockPerformancePdfManagementController {
  // Get all performance PDFs for a specific stock
  static async getPdfsByStockId(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;
      const { page = 1, limit = 10, sort_by = 'order_index', sort_order = 'ASC' } = req.query as Record<string, string>;

      const offset = (Number(page) - 1) * Number(limit);
      const validSortFields = ['id', 'title', 'order_index', 'created_at', 'updated_at'];
      const validSortOrder = ['ASC', 'DESC'];

      const sortBy = validSortFields.includes(sort_by as string) ? sort_by as string : 'order_index';
      const sortOrder = validSortOrder.includes((sort_order as string).toUpperCase()) ? (sort_order as string).toUpperCase() : 'ASC';

      const { count, rows: pdfs } = await StockPerformancePdfModel.findAndCountAll({
        where: {
          stock_id: stockId,
          // Admin should see ALL PDFs (both active and inactive)
        },
        order: [[sortBy, sortOrder]],
        limit: Number(limit),
        offset: offset,
      });

      res.json({
        success: true,
        data: {
          pdfs,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalItems: count,
            itemsPerPage: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching Competitive Benchmarking PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Competitive Benchmarking PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get a specific performance PDF by ID
  static async getPdfById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const pdf = await StockPerformancePdfModel.findByPk(id as string);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Competitive Benchmarking PDF not found',
        });
      }

      res.json({
        success: true,
        data: pdf,
      });
    } catch (error) {
      console.error('Error fetching Competitive Benchmarking PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Competitive Benchmarking PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Upload and create a new performance PDF
  static async createPdf(req: Request, res: Response) {
    try {
      const { stock_id, title, description } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is required',
        });
      }

      // Validation
      if (!stock_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID and title are required',
        });
      }

      // Check if title already exists for this stock
      const existingPdf = await StockPerformancePdfModel.findOne({
        where: {
          stock_id,
          title,
        },
      });

      if (existingPdf) {
        return res.status(400).json({
          success: false,
          message: 'Title already exists for this stock',
        });
      }

      // Get the highest order index for this stock
      const lastPdf = await StockPerformancePdfModel.findOne({
        where: {
          stock_id: parseInt(stock_id),
        },
        order: [['order_index', 'DESC']],
      });

      // Set order index: 0 for first item, +1 for subsequent items
      const order_index = lastPdf ? lastPdf.order_index + 1 : 0;

      // Get S3 URL
      const s3File = req.file as any;
      const pdfUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;

      // Check if this is the first PDF for this stock
      const existingPdfCount = await StockPerformancePdfModel.count({
        where: { stock_id: parseInt(stock_id) }
      });

      // Only the first PDF should be active, others should be inactive
      const isActive = existingPdfCount === 0;

      // Create PDF record
      const pdf = await StockPerformancePdfModel.create({
        stock_id: parseInt(stock_id),
        title,
        description: description || null,
        pdf_url: pdfUrl,
        file_name: req.file.originalname,
        file_size: req.file.size,
        page_count: 0, // Will be updated later if needed
        order_index,
        is_active: isActive,
      });

      res.status(201).json({
        success: true,
        message: 'Competitive Benchmarking PDF uploaded successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error creating Competitive Benchmarking PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Competitive Benchmarking PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk upload multiple PDFs (ensures only first one is active)
  static async bulkCreatePdfs(req: Request, res: Response) {
    try {
      const { stock_id, pdfs } = req.body;

      if (!stock_id || !pdfs || !Array.isArray(pdfs)) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID and PDFs array are required',
        });
      }

      // Check existing PDF count to determine which should be active
      const existingPdfCount = await StockPerformancePdfModel.count({
        where: { stock_id: parseInt(stock_id) }
      });

      // Get the highest order index for this stock
      const lastPdf = await StockPerformancePdfModel.findOne({
        where: {
          stock_id: parseInt(stock_id),
        },
        order: [['order_index', 'DESC']],
      });

      const createdPdfs = [];
      let isFirstNewPdf = true;
      let currentOrderIndex = lastPdf ? lastPdf.order_index + 1 : 0;

      for (const pdfData of pdfs) {
        // Only the first PDF (if no existing PDFs) should be active
        const isActive = existingPdfCount === 0 && isFirstNewPdf;
        if (isActive) isFirstNewPdf = false;

        const pdf = await StockPerformancePdfModel.create({
          stock_id: parseInt(stock_id),
          title: pdfData.title,
          description: pdfData.description || null,
          pdf_url: pdfData.pdf_url,
          file_name: pdfData.file_name,
          file_size: pdfData.file_size,
          page_count: pdfData.page_count || 0,
          order_index: currentOrderIndex,
          is_active: isActive,
        });

        createdPdfs.push(pdf);
        currentOrderIndex++;
      }

      res.status(201).json({
        success: true,
        message: `${createdPdfs.length} PDFs uploaded successfully`,
        data: createdPdfs,
      });
    } catch (error) {
      console.error('Error bulk creating PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk create PDFs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update a performance PDF
  static async updatePdf(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { title, description, order_index, is_active } = req.body;

      const pdf = await StockPerformancePdfModel.findByPk(id as string);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Competitive Benchmarking PDF not found',
        });
      }

      // Check for unique constraint violation if title is changed
      if (title && title !== pdf.title) {
        const existing = await StockPerformancePdfModel.findOne({
          where: {
            stock_id: pdf.stock_id,
            title: title,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Title already exists for this stock',
          });
        }
      }

      // Handle order index conflicts if order_index is being updated
      if (order_index !== undefined && order_index !== pdf.order_index) {
        // Check if another PDF already has this order index
        const conflictingPdf = await StockPerformancePdfModel.findOne({
          where: {
            stock_id: pdf.stock_id,
            order_index: order_index,
            id: { [Op.ne]: id },
          },
        });

        if (conflictingPdf) {
          // Move the conflicting PDF to the old position of the current PDF
          await conflictingPdf.update({ order_index: pdf.order_index });
        }
      }

      // If setting this PDF as active, deactivate all other PDFs for this stock
      if (is_active === true) {
        await StockPerformancePdfModel.update(
          { is_active: false },
          {
            where: {
              stock_id: pdf.stock_id,
              id: { [Op.ne]: id },
            },
          }
        );
      }

      await pdf.update({
        title: title ?? pdf.title,
        description: description ?? pdf.description,
        order_index: order_index !== undefined ? order_index : pdf.order_index,
        is_active: is_active !== undefined ? is_active : pdf.is_active,
      });

      res.json({
        success: true,
        message: 'Competitive Benchmarking PDF updated successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error updating Competitive Benchmarking PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Competitive Benchmarking PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete a performance PDF
  static async deletePdf(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const pdf = await StockPerformancePdfModel.findByPk(id as string);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Competitive Benchmarking PDF not found',
        });
      }

      const stockId = pdf.stock_id;
      const deletedOrder = pdf.order_index;

      // Note: S3 files are automatically cleaned up by lifecycle policies
      // No need to manually delete from S3 for now

      // Delete the database record
      await pdf.destroy();

      // Reorder remaining PDFs for the same stock
      await StockPerformancePdfManagementController.reorderPdfsAfterDeletion(stockId, deletedOrder);

      res.json({
        success: true,
        message: 'Competitive Benchmarking PDF deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting Competitive Benchmarking PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete Competitive Benchmarking PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Replace PDF file (keep metadata, update file)
  static async replacePdf(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const pdf = await StockPerformancePdfModel.findByPk(id as string);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Competitive Benchmarking PDF not found',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is required',
        });
      }

      // Get S3 URL for new file
      const s3File = req.file as any;
      const newPdfUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;

      // Update PDF with new file information
      // Keep the existing is_active status when replacing file
      await pdf.update({
        pdf_url: newPdfUrl,
        file_name: req.file.originalname,
        file_size: req.file.size,
        page_count: 0, // Reset page count, will be updated when loaded
        // is_active remains unchanged - don't modify active status when replacing file
      });

      res.json({
        success: true,
        message: 'PDF file replaced successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error replacing PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to replace PDF file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get performance PDF statistics
  static async getPdfStats(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;

      const totalPdfs = await StockPerformancePdfModel.count({
        where: { stock_id: stockId, is_active: true },
      });

      const totalSize = await StockPerformancePdfModel.sum('file_size', {
        where: { stock_id: stockId, is_active: true },
      });

      res.json({
        success: true,
        data: {
          totalPdfs,
          totalSize: totalSize || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching Competitive Benchmarking PDF stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Competitive Benchmarking PDF statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Helper method to reorder PDFs after deletion
  private static async reorderPdfsAfterDeletion(stockId: number, deletedOrder: number): Promise<void> {
    try {
      // Get all remaining PDFs for this stock with order greater than the deleted order
      const remainingPdfs = await StockPerformancePdfModel.findAll({
        where: {
          stock_id: stockId,
          order_index: {
            [Op.gt]: deletedOrder
          }
        },
        order: [['order_index', 'ASC']]
      });

      // Decrement the order of all PDFs that had higher order than the deleted one
      for (let i = 0; i < remainingPdfs.length; i++) {
        await remainingPdfs[i].update({
          order_index: deletedOrder + i
        });
      }
    } catch (error) {
      console.error('Error reordering PDFs after deletion:', error);
      // Don't throw error here as deletion was successful
    }
  }
}
