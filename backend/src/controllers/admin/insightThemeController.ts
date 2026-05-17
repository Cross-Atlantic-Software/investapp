import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class InsightThemeController {
  // Get all insight themes with pagination and search
  static async getAllInsightThemes(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "", sort_by = "name", sort_order = "ASC" } = req.query as Record<string, string>;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = {};
      if (search) {
        whereClause = {
          name: {
            [Op.like]: `%${search}%`
          }
        };
      }

      const { count, rows } = await db.InsightTheme.findAndCountAll({
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
      console.error("Error fetching insight themes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight themes",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get insight theme by ID
  static async getInsightThemeById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const insightTheme = await db.InsightTheme.findByPk(id as string);

      if (!insightTheme) {
        return res.status(404).json({
          success: false,
          message: "Insight theme not found"
        });
      }

      res.json({
        success: true,
        data: insightTheme
      });
    } catch (error) {
      console.error("Error fetching insight theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new insight theme
  static async createInsightTheme(req: Request, res: Response) {
    try {
      const { name, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      // Check if theme with same name already exists
      const existingTheme = await db.InsightTheme.findOne({
        where: { name: name.trim() }
      });

      if (existingTheme) {
        return res.status(400).json({
          success: false,
          message: "Insight theme with this name already exists"
        });
      }

      const insightTheme = await db.InsightTheme.create({
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Insight theme created successfully",
        data: insightTheme
      });
    } catch (error) {
      console.error("Error creating insight theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create insight theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update insight theme
  static async updateInsightTheme(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, is_active } = req.body;

      const insightTheme = await db.InsightTheme.findByPk(id as string);
      if (!insightTheme) {
        return res.status(404).json({
          success: false,
          message: "Insight theme not found"
        });
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== insightTheme.name) {
        const existingTheme = await db.InsightTheme.findOne({
          where: { name: name.trim() }
        });

        if (existingTheme) {
          return res.status(400).json({
            success: false,
            message: "Insight theme with this name already exists"
          });
        }
      }

      await insightTheme.update({
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Insight theme updated successfully",
        data: insightTheme
      });
    } catch (error) {
      console.error("Error updating insight theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update insight theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete insight theme
  static async deleteInsightTheme(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const insightTheme = await db.InsightTheme.findByPk(id as string);
      if (!insightTheme) {
        return res.status(404).json({
          success: false,
          message: "Insight theme not found"
        });
      }

      await insightTheme.destroy();

      res.json({
        success: true,
        message: "Insight theme deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting insight theme:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete insight theme",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
