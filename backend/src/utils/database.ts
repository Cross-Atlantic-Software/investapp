import { Sequelize } from "sequelize";
import User, { initializeUserModel } from "../Models/User";
import UserVerification, { initializeUserVerificationModel } from "../Models/UserVerification";
import Product, { initializeProductModel } from "../Models/Product";
import CmsUser, { initializeCmsUserModel } from "../Models/CmsUser";
import { connectionManager } from "./pooling";
import dotenv from "dotenv";
import config from "./config.json";

dotenv.config();

// Get database configuration
function getDatabaseConfig() {
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

// Initialize connection manager first
let sequelize: Sequelize;

// Initialize the connection manager and get sequelize instance
async function initializeSequelize() {
  const dbConfig = getDatabaseConfig();
  await connectionManager.initialize(dbConfig);
  sequelize = connectionManager.getSequelize();
  
  // Initialize the User model
  initializeUserModel(sequelize);
  initializeUserVerificationModel(sequelize);
  initializeProductModel(sequelize);
  initializeCmsUserModel(sequelize);
  
  // No associations needed since only admins handle stocks
  
  return sequelize;
}

// Export a promise that resolves to sequelize
export const sequelizePromise = initializeSequelize();

// Export db object
export const db = {
  get sequelize() {
    if (!sequelize) {
      throw new Error('Sequelize not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return sequelize;
  },
  User,
  UserVerification,
  Product,
  CmsUser
};

async function initialize() {
  try {
    // Wait for sequelize to be initialized
    const sequelize = await sequelizePromise;
    
    // Sync the database
    // await sequelize.sync({ alter: true });
    
    // Only sync in development, skip in production
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    } else {
      console.log('⚠️ Skipping database sync in production');
    }
    console.log('✅ Database synchronized successfully.');
    
    // Log connection stats
    const stats = connectionManager.getConnectionStats();
    console.log('📊 Connection Pool Stats:', stats);
    
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    throw err;
  }
}

// Initialize database
initialize().catch((err) => {
  console.error("❌ Database initialization failed:", err);
  process.exit(1);
});

export default db;
