import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class KnowledgeThemeController {
  // Get all knowledge themes with pagination and search
  static async getAllKnowledgeThemes(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "", sort_by = "name", sort_order = "ASC" } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = {};
      if (search) {
        whereClause = {
          name: {
            [Op.like]: `%${search}%`
          }
        };
      }

      const { count, rows } = await db.KnowledgeTheme.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching knowledge themes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge themes",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge theme by ID
  static async getKnowledgeThemeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const knowledgeTheme = await db.KnowledgeTheme.findByPk(id);

      if (!knowledgeTheme) {
        return res.status(404).json({
          success: false,
          message: "Knowledge theme not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeTheme
      });
    } catch (error) {
      console.error("Error fetching knowledge theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new knowledge theme
  static async createKnowledgeTheme(req: Request, res: Response) {
    try {
      const { name, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      // Check if theme with same name already exists
      const existingTheme = await db.KnowledgeTheme.findOne({
        where: { name: name.trim() }
      });

      if (existingTheme) {
        return res.status(400).json({
          success: false,
          message: "Knowledge theme with this name already exists"
        });
      }

      const knowledgeTheme = await db.KnowledgeTheme.create({
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Knowledge theme created successfully",
        data: knowledgeTheme
      });
    } catch (error) {
      console.error("Error creating knowledge theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create knowledge theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update knowledge theme
  static async updateKnowledgeTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      const knowledgeTheme = await db.KnowledgeTheme.findByPk(id);
      if (!knowledgeTheme) {
        return res.status(404).json({
          success: false,
          message: "Knowledge theme not found"
        });
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== knowledgeTheme.name) {
        const existingTheme = await db.KnowledgeTheme.findOne({
          where: { name: name.trim() }
        });

        if (existingTheme) {
          return res.status(400).json({
            success: false,
            message: "Knowledge theme with this name already exists"
          });
        }
      }

      await knowledgeTheme.update({
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Knowledge theme updated successfully",
        data: knowledgeTheme
      });
    } catch (error) {
      console.error("Error updating knowledge theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update knowledge theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete knowledge theme
  static async deleteKnowledgeTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const knowledgeTheme = await db.KnowledgeTheme.findByPk(id);
      if (!knowledgeTheme) {
        return res.status(404).json({
          success: false,
          message: "Knowledge theme not found"
        });
      }

      await knowledgeTheme.destroy();

      res.json({
        success: true,
        message: "Knowledge theme deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting knowledge theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete knowledge theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
