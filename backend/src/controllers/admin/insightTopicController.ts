import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class InsightTopicController {
  // Get all insight topics with pagination and search
  static async getAllInsightTopics(req: Request, res: Response) {
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

      const { count, rows } = await db.InsightTopic.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.InsightSubtopic,
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
      console.error("Error fetching insight topics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight topics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get insight topic by ID
  static async getInsightTopicById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const insightTopic = await db.InsightTopic.findByPk(id, {
        include: [
          {
            model: db.InsightSubtopic,
            as: 'subtopics',
            attributes: ['id', 'name', 'is_active']
          }
        ]
      });

      if (!insightTopic) {
        return res.status(404).json({
          success: false,
          message: "Insight topic not found"
        });
      }

      res.json({
        success: true,
        data: insightTopic
      });
    } catch (error) {
      console.error("Error fetching insight topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch insight topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new insight topic
  static async createInsightTopic(req: Request, res: Response) {
    try {
      const { name, is_active = true } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }

      // Check if topic with same name already exists
      const existingTopic = await db.InsightTopic.findOne({
        where: { name: name.trim() }
      });

      if (existingTopic) {
        return res.status(400).json({
          success: false,
          message: "Insight topic with this name already exists"
        });
      }

      const insightTopic = await db.InsightTopic.create({
        name: name.trim(),
        is_active: Boolean(is_active)
      });

      res.status(201).json({
        success: true,
        message: "Insight topic created successfully",
        data: insightTopic
      });
    } catch (error) {
      console.error("Error creating insight topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create insight topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update insight topic
  static async updateInsightTopic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      const insightTopic = await db.InsightTopic.findByPk(id);
      if (!insightTopic) {
        return res.status(404).json({
          success: false,
          message: "Insight topic not found"
        });
      }

      // Check if name is being updated and if it conflicts with existing
      if (name && name.trim() !== insightTopic.name) {
        const existingTopic = await db.InsightTopic.findOne({
          where: { name: name.trim() }
        });

        if (existingTopic) {
          return res.status(400).json({
            success: false,
            message: "Insight topic with this name already exists"
          });
        }
      }

      await insightTopic.update({
        ...(name && { name: name.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) })
      });

      res.json({
        success: true,
        message: "Insight topic updated successfully",
        data: insightTopic
      });
    } catch (error) {
      console.error("Error updating insight topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update insight topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete insight topic
  static async deleteInsightTopic(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const insightTopic = await db.InsightTopic.findByPk(id);
      if (!insightTopic) {
        return res.status(404).json({
          success: false,
          message: "Insight topic not found"
        });
      }

      await insightTopic.destroy();

      res.json({
        success: true,
        message: "Insight topic deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting insight topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete insight topic",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
