import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import config from "./config.json";

dotenv.config();

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
  acquire: 30000,   // Maximum time to get connection (30 seconds)
  idle: 10000,      // Maximum idle time (10 seconds)
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

// Get database configuration
export function getDatabaseConfig() {
  const env = (process.env.NODE_ENV as "development" | "production" | "test") || "development";
  const envConfig = (config as any)[env] || {};
  
  return {
    host: process.env.DB_HOST || envConfig.host,
    port: Number(process.env.DB_PORT || envConfig.port),
    user: process.env.DB_USER || envConfig.user,
    password: process.env.DB_PASSWORD || envConfig.password,
    database: process.env.DB_NAME || envConfig.database,
    environment: env
  };
}

// Create MySQL connection pool
export function createMySQLPool() {
  const dbConfig = getDatabaseConfig();
  
  return mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: POOL_CONFIGS[dbConfig.environment].max,
    queueLimit: 0,
    idleTimeout: POOL_CONFIGS[dbConfig.environment].idle
  });
}

// Create Sequelize instance with connection pooling
export function createSequelizeWithPool(): Sequelize {
  const dbConfig = getDatabaseConfig();
  const poolConfig = POOL_CONFIGS[dbConfig.environment];
  
  return new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    logging: poolConfig.logging ? console.log : false,
    pool: {
      min: poolConfig.min,
      max: poolConfig.max,
      acquire: poolConfig.acquire,
      idle: poolConfig.idle,
      evict: poolConfig.evict
    },
    dialectOptions: {
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
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
      max: 3
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
  getDatabaseConfig,
  checkConnectionHealth,
  getPoolStats,
  POOL_CONFIGS,
  DEFAULT_POOL_CONFIG
};
