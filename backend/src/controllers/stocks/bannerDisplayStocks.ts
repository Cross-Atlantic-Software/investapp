import { Request, Response } from "express";
import { db } from "../../utils/database";

// Get stocks that are set to display on banner
export const getBannerDisplayStocks = async (req: Request, res: Response) => {
  try {
    console.log("Fetching banner display stocks...");
    
    // Wait for database to be ready
    await db.sequelizePromise;
    
    const stocks = await db.Product.findAll({
      where: {
        bannerDisplay: 'yes'
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
      attributes: [
        'id', 'company_name', 'logo', 'price_change', 'teaser', 
        'short_description', 'analysis', 'demand', 'homeDisplay', 
        'bannerDisplay', 'valuation', 'price_per_share', 
        'percentage_change', 'founded', 'sector_ids', 'subsector_ids', 
        'headquarters', 'min_units', 'lot_size', 'stock_master_ids', 
        'createdAt', 'updatedAt'
      ]
    });

    console.log(`Found ${stocks.length} stocks with bannerDisplay='yes'`);

    return res.status(200).json({
      success: true,
      data: {
        stocks,
        totalCount: stocks.length
      }
    });
  } catch (error) {
    console.error("Error fetching banner display stocks:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + errorMessage
    });
  }
};
