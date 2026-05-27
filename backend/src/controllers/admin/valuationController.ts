import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class ValuationController {
  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  static async getAllValuations(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const offset = (page - 1) * limit;

      const whereClause = search ? {
        valuation_name: {
          [Op.like]: `%${search}%`
        }
      } : {};

      const { count, rows: valuations } = await db.Valuation.findAndCountAll({
        where: whereClause,
        order: [['valuation_name', 'ASC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(count / limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuations fetched successfully',
        data: {
          valuations,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching valuations:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationById(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const id = req.params.id as string;
      const valuation = await db.Valuation.findByPk(id as string);

      if (!valuation) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation not found'
        });
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation fetched successfully',
        data: { valuation }
      });
    } catch (error) {
      console.error('Error fetching valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createValuation(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const { valuation_name } = req.body;

      if (!valuation_name || valuation_name.trim() === '') {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Valuation name is required'
        });
      }

      // Check if valuation already exists
      const existingValuation = await db.Valuation.findOne({
        where: { valuation_name: valuation_name.trim() }
      });

      if (existingValuation) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Valuation with this name already exists'
        });
      }

      const valuation = await db.Valuation.create({
        valuation_name: valuation_name.trim()
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Valuation created successfully',
        data: { valuation }
      });
    } catch (error) {
      console.error('Error creating valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateValuation(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const id = req.params.id as string;
      const { valuation_name } = req.body;

      if (!valuation_name || valuation_name.trim() === '') {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Valuation name is required'
        });
      }

      const valuation = await db.Valuation.findByPk(id as string);

      if (!valuation) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation not found'
        });
      }

      // Check if another valuation with the same name exists
      const existingValuation = await db.Valuation.findOne({
        where: { 
          valuation_name: valuation_name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingValuation) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: 'Valuation with this name already exists'
        });
      }

      await valuation.update({
        valuation_name: valuation_name.trim()
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation updated successfully',
        data: { valuation }
      });
    } catch (error) {
      console.error('Error updating valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteValuation(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const id = req.params.id as string;

      const valuation = await db.Valuation.findByPk(id as string);

      if (!valuation) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'Valuation not found'
        });
      }

      // Check if valuation is being used by any products
      const productsUsingValuation = await db.Product.count({
        where: { valuation_id: id }
      });

      if (productsUsingValuation > 0) {
        return res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: `Cannot delete valuation. It is being used by ${productsUsingValuation} product(s).`
        });
      }

      await valuation.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting valuation:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete valuation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationsForSelect(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const valuations = await db.Valuation.findAll({
        attributes: ['id', 'valuation_name'],
        order: [['valuation_name', 'ASC']]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuations fetched successfully',
        data: { valuations }
      });
    } catch (error) {
      console.error('Error fetching valuations for select:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationRanges(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      const valuationRanges = await db.ValuationRange.findAll({
        attributes: ['id', 'name', 'value', 'min_value', 'max_value'],
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation ranges fetched successfully',
        data: { valuationRanges }
      });
    } catch (error) {
      console.error('Error fetching valuation ranges:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation ranges',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getValuationMapping(req: Request, res: Response) {
    try {
      const controller = new ValuationController();
      await controller.ensureDbReady();

      // Fetch both valuation ranges and valuations
      const [valuationRanges, valuations] = await Promise.all([
        db.ValuationRange.findAll({
          attributes: ['id', 'name', 'value'],
          order: [['sort_order', 'ASC'], ['name', 'ASC']]
        }),
        db.Valuation.findAll({
          attributes: ['id', 'valuation_name'],
          order: [['valuation_name', 'ASC']]
        })
      ]);

      // Create intelligent mapping based on valuation names
      const mapping = valuationRanges.map(range => {
        let matchingValuationIds: number[] = [];
        
        // Parse the range name to determine which valuations match
        const rangeName = range.name.toLowerCase();
        
        if (rangeName.includes('below') || rangeName.includes('under')) {
          // For "Below X" ranges, match valuations that are under the threshold
          const threshold = ValuationController.extractNumberFromRange(rangeName);
          matchingValuationIds = valuations.filter(v => {
            const valName = v.valuation_name.toLowerCase();
            return ValuationController.isValuationUnderThreshold(valName, threshold);
          }).map(v => v.id);
        } else if (rangeName.includes('+') || rangeName.includes('above') || rangeName.includes('over')) {
          // For "X+" ranges, match valuations that are above the threshold
          const threshold = ValuationController.extractNumberFromRange(rangeName);
          matchingValuationIds = valuations.filter(v => {
            const valName = v.valuation_name.toLowerCase();
            return ValuationController.isValuationAboveThreshold(valName, threshold);
          }).map(v => v.id);
        } else if (rangeName.includes('-')) {
          // For "X-Y" ranges, match valuations within the range
          const [minThreshold, maxThreshold] = ValuationController.extractRangeFromName(rangeName);
          matchingValuationIds = valuations.filter(v => {
            const valName = v.valuation_name.toLowerCase();
            return ValuationController.isValuationInRange(valName, minThreshold, maxThreshold);
          }).map(v => v.id);
        } else {
          // Fallback: return all valuations if we can't parse the range
          matchingValuationIds = valuations.map(v => v.id);
        }

        return {
          range: range,
          matchingValuationIds: matchingValuationIds
        };
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Valuation mapping fetched successfully',
        data: { 
          mapping,
          valuationRanges,
          valuations 
        }
      });
    } catch (error) {
      console.error('Error fetching valuation mapping:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch valuation mapping',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper method to extract number from range name (e.g., "below 1000" -> 1000)
  private static extractNumberFromRange(rangeName: string): number {
    const match = rangeName.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Helper method to extract range from name (e.g., "1000-2500" -> [1000, 2500])
  private static extractRangeFromName(rangeName: string): [number, number] {
    const matches = rangeName.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (matches) {
      return [parseFloat(matches[1]), parseFloat(matches[2])];
    }
    return [0, 0];
  }

  // Helper method to check if valuation is under threshold
  private static isValuationUnderThreshold(valuationName: string, threshold: number): boolean {
    // Handle simple numeric values (e.g., "500", "1000", "3000 Cr")
    const numericMatch = valuationName.match(/^(\d+(?:\.\d+)?)\s*(?:cr)?$/i);
    if (numericMatch) {
      const val = parseFloat(numericMatch[1]);
      return val < threshold;
    }
    
    // Handle "Under ₹X Cr" format
    if (valuationName.includes('under')) {
      const valThreshold = this.extractNumberFromRange(valuationName);
      return valThreshold < threshold;
    }
    
    // Handle "₹X-Y Cr" format where Y < threshold
    if (valuationName.includes('-')) {
      const [, maxVal] = this.extractRangeFromName(valuationName);
      return maxVal < threshold;
    }
    
    // Handle "Above ₹X Cr" format (never under threshold)
    if (valuationName.includes('above')) {
      return false;
    }
    
    return false;
  }

  // Helper method to check if valuation is above threshold
  private static isValuationAboveThreshold(valuationName: string, threshold: number): boolean {
    // Handle simple numeric values (e.g., "500", "1000", "3000 Cr")
    const numericMatch = valuationName.match(/^(\d+(?:\.\d+)?)\s*(?:cr)?$/i);
    if (numericMatch) {
      const val = parseFloat(numericMatch[1]);
      return val >= threshold;
    }
    
    // Handle "Above ₹X Cr" format
    if (valuationName.includes('above')) {
      const valThreshold = this.extractNumberFromRange(valuationName);
      return valThreshold >= threshold;
    }
    
    // Handle "₹X-Y Cr" format where X >= threshold
    if (valuationName.includes('-')) {
      const [minVal] = this.extractRangeFromName(valuationName);
      return minVal >= threshold;
    }
    
    // Handle "Under ₹X Cr" format (never above threshold)
    if (valuationName.includes('under')) {
      return false;
    }
    
    return false;
  }

  // Helper method to check if valuation is within range
  private static isValuationInRange(valuationName: string, minThreshold: number, maxThreshold: number): boolean {
    // Handle simple numeric values (e.g., "500", "1000", "3000 Cr")
    const numericMatch = valuationName.match(/^(\d+(?:\.\d+)?)\s*(?:cr)?$/i);
    if (numericMatch) {
      const val = parseFloat(numericMatch[1]);
      return val >= minThreshold && val < maxThreshold;
    }
    
    // Handle "₹X-Y Cr" format
    if (valuationName.includes('-')) {
      const [minVal, maxVal] = this.extractRangeFromName(valuationName);
      // Check if ranges overlap
      return !(maxVal < minThreshold || minVal > maxThreshold);
    }
    
    // Handle "Under ₹X Cr" format
    if (valuationName.includes('under')) {
      const valThreshold = this.extractNumberFromRange(valuationName);
      return valThreshold < maxThreshold;
    }
    
    // Handle "Above ₹X Cr" format
    if (valuationName.includes('above')) {
      const valThreshold = this.extractNumberFromRange(valuationName);
      return valThreshold >= minThreshold;
    }
    
    return false;
  }
}

