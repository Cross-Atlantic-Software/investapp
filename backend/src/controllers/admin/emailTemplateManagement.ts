import { Request, Response } from "express";
import { Op } from "sequelize";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";

export class EmailTemplateManagementController {
  private emailTemplateModel = db.EmailTemplate;

  private async ensureDbReady() {
    await sequelizePromise;
  }

  getAllEmailTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sort_by as string || 'createdAt';
      const sortOrder = req.query.sort_order as string || 'DESC';
      const offset = (page - 1) * limit;

      // Validate sort fields to prevent SQL injection
      const allowedSortFields = ['type', 'subject', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { type: { [Op.like]: `%${search}%` } },
          { subject: { [Op.like]: `%${search}%` } }
        ];
      }

      const totalCount = await this.emailTemplateModel.count({ where: whereClause });
      const templates = await this.emailTemplateModel.findAll({
        where: whereClause,
        attributes: [
          'id', 'type', 'subject', 'body', 
          'created_by', 'updated_by', 'createdAt', 'updatedAt'
        ],
        order: [[validSortBy, validSortOrder]],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success: true,
        message: "Email templates fetched successfully",
        data: {
          templates,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error: any) {
      console.error("Get all email templates error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getEmailTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const template = await this.emailTemplateModel.findByPk(id);
      if (!template) {
        return (res as any).error("Email template not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Email template fetched successfully",
        data: { template }
      });
    } catch (error: any) {
      console.error("Get email template by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { type, subject, body } = req.body;
      const adminId = (req.user as any)?.user_id;

      if (!type || !subject || !body) {
        return (res as any).error("Type, subject, and body are required", HttpStatusCode.BAD_REQUEST);
      }

      // Check if template type already exists
      const existingTemplate = await this.emailTemplateModel.findOne({
        where: { type }
      });

      if (existingTemplate) {
        return (res as any).error("Email template type already exists", HttpStatusCode.CONFLICT);
      }

      const newTemplate = await this.emailTemplateModel.create({
        type,
        subject,
        body,
        created_by: adminId,
        updated_by: adminId
      });

      res.status(201).json({
        success: true,
        message: "Email template created successfully",
        data: { template: newTemplate }
      });
    } catch (error: any) {
      console.error("Create email template error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updateEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { type, subject, body } = req.body;
      const adminId = (req.user as any)?.user_id;

      const template = await this.emailTemplateModel.findByPk(id);
      if (!template) {
        return (res as any).error("Email template not found", HttpStatusCode.NOT_FOUND);
      }

      // Check if type is being changed and if new type already exists
      if (type && type !== template.type) {
        const existingTemplate = await this.emailTemplateModel.findOne({
          where: { 
            type, 
            id: { [Op.ne]: parseInt(id) } 
          }
        });

        if (existingTemplate) {
          return (res as any).error("Email template type already exists", HttpStatusCode.CONFLICT);
        }
      }

      const updateData: any = {
        updated_by: adminId
      };

      if (type !== undefined) updateData.type = type;
      if (subject !== undefined) updateData.subject = subject;
      if (body !== undefined) updateData.body = body;

      await template.update(updateData);

      res.status(200).json({
        success: true,
        message: "Email template updated successfully",
        data: { template }
      });
    } catch (error: any) {
      console.error("Update email template error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deleteEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const template = await this.emailTemplateModel.findByPk(id);
      if (!template) {
        return (res as any).error("Email template not found", HttpStatusCode.NOT_FOUND);
      }

      await template.destroy();

      res.status(200).json({
        success: true,
        message: "Email template deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete email template error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getEmailTemplateStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalTemplates = await this.emailTemplateModel.count();

      const templatesByType = await this.emailTemplateModel.findAll({
        attributes: [
          'type',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      res.status(200).json({
        success: true,
        message: "Email template statistics fetched successfully",
        data: {
          totalTemplates,
          templatesByType
        }
      });
    } catch (error: any) {
      console.error("Get email template stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
