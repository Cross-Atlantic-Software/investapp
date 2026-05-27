import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class KnowledgeTopicController {
  // Get all knowledge topics with pagination and search
  static async getAllKnowledgeTopics(req: Request, res: Response) {
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

      const { count, rows } = await db.KnowledgeTopic.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.KnowledgeSubtopic,
            as: 'subtopics',
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
      console.error("Error fetching knowledge topics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge topics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge topic by ID
  static async getKnowledgeTopicById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const knowledgeTopic = await db.KnowledgeTopic.findByPk(id as string, {
        include: [
          {
            model: db.KnowledgeSubtopic,
            as: 'subtopics',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!knowledgeTopic) {
        return res.status(404).json({
          success: false,
          message: "Knowledge topic not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeTopic
      });
    } catch (error) {
      console.error("Error fetching knowledge topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new knowledge topic
  static async createKnowledgeTopic(req: Request, res: Response) {
    try {
      const { name, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      // Check if topic with same name already exists
      const existingTopic = await db.KnowledgeTopic.findOne({
        where: { name: name.trim() }
      });

      if (existingTopic) {
        return res.status(400).json({
          success: false,
          message: "Knowledge topic with this name already exists"
        });
      }

      const knowledgeTopic = await db.KnowledgeTopic.create({
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Knowledge topic created successfully",
        data: knowledgeTopic
      });
    } catch (error) {
      console.error("Error creating knowledge topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create knowledge topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update knowledge topic
  static async updateKnowledgeTopic(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, is_active } = req.body;

      const knowledgeTopic = await db.KnowledgeTopic.findByPk(id as string);
      if (!knowledgeTopic) {
        return res.status(404).json({
          success: false,
          message: "Knowledge topic not found"
        });
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== knowledgeTopic.name) {
        const existingTopic = await db.KnowledgeTopic.findOne({
          where: { name: name.trim() }
        });

        if (existingTopic) {
          return res.status(400).json({
            success: false,
            message: "Knowledge topic with this name already exists"
          });
        }
      }

      await knowledgeTopic.update({
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Knowledge topic updated successfully",
        data: knowledgeTopic
      });
    } catch (error) {
      console.error("Error updating knowledge topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update knowledge topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete knowledge topic
  static async deleteKnowledgeTopic(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const knowledgeTopic = await db.KnowledgeTopic.findByPk(id as string);
      if (!knowledgeTopic) {
        return res.status(404).json({
          success: false,
          message: "Knowledge topic not found"
        });
      }

      await knowledgeTopic.destroy();

      res.json({
        success: true,
        message: "Knowledge topic deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting knowledge topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete knowledge topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
