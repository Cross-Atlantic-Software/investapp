import { Request, Response } from 'express';
import db from '../../utils/database';

export class StockDisplayController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get stocks for banner display
  static async getBannerDisplayStocks(req: Request, res: Response) {
    try {
      const controller = new StockDisplayController();
      await controller.ensureDbReady();
      
      const stocks = await db.Product.findAll({
        where: {
          bannerDisplay: 'yes'
        },
        order: [['createdAt', 'DESC']],
        limit: 10 // Limit to 10 stocks for banner
      });

      console.log('Banner Display: Found', stocks.length, 'stocks');
      
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
              // Fallback to hardcoded mapping if database fails
              const valuationMap: { [key: number]: string } = {
                1: '100Cr',
                2: '150Cr', 
                3: '200Cr',
                4: '250Cr',
                6: '300Cr'
              };
              valuationName = valuationMap[stock.valuation_id] || stock.valuation || 'N/A';
              console.log(`Using fallback valuation: ${valuationName}`);
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
            valuation_id: stock.valuation_id
          };
        })
      );
      
      console.log('Processed stocks:', stocksWithValuations.length);

      console.log('Sending response with', stocksWithValuations.length, 'processed stocks');
      console.log('First processed stock:', stocksWithValuations[0]);
      
      res.json({
        success: true,
        data: {
          stocks: stocksWithValuations,
          count: stocks.length
        }
      });
    } catch (error) {
      console.error('Error fetching banner display stocks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch banner display stocks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get stocks for home display
  static async getHomeDisplayStocks(req: Request, res: Response) {
    try {
      const controller = new StockDisplayController();
      await controller.ensureDbReady();
      
      const stocks = await db.Product.findAll({
        where: {
          homeDisplay: 'yes'
        },
        order: [['createdAt', 'DESC']],
        limit: 20 // Limit to 20 stocks for home display
      });

      // Fetch price change periods and valuation names for all stocks
      const stocksWithPeriods = await Promise.all(
        stocks.map(async (stock: any) => {
          let priceChangePeriod = '12 Months';
          if (stock.price_change_period_id) {
            const period = await db.PriceChangePeriod.findByPk(stock.price_change_period_id);
            priceChangePeriod = period ? period.period : '12 Months';
          }

          let valuationName = 'N/A';
          
          // Check if valuation_id exists (for backward compatibility)
          if (stock.valuation_id) {
            try {
              const valuation = await db.Valuation.findByPk(stock.valuation_id);
              valuationName = valuation ? valuation.valuation_name : 'N/A';
              console.log(`Home Stock ${stock.company_name}: valuation_id=${stock.valuation_id}, valuation_name=${valuationName}`);
            } catch (error) {
              console.log(`Error fetching valuation for ${stock.company_name}:`, error instanceof Error ? error.message : 'Unknown error');
              valuationName = stock.valuation || 'N/A'; // Fallback to old field
            }
          } else {
            console.log(`Home Stock ${stock.company_name}: No valuation_id found, using old valuation field: ${stock.valuation}`);
            valuationName = stock.valuation || 'N/A'; // Fallback to old field
          }

          return {
            id: stock.id,
            company_name: stock.company_name,
            logo: stock.logo,
            price: stock.price_per_share,
            price_change: stock.price_change,
            price_change_period_id: stock.price_change_period_id,
            price_change_period: priceChangePeriod,
            teaser: stock.teaser,
            short_description: stock.short_description,
            analysis: stock.analysis,
            demand: stock.demand,
            homeDisplay: stock.homeDisplay,
            bannerDisplay: stock.bannerDisplay,
            valuation_id: stock.valuation_id,
            price_per_share: stock.price_per_share,
            percentage_change: stock.percentage_change,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt
          };
        })
      );

      res.json({
        success: true,
        data: {
          stocks: stocksWithPeriods,
          count: stocks.length
        }
      });
    } catch (error) {
      console.error('Error fetching home display stocks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch home display stocks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
