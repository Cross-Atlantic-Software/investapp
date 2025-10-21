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
        insight_topic_id,
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
      if (insight_topic_id) {
        whereClause.insight_topic_id = insight_topic_id;
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
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
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
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
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
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
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
            model: db.InsightTopic,
            as: 'InsightTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.InsightTheme,
            as: 'InsightTheme',
            attributes: ['id', 'name']
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
      // Debug multer errors
      if ((req as any).fileError) {
        console.error('❌ Multer error:', (req as any).fileError);
        return res.status(400).json({
          success: false,
          message: "File upload error: " + (req as any).fileError.message
        });
      }
      const {
        slug,
        is_featured = false,
        title,
        teaser,
        summary,
        content_type = 'TEXT',
        first_part,
        second_part,
        insight_sector_id,
        insight_subsector_ids = [],
        insight_topic_id,
        insight_subtopic_ids = [],
        insight_theme_id,
        company_ids = [],
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

      // Validate company_ids if provided
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

      // Parse subsector_ids if it's a JSON string
      let parsedSubsectorIds = insight_subsector_ids;
      if (typeof insight_subsector_ids === 'string') {
        try {
          parsedSubsectorIds = JSON.parse(insight_subsector_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid insight_subsector_ids format"
          });
        }
      }

      // Parse subtopic_ids if it's a JSON string
      let parsedSubtopicIds = insight_subtopic_ids;
      if (typeof insight_subtopic_ids === 'string') {
        try {
          parsedSubtopicIds = JSON.parse(insight_subtopic_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid insight_subtopic_ids format"
          });
        }
      }


      // Get file URLs from uploaded files
      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } || {};
      const blogImageFile = files.blog_image?.[0];
      const videoFile = files.video_file?.[0];
      
      const blog_image = (blogImageFile as any)?.location || '';
      const video_file = (videoFile as any)?.location || undefined;
      
      // Debug logging
      console.log('🔍 File upload debug:', {
        hasBlogImage: !!blogImageFile,
        hasVideoFile: !!videoFile,
        blogImageLocation: (blogImageFile as any)?.location,
        videoFileLocation: (videoFile as any)?.location,
        content_type
      });

      // Validate content_type
      if (!['TEXT', 'VIDEO'].includes(content_type)) {
        return res.status(400).json({
          success: false,
          message: "Content type must be either 'TEXT' or 'VIDEO'"
        });
      }

      // Content-specific validation
      if (content_type === 'TEXT') {
        if (!first_part || !second_part) {
          return res.status(400).json({
            success: false,
            message: "First part and second part are required for TEXT content type"
          });
        }
      }
      
      // File upload validation based on content type
      if (content_type === 'TEXT' && !blog_image) {
        return res.status(400).json({
          success: false,
          message: "Blog image is required for TEXT content type"
        });
      }
      
      if (content_type === 'VIDEO' && !video_file) {
        return res.status(400).json({
          success: false,
          message: "Video file is required for VIDEO content type"
        });
      }

      // Basic validation
      if (!slug || !title || !teaser || !summary) {
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

      // Validate subsector IDs if provided
      if (parsedSubsectorIds && parsedSubsectorIds.length > 0) {
        const subsectors = await db.InsightSubsector.findAll({
          where: { id: parsedSubsectorIds }
        });
        if (subsectors.length !== parsedSubsectorIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subsectors not found"
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

      // Validate subtopic IDs if provided
      if (parsedSubtopicIds && parsedSubtopicIds.length > 0) {
        const subtopics = await db.InsightSubtopic.findAll({
          where: { id: parsedSubtopicIds }
        });
        if (subtopics.length !== parsedSubtopicIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subtopics not found"
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

      // Create the market insight
      const marketInsight = await db.MarketInsight.create({
        slug: slug.trim(),
        is_featured: is_featured === 'true' || is_featured === true,
        title: title.trim(),
        blog_image: blog_image, // S3 URL, no need to trim
        teaser: teaser.trim(),
        summary: summary.trim(),
        content_type: content_type,
        first_part: content_type === 'TEXT' ? first_part.trim() : undefined,
        second_part: content_type === 'TEXT' ? second_part.trim() : undefined,
        video_file: content_type === 'VIDEO' ? video_file : undefined,
        insight_sector_id: insight_sector_id || null,
        insight_subsector_ids: parsedSubsectorIds.length > 0 ? JSON.stringify(parsedSubsectorIds) : undefined,
        insight_topic_id: insight_topic_id || null,
        insight_subtopic_ids: parsedSubtopicIds.length > 0 ? JSON.stringify(parsedSubtopicIds) : undefined,
        insight_theme_id: insight_theme_id || null,
        company_ids: parsedCompanyIds.length > 0 ? JSON.stringify(parsedCompanyIds) : undefined,
      });

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
        content_type,
        first_part,
        second_part,
        insight_sector_id,
        insight_subsector_ids = [],
        insight_topic_id,
        insight_subtopic_ids = [],
        insight_theme_id,
        company_ids = [],
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

      // Validate company_ids if provided
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

      // Parse subsector_ids if it's a JSON string
      let parsedSubsectorIds = insight_subsector_ids;
      if (typeof insight_subsector_ids === 'string') {
        try {
          parsedSubsectorIds = JSON.parse(insight_subsector_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid insight_subsector_ids format"
          });
        }
      }

      // Parse subtopic_ids if it's a JSON string
      let parsedSubtopicIds = insight_subtopic_ids;
      if (typeof insight_subtopic_ids === 'string') {
        try {
          parsedSubtopicIds = JSON.parse(insight_subtopic_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid insight_subtopic_ids format"
          });
        }
      }


      // Get file URLs from uploaded files (if new files uploaded)
      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } || {};
      const blogImageFile = files.blog_image?.[0];
      const videoFile = files.video_file?.[0];
      
      const blog_image = (blogImageFile as any)?.location;
      const video_file = (videoFile as any)?.location;

      const marketInsight = await db.MarketInsight.findByPk(id);
      if (!marketInsight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found"
        });
      }

      // Validate content_type if provided
      if (content_type && !['TEXT', 'VIDEO'].includes(content_type)) {
        return res.status(400).json({
          success: false,
          message: "Content type must be either 'TEXT' or 'VIDEO'"
        });
      }

      // Content-specific validation
      const finalContentType = content_type || marketInsight.content_type;
      if (finalContentType === 'TEXT') {
        if (first_part === undefined || second_part === undefined) {
          return res.status(400).json({
            success: false,
            message: "First part and second part are required for TEXT content type"
          });
        }
      } else if (finalContentType === 'VIDEO') {
        if (!video_file && !marketInsight.video_file) {
          return res.status(400).json({
            success: false,
            message: "Video file is required for VIDEO content type"
          });
        }
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

      // Validate subsector IDs if provided
      if (parsedSubsectorIds && parsedSubsectorIds.length > 0) {
        const subsectors = await db.InsightSubsector.findAll({
          where: { id: parsedSubsectorIds }
        });
        if (subsectors.length !== parsedSubsectorIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subsectors not found"
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

      // Validate subtopic IDs if provided
      if (parsedSubtopicIds && parsedSubtopicIds.length > 0) {
        const subtopics = await db.InsightSubtopic.findAll({
          where: { id: parsedSubtopicIds }
        });
        if (subtopics.length !== parsedSubtopicIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subtopics not found"
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

      // Update the market insight
      await marketInsight.update({
        ...(slug && { slug: slug.trim() }),
        ...(is_featured !== undefined && { is_featured: is_featured === 'true' || is_featured === true }),
        ...(title && { title: title.trim() }),
        ...(blog_image && { blog_image: blog_image }), // S3 URL, no need to trim
        ...(teaser && { teaser: teaser.trim() }),
        ...(summary && { summary: summary.trim() }),
        ...(content_type && { content_type: content_type }),
        ...(first_part !== undefined && { first_part: finalContentType === 'TEXT' ? first_part.trim() : undefined }),
        ...(second_part !== undefined && { second_part: finalContentType === 'TEXT' ? second_part.trim() : undefined }),
        ...(video_file && { video_file: finalContentType === 'VIDEO' ? video_file : undefined }),
        ...(insight_sector_id !== undefined && { insight_sector_id: insight_sector_id || null }),
        ...(insight_subsector_ids !== undefined && { insight_subsector_ids: parsedSubsectorIds.length > 0 ? JSON.stringify(parsedSubsectorIds) : undefined }),
        ...(insight_topic_id !== undefined && { insight_topic_id: insight_topic_id || null }),
        ...(insight_subtopic_ids !== undefined && { insight_subtopic_ids: parsedSubtopicIds.length > 0 ? JSON.stringify(parsedSubtopicIds) : undefined }),
        ...(insight_theme_id !== undefined && { insight_theme_id: insight_theme_id || null }),
        ...(company_ids !== undefined && { company_ids: parsedCompanyIds.length > 0 ? JSON.stringify(parsedCompanyIds) : undefined }),
      });

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
