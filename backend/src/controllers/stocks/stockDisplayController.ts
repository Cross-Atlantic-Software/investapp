import { Request, Response } from 'express';
import db from '../../utils/database';
import { Op } from 'sequelize';

export class StockDisplayController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get available filter options based on existing stocks
  static async getAvailableFilterOptions(req: Request, res: Response) {
    try {
      const controller = new StockDisplayController();
      await controller.ensureDbReady();
      
      // Fetch all stocks to determine which filter options are available
      const stocks = await db.Product.findAll({
        attributes: ['id', 'valuation', 'sector_ids', 'subsector_ids', 'theme_ids', 'stock_master_ids']
      });
      
      console.log('🔍 Fetching available filter options from', stocks.length, 'stocks');
      
      // Collect unique values for each filter
      const usedValuations = new Set<string>();
      const usedSectorIds = new Set<number>();
      const usedSubsectorIds = new Set<number>();
      const usedThemeIds = new Set<number>();
      const usedStockMasterIds = new Set<number>();
      
      // Load valuation ranges to map numeric valuations to configured ranges
      const ranges = await db.ValuationRange.findAll({
        attributes: ['value', 'min_value', 'max_value']
      });

      stocks.forEach((stock: any) => {
        // Valuation
        if (stock.valuation !== undefined && stock.valuation !== null && String(stock.valuation).toString().trim() !== '') {
          // Extract numeric value
          const valStr = String(stock.valuation);
          const numericMatch = valStr.match(/[\d,]+/);
          if (numericMatch) {
            const numericValue = parseFloat(numericMatch[0].replace(/,/g, ''));
            // Find matching configured range (prefer DB config over hardcoded buckets)
            const candidateMatches: { value: string; min: number | null; max: number | null; width: number }[] = [];
            for (const r of ranges as any[]) {
              let min = r.min_value != null ? Number(r.min_value) : null;
              let max = r.max_value != null ? Number(r.max_value) : null;
              // If DB min/max missing, derive from value string
              if (min == null && max == null && typeof r.value === 'string') {
                const val = r.value.toLowerCase().replace(/₹/g, '').replace(/cr\.?/g, '').replace(/\s+/g, ' ').trim();
                const rangeMatch = val.match(/^(\d+(?:\.\d+)?)\s*[-_]\s*(\d+(?:\.\d+)?)$/);
                const belowMatch = val.match(/^below\s*[-_]?\s*(\d+(?:\.\d+)?)$/);
                const plusMatch = val.match(/^(\d+(?:\.\d+)?)\s*(?:[-_]?\s*)?(?:plus|\+)$/);
                if (rangeMatch) {
                  min = parseFloat(rangeMatch[1]);
                  max = parseFloat(rangeMatch[2]);
                } else if (belowMatch) {
                  min = 0;
                  max = parseFloat(belowMatch[1]);
                } else if (plusMatch) {
                  min = parseFloat(plusMatch[1]);
                  max = 999999999;
                }
              }
              if (min == null && max == null) continue;
              const inClosed = min != null && max != null && numericValue >= min && numericValue <= max;
              const inBelowOnly = min == null && max != null && numericValue <= max;
              const inPlusOnly = min != null && max == null && numericValue >= min;
              if (inClosed || inBelowOnly || inPlusOnly) {
                const width = (min != null && max != null) ? (max - min) : Number.POSITIVE_INFINITY;
                candidateMatches.push({ value: r.value, min, max, width });
              }
            }
            if (candidateMatches.length > 0) {
              // Prefer the most specific closed interval (smallest width); tie-breaker by width then by value string
              const best = candidateMatches
                .sort((a, b) => {
                  const aw = a.width;
                  const bw = b.width;
                  if (aw === bw) return a.value.localeCompare(b.value);
                  return aw - bw;
                })[0];
              usedValuations.add(best.value);
            } else {
              // Fallback to legacy buckets if nothing matched
              if (numericValue < 1000) usedValuations.add('below-1000');
              else if (numericValue < 2500) usedValuations.add('1000-2500');
              else if (numericValue < 5000) usedValuations.add('2500-5000');
              else usedValuations.add('5000-plus');
            }
          }
        }
        
        // Sectors
        if (stock.sector_ids) {
          try {
            const sectorIds = JSON.parse(stock.sector_ids);
            if (Array.isArray(sectorIds)) {
              sectorIds.forEach((id: number) => usedSectorIds.add(id));
            }
          } catch (error) {
            console.error('Error parsing sector_ids:', error);
          }
        }
        
        // Subsectors
        if (stock.subsector_ids) {
          try {
            const subsectorIds = JSON.parse(stock.subsector_ids);
            if (Array.isArray(subsectorIds)) {
              subsectorIds.forEach((id: number) => usedSubsectorIds.add(id));
            }
          } catch (error) {
            console.error('Error parsing subsector_ids:', error);
          }
        }
        
        // Themes
        if (stock.theme_ids) {
          try {
            const themeIds = JSON.parse(stock.theme_ids);
            if (Array.isArray(themeIds)) {
              themeIds.forEach((id: number) => usedThemeIds.add(id));
            }
          } catch (error) {
            console.error('Error parsing theme_ids:', error);
          }
        }
        
        // Stock Masters
        if (stock.stock_master_ids) {
          try {
            const stockMasterIds = JSON.parse(stock.stock_master_ids);
            if (Array.isArray(stockMasterIds)) {
              stockMasterIds.forEach((id: number) => usedStockMasterIds.add(id));
            }
          } catch (error) {
            console.error('Error parsing stock_master_ids:', error);
          }
        }
      });
      
      console.log('🔍 Available filter options:', {
        valuations: Array.from(usedValuations),
        sectors: Array.from(usedSectorIds),
        subsectors: Array.from(usedSubsectorIds),
        themes: Array.from(usedThemeIds),
        stockMasters: Array.from(usedStockMasterIds)
      });
      
      res.json({
        success: true,
        data: {
          valuations: Array.from(usedValuations),
          sectors: Array.from(usedSectorIds),
          subsectors: Array.from(usedSubsectorIds),
          themes: Array.from(usedThemeIds),
          stockMasters: Array.from(usedStockMasterIds)
        }
      });
    } catch (error) {
      console.error('Error fetching available filter options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available filter options',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get public stocks for invest page (with proper price change period resolution)
  static async getPublicStocks(req: Request, res: Response) {
    try {
      const controller = new StockDisplayController();
      await controller.ensureDbReady();
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sort_by as string || 'createdAt';
      const sortOrder = req.query.sort_order as string || 'DESC';
      
      // Filter parameters
      const stockMasterIds = req.query.stock_master_ids as string;
      const sectors = req.query.sectors as string;
      const subsectors = req.query.subsectors as string;
      const themes = req.query.themes as string;
      const valuation = req.query.valuation as string;
      
      console.log('🔍 BACKEND DEBUG - All query params:', req.query);
      console.log('🔍 BACKEND DEBUG - stock_master_ids param:', stockMasterIds);
      console.log('🔍 BACKEND DEBUG - stock_master_ids type:', typeof stockMasterIds);
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      let whereClause: any = {};
      
      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { company_name: { [Op.like]: `%${search}%` } },
          { teaser: { [Op.like]: `%${search}%` } },
          { short_description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Note: We'll handle stock_master_ids filtering after fetching stocks
      // because JSON array filtering is complex in SQL
      
      // Sectors filter
      if (sectors) {
        const sectorArray = sectors.split(',').map(id => parseInt(id.trim()));
        whereClause.sector_ids = {
          [Op.and]: sectorArray.map(id => ({
            [Op.like]: `%${id}%`
          }))
        };
      }
      
      // Subsectors filter
      if (subsectors) {
        const subsectorArray = subsectors.split(',').map(id => parseInt(id.trim()));
        whereClause.subsector_ids = {
          [Op.and]: subsectorArray.map(id => ({
            [Op.like]: `%${id}%`
          }))
        };
      }
      
      // Themes filter
      if (themes) {
        const themeArray = themes.split(',').map(id => parseInt(id.trim()));
        whereClause.theme_ids = {
          [Op.and]: themeArray.map(id => ({
            [Op.like]: `%${id}%`
          }))
        };
      }
      
      // Valuation filter - parse the value string to get min/max
      let minValuation: number | null = null;
      let maxValuation: number | null = null;
      
      if (valuation) {
        console.log('🔍 Valuation filter - Looking for range:', valuation);
        
        // Parse from value string (e.g., "2500-5000", "below-1000", "5000-plus")
        const rangeMatch = valuation.match(/^(\d+)-(\d+)$/);
        
        if (rangeMatch) {
          minValuation = parseInt(rangeMatch[1]);
          maxValuation = parseInt(rangeMatch[2]);
        } else if (valuation === 'below-1000') {
          minValuation = 0;
          maxValuation = 1000;
        } else if (valuation === '5000-plus' || valuation === '5000+') {
          minValuation = 5000;
          maxValuation = 999999999;
        }
        
        console.log('🔍 Valuation filter - Parsed range:', { min: minValuation, max: maxValuation });
      }
      
      console.log('🔍 Backend whereClause:', JSON.stringify(whereClause, null, 2));
      
      let stocks = await db.Product.findAll({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: limit,
        offset: offset
      });
      
      console.log('🔍 BACKEND DEBUG - Fetched stocks count:', stocks.length);
      console.log('🔍 BACKEND DEBUG - All stocks:', stocks.map(s => ({ 
        id: s.id, 
        company_name: s.company_name, 
        stock_master_ids: s.stock_master_ids 
      })));
      
      // Apply stock_master_ids filtering after fetching (for JSON array filtering)
      if (stockMasterIds) {
        const stockMasterIdArray = stockMasterIds.split(',').map(id => parseInt(id.trim()));
        console.log('🔍 BACKEND DEBUG - Filtering by stock_master_ids:', stockMasterIdArray);
        
        const originalCount = stocks.length;
        stocks = stocks.filter((stock: any) => {
          console.log(`🔍 BACKEND DEBUG - Checking stock: ${stock.company_name} (ID: ${stock.id})`);
          console.log(`🔍 BACKEND DEBUG - stock_master_ids raw:`, stock.stock_master_ids);
          
          if (!stock.stock_master_ids) {
            console.log(`🔍 BACKEND DEBUG - Stock ${stock.company_name} has no stock_master_ids - EXCLUDED`);
            return false;
          }
          
          try {
            const stockMasterIdsArray = JSON.parse(stock.stock_master_ids);
            console.log(`🔍 BACKEND DEBUG - Stock ${stock.company_name} parsed stock_master_ids:`, stockMasterIdsArray);
            
            const hasMatch = stockMasterIdArray.some(filterId => 
              stockMasterIdsArray.includes(filterId)
            );
            
            console.log(`🔍 BACKEND DEBUG - Stock ${stock.company_name} matches filter ${stockMasterIdArray}:`, hasMatch);
            return hasMatch;
          } catch (error) {
            console.log(`🔍 BACKEND DEBUG - Error parsing stock_master_ids for ${stock.company_name}:`, error);
            return false;
          }
        });
        
        console.log(`🔍 BACKEND DEBUG - Filtering complete: ${originalCount} -> ${stocks.length} stocks`);
      } else {
        console.log('🔍 BACKEND DEBUG - No stock_master_ids filter applied');
      }
      
      // Apply valuation filter based on text field
      if (valuation && minValuation !== null && maxValuation !== null) {
        console.log('🔍 Valuation filter - Applying range filter to fetched stocks');
        const originalCount = stocks.length;
        
        stocks = stocks.filter((stock: any) => {
          const stockValuation = stock.valuation || '';
          
          // Extract numeric value from valuation text (e.g., "3400" from "₹ 3400 Cr" or "2500" from "2500")
          const numericMatch = stockValuation.match(/[\d,]+/);
          
          if (!numericMatch) {
            console.log(`🔍 Stock ${stock.company_name} has no numeric valuation:`, stockValuation);
            return false;
          }
          
          const numericValue = parseFloat(numericMatch[0].replace(/,/g, ''));
          console.log(`🔍 Stock ${stock.company_name}: valuation="${stockValuation}", numeric=${numericValue}, range=[${minValuation}, ${maxValuation}]`);
          
          const isInRange = numericValue >= minValuation! && numericValue <= maxValuation!;
          console.log(`🔍 Stock ${stock.company_name} matches valuation range:`, isInRange);
          
          return isInRange;
        });
        
        console.log(`🔍 Valuation filter complete: ${originalCount} -> ${stocks.length} stocks`);
      }
      
      const totalStocks = await db.Product.count({ where: whereClause });
      
      // Resolve price change periods and valuations
      const stocksWithResolvedData = await Promise.all(
        stocks.map(async (stock: any) => {
          let priceChangePeriodName = 'No period assigned';
          let valuationName = 'N/A';
          
          // Resolve price change period
          if (stock.price_change_period_id) {
            try {
              const priceChangePeriod = await db.PriceChangePeriod.findByPk(stock.price_change_period_id);
              priceChangePeriodName = priceChangePeriod ? priceChangePeriod.period : 'Period not found';
            } catch (error) {
              console.log(`Error fetching price change period for ${stock.company_name}:`, error instanceof Error ? error.message : 'Unknown error');
              priceChangePeriodName = 'Period not found';
            }
          }
          
          // Use valuation text field from database (not valuation_id lookup)
          valuationName = stock.valuation || 'N/A';
          
          return {
            id: stock.id,
            company_name: stock.company_name,
            logo: stock.logo,
            price_per_share: stock.price_per_share,
            price_change: stock.price_change,
            price_change_period_id: stock.price_change_period_id,
            price_change_period: priceChangePeriodName,
            valuation_id: stock.valuation_id,
            valuation: valuationName,
            teaser: stock.teaser,
            short_description: stock.short_description,
            analysis: stock.analysis,
            sector_ids: stock.sector_ids,
            subsector_ids: stock.subsector_ids,
            theme_ids: stock.theme_ids,
            stock_master_ids: stock.stock_master_ids,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt
          };
        })
      );
      
      res.json({
        success: true,
        data: {
          stocks: stocksWithResolvedData,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalStocks / limit),
            totalStocks: totalStocks,
            hasNextPage: page < Math.ceil(totalStocks / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching public stocks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
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
            price_change: stock.price_change,
            price_per_share: stock.price_per_share,
            percentage_change: stock.percentage_change,
            valuation: valuationName,
            valuation_id: stock.valuation_id,
            price_change_period_id: stock.price_change_period_id,
            price_change_period: stock.price_change_period || 'No period assigned',
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
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt
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
          let priceChangePeriod = 'No period assigned';
          if (stock.price_change_period_id) {
            const period = await db.PriceChangePeriod.findByPk(stock.price_change_period_id);
            priceChangePeriod = period ? period.period : 'Period not found';
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
