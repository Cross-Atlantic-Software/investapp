import { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { StockPriceDataModel } from '../../Models/StockPriceData';
import { ExcelDateConverter } from '../../utils/excelDateConverter';

const stockPriceDataModel = new StockPriceDataModel();

// Configure multer for CSV upload
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload CSV price data for a stock
export const uploadPriceDataCSV = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    console.log(`Processing CSV upload for stock ID: ${stockId}`);
    console.log(`File size: ${req.file.size} bytes`);

    // Parse CSV data
    const priceDataArray: any[] = [];
    const errors: string[] = [];
    
    const csvStream = Readable.from(req.file.buffer.toString());
    
    await new Promise((resolve, reject) => {
      csvStream
        .pipe(csv())
        .on('data', (row: any) => {
          try {
            // Validate and process each row
            const processedRow = processCSVRow(row, stockId);
            if (processedRow) {
              priceDataArray.push(processedRow);
            }
          } catch (error) {
            errors.push(`Row error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        })
        .on('end', () => {
          resolve(true);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });

    if (priceDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in CSV',
        errors
      });
    }

    // Clear existing price data for this stock
    await stockPriceDataModel.deleteAllPriceData(parseInt(stockId));

    // Bulk insert new price data
    const success = await stockPriceDataModel.bulkInsertPriceData(priceDataArray);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save price data to database'
      });
    }

    console.log(`Successfully uploaded ${priceDataArray.length} price data records`);

    res.json({
      success: true,
      message: `Successfully uploaded ${priceDataArray.length} price data records`,
      data: {
        recordsProcessed: priceDataArray.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process CSV file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process a single CSV row
function processCSVRow(row: any, stockId: string): any | null {
  try {
    // Extract data from CSV row
    const dateSerial = ExcelDateConverter.parseExcelSerial(row.Date);
    if (!dateSerial) {
      throw new Error(`Invalid date serial: ${row.Date}`);
    }

    const date = ExcelDateConverter.excelSerialToDate(dateSerial);
    const openPrice = parseFloat(row.Open);
    const highPrice = parseFloat(row.High);
    const lowPrice = parseFloat(row.Low);
    const closePrice = parseFloat(row['Close*']); // Handle asterisk in column name
    const volume = parseInt(row.Volume);

    // Validate data
    if (isNaN(openPrice) || isNaN(highPrice) || isNaN(lowPrice) || isNaN(closePrice) || isNaN(volume)) {
      throw new Error('Invalid numeric values');
    }

    // Validate OHLC relationships
    if (highPrice < Math.max(openPrice, closePrice) || lowPrice > Math.min(openPrice, closePrice)) {
      throw new Error('Invalid OHLC relationships');
    }

    if (volume < 0) {
      throw new Error('Volume cannot be negative');
    }

    return {
      stock_id: parseInt(stockId),
      date: date,
      open_price: openPrice,
      high_price: highPrice,
      low_price: lowPrice,
      close_price: closePrice,
      volume: volume
    };

  } catch (error) {
    console.error('Error processing CSV row:', error);
    return null;
  }
}

// Get price data for a stock
export const getPriceData = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;
    const { limit, offset, startDate, endDate } = req.query;

    let priceData;

    if (startDate && endDate) {
      // Get data by date range
      priceData = await stockPriceDataModel.getPriceDataByDateRange(
        parseInt(stockId),
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else {
      // Get data with pagination
      priceData = await stockPriceDataModel.getPriceDataByStockId(
        parseInt(stockId),
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
    }

    res.json({
      success: true,
      message: 'Price data retrieved successfully',
      data: {
        priceData,
        count: priceData.length
      }
    });

  } catch (error) {
    console.error('Error getting price data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve price data'
    });
  }
};

// Get latest price data for a stock
export const getLatestPriceData = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;

    const latestPriceData = await stockPriceDataModel.getLatestPriceData(parseInt(stockId));

    if (!latestPriceData) {
      return res.status(404).json({
        success: false,
        message: 'No price data found for this stock'
      });
    }

    res.json({
      success: true,
      message: 'Latest price data retrieved successfully',
      data: latestPriceData
    });

  } catch (error) {
    console.error('Error getting latest price data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest price data'
    });
  }
};

// Delete all price data for a stock
export const deleteAllPriceData = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;

    const success = await stockPriceDataModel.deleteAllPriceData(parseInt(stockId));

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete price data'
      });
    }

    res.json({
      success: true,
      message: 'All price data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting price data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete price data'
    });
  }
};

// Check if price data exists for a stock
export const checkPriceDataExists = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;

    const exists = await stockPriceDataModel.hasPriceData(parseInt(stockId));
    const count = await stockPriceDataModel.getPriceDataCount(parseInt(stockId));

    res.json({
      success: true,
      message: 'Price data status retrieved successfully',
      data: {
        exists,
        count
      }
    });

  } catch (error) {
    console.error('Error checking price data existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check price data existence'
    });
  }
};

// Export price data as CSV
export const exportPriceDataCSV = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;

    // Get all price data for the stock
    const priceData = await stockPriceDataModel.getPriceDataByStockId(parseInt(stockId));
    
    if (!priceData || priceData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No price data found for this stock'
      });
    }

    // Convert to CSV format
    const csvHeaders = 'Date,Open,High,Low,Close*,Volume\n';
    const csvRows = priceData.map(row => {
      // Convert date to Excel serial number format
      // Handle both Date objects and date strings
      const dateObj = row.date instanceof Date ? row.date : new Date(row.date);
      const excelSerial = ExcelDateConverter.dateToExcelSerial(dateObj);
      return `${excelSerial},${row.open_price},${row.high_price},${row.low_price},${row.close_price},${row.volume}`;
    }).join('\n');

    const csvContent = csvHeaders + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="stock_${stockId}_price_data.csv"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent));

    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting price data CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export price data CSV'
    });
  }
};

// Delete all price data for a stock (admin function)
export const deletePriceDataAdmin = async (req: Request, res: Response) => {
  try {
    const { id: stockId } = req.params;

    const success = await stockPriceDataModel.deleteAllPriceData(parseInt(stockId));

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete price data'
      });
    }

    res.json({
      success: true,
      message: 'All price data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting price data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete price data'
    });
  }
};

