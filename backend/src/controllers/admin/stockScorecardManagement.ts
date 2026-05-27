import { Request, Response } from 'express';
import { StockScorecardModel } from '../../Models/StockScorecard';
import { Op, Sequelize } from 'sequelize';
import { db } from '../../utils/database';

export class StockScorecardManagementController {
  // Get all scorecards for a specific stock
  static async getScorecardsByStockId(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;
      const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'DESC' } = req.query as Record<string, string>;

      const offset = (Number(page) - 1) * Number(limit);
      const validSortFields = ['id', 'category', 'score_value', 'score_tag', 'created_at', 'updated_at'];
      const validSortOrder = ['ASC', 'DESC'];

      const sortBy = validSortFields.includes(sort_by as string) ? sort_by as string : 'created_at';
      const sortOrder = validSortOrder.includes((sort_order as string).toUpperCase()) ? (sort_order as string).toUpperCase() : 'DESC';

      const { count, rows: scorecards } = await StockScorecardModel.findAndCountAll({
        where: {
          stock_id: stockId,
        },
        order: [[sortBy, sortOrder]],
        limit: Number(limit),
        offset: offset,
      });

      res.json({
        success: true,
        data: {
          scorecards,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalItems: count,
            itemsPerPage: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching scorecards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scorecards',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get a specific scorecard by ID
  static async getScorecardById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const scorecard = await StockScorecardModel.findByPk(id as string);

      if (!scorecard) {
        return res.status(404).json({
          success: false,
          message: 'Scorecard not found',
        });
      }

      res.json({
        success: true,
        data: scorecard,
      });
    } catch (error) {
      console.error('Error fetching scorecard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scorecard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create a new scorecard
  static async createScorecard(req: Request, res: Response) {
    try {
      const { stock_id, category, score_value, score_tag, analysis } = req.body;

      // Validation
      if (!stock_id || !category || score_value === undefined || !score_tag || !analysis) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      if (score_value < 0 || score_value > 10) {
        return res.status(400).json({
          success: false,
          message: 'Score value must be between 0 and 10',
        });
      }

      if (!['Low Risk', 'Medium Risk', 'High Risk'].includes(score_tag)) {
        return res.status(400).json({
          success: false,
          message: 'Score tag must be Low Risk, Medium Risk, or High Risk',
        });
      }

      // Check if category already exists for this stock
      const existingScorecard = await StockScorecardModel.findOne({
        where: {
          stock_id,
          category,
        },
      });

      if (existingScorecard) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists for this stock',
        });
      }

      const scorecard = await StockScorecardModel.create({
        stock_id,
        category,
        score_value,
        score_tag,
        analysis,
      });

      res.status(201).json({
        success: true,
        message: 'Scorecard created successfully',
        data: scorecard,
      });
    } catch (error) {
      console.error('Error creating scorecard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create scorecard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update a scorecard
  static async updateScorecard(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { category, score_value, score_tag, analysis } = req.body;

      const scorecard = await StockScorecardModel.findByPk(id as string);

      if (!scorecard) {
        return res.status(404).json({
          success: false,
          message: 'Scorecard not found',
        });
      }

      // Validation
      if (score_value !== undefined && (score_value < 0 || score_value > 10)) {
        return res.status(400).json({
          success: false,
          message: 'Score value must be between 0 and 10',
        });
      }

      if (score_tag && !['Low Risk', 'Medium Risk', 'High Risk'].includes(score_tag)) {
        return res.status(400).json({
          success: false,
          message: 'Score tag must be Low Risk, Medium Risk, or High Risk',
        });
      }

      // Check if category already exists for this stock (if category is being updated)
      if (category && category !== scorecard.category) {
        const existingScorecard = await StockScorecardModel.findOne({
          where: {
            stock_id: scorecard.stock_id,
            category,
            id: { [Op.ne]: id },
          },
        });

        if (existingScorecard) {
          return res.status(400).json({
            success: false,
            message: 'Category already exists for this stock',
          });
        }
      }

      await scorecard.update({
        category: category || scorecard.category,
        score_value: score_value !== undefined ? score_value : scorecard.score_value,
        score_tag: score_tag || scorecard.score_tag,
        analysis: analysis || scorecard.analysis,
      });

      res.json({
        success: true,
        message: 'Scorecard updated successfully',
        data: scorecard,
      });
    } catch (error) {
      console.error('Error updating scorecard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update scorecard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete a scorecard
  static async deleteScorecard(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const scorecard = await StockScorecardModel.findByPk(id as string);

      if (!scorecard) {
        return res.status(404).json({
          success: false,
          message: 'Scorecard not found',
        });
      }

      await scorecard.destroy();

      res.json({
        success: true,
        message: 'Scorecard deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting scorecard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete scorecard',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get scorecard statistics
  static async getScorecardStats(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;

      const totalScorecards = await StockScorecardModel.count({
        where: { stock_id: stockId },
      });

      const lowRiskCount = await StockScorecardModel.count({
        where: { stock_id: stockId, score_tag: 'Low Risk' },
      });

      const mediumRiskCount = await StockScorecardModel.count({
        where: { stock_id: stockId, score_tag: 'Medium Risk' },
      });

      const highRiskCount = await StockScorecardModel.count({
        where: { stock_id: stockId, score_tag: 'High Risk' },
      });

      const avgScore = await StockScorecardModel.findOne({
        where: { stock_id: stockId },
        attributes: [
          [db.sequelize.fn('AVG', db.sequelize.col('score_value')), 'average_score'],
        ],
        raw: true,
      });

      res.json({
        success: true,
        data: {
          totalScorecards,
          riskDistribution: {
            lowRisk: lowRiskCount,
            mediumRisk: mediumRiskCount,
            highRisk: highRiskCount,
          },
          averageScore: avgScore ? parseFloat((avgScore as any).average_score as string) : 0,
        },
      });
    } catch (error) {
      console.error('Error fetching scorecard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scorecard statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bulk create scorecards for a stock
  static async bulkCreateScorecards(req: Request, res: Response) {
    try {
      const { stock_id, scorecards } = req.body;

      if (!stock_id || !Array.isArray(scorecards) || scorecards.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock ID and scorecards array are required',
        });
      }

      // Validate each scorecard
      for (const scorecard of scorecards) {
        if (!scorecard.category || scorecard.score_value === undefined || !scorecard.score_tag || !scorecard.analysis) {
          return res.status(400).json({
            success: false,
            message: 'All scorecard fields are required',
          });
        }

        if (scorecard.score_value < 0 || scorecard.score_value > 10) {
          return res.status(400).json({
            success: false,
            message: 'Score value must be between 0 and 10',
          });
        }

        if (!['Low Risk', 'Medium Risk', 'High Risk'].includes(scorecard.score_tag)) {
          return res.status(400).json({
            success: false,
            message: 'Score tag must be Low Risk, Medium Risk, or High Risk',
          });
        }
      }

      // Check for duplicate categories
      const categories = scorecards.map(s => s.category);
      const uniqueCategories = [...new Set(categories)];
      if (categories.length !== uniqueCategories.length) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate categories found in scorecards',
        });
      }

      // Check if any category already exists for this stock
      const existingScorecards = await StockScorecardModel.findAll({
        where: {
          stock_id,
          category: categories,
        },
      });

      if (existingScorecards.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some categories already exist for this stock',
        });
      }

      // Create all scorecards
      const createdScorecards = await StockScorecardModel.bulkCreate(
        scorecards.map(scorecard => ({
          stock_id,
          category: scorecard.category,
          score_value: scorecard.score_value,
          score_tag: scorecard.score_tag,
          analysis: scorecard.analysis,
        }))
      );

      res.status(201).json({
        success: true,
        message: 'Scorecards created successfully',
        data: createdScorecards,
      });
    } catch (error) {
      console.error('Error bulk creating scorecards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create scorecards',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
