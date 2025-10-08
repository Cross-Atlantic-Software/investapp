import { Request, Response } from 'express';
import Product from '../../Models/Product';
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
      
      const stocks = await Product.findAll({
        where: {
          bannerDisplay: 'yes'
        },
        order: [['createdAt', 'DESC']],
        limit: 10 // Limit to 10 stocks for banner
      });

      res.json({
        success: true,
        data: {
          stocks: stocks.map((stock: any) => ({
            id: stock.id,
            company_name: stock.company_name,
            logo: stock.logo,
            price_per_share: stock.price_per_share,
            percentage_change: stock.percentage_change,
            valuation: stock.valuation
          })),
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
      
      const stocks = await Product.findAll({
        where: {
          homeDisplay: 'yes'
        },
        order: [['createdAt', 'DESC']],
        limit: 20 // Limit to 20 stocks for home display
      });

      res.json({
        success: true,
        data: {
          stocks: stocks.map((stock: any) => ({
            id: stock.id,
            company_name: stock.company_name,
            logo: stock.logo,
            price: stock.price_per_share,
            price_change: stock.price_change,
            teaser: stock.teaser,
            short_description: stock.short_description,
            analysis: stock.analysis,
            demand: stock.demand,
            homeDisplay: stock.homeDisplay,
            bannerDisplay: stock.bannerDisplay,
            valuation: stock.valuation,
            price_per_share: stock.price_per_share,
            percentage_change: stock.percentage_change,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt
          })),
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
