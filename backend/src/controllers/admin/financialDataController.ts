import { Request, Response } from 'express';
import { Op } from 'sequelize';
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

      // Clear existing data for this stock and category (replace mode)
      // This ensures old data is completely removed when uploading new CSV
      const deletedCount = await StockFinancialData.destroy({
        where: { 
          stock_id: parseInt(stockId),
          category
        }
      });

      console.log(`Cleared ${deletedCount} existing ${category} data records for stock ${stockId}`);

      // Process each row and prepare data for bulk insert
      const dataToInsert: any[] = [];

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

      // Bulk insert new data
      if (dataToInsert.length > 0) {
        await StockFinancialData.bulkCreate(dataToInsert);
      }

      // Clean up orphaned KPIs that are no longer used in this category
      // Get all KPIs currently used in the new data
      const usedKpiIds = new Set(dataToInsert.map(item => item.kpi_id));
      
      // Find KPIs in this category that are not used in the new data
      const orphanedKpis = await FinancialKpi.findAll({
        where: {
          category,
          id: { [Op.notIn]: Array.from(usedKpiIds) }
        }
      });

      // Delete orphaned KPIs (only if they have no data in any stock)
      for (const orphanedKpi of orphanedKpis) {
        const hasData = await StockFinancialData.findOne({
          where: { kpi_id: orphanedKpi.id }
        });
        
        if (!hasData) {
          await orphanedKpi.destroy();
          console.log(`Deleted orphaned KPI: ${orphanedKpi.name}`);
        }
      }

      // Store the original CSV content in the database (ADDITIONAL functionality - doesn't affect existing code)
      try {
        const originalCsvContent = file.buffer.toString('utf-8');
        
        await db.FinancialDataCsv.upsert({
          stock_id: parseInt(stockId),
          category,
          original_filename: file.originalname,
          s3_key: `csv/financial-data/stock_${stockId}_${category}_${Date.now()}.csv`,
          s3_url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/csv/financial-data/stock_${stockId}_${category}_${Date.now()}.csv`,
          file_size: file.size,
          uploaded_at: new Date(),
          csv_content: originalCsvContent
        });
        
        console.log(`CSV content stored for stock ${stockId}, category ${category}`);
      } catch (csvError) {
        console.error('Error storing CSV content:', csvError);
        // Don't fail the request if CSV storage fails
      }

      res.json({
        success: true,
        message: 'Financial data uploaded successfully',
        data: {
          inserted: dataToInsert.length,
          totalProcessed: dataToInsert.length
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

  // Export financial data as CSV for a specific category (serves original uploaded file)
  static async exportFinancialDataCSV(req: Request, res: Response) {
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

      // Try to get the stored CSV content from financial_data_csv table first
      const csvFile = await db.FinancialDataCsv.findOne({
        where: {
          stock_id: parseInt(stockId),
          category
        }
      });

      let csvContent: string;

      if (csvFile && csvFile.csv_content) {
        // Use the stored original CSV content (exact same as uploaded)
        csvContent = csvFile.csv_content;
        console.log(`Serving original CSV file for stock ${stockId}, category ${category}`);
      } else {
        // Fallback to original reconstruction logic for backward compatibility
        console.log(`No stored CSV found, reconstructing from database for stock ${stockId}, category ${category}`);
        
        // Get KPIs for the category
        const kpis = await FinancialKpi.findAll({
          where: { category },
          order: [['display_order', 'ASC']]
        });

        if (kpis.length === 0) {
          return res.status(404).json({
            success: false,
            message: `No KPIs found for ${category}`
          });
        }

        // Get financial data for the stock and category
        const financialData = await StockFinancialData.findAll({
          where: {
            stock_id: stockId,
            category
          },
          order: [
            ['kpi_id', 'ASC'],
            ['year', 'ASC']
          ]
        });

        if (financialData.length === 0) {
          return res.status(404).json({
            success: false,
            message: `No financial data found for ${category}`
          });
        }

        // Organize data by KPI and year
        const organizedData: any = {};
        const years = new Set<number>();

        financialData.forEach((data: any) => {
          const kpiName = kpis.find(kpi => kpi.id === data.kpi_id)?.name;
          if (!kpiName) return;
          
          if (!organizedData[kpiName]) {
            organizedData[kpiName] = {};
          }
          organizedData[kpiName][data.year] = data.value;
          years.add(data.year);
        });

        // Convert to CSV format (matching original upload format)
        const sortedYears = Array.from(years).sort((a, b) => a - b);
        
        // Create column headers matching upload format (1, 2, 3, 4 instead of actual years)
        const yearColumns = sortedYears.map((_, index) => (index + 1).toString());
        const csvHeaders = ['KPI Name', ...yearColumns].join(',') + '\n';
        
        const csvRows = Object.entries(organizedData).map(([kpiName, values]: [string, any]) => {
          // Map actual year values to column positions (1, 2, 3, 4)
          const row = sortedYears.map(year => values[year] || '');
          return [kpiName, ...row].join(',');
        }).join('\n');

        csvContent = csvHeaders + csvRows;
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="stock_${stockId}_${category}_data.csv"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent));

      res.send(csvContent);

    } catch (error) {
      console.error('Error exporting financial data CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export financial data CSV'
      });
    }
  }

  // Check if financial data exists for a specific stock and category
  static async checkFinancialDataExists(req: Request, res: Response) {
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

      const count = await StockFinancialData.count({
        where: {
          stock_id: stockId,
          category
        }
      });

      res.json({
        success: true,
        message: 'Financial data existence checked successfully',
        data: {
          exists: count > 0,
          count
        }
      });

    } catch (error) {
      console.error('Error checking financial data existence:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check financial data existence'
      });
    }
  }

  // Delete financial data for a specific stock and category
  static async deleteFinancialData(req: Request, res: Response) {
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

      const deletedCount = await StockFinancialData.destroy({
        where: {
          stock_id: parseInt(stockId),
          category
        }
      });

      // Clean up KPIs that are no longer used by ANY stock in this category
      // Get all KPIs for this category
      const categoryKpis = await FinancialKpi.findAll({
        where: { category }
      });

      // Check each KPI to see if it's still being used by any stock
      for (const kpi of categoryKpis) {
        const hasData = await StockFinancialData.findOne({
          where: { kpi_id: kpi.id }
        });
        
        if (!hasData) {
          // This KPI is not used by any stock, safe to delete
          await kpi.destroy();
          console.log(`Deleted unused KPI: ${kpi.name} (category: ${category})`);
        }
      }

      // Also clean up stored CSV content from database (ADDITIONAL functionality)
      try {
        await db.FinancialDataCsv.destroy({
          where: {
            stock_id: parseInt(stockId),
            category
          }
        });
        console.log(`CSV content cleaned up for stock ${stockId}, category ${category}`);
      } catch (csvError) {
        console.error('Error cleaning up CSV content:', csvError);
        // Don't fail the request if CSV cleanup fails
      }

      res.json({
        success: true,
        message: `${category.replace('_', ' ')} data deleted successfully`,
        data: {
          deletedCount
        }
      });

    } catch (error) {
      console.error('Error deleting financial data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete financial data'
      });
    }
  }
}
