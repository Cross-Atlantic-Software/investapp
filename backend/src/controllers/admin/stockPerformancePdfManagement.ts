import { Request, Response } from 'express';
import { StockPerformancePdfModel } from '../../Models/StockPerformancePdf';
import { Op } from 'sequelize';
import { uploadPdf } from '../../utils/middlewares/s3Upload';

export const uploadMiddleware = uploadPdf.single('pdf');

export class StockPerformancePdfManagementController {
  // Get all performance PDFs for a specific stock
  static async getPdfsByStockId(req: Request, res: Response) {
    try {
      const { stockId } = req.params;
      const { page = 1, limit = 10, sort_by = 'order_index', sort_order = 'ASC' } = req.query;

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
      console.error('Error fetching performance PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance PDFs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get a specific performance PDF by ID
  static async getPdfById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockPerformancePdfModel.findByPk(id);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Performance PDF not found',
        });
      }

      res.json({
        success: true,
        data: pdf,
      });
    } catch (error) {
      console.error('Error fetching performance PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Upload and create a new performance PDF
  static async createPdf(req: Request, res: Response) {
    try {
      const { stock_id, title, description, order_index = 0 } = req.body;

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
        order_index: parseInt(order_index) || 0,
        is_active: isActive,
      });

      res.status(201).json({
        success: true,
        message: 'Performance PDF uploaded successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error creating performance PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create performance PDF',
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

      const createdPdfs = [];
      let isFirstNewPdf = true;

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
          order_index: pdfData.order_index || 0,
          is_active: isActive,
        });

        createdPdfs.push(pdf);
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
      const { id } = req.params;
      const { title, description, order_index, is_active } = req.body;

      const pdf = await StockPerformancePdfModel.findByPk(id);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Performance PDF not found',
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
        message: 'Performance PDF updated successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error updating performance PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update performance PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete a performance PDF
  static async deletePdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockPerformancePdfModel.findByPk(id);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Performance PDF not found',
        });
      }

      // Note: S3 files are automatically cleaned up by lifecycle policies
      // No need to manually delete from S3 for now

      // Delete the database record
      await pdf.destroy();

      res.json({
        success: true,
        message: 'Performance PDF deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting performance PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete performance PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Replace PDF file (keep metadata, update file)
  static async replacePdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockPerformancePdfModel.findByPk(id);

      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Performance PDF not found',
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
      const { stockId } = req.params;

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
      console.error('Error fetching performance PDF stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance PDF statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
