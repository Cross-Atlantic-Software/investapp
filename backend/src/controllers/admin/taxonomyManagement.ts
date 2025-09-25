import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class TaxonomyManagementController {
  private taxonomyModel = db.Taxonomy;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  getAllTaxonomies = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { page = 1, limit = 10, search = '', sort_by = 'createdAt', sort_order = 'DESC' } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows: taxonomies } = await this.taxonomyModel.findAndCountAll({
        where: whereClause,
        order,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        message: "Taxonomies fetched successfully",
        data: {
          taxonomies,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all taxonomies error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getTaxonomyById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const taxonomy = await this.taxonomyModel.findByPk(id);

      if (!taxonomy) {
        return (res as any).error("Taxonomy not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Taxonomy fetched successfully",
        data: { taxonomy },
      });
    } catch (error: any) {
      console.error("Get taxonomy by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  createTaxonomy = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { name, color } = req.body;

      if (!name) {
        return (res as any).error("Name is required", HttpStatusCode.BAD_REQUEST);
      }

      // Validate color format if provided
      if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return (res as any).error("Color must be a valid hex color code (e.g., #FF5733)", HttpStatusCode.BAD_REQUEST);
      }

      // Check if taxonomy name already exists
      const existingTaxonomy = await this.taxonomyModel.findOne({
        where: { name }
      });

      if (existingTaxonomy) {
        return (res as any).error("Taxonomy name already exists", HttpStatusCode.CONFLICT);
      }

      const newTaxonomy = await this.taxonomyModel.create({
        name,
        color: color || '#3B82F6',
      });

      res.status(201).json({
        success: true,
        message: "Taxonomy created successfully",
        data: { taxonomy: newTaxonomy },
      });
    } catch (error: any) {
      console.error("Create taxonomy error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  updateTaxonomy = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { name, color } = req.body;

      const taxonomy = await this.taxonomyModel.findByPk(id);
      if (!taxonomy) {
        return (res as any).error("Taxonomy not found", HttpStatusCode.NOT_FOUND);
      }

      // Validate color format if provided
      if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return (res as any).error("Color must be a valid hex color code (e.g., #FF5733)", HttpStatusCode.BAD_REQUEST);
      }

      // Check if new name conflicts with existing taxonomy (excluding current one)
      if (name && name !== taxonomy.name) {
        const existingTaxonomy = await this.taxonomyModel.findOne({
          where: { 
            name,
            id: { [Op.ne]: id }
          }
        });

        if (existingTaxonomy) {
          return (res as any).error("Taxonomy name already exists", HttpStatusCode.CONFLICT);
        }
      }

      await taxonomy.update({
        name: name !== undefined ? name : taxonomy.name,
        color: color !== undefined ? color : taxonomy.color,
      });

      res.status(200).json({
        success: true,
        message: "Taxonomy updated successfully",
        data: { taxonomy },
      });
    } catch (error: any) {
      console.error("Update taxonomy error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  deleteTaxonomy = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const taxonomy = await this.taxonomyModel.findByPk(id);
      if (!taxonomy) {
        return (res as any).error("Taxonomy not found", HttpStatusCode.NOT_FOUND);
      }

      await taxonomy.destroy();

      res.status(200).json({
        success: true,
        message: "Taxonomy deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete taxonomy error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getTaxonomyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalTaxonomies = await this.taxonomyModel.count();

      res.status(200).json({
        success: true,
        message: "Taxonomy stats fetched successfully",
        data: {
          total: totalTaxonomies,
        },
      });
    } catch (error: any) {
      console.error("Get taxonomy stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  getActiveTaxonomies = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const taxonomies = await this.taxonomyModel.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'color'],
      });

      res.status(200).json({
        success: true,
        message: "Taxonomies fetched successfully",
        data: { taxonomies },
      });
    } catch (error: any) {
      console.error("Get taxonomies error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
