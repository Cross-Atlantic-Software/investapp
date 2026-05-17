import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class MethodologyNotesManagementController {
  private methodologyNoteModel = db.MethodologyNote;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  getAllMethodologyNotes = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'created_at', sort_order = 'DESC' } = req.query as Record<string, string>;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { section_name: { [Op.like]: `%${search}%` } },
          { section_key: { [Op.like]: `%${search}%` } },
          { methodology_text: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: methodologyNotes } = await this.methodologyNoteModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        message: "Methodology notes fetched successfully",
        data: {
          methodologyNotes,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all methodology notes error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getMethodologyNoteById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const id = req.params.id as string;

      const methodologyNote = await this.methodologyNoteModel.findByPk(id as string);

      if (!methodologyNote) {
        return (res as any).error('Methodology note not found', HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Methodology note fetched successfully",
        data: methodologyNote,
      });
    } catch (error: any) {
      console.error("Get methodology note by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createMethodologyNote = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { section_key, section_name, methodology_text, is_active = true } = req.body;
      const created_by = (req as any).user?.id || 1; // Default to admin user ID 1

      // Validate required fields
      if (!section_key || !section_name || !methodology_text) {
        return (res as any).error('Missing required fields: section_key, section_name, methodology_text', HttpStatusCode.BAD_REQUEST);
      }

      // Check if section_key already exists
      const existingNote = await this.methodologyNoteModel.findOne({
        where: { section_key }
      });

      if (existingNote) {
        return (res as any).error('Methodology note with this section key already exists', HttpStatusCode.CONFLICT);
      }

      const methodologyNote = await this.methodologyNoteModel.create({
        section_key,
        section_name,
        methodology_text,
        is_active,
        created_by,
        updated_by: created_by,
      });

      res.status(201).json({
        success: true,
        message: "Methodology note created successfully",
        data: methodologyNote,
      });
    } catch (error: any) {
      console.error("Create methodology note error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updateMethodologyNote = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const id = req.params.id as string;
      const { section_key, section_name, methodology_text, is_active } = req.body;
      const updated_by = (req as any).user?.id || 1; // Default to admin user ID 1

      const methodologyNote = await this.methodologyNoteModel.findByPk(id as string);

      if (!methodologyNote) {
        return (res as any).error('Methodology note not found', HttpStatusCode.NOT_FOUND);
      }

      // Check if section_key already exists for another record
      if (section_key && section_key !== methodologyNote.section_key) {
        const existingNote = await this.methodologyNoteModel.findOne({
          where: { 
            section_key,
            id: { [Op.ne]: id }
          }
        });

        if (existingNote) {
          return (res as any).error('Methodology note with this section key already exists', HttpStatusCode.CONFLICT);
        }
      }

      await methodologyNote.update({
        ...(section_key && { section_key }),
        ...(section_name && { section_name }),
        ...(methodology_text && { methodology_text }),
        ...(is_active !== undefined && { is_active }),
        updated_by,
      });

      res.status(200).json({
        success: true,
        message: "Methodology note updated successfully",
        data: methodologyNote,
      });
    } catch (error: any) {
      console.error("Update methodology note error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deleteMethodologyNote = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const id = req.params.id as string;

      const methodologyNote = await this.methodologyNoteModel.findByPk(id as string);

      if (!methodologyNote) {
        return (res as any).error('Methodology note not found', HttpStatusCode.NOT_FOUND);
      }

      await methodologyNote.destroy();

      res.status(200).json({
        success: true,
        message: "Methodology note deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete methodology note error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getAllActiveMethodologyNotes = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const methodologyNotes = await this.methodologyNoteModel.findAll({
        where: { is_active: true },
        order: [['section_key', 'ASC']],
      });

      res.status(200).json({
        success: true,
        message: "Active methodology notes fetched successfully",
        data: methodologyNotes,
      });
    } catch (error: any) {
      console.error("Get all active methodology notes error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
