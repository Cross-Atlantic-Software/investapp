import { Request, Response } from "express";
import { db } from "../../utils/database";
import { Op } from "sequelize";

// Get stocks that are set to display on home page
export const getHomeDisplayStocks = async (req: Request, res: Response) => {
  try {
    console.log("Fetching home display stocks...");
    
    // Wait for database to be ready
    await db.sequelizePromise;
    
    const stocks = await db.Product.findAll({
      where: {
        homeDisplay: 'yes'
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
      attributes: [
        'id', 'company_name', 'logo', 'price_change', 'teaser', 
        'short_description', 'analysis', 'demand', 'homeDisplay', 
        'bannerDisplay', 'valuation_id', 'valuation', 'price_per_share', 
        'percentage_change', 'founded', 'sector_ids', 'subsector_ids', 
        'headquarters', 'min_units', 'lot_size', 'stock_master_ids', 
        'price_change_period_id', 'createdAt', 'updatedAt'
      ]
    });

    console.log(`Found ${stocks.length} stocks with homeDisplay='yes'`);

    // Fetch price change periods for all stocks
    const stocksWithValuations = await Promise.all(
      stocks.map(async (stock: any) => {
        let priceChangePeriod = 'No period assigned';
        
        console.log(`Processing stock: ${stock.company_name}, valuation: ${stock.valuation}, price_change_period_id: ${stock.price_change_period_id}`);
        
        // Use valuation directly from products table
        const valuationName = stock.valuation || 'N/A';

        // Fetch price change period name
        if (stock.price_change_period_id) {
          try {
            console.log(`Looking up price change period for ID: ${stock.price_change_period_id}`);
            const period = await db.PriceChangePeriod.findByPk(stock.price_change_period_id);
            console.log(`Found price change period:`, period);
            priceChangePeriod = period ? period.period : 'Period not found';
            console.log(`Stock ${stock.company_name}: price_change_period_id=${stock.price_change_period_id}, period=${priceChangePeriod}`);
          } catch (error) {
            console.log(`Error fetching price change period for ${stock.company_name}:`, error instanceof Error ? error.message : 'Unknown error');
            priceChangePeriod = 'No period assigned';
          }
        } else {
          console.log(`Stock ${stock.company_name}: No price_change_period_id found`);
          priceChangePeriod = 'No period assigned';
        }

        return {
          id: stock.id,
          company_name: stock.company_name,
          logo: stock.logo,
          price_change: stock.price_change,
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
          price_change_period: priceChangePeriod,
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
    console.error("Error fetching home display stocks:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + errorMessage
    });
  }
};
