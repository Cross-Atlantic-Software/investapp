import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class KnowledgeSubsectorController {
  // Get all knowledge subsectors with pagination and search
  static async getAllKnowledgeSubsectors(req: Request, res: Response) {
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
        whereClause.knowledge_sector_id = sector_id;
      }

      const { count, rows } = await db.KnowledgeSubsector.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.KnowledgeSector,
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
      console.error("Error fetching knowledge subsectors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge subsectors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge subsector by ID
  static async getKnowledgeSubsectorById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const knowledgeSubsector = await db.KnowledgeSubsector.findByPk(id as string, {
        include: [
          {
            model: db.KnowledgeSector,
            as: 'sector',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!knowledgeSubsector) {
        return res.status(404).json({
          success: false,
          message: "Knowledge subsector not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeSubsector
      });
    } catch (error) {
      console.error("Error fetching knowledge subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new knowledge subsector
  static async createKnowledgeSubsector(req: Request, res: Response) {
    try {
      const { name, knowledge_sector_id, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      if (!knowledge_sector_id) {
        return res.status(400).json({
          success: false,
          message: "Knowledge sector ID is required"
        });
      }

      // Check if sector exists
      const sector = await db.KnowledgeSector.findByPk(knowledge_sector_id);
      if (!sector) {
        return res.status(400).json({
          success: false,
          message: "Knowledge sector not found"
        });
      }

      // Check if subsector with same name already exists in this sector
      const existingSubsector = await db.KnowledgeSubsector.findOne({
        where: { 
          name: name.trim(),
          knowledge_sector_id: knowledge_sector_id
        }
      });

      if (existingSubsector) {
        return res.status(400).json({
          success: false,
          message: "Knowledge subsector with this name already exists in this sector"
        });
      }

      const knowledgeSubsector = await db.KnowledgeSubsector.create({
        name: name.trim(),
        knowledge_sector_id: knowledge_sector_id,
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Knowledge subsector created successfully",
        data: knowledgeSubsector
      });
    } catch (error) {
      console.error("Error creating knowledge subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create knowledge subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update knowledge subsector
  static async updateKnowledgeSubsector(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, knowledge_sector_id, is_active } = req.body;

      const knowledgeSubsector = await db.KnowledgeSubsector.findByPk(id as string);
      if (!knowledgeSubsector) {
        return res.status(404).json({
          success: false,
          message: "Knowledge subsector not found"
        });
      }

      // Check if sector exists (if being updated)
      if (knowledge_sector_id) {
        const sector = await db.KnowledgeSector.findByPk(knowledge_sector_id);
        if (!sector) {
          return res.status(400).json({
            success: false,
            message: "Knowledge sector not found"
          });
        }
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== knowledgeSubsector.name) {
        const finalSectorId = knowledge_sector_id || knowledgeSubsector.knowledge_sector_id;
        const existingSubsector = await db.KnowledgeSubsector.findOne({
          where: { 
            name: name.trim(),
            knowledge_sector_id: finalSectorId
          }
        });

        if (existingSubsector) {
          return res.status(400).json({
            success: false,
            message: "Knowledge subsector with this name already exists in this sector"
          });
        }
      }

      await knowledgeSubsector.update({
        ...(name && { name: name.trim() }),
        ...(knowledge_sector_id && { knowledge_sector_id: knowledge_sector_id }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Knowledge subsector updated successfully",
        data: knowledgeSubsector
      });
    } catch (error) {
      console.error("Error updating knowledge subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update knowledge subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete knowledge subsector
  static async deleteKnowledgeSubsector(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const knowledgeSubsector = await db.KnowledgeSubsector.findByPk(id as string);
      if (!knowledgeSubsector) {
        return res.status(404).json({
          success: false,
          message: "Knowledge subsector not found"
        });
      }

      await knowledgeSubsector.destroy();

      res.json({
        success: true,
        message: "Knowledge subsector deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting knowledge subsector:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete knowledge subsector",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
