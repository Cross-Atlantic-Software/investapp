import { Request, Response } from 'express';
import { StockSectorInsightsPdfModel } from '../../Models/StockSectorInsightsPdf';
import { Op } from 'sequelize';

export class StockSectorInsightsPdfManagementController {
  // Get PDF by ID
  static async getPdfById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockSectorInsightsPdfModel.findByPk(id);
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Sector insights PDF not found',
        });
      }

      res.json({
        success: true,
        data: pdf,
      });
    } catch (error) {
      console.error('Error fetching sector insights PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sector insights PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get PDFs for a specific stock (Public API - uses :id parameter)
  static async getPdfsByStockIdPublic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { is_active } = req.query;

      const whereClause: any = {
        stock_id: parseInt(id),
      };

      // Public API should only show active PDFs by default
      if (is_active === 'true') {
        whereClause.is_active = true;
      }

      const pdfs = await StockSectorInsightsPdfModel.findAll({
        where: whereClause,
        order: [['order_index', 'ASC'], ['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: {
          pdfs,
          count: pdfs.length,
        },
      });
    } catch (error) {
      console.error('Error fetching sector insights PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sector insights PDFs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get PDFs for a specific stock
  static async getPdfsByStockId(req: Request, res: Response) {
    try {
      const { stockId } = req.params;
      const { sortBy = 'order_index', sortOrder = 'ASC', limit = 10, offset = 0 } = req.query;

      const { count, rows: pdfs } = await StockSectorInsightsPdfModel.findAndCountAll({
        where: {
          stock_id: parseInt(stockId),
          // Admin should see ALL PDFs (both active and inactive)
        },
        order: [[sortBy as string, sortOrder as string]],
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json({
        success: true,
        data: {
          pdfs,
          total: count,
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error) {
      console.error('Error fetching sector insights PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sector insights PDFs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create a new PDF
  static async createPdf(req: Request, res: Response) {
    try {
      const { stock_id, title, description } = req.body;

      if (!stock_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID and title are required',
        });
      }

      const s3File = req.file as any;
      if (!s3File) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is required',
        });
      }

      const pdfUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;

      // Get the highest order index for this stock
      const lastPdf = await StockSectorInsightsPdfModel.findOne({
        where: {
          stock_id: parseInt(stock_id),
        },
        order: [['order_index', 'DESC']],
      });

      // Set order index: 0 for first item, +1 for subsequent items
      const order_index = lastPdf ? lastPdf.order_index + 1 : 0;

      // Check if this is the first PDF for this stock
      const existingPdfCount = await StockSectorInsightsPdfModel.count({
        where: { stock_id: parseInt(stock_id) }
      });
      const isActive = existingPdfCount === 0; // Only the first PDF should be active

      const pdf = await StockSectorInsightsPdfModel.create({
        stock_id: parseInt(stock_id),
        title,
        description: description || '',
        pdf_url: pdfUrl, // S3 URL
        file_name: req.file!.originalname,
        file_size: req.file!.size,
        page_count: 0, // Will be updated later if needed
        order_index,
        is_active: isActive,
      });

      res.json({
        success: true,
        message: 'Sector insights PDF created successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error creating sector insights PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create sector insights PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk create PDFs
  static async bulkCreatePdfs(req: Request, res: Response) {
    try {
      const { stock_id, pdfs } = req.body;

      if (!stock_id || !pdfs || !Array.isArray(pdfs)) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID and PDFs array are required',
        });
      }

      // Check existing PDF count
      const existingPdfCount = await StockSectorInsightsPdfModel.count({
        where: { stock_id: parseInt(stock_id) }
      });

      // Get the highest order index for this stock
      const lastPdf = await StockSectorInsightsPdfModel.findOne({
        where: {
          stock_id: parseInt(stock_id),
        },
        order: [['order_index', 'DESC']],
      });

      const createdPdfs = [];
      let isFirstNewPdf = true;
      let currentOrderIndex = lastPdf ? lastPdf.order_index + 1 : 0;

      for (const pdfData of pdfs) {
        const isActive = existingPdfCount === 0 && isFirstNewPdf;
        if (isActive) isFirstNewPdf = false;

        const pdf = await StockSectorInsightsPdfModel.create({
          stock_id: parseInt(stock_id),
          title: pdfData.title,
          description: pdfData.description || '',
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

      res.json({
        success: true,
        message: `${createdPdfs.length} sector insights PDFs created successfully`,
        data: createdPdfs,
      });
    } catch (error) {
      console.error('Error bulk creating sector insights PDFs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk create sector insights PDFs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update PDF
  static async updatePdf(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, order_index, is_active } = req.body;

      const pdf = await StockSectorInsightsPdfModel.findByPk(id);
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Sector insights PDF not found',
        });
      }

      // Handle order index conflicts if order_index is being updated
      if (order_index !== undefined && order_index !== pdf.order_index) {
        // Check if another PDF already has this order index
        const conflictingPdf = await StockSectorInsightsPdfModel.findOne({
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

      // If setting this PDF as active, deactivate others
      if (is_active === true) {
        await StockSectorInsightsPdfModel.update(
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
        title: title || pdf.title,
        description: description !== undefined ? description : pdf.description,
        order_index: order_index !== undefined ? order_index : pdf.order_index,
        is_active: is_active !== undefined ? is_active : pdf.is_active,
      });

      res.json({
        success: true,
        message: 'Sector insights PDF updated successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error updating sector insights PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update sector insights PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Replace PDF file
  static async replacePdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockSectorInsightsPdfModel.findByPk(id);
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Sector insights PDF not found',
        });
      }

      const s3File = req.file as any;
      if (!s3File) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is required',
        });
      }

      const newPdfUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;

      await pdf.update({
        pdf_url: newPdfUrl,
        file_name: req.file!.originalname,
        file_size: req.file!.size,
        page_count: 0,
        // is_active remains unchanged - don't modify active status when replacing file
      });

      res.json({
        success: true,
        message: 'Sector insights PDF replaced successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error replacing sector insights PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to replace sector insights PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete PDF
  static async deletePdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockSectorInsightsPdfModel.findByPk(id);
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Sector insights PDF not found',
        });
      }

      await pdf.destroy();

      res.json({
        success: true,
        message: 'Sector insights PDF deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting sector insights PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete sector insights PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Set PDF as active
  static async setActivePdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdf = await StockSectorInsightsPdfModel.findByPk(id);
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'Sector insights PDF not found',
        });
      }

      // Deactivate all other PDFs for this stock
      await StockSectorInsightsPdfModel.update(
        { is_active: false },
        {
          where: {
            stock_id: pdf.stock_id,
            id: { [Op.ne]: id },
          },
        }
      );

      // Activate this PDF
      await pdf.update({ is_active: true });

      res.json({
        success: true,
        message: 'Sector insights PDF set as active successfully',
        data: pdf,
      });
    } catch (error) {
      console.error('Error setting active sector insights PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set active sector insights PDF',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get PDF statistics
  static async getPdfStats(req: Request, res: Response) {
    try {
      const { stockId } = req.params;

      const totalPdfs = await StockSectorInsightsPdfModel.count({
        where: { stock_id: stockId },
      });

      const activePdfs = await StockSectorInsightsPdfModel.count({
        where: { stock_id: stockId, is_active: true },
      });

      res.json({
        success: true,
        data: {
          totalPdfs,
          activePdfs,
        },
      });
    } catch (error) {
      console.error('Error fetching sector insights PDF stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sector insights PDF statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
