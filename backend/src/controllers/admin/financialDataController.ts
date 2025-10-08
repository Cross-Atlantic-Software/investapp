import { Request, Response } from 'express';
import FinancialKpi from '../../Models/FinancialKpi';
import StockFinancialData from '../../Models/StockFinancialData';
import { initializeFinancialDataModels } from '../../Models/associations';
import db from '../../utils/database';

export class FinancialDataController {
  private async ensureDbReady() {
    await db.sequelizePromise;
    // Initialize financial data models
    initializeFinancialDataModels(db.sequelize);
  }

  // Get all KPIs for a specific category
  static async getKpisByCategory(req: Request, res: Response) {
    try {
      const controller = new FinancialDataController();
      await controller.ensureDbReady();
      
      const { category } = req.params;
      
      if (!['income_statement', 'balance_sheet', 'cash_flow'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be income_statement, balance_sheet, or cash_flow'
        });
      }

      const kpis = await FinancialKpi.findAll({
        where: { category },
        order: [['display_order', 'ASC']]
      });

      res.json({
        success: true,
        data: kpis
      });
    } catch (error) {
      console.error('Error fetching KPIs by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch KPIs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get financial data for a specific stock and category
  static async getStockFinancialData(req: Request, res: Response) {
    try {
      const controller = new FinancialDataController();
      await controller.ensureDbReady();
      
      const { stockId, category } = req.params;
      
      if (!['income_statement', 'balance_sheet', 'cash_flow'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be income_statement, balance_sheet, or cash_flow'
        });
      }

      // Get KPIs for the category
      const kpis = await FinancialKpi.findAll({
        where: { category },
        order: [['display_order', 'ASC']]
      });

      // Get financial data for the stock
      const financialData = await StockFinancialData.findAll({
        where: { stock_id: stockId },
        include: [{
          model: FinancialKpi,
          as: 'FinancialKpi',
          where: { category },
          required: true
        }],
        order: [
          [{ model: FinancialKpi, as: 'FinancialKpi' }, 'display_order', 'ASC'],
          ['year', 'DESC']
        ]
      });

      // Organize data by KPI and year
      const organizedData: any = {};
      const years = new Set<number>();

      financialData.forEach((data: any) => {
        const kpiName = data.FinancialKpi.name;
        if (!organizedData[kpiName]) {
          organizedData[kpiName] = {
            kpi_id: data.kpi_id,
            name: kpiName,
            unit: data.FinancialKpi.unit,
            display_order: data.FinancialKpi.display_order,
            values: {}
          };
        }
        organizedData[kpiName].values[data.year] = data.value;
        years.add(data.year);
      });

      // Convert to array format
      const result = Object.values(organizedData).sort((a: any, b: any) => a.display_order - b.display_order);
      const sortedYears = Array.from(years).sort((a, b) => b - a);

      res.json({
        success: true,
        data: {
          kpis: result,
          years: sortedYears,
          category
        }
      });
    } catch (error) {
      console.error('Error fetching stock financial data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch financial data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Upload financial data CSV
  static async uploadFinancialDataCSV(req: Request, res: Response) {
    try {
      const controller = new FinancialDataController();
      await controller.ensureDbReady();
      
      const { stockId, category } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No CSV file uploaded'
        });
      }

      if (!['income_statement', 'balance_sheet', 'cash_flow'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be income_statement, balance_sheet, or cash_flow'
        });
      }

      // Parse CSV file
      const csv = require('csv-parser');
      const { Readable } = require('stream');
      const results: any[] = [];

      console.log(`File size: ${file.size} bytes`);

      const csvStream = Readable.from(file.buffer.toString());
      
      await new Promise((resolve, reject) => {
        csvStream
          .pipe(csv())
          .on('data', (data: any) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is empty'
        });
      }

      // Get headers (years)
      const headers = Object.keys(results[0]);
      console.log('CSV Headers:', headers);
      console.log('First few rows:', results.slice(0, 3));

      // Skip metadata rows and find the actual data
      // Look for rows where the last column contains KPI names (not dates/metadata)
      const dataRows = results.filter(row => {
        const lastColumn = headers[headers.length - 1];
        const kpiName = row[lastColumn];
        // Skip rows with metadata like dates, periods, etc.
        return kpiName && 
               !kpiName.includes('Period Ending:') && 
               !kpiName.match(/^\d{4}$/) && // Skip pure year values
               !kpiName.match(/^\d{1,2}\/\d{1,2}$/) && // Skip date formats
               kpiName.trim() !== '';
      });

      console.log('Filtered data rows:', dataRows.length);
      console.log('Sample data rows:', dataRows.slice(0, 3));

      if (dataRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid data rows found in CSV'
        });
      }

      // The last column contains KPI names, others are years
      const kpiColumn = headers[headers.length - 1];
      const yearColumns = headers.slice(0, -1); // All columns except the last one

      console.log('KPI Column:', kpiColumn);
      console.log('Year Columns:', yearColumns);

      // Get existing KPIs for this category
      const existingKpis = await FinancialKpi.findAll({
        where: { category }
      });

      const kpiMap = new Map(existingKpis.map(kpi => [kpi.name, kpi.id]));

      // Auto-create missing KPIs from CSV headers
      const kpiNames = dataRows.map(row => row[kpiColumn]).filter(name => name && name.trim() !== '');
      console.log('Extracted KPI names:', kpiNames);
      
