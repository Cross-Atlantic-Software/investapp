import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class InsightSubsectorController {
  // Get all insight subsectors with pagination and search
  static async getAllInsightSubsectors(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "", sector_id, sort_by = "name", sort_order = "ASC" } = req.query as Record<string, string>;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }
      if (sector_id) {
        whereClause.insight_sector_id = sector_id;
      }

      const { count, rows } = await db.InsightSubsector.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.InsightSector,
            as: 'sector',
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
      console.error("Error fetching insight subsectors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight subsectors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get insight subsector by ID
  static async getInsightSubsectorById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const insightSubsector = await db.InsightSubsector.findByPk(id as string, {
        include: [
          {
            model: db.InsightSector,
            as: 'sector',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!insightSubsector) {
        return res.status(404).json({
          success: false,
          message: "Insight subsector not found"
        });
      }

      res.json({
        success: true,
        data: insightSubsector
      });
    } catch (error) {
      console.error("Error fetching insight subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new insight subsector
  static async createInsightSubsector(req: Request, res: Response) {
    try {
      const { insight_sector_id, name, is_active = true } = req.body;

      if (!insight_sector_id || !name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Sector ID and name are required"
        });
      }

      // Check if sector exists
      const sector = await db.InsightSector.findByPk(insight_sector_id);
      if (!sector) {
        return res.status(400).json({
          success: false,
          message: "Insight sector not found"
        });
      }

      // Check if subsector with same name already exists in this sector
      const existingSubsector = await db.InsightSubsector.findOne({
        where: { 
          insight_sector_id: insight_sector_id,
          name: name.trim()
        }
      });

      if (existingSubsector) {
        return res.status(400).json({
          success: false,
          message: "Insight subsector with this name already exists in this sector"
        });
      }

      const insightSubsector = await db.InsightSubsector.create({
        insight_sector_id: Number(insight_sector_id),
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Insight subsector created successfully",
        data: insightSubsector
      });
    } catch (error) {
      console.error("Error creating insight subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create insight subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update insight subsector
  static async updateInsightSubsector(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { insight_sector_id, name, is_active } = req.body;

      const insightSubsector = await db.InsightSubsector.findByPk(id as string);
      if (!insightSubsector) {
        return res.status(404).json({
          success: false,
          message: "Insight subsector not found"
        });
      }

      // Check if sector exists (if being updated)
      if (insight_sector_id) {
        const sector = await db.InsightSector.findByPk(insight_sector_id);
        if (!sector) {
          return res.status(400).json({
            success: false,
            message: "Insight sector not found"
          });
        }
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== insightSubsector.name) {
        const sectorId = insight_sector_id || insightSubsector.insight_sector_id;
        const existingSubsector = await db.InsightSubsector.findOne({
          where: { 
            insight_sector_id: sectorId,
            name: name.trim()
          }
        });

        if (existingSubsector) {
          return res.status(400).json({
            success: false,
            message: "Insight subsector with this name already exists in this sector"
          });
        }
      }

      await insightSubsector.update({
        ...(insight_sector_id && { insight_sector_id: Number(insight_sector_id) }),
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Insight subsector updated successfully",
        data: insightSubsector
      });
    } catch (error) {
      console.error("Error updating insight subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update insight subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete insight subsector
  static async deleteInsightSubsector(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const insightSubsector = await db.InsightSubsector.findByPk(id as string);
      if (!insightSubsector) {
        return res.status(404).json({
          success: false,
          message: "Insight subsector not found"
        });
      }

      await insightSubsector.destroy();

      res.json({
        success: true,
        message: "Insight subsector deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting insight subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete insight subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
