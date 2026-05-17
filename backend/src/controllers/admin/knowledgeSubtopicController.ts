import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class KnowledgeSubtopicController {
  // Get all knowledge subtopics with pagination and search
  static async getAllKnowledgeSubtopics(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "", topic_id, sort_by = "name", sort_order = "ASC" } = req.query as Record<string, string>;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }
      if (topic_id) {
        whereClause.knowledge_topic_id = topic_id;
      }

      const { count, rows } = await db.KnowledgeSubtopic.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.KnowledgeTopic,
            as: 'topic',
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
      console.error("Error fetching knowledge subtopics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge subtopics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge subtopic by ID
  static async getKnowledgeSubtopicById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const knowledgeSubtopic = await db.KnowledgeSubtopic.findByPk(id as string, {
        include: [
          {
            model: db.KnowledgeTopic,
            as: 'topic',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!knowledgeSubtopic) {
        return res.status(404).json({
          success: false,
          message: "Knowledge subtopic not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeSubtopic
      });
    } catch (error) {
      console.error("Error fetching knowledge subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new knowledge subtopic
  static async createKnowledgeSubtopic(req: Request, res: Response) {
    try {
      const { name, knowledge_topic_id, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      if (!knowledge_topic_id) {
        return res.status(400).json({
          success: false,
          message: "Knowledge topic ID is required"
        });
      }

      // Check if topic exists
      const topic = await db.KnowledgeTopic.findByPk(knowledge_topic_id);
      if (!topic) {
        return res.status(400).json({
          success: false,
          message: "Knowledge topic not found"
        });
      }

      // Check if subtopic with same name already exists in this topic
      const existingSubtopic = await db.KnowledgeSubtopic.findOne({
        where: { 
          name: name.trim(),
          knowledge_topic_id: knowledge_topic_id
        }
      });

      if (existingSubtopic) {
        return res.status(400).json({
          success: false,
          message: "Knowledge subtopic with this name already exists in this topic"
        });
      }

      const knowledgeSubtopic = await db.KnowledgeSubtopic.create({
        name: name.trim(),
        knowledge_topic_id: knowledge_topic_id,
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Knowledge subtopic created successfully",
        data: knowledgeSubtopic
      });
    } catch (error) {
      console.error("Error creating knowledge subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create knowledge subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update knowledge subtopic
  static async updateKnowledgeSubtopic(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, knowledge_topic_id, is_active } = req.body;

      const knowledgeSubtopic = await db.KnowledgeSubtopic.findByPk(id as string);
      if (!knowledgeSubtopic) {
        return res.status(404).json({
          success: false,
          message: "Knowledge subtopic not found"
        });
      }

      // Check if topic exists (if being updated)
      if (knowledge_topic_id) {
        const topic = await db.KnowledgeTopic.findByPk(knowledge_topic_id);
        if (!topic) {
          return res.status(400).json({
            success: false,
            message: "Knowledge topic not found"
          });
        }
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== knowledgeSubtopic.name) {
        const finalTopicId = knowledge_topic_id || knowledgeSubtopic.knowledge_topic_id;
        const existingSubtopic = await db.KnowledgeSubtopic.findOne({
          where: { 
            name: name.trim(),
            knowledge_topic_id: finalTopicId
          }
        });

        if (existingSubtopic) {
          return res.status(400).json({
            success: false,
            message: "Knowledge subtopic with this name already exists in this topic"
          });
        }
      }

      await knowledgeSubtopic.update({
        ...(name && { name: name.trim() }),
        ...(knowledge_topic_id && { knowledge_topic_id: knowledge_topic_id }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Knowledge subtopic updated successfully",
        data: knowledgeSubtopic
      });
    } catch (error) {
      console.error("Error updating knowledge subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update knowledge subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete knowledge subtopic
  static async deleteKnowledgeSubtopic(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const knowledgeSubtopic = await db.KnowledgeSubtopic.findByPk(id as string);
      if (!knowledgeSubtopic) {
        return res.status(404).json({
          success: false,
          message: "Knowledge subtopic not found"
        });
      }

      await knowledgeSubtopic.destroy();

      res.json({
        success: true,
        message: "Knowledge subtopic deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting knowledge subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete knowledge subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
