import { Sequelize } from "sequelize";
import * as mysql from "mysql2/promise";
import mysql2 from "mysql2";

// Connection Pool Configuration
export interface PoolConfig {
  min: number;
  max: number;
  acquire: number;
  idle: number;
  evict: number;
  handleDisconnects: boolean;
}

// Default pool configuration for 10 users
export const DEFAULT_POOL_CONFIG: PoolConfig = {
  min: 2,           // Minimum connections in pool
  max: 10,          // Maximum connections in pool (for 10 users)
  acquire: 60000,   // Maximum time to get connection (60 seconds)
  idle: 30000,      // Maximum idle time (30 seconds)
  evict: 1000,      // Check for idle connections every 1 second
  handleDisconnects: true
};

// Environment-specific pool configurations
export const POOL_CONFIGS = {
  development: {
    ...DEFAULT_POOL_CONFIG,
    min: 1,
    max: 5,
    logging: true
  },
  production: {
    ...DEFAULT_POOL_CONFIG,
    min: 3,
    max: 10,
    logging: false
  },
  test: {
    ...DEFAULT_POOL_CONFIG,
    min: 1,
    max: 3,
    logging: false
  }
};

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  environment: string;
}

// Create MySQL connection pool
export function createMySQLPool(dbConfig: DatabaseConfig) {
  return mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: POOL_CONFIGS[dbConfig.environment as keyof typeof POOL_CONFIGS].max,
    queueLimit: 0,
    idleTimeout: POOL_CONFIGS[dbConfig.environment as keyof typeof POOL_CONFIGS].idle,
    charset: 'utf8mb4'
  });
}

// Create Sequelize instance with connection pooling
export function createSequelizeWithPool(dbConfig: DatabaseConfig): Sequelize {
  const poolConfig = POOL_CONFIGS[dbConfig.environment as keyof typeof POOL_CONFIGS];
  
  return new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false, // Disable Sequelize query logging
    pool: {
      min: poolConfig.min,
      max: poolConfig.max,
      acquire: poolConfig.acquire,
      idle: poolConfig.idle,
      evict: poolConfig.evict
    },
    dialectOptions: {
      connectTimeout: 120000,  // 2 minutes connection timeout
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 5,
      timeout: 30000  // 30 seconds between retries
    }
  });
}

// Connection health check
export async function checkConnectionHealth(sequelize: Sequelize): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Get pool statistics
export function getPoolStats(sequelize: Sequelize) {
  try {
    // Access pool through the connection manager
    const pool = (sequelize.connectionManager as any).pool;
    if (pool) {
      return {
        size: pool.size || 0,
        used: pool.used || 0,
        pending: pool.pending || 0,
        available: pool.available || 0
      };
    }
    return {
      size: 0,
      used: 0,
      pending: 0,
      available: 0
    };
  } catch (error) {
    console.warn('Could not get pool stats:', error);
    return {
      size: 0,
      used: 0,
      pending: 0,
      available: 0
    };
  }
}

export default {
  createSequelizeWithPool,
  createMySQLPool,
  checkConnectionHealth,
  getPoolStats,
  POOL_CONFIGS,
  DEFAULT_POOL_CONFIG
};
