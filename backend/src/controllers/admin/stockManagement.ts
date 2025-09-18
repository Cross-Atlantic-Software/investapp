import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Op } from "sequelize";

// Get all stocks with pagination
export const getAllStocks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || "";

    let whereClause: any = {};
    
    // Add search functionality
    if (search) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { company_name: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: stocks } = await db.Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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

// Create new stock
export const createStock = async (req: Request, res: Response) => {
  try {
    const {
      title,
      icon,
      company_name,
      price_per_share,
      valuation,
      price_change,
      percentage_change
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    // Create new stock
    const newStock = await db.Product.create({
      title,
      icon,
      company_name,
      price_per_share,
      valuation,
      price_change,
      percentage_change
    });

    return res.status(201).json({
      success: true,
      message: "Stock created successfully",
      data: newStock
    });
  } catch (error) {
    console.error("Error creating stock:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update stock
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      icon,
      company_name,
      price_per_share,
      valuation,
      price_change,
      percentage_change
    } = req.body;

    const stock = await db.Product.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    // Update stock
    await stock.update({
      title: title !== undefined ? title : stock.title,
      icon: icon !== undefined ? icon : stock.icon,
      company_name: company_name !== undefined ? company_name : stock.company_name,
      price_per_share: price_per_share !== undefined ? price_per_share : stock.price_per_share,
      valuation: valuation !== undefined ? valuation : stock.valuation,
      price_change: price_change !== undefined ? price_change : stock.price_change,
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

    // Calculate average price per share (if numeric)
    const priceStats = await db.Product.findAll({
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.cast(db.sequelize.col('price_per_share'), 'DECIMAL')), 'avgPrice'],
        [db.sequelize.fn('MIN', db.sequelize.cast(db.sequelize.col('price_per_share'), 'DECIMAL')), 'minPrice'],
        [db.sequelize.fn('MAX', db.sequelize.cast(db.sequelize.col('price_per_share'), 'DECIMAL')), 'maxPrice']
      ],
      where: {
        price_per_share: {
          [Op.ne]: null as any,
          [Op.regexp]: '^[0-9]+\.?[0-9]*$'
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
        priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
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
