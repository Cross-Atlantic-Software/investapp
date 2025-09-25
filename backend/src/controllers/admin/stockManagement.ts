import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Op } from "sequelize";

// Extend Request interface to include files property from multer
interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// Get all stocks with pagination
export const getAllStocks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || "";
    const sortBy = req.query.sort_by as string || 'createdAt';
    const sortOrder = req.query.sort_order as string || 'DESC';

    let whereClause: any = {};
    
    // Add search functionality - search only by company name
    if (search) {
      whereClause = {
        company_name: { [Op.like]: `%${search}%` }
      };
    }

    // Validate sort fields to prevent SQL injection
    const allowedSortFields = ['id', 'company_name', 'price', 'price_change', 'demand', 'homeDisplay', 'bannerDisplay', 'valuation', 'price_per_share', 'percentage_change', 'createdAt', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: stocks } = await db.Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[validSortBy, validSortOrder]]
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        stocks,
        pagination: {
          currentPage: page,
          totalPages,
          totalStocks: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get stock by ID
export const getStockById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stock = await db.Product.findByPk(id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get stock by company name
export const getStockByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const stock = await db.Product.findOne({
      where: {
        company_name: name
      }
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error("Error fetching stock by name:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Create new stock
export const createStock = async (req: MulterRequest, res: Response) => {
  try {
    // Debug: Log the request body and files
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    // Clean up the request body by trimming field names and values
    const cleanedBody: any = {};
    Object.keys(req.body).forEach(key => {
      const cleanKey = key.trim().replace(/[:]/g, ''); // Remove spaces and colons
      cleanedBody[cleanKey] = req.body[key];
    });
    
    const {
      company_name,
      logo,
      price,
      price_change,
      teaser,
      short_description,
      analysis,
      demand,
      homeDisplay,
      bannerDisplay,
      valuation,
      price_per_share,
      percentage_change
    } = cleanedBody;

    // Validate required fields
    if (!company_name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
        debug: {
          originalBody: req.body,
          cleanedBody: cleanedBody,
          receivedFiles: req.files
        }
      });
    }

    // Handle logo upload to S3
    let logoUrl: string | undefined = undefined;
    if (req.files) {
      let file: Express.Multer.File | undefined;
      
      // Handle both array and object formats
      if (Array.isArray(req.files)) {
        file = req.files[0];
      } else {
        // Get the first file from any field
        const fileArrays = Object.values(req.files);
        file = fileArrays.length > 0 ? fileArrays[0][0] : undefined;
      }
      
      if (file) {
        const s3File = file as any;
        logoUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
      }
    }

    // Create new stock
    const newStock = await db.Product.create({
      company_name,
      logo: logoUrl || logo,
      price,
      price_change,
      teaser,
      short_description,
      analysis,
      demand: demand || 'Low Demand',
      homeDisplay: homeDisplay || 'no',
      bannerDisplay: bannerDisplay || 'no',
      valuation: valuation || 'N/A',
      price_per_share: price_per_share || price || 0,
      percentage_change: percentage_change || price_change || 0
    });

    return res.status(201).json({
      success: true,
      message: "Stock created successfully",
      data: newStock
    });
  } catch (error) {
    console.error("Error creating stock:", error);
    console.error("Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Update stock
export const updateStock = async (req: MulterRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      logo,
      price,
      price_change,
      teaser,
      short_description,
      analysis,
      demand,
      homeDisplay,
      bannerDisplay,
      valuation,
      price_per_share,
      percentage_change
    } = req.body;

    const stock = await db.Product.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    // Handle logo upload to S3
    let logoUrl = stock.logo; // Keep existing logo by default
    if (req.files) {
      let file: Express.Multer.File | undefined;
      
      // Handle both array and object formats
      if (Array.isArray(req.files)) {
        file = req.files[0];
      } else {
        // Get the first file from any field
        const fileArrays = Object.values(req.files);
        file = fileArrays.length > 0 ? fileArrays[0][0] : undefined;
      }
      
      if (file) {
        const s3File = file as any;
        logoUrl = s3File.location || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.key}`;
      }
    }

    // Update stock
    await stock.update({
      company_name: company_name !== undefined ? company_name : stock.company_name,
      logo: logoUrl,
      price: price !== undefined ? price : stock.price,
      price_change: price_change !== undefined ? price_change : stock.price_change,
      teaser: teaser !== undefined ? teaser : stock.teaser,
      short_description: short_description !== undefined ? short_description : stock.short_description,
      analysis: analysis !== undefined ? analysis : stock.analysis,
      demand: demand !== undefined ? demand : stock.demand,
      homeDisplay: homeDisplay !== undefined ? homeDisplay : stock.homeDisplay,
      bannerDisplay: bannerDisplay !== undefined ? bannerDisplay : stock.bannerDisplay,
      valuation: valuation !== undefined ? valuation : stock.valuation,
      price_per_share: price_per_share !== undefined ? price_per_share : stock.price_per_share,
      percentage_change: percentage_change !== undefined ? percentage_change : stock.percentage_change
    });

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: stock
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete stock
export const deleteStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stock = await db.Product.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    await stock.destroy();

    return res.status(200).json({
      success: true,
      message: "Stock deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get stock statistics
export const getStockStats = async (req: Request, res: Response) => {
  try {
    const totalStocks = await db.Product.count();
    
    // Calculate 30-day percentage changes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalStocks30DaysAgo = await db.Product.count({
      where: {
        createdAt: {
          [Op.lte]: thirtyDaysAgo
        }
      }
    });

    // Calculate percentage change (growth in last 30 days)
    const totalStocksChange = totalStocks30DaysAgo > 0 ? 
      ((totalStocks - totalStocks30DaysAgo) / totalStocks30DaysAgo * 100) : 
      (totalStocks > 0 ? 100 : 0);
    
    // Count stocks by company
    const stocksByCompany = await db.Product.findAll({
      attributes: [
        'company_name',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        company_name: {
          [Op.ne]: null as any
        }
      },
      group: ['company_name'],
      order: [[db.sequelize.literal('count'), 'DESC']],
      limit: 10,
      raw: true
    });

    // Get recent stocks
    const recentStocks = await db.Product.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    // Calculate average price (if numeric)
    const priceStats = await db.Product.findAll({
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.cast(db.sequelize.col('price'), 'DECIMAL')), 'avgPrice'],
        [db.sequelize.fn('MIN', db.sequelize.cast(db.sequelize.col('price'), 'DECIMAL')), 'minPrice'],
        [db.sequelize.fn('MAX', db.sequelize.cast(db.sequelize.col('price'), 'DECIMAL')), 'maxPrice']
      ],
      where: {
        price: {
          [Op.ne]: null as any
        }
      },
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: {
        totalStocks,
        stocksByCompany,
        recentStocks,
        priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
        totalStocksChange: Math.round(totalStocksChange * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error fetching stock stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Bulk operations
export const bulkDeleteStocks = async (req: Request, res: Response) => {
  try {
    const { stockIds } = req.body;

    if (!stockIds || !Array.isArray(stockIds) || stockIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Stock IDs array is required"
      });
    }

    const deletedCount = await db.Product.destroy({
      where: {
        id: {
          [Op.in]: stockIds
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `${deletedCount} stocks deleted successfully`
    });
  } catch (error) {
    console.error("Error bulk deleting stocks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};