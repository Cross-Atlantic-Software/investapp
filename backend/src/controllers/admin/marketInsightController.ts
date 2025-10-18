import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class MarketInsightController {
  // Get all market insights with pagination and search
  static async getAllMarketInsights(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        is_featured,
        insight_sector_id,
        insight_subsector_id,
        insight_topic_id,
        insight_subtopic_id,
        insight_theme_id,
        sort_by = "updated_at", 
        sort_order = "DESC" 
      } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      if (search) {
        whereClause = {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { teaser: { [Op.like]: `%${search}%` } },
            { summary: { [Op.like]: `%${search}%` } }
          ]
        };
      }
      if (is_featured !== undefined) {
        whereClause.is_featured = is_featured === 'true';
      }
      if (insight_sector_id) {
        whereClause.insight_sector_id = insight_sector_id;
      }
      if (insight_subsector_id) {
        whereClause.insight_subsector_id = insight_subsector_id;
      }
      if (insight_topic_id) {
        whereClause.insight_topic_id = insight_topic_id;
      }
      if (insight_subtopic_id) {
        whereClause.insight_subtopic_id = insight_subtopic_id;
      }
      if (insight_theme_id) {
        whereClause.insight_theme_id = insight_theme_id;
      }

      const { count, rows } = await db.MarketInsight.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.InsightSector,
            as: 'InsightSector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubsector,
            as: 'InsightSubsector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubtopic,
            as: 'InsightSubtopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
          },
          {
            model: db.Product,
            as: 'Companies',
            attributes: ['id', 'company_name'],
            through: { attributes: [] }
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
      console.error("Error fetching market insights:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch market insights",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get featured market insights
  static async getFeaturedMarketInsights(req: Request, res: Response) {
    try {
      const { limit = 7 } = req.query;

      const insights = await db.MarketInsight.findAll({
        where: { is_featured: true },
        order: [['updated_at', 'DESC']],
        limit: Number(limit),
        include: [
          {
            model: db.InsightSector,
            as: 'InsightSector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubsector,
            as: 'InsightSubsector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubtopic,
            as: 'InsightSubtopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
          },
          {
            model: db.Product,
            as: 'Companies',
            attributes: ['id', 'company_name'],
            through: { attributes: [] }
          }
        ]
      });

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error("Error fetching featured market insights:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch featured market insights",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get market insight by slug
  static async getMarketInsightBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const insight = await db.MarketInsight.findOne({
        where: { slug },
        include: [
          {
            model: db.InsightSector,
            as: 'InsightSector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubsector,
            as: 'InsightSubsector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubtopic,
            as: 'InsightSubtopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
          },
          {
            model: db.Product,
            as: 'Companies',
            attributes: ['id', 'company_name'],
            through: { attributes: [] }
          }
        ]
      });

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found"
        });
      }

      res.json({
        success: true,
        data: insight
      });
    } catch (error) {
      console.error("Error fetching market insight:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch market insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get market insight by ID
  static async getMarketInsightById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const insight = await db.MarketInsight.findByPk(id, {
        include: [
          {
            model: db.InsightSector,
            as: 'InsightSector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubsector,
            as: 'InsightSubsector',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightSubtopic,
            as: 'InsightSubtopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
          },
          {
            model: db.Product,
            as: 'Companies',
            attributes: ['id', 'company_name'],
            through: { attributes: [] }
          }
        ]
      });

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found"
        });
      }

      res.json({
        success: true,
        data: insight
      });
    } catch (error) {
      console.error("Error fetching market insight:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch market insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new market insight
  static async createMarketInsight(req: Request, res: Response) {
    try {
      const {
        slug,
        is_featured = false,
        title,
        teaser,
        summary,
        first_part,
        second_part,
        insight_sector_id,
        insight_subsector_id,
        insight_topic_id,
        insight_subtopic_id,
        insight_theme_id,
        company_ids = []
      } = req.body;

      // Parse company_ids if it's a JSON string
      let parsedCompanyIds = company_ids;
      if (typeof company_ids === 'string') {
        try {
          parsedCompanyIds = JSON.parse(company_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid company_ids format"
          });
        }
      }

      // Get blog image URL from uploaded file
      const blog_image = (req as any).file?.location || '';

      // Validation
      if (!slug || !title || !teaser || !summary || !first_part || !second_part) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided"
        });
      }

      // Check if slug already exists
      const existingInsight = await db.MarketInsight.findOne({
        where: { slug: slug.trim() }
      });

      if (existingInsight) {
        return res.status(400).json({
          success: false,
          message: "Market insight with this slug already exists"
        });
      }

      // Validate taxonomy IDs if provided
      if (insight_sector_id) {
        const sector = await db.InsightSector.findByPk(insight_sector_id);
        if (!sector) {
          return res.status(400).json({
            success: false,
            message: "Insight sector not found"
          });
        }
      }

      if (insight_subsector_id) {
        const subsector = await db.InsightSubsector.findByPk(insight_subsector_id);
        if (!subsector) {
          return res.status(400).json({
            success: false,
            message: "Insight subsector not found"
          });
        }
      }

      if (insight_topic_id) {
        const topic = await db.InsightTopic.findByPk(insight_topic_id);
        if (!topic) {
          return res.status(400).json({
            success: false,
            message: "Insight topic not found"
          });
        }
      }

      if (insight_subtopic_id) {
        const subtopic = await db.InsightSubtopic.findByPk(insight_subtopic_id);
        if (!subtopic) {
          return res.status(400).json({
            success: false,
            message: "Insight subtopic not found"
          });
        }
      }

      if (insight_theme_id) {
        const theme = await db.InsightTheme.findByPk(insight_theme_id);
        if (!theme) {
          return res.status(400).json({
            success: false,
            message: "Insight theme not found"
          });
        }
      }

      // Validate company IDs if provided
      if (parsedCompanyIds && parsedCompanyIds.length > 0) {
        const companies = await db.Product.findAll({
          where: { id: parsedCompanyIds }
        });
        if (companies.length !== parsedCompanyIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more companies not found"
          });
        }
      }

      // Create the market insight
      const marketInsight = await db.MarketInsight.create({
        slug: slug.trim(),
        is_featured: Boolean(is_featured),
        title: title.trim(),
        blog_image: blog_image, // S3 URL, no need to trim
        teaser: teaser.trim(),
        summary: summary.trim(),
        first_part: first_part.trim(),
        second_part: second_part.trim(),
        insight_sector_id: insight_sector_id || null,
        insight_subsector_id: insight_subsector_id || null,
        insight_topic_id: insight_topic_id || null,
        insight_subtopic_id: insight_subtopic_id || null,
        insight_theme_id: insight_theme_id || null
      });

      // Associate companies if provided
      if (parsedCompanyIds && parsedCompanyIds.length > 0) {
        // Clear existing associations
        await db.MarketInsightCompany.destroy({
          where: { market_insight_id: marketInsight.id }
        });
        
        // Create new associations
        const companyAssociations = parsedCompanyIds.map((product_id: number) => ({
          market_insight_id: marketInsight.id,
          product_id: product_id
        }));
        
        await db.MarketInsightCompany.bulkCreate(companyAssociations);
      }

      res.status(201).json({
        success: true,
        message: "Market insight created successfully",
        data: marketInsight
      });
    } catch (error) {
      console.error("Error creating market insight:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create market insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update market insight
  static async updateMarketInsight(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        slug,
        is_featured,
        title,
        teaser,
        summary,
        first_part,
        second_part,
        insight_sector_id,
        insight_subsector_id,
        insight_topic_id,
        insight_subtopic_id,
        insight_theme_id,
        company_ids
      } = req.body;

      // Parse company_ids if it's a JSON string
      let parsedCompanyIds = company_ids;
      if (company_ids && typeof company_ids === 'string') {
        try {
          parsedCompanyIds = JSON.parse(company_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid company_ids format"
          });
        }
      }

      // Get blog image URL from uploaded file (if new file uploaded)
      const blog_image = (req as any).file?.location;

      const marketInsight = await db.MarketInsight.findByPk(id);
      if (!marketInsight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found"
        });
      }

      // Check if slug is being updated and if it conflicts
      if (slug && slug.trim() !== marketInsight.slug) {
        const existingInsight = await db.MarketInsight.findOne({
          where: { slug: slug.trim() }
        });

        if (existingInsight) {
          return res.status(400).json({
            success: false,
            message: "Market insight with this slug already exists"
          });
        }
      }

      // Validate taxonomy IDs if provided
      if (insight_sector_id) {
        const sector = await db.InsightSector.findByPk(insight_sector_id);
        if (!sector) {
          return res.status(400).json({
            success: false,
            message: "Insight sector not found"
          });
        }
      }

      if (insight_subsector_id) {
        const subsector = await db.InsightSubsector.findByPk(insight_subsector_id);
        if (!subsector) {
          return res.status(400).json({
            success: false,
            message: "Insight subsector not found"
          });
        }
      }

      if (insight_topic_id) {
        const topic = await db.InsightTopic.findByPk(insight_topic_id);
        if (!topic) {
          return res.status(400).json({
            success: false,
            message: "Insight topic not found"
          });
        }
      }

      if (insight_subtopic_id) {
        const subtopic = await db.InsightSubtopic.findByPk(insight_subtopic_id);
        if (!subtopic) {
          return res.status(400).json({
            success: false,
            message: "Insight subtopic not found"
          });
        }
      }

      if (insight_theme_id) {
        const theme = await db.InsightTheme.findByPk(insight_theme_id);
        if (!theme) {
          return res.status(400).json({
            success: false,
            message: "Insight theme not found"
          });
        }
      }

      // Validate company IDs if provided
      if (parsedCompanyIds && parsedCompanyIds.length > 0) {
        const companies = await db.Product.findAll({
          where: { id: parsedCompanyIds }
        });
        if (companies.length !== parsedCompanyIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more companies not found"
          });
        }
      }

      // Update the market insight
      await marketInsight.update({
        ...(slug && { slug: slug.trim() }),
        ...(is_featured !== undefined && { is_featured: Boolean(is_featured) }),
        ...(title && { title: title.trim() }),
        ...(blog_image && { blog_image: blog_image }), // S3 URL, no need to trim
        ...(teaser && { teaser: teaser.trim() }),
        ...(summary && { summary: summary.trim() }),
        ...(first_part && { first_part: first_part.trim() }),
        ...(second_part && { second_part: second_part.trim() }),
        ...(insight_sector_id !== undefined && { insight_sector_id: insight_sector_id || null }),
        ...(insight_subsector_id !== undefined && { insight_subsector_id: insight_subsector_id || null }),
        ...(insight_topic_id !== undefined && { insight_topic_id: insight_topic_id || null }),
        ...(insight_subtopic_id !== undefined && { insight_subtopic_id: insight_subtopic_id || null }),
        ...(insight_theme_id !== undefined && { insight_theme_id: insight_theme_id || null })
      });

      // Update company associations if provided
      if (company_ids !== undefined) {
        // Clear existing associations
        await db.MarketInsightCompany.destroy({
          where: { market_insight_id: marketInsight.id }
        });
        
        // Create new associations if any companies provided
        if (parsedCompanyIds && parsedCompanyIds.length > 0) {
          const companyAssociations = parsedCompanyIds.map((product_id: number) => ({
            market_insight_id: marketInsight.id,
            product_id: product_id
          }));
          
          await db.MarketInsightCompany.bulkCreate(companyAssociations);
        }
      }

      res.json({
        success: true,
        message: "Market insight updated successfully",
        data: marketInsight
      });
    } catch (error) {
      console.error("Error updating market insight:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update market insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete market insight
  static async deleteMarketInsight(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const marketInsight = await db.MarketInsight.findByPk(id);
      if (!marketInsight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found"
        });
      }

      await marketInsight.destroy();

      res.json({
        success: true,
        message: "Market insight deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting market insight:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete market insight",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
