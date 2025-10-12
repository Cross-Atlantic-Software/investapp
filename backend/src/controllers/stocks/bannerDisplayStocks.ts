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

    // Fetch valuation names for all stocks
    const stocksWithValuations = await Promise.all(
      stocks.map(async (stock: any) => {
        let valuationName = 'N/A';
        
        console.log(`Processing stock: ${stock.company_name}, valuation_id: ${stock.valuation_id}`);
        
        // Check if valuation_id exists (for backward compatibility)
        if (stock.valuation_id) {
          try {
            console.log(`Looking up valuation for ID: ${stock.valuation_id}`);
            const valuation = await db.Valuation.findByPk(stock.valuation_id);
            console.log(`Found valuation:`, valuation);
            valuationName = valuation ? valuation.valuation_name : 'N/A';
            console.log(`Stock ${stock.company_name}: valuation_id=${stock.valuation_id}, valuation_name=${valuationName}`);
          } catch (error) {
            console.log(`Error fetching valuation for ${stock.company_name}:`, error instanceof Error ? error.message : 'Unknown error');
            valuationName = stock.valuation || 'N/A'; // Fallback to old field
          }
        } else {
          console.log(`Stock ${stock.company_name}: No valuation_id found, using old valuation field: ${stock.valuation}`);
          valuationName = stock.valuation || 'N/A'; // Fallback to old field
        }

        return {
          id: stock.id,
          company_name: stock.company_name,
          logo: stock.logo,
          price_per_share: stock.price_per_share,
          percentage_change: stock.percentage_change,
          valuation: valuationName,
          teaser: stock.teaser,
          short_description: stock.short_description,
          analysis: stock.analysis,
          demand: stock.demand,
          homeDisplay: stock.homeDisplay,
          bannerDisplay: stock.bannerDisplay,
          founded: stock.founded,
          sector_ids: stock.sector_ids,
          subsector_ids: stock.subsector_ids,
          headquarters: stock.headquarters,
          min_units: stock.min_units,
          lot_size: stock.lot_size,
          stock_master_ids: stock.stock_master_ids,
          price_change_period_id: stock.price_change_period_id,
          createdAt: stock.createdAt,
          updatedAt: stock.updatedAt
        };
      })
    );

    console.log('Processed stocks with valuations:', stocksWithValuations.length);

    return res.status(200).json({
      success: true,
      data: {
        stocks: stocksWithValuations,
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
