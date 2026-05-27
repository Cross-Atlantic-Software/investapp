import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class ThemeController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all themes
  static async getAllThemes(req: Request, res: Response) {
    try {
      const controller = new ThemeController();
      await controller.ensureDbReady();

      const { search, page = 1, limit = 10 } = req.query as Record<string, string>;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }

      const { count, rows: themes } = await db.Theme.findAndCountAll({
        where: whereClause,
        order: [['name', 'ASC']],
        limit: Number(limit),
        offset: offset
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Themes fetched successfully',
        data: {
          themes,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching themes:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch themes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get theme by ID
  static async getThemeById(req: Request, res: Response) {
    try {
      const controller = new ThemeController();
      await controller.ensureDbReady();

      const id = req.params.id as string;
      const theme = await db.Theme.findByPk(id as string);

      if (!theme) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Theme not found'
        });
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Theme fetched successfully',
        data: { theme }
      });
    } catch (error) {
      console.error('Error fetching theme:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch theme',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new theme
  static async createTheme(req: Request, res: Response) {
    try {
      const controller = new ThemeController();
      await controller.ensureDbReady();

      const { name } = req.body;

      if (!name) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Theme name is required'
        });
      }

      // Check if theme already exists
      const existingTheme = await db.Theme.findOne({
        where: { name }
      });

      if (existingTheme) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Theme already exists'
        });
      }

      const newTheme = await db.Theme.create({ name });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Theme created successfully',
        data: { theme: newTheme }
      });
    } catch (error) {
      console.error('Error creating theme:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create theme',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update theme
  static async updateTheme(req: Request, res: Response) {
    try {
      const controller = new ThemeController();
      await controller.ensureDbReady();

      const id = req.params.id as string;
      const { name } = req.body;

      if (!name) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Theme name is required'
        });
      }

      const existingTheme = await db.Theme.findByPk(id as string);
      if (!existingTheme) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Theme not found'
        });
      }

      // Check if theme name already exists (excluding current record)
      const duplicateTheme = await db.Theme.findOne({
        where: { 
          name,
          id: { [Op.ne]: id }
        }
      });

      if (duplicateTheme) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Theme name already exists'
        });
      }

      await existingTheme.update({ name });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Theme updated successfully',
        data: { theme: existingTheme }
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update theme',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete theme
  static async deleteTheme(req: Request, res: Response) {
    try {
      const controller = new ThemeController();
      await controller.ensureDbReady();

      const id = req.params.id as string;

      const theme = await db.Theme.findByPk(id as string);
      if (!theme) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Theme not found'
        });
      }

      await theme.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Theme deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting theme:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete theme',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all themes for dropdown (no pagination)
  static async getThemesForSelect(req: Request, res: Response) {
    try {
      const controller = new ThemeController();
      await controller.ensureDbReady();

      const themes = await db.Theme.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name']
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Themes fetched successfully',
        data: { themes }
      });
    } catch (error) {
      console.error('Error fetching themes for select:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch themes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