      const missingKpis = kpiNames.filter(name => !kpiMap.has(name));
      console.log('Missing KPIs to create:', missingKpis);
      
      if (missingKpis.length > 0) {
        console.log(`Creating ${missingKpis.length} new KPIs for category ${category}`);
        
        for (let i = 0; i < missingKpis.length; i++) {
          const kpiName = missingKpis[i];
          console.log(`Creating KPI: ${kpiName} for category: ${category}`);
          try {
            const newKpi = await FinancialKpi.create({
              category: category as 'income_statement' | 'balance_sheet' | 'cash_flow',
              name: kpiName,
              display_order: existingKpis.length + i + 1,
              unit: 'Rs. Crore' // Default unit
            });
            kpiMap.set(kpiName, newKpi.id);
            console.log(`Successfully created KPI: ${kpiName} with ID: ${newKpi.id}`);
          } catch (kpiError) {
            console.error(`Error creating KPI ${kpiName}:`, kpiError);
            throw kpiError;
          }
        }
      }

      // Get all existing data for this stock and category to avoid duplicates
      const existingDataMap = new Map<string, any>();
      const existingData = await StockFinancialData.findAll({
        where: { 
          stock_id: stockId,
          category
        }
      });

      existingData.forEach((data: any) => {
        const key = `${data.kpi_id}-${data.year}`;
        existingDataMap.set(key, data);
      });

      // Process each row
      const dataToInsert: any[] = [];
      const dataToUpdate: any[] = [];

      for (const row of dataRows) {
        const kpiName = row[kpiColumn];
        if (!kpiName || !kpiMap.has(kpiName)) {
          console.warn(`KPI "${kpiName}" not found in database for category ${category}`);
          continue;
        }

        const kpiId = kpiMap.get(kpiName)!;

        for (const yearCol of yearColumns) {
          const year = parseInt(yearCol);
          const value = parseFloat(row[yearCol]);

          if (!isNaN(year) && !isNaN(value)) {
            const key = `${kpiId}-${year}`;
            const existingRecord = existingDataMap.get(key);

            if (existingRecord) {
              dataToUpdate.push({ id: existingRecord.id, value });
            } else {
              dataToInsert.push({
                stock_id: stockId,
                kpi_id: kpiId,
                category: category as 'income_statement' | 'balance_sheet' | 'cash_flow',
                year,
                value
              });
            }
          }
        }
      }

      // Insert new data
      if (dataToInsert.length > 0) {
        await StockFinancialData.bulkCreate(dataToInsert);
      }

      // Update existing data
      for (const updateData of dataToUpdate) {
        await StockFinancialData.update(
          { value: updateData.value },
          { where: { id: updateData.id } }
        );
      }

      res.json({
        success: true,
        message: 'Financial data uploaded successfully',
        data: {
          inserted: dataToInsert.length,
          updated: dataToUpdate.length,
          totalProcessed: dataToInsert.length + dataToUpdate.length
        }
      });
    } catch (error) {
      console.error('Error uploading financial data CSV:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a Sequelize validation error
        if (error.name === 'SequelizeValidationError') {
          console.error('Validation errors:', (error as any).errors);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to upload financial data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Public method for frontend display (no authentication required)
  static async getStockFinancialDataPublic(req: Request, res: Response) {
    try {
      const controller = new FinancialDataController();
      await controller.ensureDbReady();
      
      const { id: stockId, category } = req.params;

      if (!['income_statement', 'balance_sheet', 'cash_flow'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be income_statement, balance_sheet, or cash_flow'
        });
      }

      // Get KPIs for the category
      const kpis = await FinancialKpi.findAll({
        where: { category },
        order: [['display_order', 'ASC']]
      });

      if (kpis.length === 0) {
        return res.json({
          success: true,
          data: {
            kpis: [],
            years: [],
            category
          }
        });
      }

      // Get financial data for the stock and KPIs
      const financialData = await StockFinancialData.findAll({
        where: {
          stock_id: stockId,
          category
        },
        order: [
          ['kpi_id', 'ASC'],
          ['year', 'DESC']
        ]
      });

      // Organize data by KPI and year
      const organizedData: any = {};
      const years = new Set<number>();

      financialData.forEach((data: any) => {
        const kpiName = kpis.find(kpi => kpi.id === data.kpi_id)?.name;
        if (!kpiName) return;
        
        if (!organizedData[kpiName]) {
          organizedData[kpiName] = {
            kpi_id: data.kpi_id,
            name: kpiName,
            unit: kpis.find(kpi => kpi.id === data.kpi_id)?.unit || 'Rs. Crore',
            display_order: kpis.find(kpi => kpi.id === data.kpi_id)?.display_order || 0,
            values: {}
          };
        }
        organizedData[kpiName].values[data.year] = data.value;
        years.add(data.year);
      });

      // Convert to array and sort by display_order
      const kpisArray = Object.values(organizedData).sort((a: any, b: any) => 
        a.display_order - b.display_order
      );

      res.json({
        success: true,
        data: {
          kpis: kpisArray,
          years: Array.from(years).sort((a, b) => b - a), // Sort years descending
          category
        }
      });
    } catch (error) {
      console.error('Error fetching public financial data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch financial data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
