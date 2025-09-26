import { Sequelize } from "sequelize";
import User, { initializeUserModel } from "../Models/User";
import UserVerification, { initializeUserVerificationModel } from "../Models/UserVerification";
import Product, { initializeProductModel } from "../Models/Product";
import CmsUser, { initializeCmsUserModel } from "../Models/CmsUser";
import EmailTemplate, { initializeEmailTemplateModel } from "../Models/EmailTemplate";
import Enquiry, { initializeEnquiryModel } from "../Models/Enquiry";
import Subscriber, { initializeSubscriberModel } from "../Models/Subscriber";
import PrivateMarketNews, { initializePrivateMarketNewsModel } from "../Models/PrivateMarketNews";
import Taxonomy, { initializeTaxonomyModel } from "../Models/Taxonomy";
import NotableActivity, { initializeNotableActivityModel } from "../Models/NotableActivity";
import ActivityType, { initializeActivityTypeModel } from "../Models/ActivityType";
import { connectionManager } from "./pooling";
import dotenv from "dotenv";
import config from "./config.json";

dotenv.config();

// Get database configuration
function getDatabaseConfig() {
  const env = (process.env.NODE_ENV as "development" | "production" | "test") || "development";
  const envConfig = (config as any)[env] || {};
  
  const dbConfig = {
    host: process.env.DB_HOST || envConfig.host,
    port: Number(process.env.DB_PORT || envConfig.port),
    user: process.env.DB_USER || envConfig.user,
    password: process.env.DB_PASSWORD || envConfig.password,
    database: process.env.DB_NAME || envConfig.database,
    environment: env
  };
  
  console.log('🔍 Database Configuration Debug:');
  console.log('Environment:', env);
  console.log('DB_HOST from env:', process.env.DB_HOST);
  console.log('DB_USER from env:', process.env.DB_USER);
  console.log('DB_NAME from env:', process.env.DB_NAME);
  console.log('Final config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    environment: dbConfig.environment
  });
  
  return dbConfig;
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
  initializeEmailTemplateModel(sequelize);
  
  // Initialize Enquiry model
  initializeEnquiryModel(sequelize);
  
  // Initialize Subscriber model
  initializeSubscriberModel(sequelize);
  
  // Initialize Private Market News model
  initializePrivateMarketNewsModel(sequelize);
  
  // Initialize Taxonomy model
  initializeTaxonomyModel(sequelize);
  
  // Initialize Notable Activity model
  initializeNotableActivityModel(sequelize);
  
  // Initialize Activity Type model
  initializeActivityTypeModel(sequelize);
  
  // No associations needed since only admins handle stocks
  
  return sequelize;
}

// Export a promise that resolves to sequelize
export const sequelizePromise = initializeSequelize();

// Export db object
export const db = {
  get sequelize() {
    if (!sequelize) {
      // Try to get sequelize from the promise if it's resolved
      if (sequelizePromise) {
        sequelizePromise.then(seq => {
          sequelize = seq;
        }).catch(err => {
          console.error('Error getting sequelize from promise:', err);
        });
      }
      
      if (!sequelize) {
        throw new Error('Sequelize not initialized yet. Wait for sequelizePromise to resolve.');
      }
    }
    return sequelize;
  },
  sequelizePromise,
  User,
  UserVerification,
  Product,
  CmsUser,
  EmailTemplate,
  Enquiry,
  Subscriber,
  PrivateMarketNews,
  Taxonomy,
  NotableActivity,
  ActivityType,
};

async function initialize() {
  try {
    // Wait for sequelize to be initialized with timeout
    const sequelizeInstance = await Promise.race([
      sequelizePromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database initialization timeout')), 30000)
      )
    ]);
    
    // Sync the database
    // await sequelizeInstance.sync({ alter: true });
    
    // Only sync in development, skip in production
    if (process.env.NODE_ENV !== 'production') {
      await sequelizeInstance.sync();
    } else {
      console.log('⚠️ Skipping database sync in production');
    }
    console.log('✅ Database synchronized successfully.');
    
    // Log connection stats
    const stats = connectionManager.getConnectionStats();
    console.log('📊 Connection Pool Stats:', stats);
    
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    // Don't exit the process, let the app continue and retry later
    console.log('🔄 Will retry database connection on next request...');
  }
}

// Initialize database
initialize().catch((err) => {
  console.error("❌ Database initialization failed:", err);
  // Don't exit the process, let it continue and retry
});

export default db;
