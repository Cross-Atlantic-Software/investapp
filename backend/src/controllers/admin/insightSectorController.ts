import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class InsightSectorController {
  // Get all insight sectors with pagination and search
  static async getAllInsightSectors(req: Request, res: Response) {
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

      const { count, rows } = await db.InsightSector.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.InsightSubsector,
            as: 'subsectors',
            attributes: ['id', 'name', 'is_active']
          }
        ]
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
      console.error("Error fetching insight sectors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight sectors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get insight sector by ID
  static async getInsightSectorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const insightSector = await db.InsightSector.findByPk(id, {
        include: [
          {
            model: db.InsightSubsector,
            as: 'subsectors',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!insightSector) {
        return res.status(404).json({
          success: false,
          message: "Insight sector not found"
        });
      }

      res.json({
        success: true,
        data: insightSector
      });
    } catch (error) {
      console.error("Error fetching insight sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new insight sector
  static async createInsightSector(req: Request, res: Response) {
    try {
      const { name, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      // Check if sector with same name already exists
      const existingSector = await db.InsightSector.findOne({
        where: { name: name.trim() }
      });

      if (existingSector) {
        return res.status(400).json({
          success: false,
          message: "Insight sector with this name already exists"
        });
      }

      const insightSector = await db.InsightSector.create({
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Insight sector created successfully",
        data: insightSector
      });
    } catch (error) {
      console.error("Error creating insight sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create insight sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update insight sector
  static async updateInsightSector(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      const insightSector = await db.InsightSector.findByPk(id);
      if (!insightSector) {
        return res.status(404).json({
          success: false,
          message: "Insight sector not found"
        });
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== insightSector.name) {
        const existingSector = await db.InsightSector.findOne({
          where: { name: name.trim() }
        });

        if (existingSector) {
          return res.status(400).json({
            success: false,
            message: "Insight sector with this name already exists"
          });
        }
      }

      await insightSector.update({
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Insight sector updated successfully",
        data: insightSector
      });
    } catch (error) {
      console.error("Error updating insight sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update insight sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete insight sector
  static async deleteInsightSector(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const insightSector = await db.InsightSector.findByPk(id);
      if (!insightSector) {
        return res.status(404).json({
          success: false,
          message: "Insight sector not found"
        });
      }

      await insightSector.destroy();

      res.json({
        success: true,
        message: "Insight sector deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting insight sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete insight sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
