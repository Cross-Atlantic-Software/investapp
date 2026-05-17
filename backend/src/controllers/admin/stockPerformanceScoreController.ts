import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Sequelize, Op } from "sequelize";

export class StockPerformanceScoreController {
  // Get all stock performance scores with product information
  static async getAllStockPerformanceScores(req: Request, res: Response) {
    try {
      const scores = await db.StockPerformanceScore.findAll({
        include: [
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: scores,
        message: "Stock performance scores retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching stock performance scores:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch stock performance scores"
      });
    }
  }

  // Get stock performance score by ID
  static async getStockPerformanceScoreById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const score = await db.StockPerformanceScore.findByPk(id as string, {
        include: [
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name']
          }
        ]
      });

      if (!score) {
        return res.status(404).json({
          success: false,
          message: "Stock performance score not found"
        });
      }

      res.json({
        success: true,
        data: score,
        message: "Stock performance score retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching stock performance score:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch stock performance score"
      });
    }
  }

  // Create new stock performance score
  static async createStockPerformanceScore(req: Request, res: Response) {
    try {
      const { stock_id, score } = req.body;

      // Validate required fields
      if (!stock_id || !score) {
        return res.status(400).json({
          success: false,
          message: "Stock ID and score are required"
        });
      }

      // Validate score range
      const scoreNum = parseInt(score);
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 100) {
        return res.status(400).json({
          success: false,
          message: "Score must be a number between 1 and 100"
        });
      }

      // Check if stock exists
      const stock = await db.Product.findByPk(stock_id);
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: "Stock not found"
        });
      }

      // Check if score already exists for this stock
      const existingScore = await db.StockPerformanceScore.findOne({
        where: { stock_id }
      });

      if (existingScore) {
        return res.status(400).json({
          success: false,
          message: "Performance score already exists for this stock"
        });
      }

      // Create the score
      const newScore = await db.StockPerformanceScore.create({
        stock_id,
        score: score.toString()
      });

      // Update the product's stock_performance_score_id
      await db.Product.update(
        { stock_performance_score_id: newScore.id },
        { where: { id: stock_id } }
      );

      // Fetch the created score with product information
      const createdScore = await db.StockPerformanceScore.findByPk(newScore.id, {
        include: [
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdScore,
        message: "Stock performance score created successfully"
      });
    } catch (error) {
      console.error("Error creating stock performance score:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create stock performance score"
      });
    }
  }

  // Update stock performance score
  static async updateStockPerformanceScore(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { score } = req.body;

      // Validate score
      if (!score) {
        return res.status(400).json({
          success: false,
          message: "Score is required"
        });
      }

      const scoreNum = parseInt(score);
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 100) {
        return res.status(400).json({
          success: false,
          message: "Score must be a number between 1 and 100"
        });
      }

      // Find the existing score
      const existingScore = await db.StockPerformanceScore.findByPk(id as string);
      if (!existingScore) {
        return res.status(404).json({
          success: false,
          message: "Stock performance score not found"
        });
      }

      // Update the score
      await db.StockPerformanceScore.update(
        { score: score.toString() },
        { where: { id } }
      );

      // Fetch the updated score with product information
      const updatedScore = await db.StockPerformanceScore.findByPk(id as string, {
        include: [
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name']
          }
        ]
      });

      res.json({
        success: true,
        data: updatedScore,
        message: "Stock performance score updated successfully"
      });
    } catch (error) {
      console.error("Error updating stock performance score:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update stock performance score"
      });
    }
  }

  // Delete stock performance score
  static async deleteStockPerformanceScore(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      // Find the score to get stock_id
      const score = await db.StockPerformanceScore.findByPk(id as string);
      if (!score) {
        return res.status(404).json({
          success: false,
          message: "Stock performance score not found"
        });
      }

      // Remove the reference from products table
      await db.Product.update(
        { stock_performance_score_id: Sequelize.literal('NULL') },
        { where: { stock_performance_score_id: id } }
      );

      // Delete the score
      await db.StockPerformanceScore.destroy({
        where: { id }
      });

      res.json({
        success: true,
        message: "Stock performance score deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting stock performance score:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete stock performance score"
      });
    }
  }

  // Get all products (for dropdown)
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await db.Product.findAll({
        attributes: ['id', 'company_name'],
        order: [['company_name', 'ASC']]
      });

      res.json({
        success: true,
        data: products,
        message: "Products retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products"
      });
    }
  }
}
