import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class KnowledgeSectorController {
  // Get all knowledge sectors with pagination and search
  static async getAllKnowledgeSectors(req: Request, res: Response) {
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

      const { count, rows } = await db.KnowledgeSector.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.KnowledgeSubsector,
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
      console.error("Error fetching knowledge sectors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge sectors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge sector by ID
  static async getKnowledgeSectorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const knowledgeSector = await db.KnowledgeSector.findByPk(id, {
        include: [
          {
            model: db.KnowledgeSubsector,
            as: 'subsectors',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!knowledgeSector) {
        return res.status(404).json({
          success: false,
          message: "Knowledge sector not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeSector
      });
    } catch (error) {
      console.error("Error fetching knowledge sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new knowledge sector
  static async createKnowledgeSector(req: Request, res: Response) {
    try {
      const { name, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      // Check if sector with same name already exists
      const existingSector = await db.KnowledgeSector.findOne({
        where: { name: name.trim() }
      });

      if (existingSector) {
        return res.status(400).json({
          success: false,
          message: "Knowledge sector with this name already exists"
        });
      }

      const knowledgeSector = await db.KnowledgeSector.create({
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Knowledge sector created successfully",
        data: knowledgeSector
      });
    } catch (error) {
      console.error("Error creating knowledge sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create knowledge sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update knowledge sector
  static async updateKnowledgeSector(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      const knowledgeSector = await db.KnowledgeSector.findByPk(id);
      if (!knowledgeSector) {
        return res.status(404).json({
          success: false,
          message: "Knowledge sector not found"
        });
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== knowledgeSector.name) {
        const existingSector = await db.KnowledgeSector.findOne({
          where: { name: name.trim() }
        });

        if (existingSector) {
          return res.status(400).json({
            success: false,
            message: "Knowledge sector with this name already exists"
          });
        }
      }

      await knowledgeSector.update({
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Knowledge sector updated successfully",
        data: knowledgeSector
      });
    } catch (error) {
      console.error("Error updating knowledge sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update knowledge sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete knowledge sector
  static async deleteKnowledgeSector(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const knowledgeSector = await db.KnowledgeSector.findByPk(id);
      if (!knowledgeSector) {
        return res.status(404).json({
          success: false,
          message: "Knowledge sector not found"
        });
      }

      await knowledgeSector.destroy();

      res.json({
        success: true,
        message: "Knowledge sector deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting knowledge sector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete knowledge sector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
