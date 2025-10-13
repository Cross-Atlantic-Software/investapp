import { db } from '../utils/database';

export interface StockPriceData {
  id?: number;
  stock_id: number;
  date: Date;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  created_at?: Date;
  updated_at?: Date;
}

export class StockPriceDataModel {
  constructor() {
    // No need to store pool reference as db is already available
  }

  // Create a new price data record
  async createPriceData(priceData: Omit<StockPriceData, 'id' | 'created_at' | 'updated_at'>): Promise<StockPriceData | null> {
    try {
      console.log('Creating price data:', priceData);
      
      const query = `
        INSERT INTO stock_price_data (stock_id, date, open_price, high_price, low_price, close_price, volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.sequelize.query(query, {
        replacements: [
          priceData.stock_id,
          priceData.date,
          priceData.open_price,
          priceData.high_price,
          priceData.low_price,
          priceData.close_price,
          priceData.volume
        ]
      });

      console.log('Price data inserted successfully');
      
      // Get the inserted record
      const [rows] = await db.sequelize.query(`
        SELECT * FROM stock_price_data 
        WHERE stock_id = ? AND date = ?
        ORDER BY id DESC LIMIT 1
      `, {
        replacements: [priceData.stock_id, priceData.date]
      });
      
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error creating price data:', error);
      return null;
    }
  }

  // Bulk insert price data
  async bulkInsertPriceData(priceDataArray: Omit<StockPriceData, 'id' | 'created_at' | 'updated_at'>[]): Promise<boolean> {
    try {
      console.log(`Bulk inserting ${priceDataArray.length} price data records`);
      
      const query = `
        INSERT INTO stock_price_data (stock_id, date, open_price, high_price, low_price, close_price, volume)
        VALUES ?
      `;
      
      const values = priceDataArray.map(data => [
        data.stock_id,
        data.date,
        data.open_price,
        data.high_price,
        data.low_price,
        data.close_price,
        data.volume
      ]);
      
      await db.sequelize.query(query, {
        replacements: [values]
      });
      
      console.log('Bulk insert completed successfully');
      return true;
    } catch (error) {
      console.error('Error bulk inserting price data:', error);
      return false;
    }
  }

  // Get price data by stock ID
  async getPriceDataByStockId(stockId: number, limit?: number, offset?: number): Promise<StockPriceData[]> {
    try {
      let query = `
        SELECT * FROM stock_price_data 
        WHERE stock_id = ?
        ORDER BY date DESC
      `;
      
      const replacements: any[] = [stockId];
      
      if (limit) {
        query += ' LIMIT ?';
        replacements.push(limit);
      }
      
      if (offset) {
        query += ' OFFSET ?';
        replacements.push(offset);
      }
      
      const [rows] = await db.sequelize.query(query, {
        replacements
      });
      
      return rows as StockPriceData[];
    } catch (error) {
      console.error('Error getting price data by stock ID:', error);
      return [];
    }
  }

  // Get price data by stock ID and date range
  async getPriceDataByDateRange(stockId: number, startDate: Date, endDate: Date): Promise<StockPriceData[]> {
    try {
      const query = `
        SELECT * FROM stock_price_data 
        WHERE stock_id = ? AND date BETWEEN ? AND ?
        ORDER BY date ASC
      `;
      
      const [rows] = await db.sequelize.query(query, {
        replacements: [stockId, startDate, endDate]
      });
      
      return rows as StockPriceData[];
    } catch (error) {
      console.error('Error getting price data by date range:', error);
      return [];
    }
  }

  // Get latest price data for a stock
  async getLatestPriceData(stockId: number): Promise<StockPriceData | null> {
    try {
      const query = `
        SELECT * FROM stock_price_data 
        WHERE stock_id = ?
        ORDER BY date DESC
        LIMIT 1
      `;
      
      const [rows] = await db.sequelize.query(query, {
        replacements: [stockId]
      });
      
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting latest price data:', error);
      return null;
    }
  }

  // Delete all price data for a stock
  async deleteAllPriceData(stockId: number): Promise<boolean> {
    try {
      const query = `DELETE FROM stock_price_data WHERE stock_id = ?`;
      const [result] = await db.sequelize.query(query, {
        replacements: [stockId]
      });
      
      console.log(`Deleted ${(result as any).affectedRows} price data records for stock ${stockId}`);
      return true;
    } catch (error) {
      console.error('Error deleting price data:', error);
      return false;
    }
  }

  // Get price data count for a stock
  async getPriceDataCount(stockId: number): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM stock_price_data 
        WHERE stock_id = ?
      `;
      
      const [rows] = await db.sequelize.query(query, {
        replacements: [stockId]
      });
      
      return (rows as any[])[0].count;
    } catch (error) {
      console.error('Error getting price data count:', error);
      return 0;
    }
  }

  // Check if price data exists for a stock
  async hasPriceData(stockId: number): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM stock_price_data 
        WHERE stock_id = ?
      `;
      
      const [rows] = await db.sequelize.query(query, {
        replacements: [stockId]
      });
      
      return (rows as any[])[0].count > 0;
    } catch (error) {
      console.error('Error checking price data existence:', error);
      return false;
    }
  }
}
