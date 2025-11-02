import { db } from '../utils/database';
import { QueryTypes } from 'sequelize';

/**
 * Generate a unique transaction ID in format: TXN-YYYY-XXX
 * where YYYY is the current year and XXX is a sequential number
 * 
 * @returns Promise<string> - Unique transaction ID (e.g., "TXN-2025-001")
 */
export async function generateTransactionId(): Promise<string> {
  await db.sequelizePromise;
  
  const currentYear = new Date().getFullYear();
  const yearPrefix = `TXN-${currentYear}-`;
  
  // Find the highest transaction ID for this year
  const results = await db.sequelize.query(`
    SELECT transaction_id 
    FROM transactions 
    WHERE transaction_id LIKE :prefix
    ORDER BY transaction_id DESC
    LIMIT 1
  `, {
    replacements: { prefix: `${yearPrefix}%` },
    type: QueryTypes.SELECT
  }) as any[];

  let nextNumber = 1;
  
  if (results && Array.isArray(results) && results.length > 0 && results[0].transaction_id) {
    // Extract the number from the last transaction ID
    const lastTransactionId = results[0].transaction_id;
    const match = lastTransactionId.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  // Format number with leading zeros (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  
  return `${yearPrefix}${formattedNumber}`;
}

