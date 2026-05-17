import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class InsightSubtopicController {
  // Get all insight subtopics with pagination and search
  static async getAllInsightSubtopics(req: Request, res: Response) {
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
        whereClause.insight_topic_id = topic_id;
      }

      const { count, rows } = await db.InsightSubtopic.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.InsightTopic,
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
      console.error("Error fetching insight subtopics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight subtopics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get insight subtopic by ID
  static async getInsightSubtopicById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const insightSubtopic = await db.InsightSubtopic.findByPk(id as string, {
        include: [
          {
            model: db.InsightTopic,
            as: 'topic',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!insightSubtopic) {
        return res.status(404).json({
          success: false,
          message: "Insight subtopic not found"
        });
      }

      res.json({
        success: true,
        data: insightSubtopic
      });
    } catch (error) {
      console.error("Error fetching insight subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new insight subtopic
  static async createInsightSubtopic(req: Request, res: Response) {
    try {
      const { insight_topic_id, name, is_active = true } = req.body;

      if (!insight_topic_id || !name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Topic ID and name are required"
        });
      }

      // Check if topic exists
      const topic = await db.InsightTopic.findByPk(insight_topic_id);
      if (!topic) {
        return res.status(400).json({
          success: false,
          message: "Insight topic not found"
        });
      }

      // Check if subtopic with same name already exists in this topic
      const existingSubtopic = await db.InsightSubtopic.findOne({
        where: { 
          insight_topic_id: insight_topic_id,
          name: name.trim()
        }
      });

      if (existingSubtopic) {
        return res.status(400).json({
          success: false,
          message: "Insight subtopic with this name already exists in this topic"
        });
      }

      const insightSubtopic = await db.InsightSubtopic.create({
        insight_topic_id: Number(insight_topic_id),
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Insight subtopic created successfully",
        data: insightSubtopic
      });
    } catch (error) {
      console.error("Error creating insight subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create insight subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update insight subtopic
  static async updateInsightSubtopic(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { insight_topic_id, name, is_active } = req.body;

      const insightSubtopic = await db.InsightSubtopic.findByPk(id as string);
      if (!insightSubtopic) {
        return res.status(404).json({
          success: false,
          message: "Insight subtopic not found"
        });
      }

      // Check if topic exists (if being updated)
      if (insight_topic_id) {
        const topic = await db.InsightTopic.findByPk(insight_topic_id);
        if (!topic) {
          return res.status(400).json({
            success: false,
            message: "Insight topic not found"
          });
        }
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== insightSubtopic.name) {
        const topicId = insight_topic_id || insightSubtopic.insight_topic_id;
        const existingSubtopic = await db.InsightSubtopic.findOne({
          where: { 
            insight_topic_id: topicId,
            name: name.trim()
          }
        });

        if (existingSubtopic) {
          return res.status(400).json({
            success: false,
            message: "Insight subtopic with this name already exists in this topic"
          });
        }
      }

      await insightSubtopic.update({
        ...(insight_topic_id && { insight_topic_id: Number(insight_topic_id) }),
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Insight subtopic updated successfully",
        data: insightSubtopic
      });
    } catch (error) {
      console.error("Error updating insight subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update insight subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete insight subtopic
  static async deleteInsightSubtopic(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const insightSubtopic = await db.InsightSubtopic.findByPk(id as string);
      if (!insightSubtopic) {
        return res.status(404).json({
          success: false,
          message: "Insight subtopic not found"
        });
      }

      await insightSubtopic.destroy();

      res.json({
        success: true,
        message: "Insight subtopic deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting insight subtopic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete insight subtopic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
