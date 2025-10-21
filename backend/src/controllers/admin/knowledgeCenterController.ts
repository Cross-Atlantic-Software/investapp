import { Request, Response } from "express";
import { Op } from "sequelize";
import { db } from "../../utils/database";

export class KnowledgeCenterController {
  // Get all knowledge centers with pagination and search
  static async getAllKnowledgeCenters(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        is_featured,
        knowledge_sector_id,
        knowledge_topic_id,
        knowledge_theme_id,
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
      if (knowledge_sector_id) {
        whereClause.knowledge_sector_id = knowledge_sector_id;
      }
      if (knowledge_topic_id) {
        whereClause.knowledge_topic_id = knowledge_topic_id;
      }
      if (knowledge_theme_id) {
        whereClause.knowledge_theme_id = knowledge_theme_id;
      }

      const { count, rows } = await db.KnowledgeCenter.findAndCountAll({
        where: whereClause,
        order: [[sort_by as string, sort_order as string]],
        limit: Number(limit),
        offset: offset,
        include: [
          {
            model: db.KnowledgeSector,
            as: 'KnowledgeSector',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTopic,
            as: 'KnowledgeTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTheme,
            as: 'KnowledgeTheme',
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
      console.error("Error fetching knowledge centers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge centers",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get featured knowledge centers
  static async getFeaturedKnowledgeCenters(req: Request, res: Response) {
    try {
      const { limit = 7 } = req.query;

      const knowledgeCenters = await db.KnowledgeCenter.findAll({
        where: { is_featured: true },
        order: [['updated_at', 'DESC']],
        limit: Number(limit),
        include: [
          {
            model: db.KnowledgeSector,
            as: 'KnowledgeSector',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTopic,
            as: 'KnowledgeTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTheme,
            as: 'KnowledgeTheme',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        data: knowledgeCenters
      });
    } catch (error) {
      console.error("Error fetching featured knowledge centers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch featured knowledge centers",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge center by slug
  static async getKnowledgeCenterBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const knowledgeCenter = await db.KnowledgeCenter.findOne({
        where: { slug },
        include: [
          {
            model: db.KnowledgeSector,
            as: 'KnowledgeSector',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTopic,
            as: 'KnowledgeTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTheme,
            as: 'KnowledgeTheme',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!knowledgeCenter) {
        return res.status(404).json({
          success: false,
          message: "Knowledge center not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeCenter
      });
    } catch (error) {
      console.error("Error fetching knowledge center:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge center",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Get knowledge center by ID
  static async getKnowledgeCenterById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const knowledgeCenter = await db.KnowledgeCenter.findByPk(id, {
        include: [
          {
            model: db.KnowledgeSector,
            as: 'KnowledgeSector',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTopic,
            as: 'KnowledgeTopic',
            attributes: ['id', 'name']
          },
          {
            model: db.KnowledgeTheme,
            as: 'KnowledgeTheme',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!knowledgeCenter) {
        return res.status(404).json({
          success: false,
          message: "Knowledge center not found"
        });
      }

      res.json({
        success: true,
        data: knowledgeCenter
      });
    } catch (error) {
      console.error("Error fetching knowledge center:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch knowledge center",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Create new knowledge center
  static async createKnowledgeCenter(req: Request, res: Response) {
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
        knowledge_sector_id,
        knowledge_subsector_ids = [],
        knowledge_topic_id,
        knowledge_subtopic_ids = [],
        knowledge_theme_id,
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
      let parsedSubsectorIds = knowledge_subsector_ids;
      if (typeof knowledge_subsector_ids === 'string') {
        try {
          parsedSubsectorIds = JSON.parse(knowledge_subsector_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid knowledge_subsector_ids format"
          });
        }
      }

      // Parse subtopic_ids if it's a JSON string
      let parsedSubtopicIds = knowledge_subtopic_ids;
      if (typeof knowledge_subtopic_ids === 'string') {
        try {
          parsedSubtopicIds = JSON.parse(knowledge_subtopic_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid knowledge_subtopic_ids format"
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
      const existingKnowledgeCenter = await db.KnowledgeCenter.findOne({
        where: { slug: slug.trim() }
      });

      if (existingKnowledgeCenter) {
        return res.status(400).json({
          success: false,
          message: "Knowledge center with this slug already exists"
        });
      }

      // Validate taxonomy IDs if provided
      if (knowledge_sector_id) {
        const sector = await db.KnowledgeSector.findByPk(knowledge_sector_id);
        if (!sector) {
          return res.status(400).json({
            success: false,
            message: "Knowledge sector not found"
          });
        }
      }

      // Validate subsector IDs if provided
      if (parsedSubsectorIds && parsedSubsectorIds.length > 0) {
        const subsectors = await db.KnowledgeSubsector.findAll({
          where: { id: parsedSubsectorIds }
        });
        if (subsectors.length !== parsedSubsectorIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subsectors not found"
          });
        }
      }

      if (knowledge_topic_id) {
        const topic = await db.KnowledgeTopic.findByPk(knowledge_topic_id);
        if (!topic) {
          return res.status(400).json({
            success: false,
            message: "Knowledge topic not found"
          });
        }
      }

      // Validate subtopic IDs if provided
      if (parsedSubtopicIds && parsedSubtopicIds.length > 0) {
        const subtopics = await db.KnowledgeSubtopic.findAll({
          where: { id: parsedSubtopicIds }
        });
        if (subtopics.length !== parsedSubtopicIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subtopics not found"
          });
        }
      }

      if (knowledge_theme_id) {
        const theme = await db.KnowledgeTheme.findByPk(knowledge_theme_id);
        if (!theme) {
          return res.status(400).json({
            success: false,
            message: "Knowledge theme not found"
          });
        }
      }

      // Validate company IDs if provided

      // Create the knowledge center
      const knowledgeCenter = await db.KnowledgeCenter.create({
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
        knowledge_sector_id: knowledge_sector_id || null,
        knowledge_subsector_ids: parsedSubsectorIds.length > 0 ? JSON.stringify(parsedSubsectorIds) : undefined,
        knowledge_topic_id: knowledge_topic_id || null,
        knowledge_subtopic_ids: parsedSubtopicIds.length > 0 ? JSON.stringify(parsedSubtopicIds) : undefined,
        knowledge_theme_id: knowledge_theme_id || null,
        company_ids: parsedCompanyIds.length > 0 ? JSON.stringify(parsedCompanyIds) : undefined,
      });

      res.status(201).json({
        success: true,
        message: "Knowledge center created successfully",
        data: knowledgeCenter
      });
    } catch (error) {
      console.error("Error creating knowledge center:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create knowledge center",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Update knowledge center
  static async updateKnowledgeCenter(req: Request, res: Response) {
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
        knowledge_sector_id,
        knowledge_subsector_ids = [],
        knowledge_topic_id,
        knowledge_subtopic_ids = [],
        knowledge_theme_id,
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
      let parsedSubsectorIds = knowledge_subsector_ids;
      if (typeof knowledge_subsector_ids === 'string') {
        try {
          parsedSubsectorIds = JSON.parse(knowledge_subsector_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid knowledge_subsector_ids format"
          });
        }
      }

      // Parse subtopic_ids if it's a JSON string
      let parsedSubtopicIds = knowledge_subtopic_ids;
      if (typeof knowledge_subtopic_ids === 'string') {
        try {
          parsedSubtopicIds = JSON.parse(knowledge_subtopic_ids);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid knowledge_subtopic_ids format"
          });
        }
      }


      // Get file URLs from uploaded files (if new files uploaded)
      const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } || {};
      const blogImageFile = files.blog_image?.[0];
      const videoFile = files.video_file?.[0];
      
      const blog_image = (blogImageFile as any)?.location;
      const video_file = (videoFile as any)?.location;

      const knowledgeCenter = await db.KnowledgeCenter.findByPk(id);
      if (!knowledgeCenter) {
        return res.status(404).json({
          success: false,
          message: "Knowledge center not found"
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
      const finalContentType = content_type || knowledgeCenter.content_type;
      if (finalContentType === 'TEXT') {
        if (first_part === undefined || second_part === undefined) {
          return res.status(400).json({
            success: false,
            message: "First part and second part are required for TEXT content type"
          });
        }
      } else if (finalContentType === 'VIDEO') {
        if (!video_file && !knowledgeCenter.video_file) {
          return res.status(400).json({
            success: false,
            message: "Video file is required for VIDEO content type"
          });
        }
      }

      // Check if slug is being updated and if it conflicts
      if (slug && slug.trim() !== knowledgeCenter.slug) {
        const existingKnowledgeCenter = await db.KnowledgeCenter.findOne({
          where: { slug: slug.trim() }
        });

        if (existingKnowledgeCenter) {
          return res.status(400).json({
            success: false,
            message: "Knowledge center with this slug already exists"
          });
        }
      }

      // Validate taxonomy IDs if provided
      if (knowledge_sector_id) {
        const sector = await db.KnowledgeSector.findByPk(knowledge_sector_id);
        if (!sector) {
          return res.status(400).json({
            success: false,
            message: "Knowledge sector not found"
          });
        }
      }

      // Validate subsector IDs if provided
      if (parsedSubsectorIds && parsedSubsectorIds.length > 0) {
        const subsectors = await db.KnowledgeSubsector.findAll({
          where: { id: parsedSubsectorIds }
        });
        if (subsectors.length !== parsedSubsectorIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subsectors not found"
          });
        }
      }

      if (knowledge_topic_id) {
        const topic = await db.KnowledgeTopic.findByPk(knowledge_topic_id);
        if (!topic) {
          return res.status(400).json({
            success: false,
            message: "Knowledge topic not found"
          });
        }
      }

      // Validate subtopic IDs if provided
      if (parsedSubtopicIds && parsedSubtopicIds.length > 0) {
        const subtopics = await db.KnowledgeSubtopic.findAll({
          where: { id: parsedSubtopicIds }
        });
        if (subtopics.length !== parsedSubtopicIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subtopics not found"
          });
        }
      }

      if (knowledge_theme_id) {
        const theme = await db.KnowledgeTheme.findByPk(knowledge_theme_id);
        if (!theme) {
          return res.status(400).json({
            success: false,
            message: "Knowledge theme not found"
          });
        }
      }

      // Validate company IDs if provided

      // Update the knowledge center
      await knowledgeCenter.update({
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
        ...(knowledge_sector_id !== undefined && { knowledge_sector_id: knowledge_sector_id || null }),
        ...(knowledge_subsector_ids !== undefined && { knowledge_subsector_ids: parsedSubsectorIds.length > 0 ? JSON.stringify(parsedSubsectorIds) : undefined }),
        ...(knowledge_topic_id !== undefined && { knowledge_topic_id: knowledge_topic_id || null }),
        ...(knowledge_subtopic_ids !== undefined && { knowledge_subtopic_ids: parsedSubtopicIds.length > 0 ? JSON.stringify(parsedSubtopicIds) : undefined }),
        ...(knowledge_theme_id !== undefined && { knowledge_theme_id: knowledge_theme_id || null }),
        ...(company_ids !== undefined && { company_ids: parsedCompanyIds.length > 0 ? JSON.stringify(parsedCompanyIds) : undefined }),
      });

      res.json({
        success: true,
        message: "Knowledge center updated successfully",
        data: knowledgeCenter
      });
    } catch (error) {
      console.error("Error updating knowledge center:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update knowledge center",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Delete knowledge center
  static async deleteKnowledgeCenter(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const knowledgeCenter = await db.KnowledgeCenter.findByPk(id);
      if (!knowledgeCenter) {
        return res.status(404).json({
          success: false,
          message: "Knowledge center not found"
        });
      }

      await knowledgeCenter.destroy();

      res.json({
        success: true,
        message: "Knowledge center deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting knowledge center:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete knowledge center",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
