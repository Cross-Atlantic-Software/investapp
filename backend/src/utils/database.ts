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
import BulkDeals, { initializeBulkDealsModel } from "../Models/BulkDeals";
import StockMaster, { initializeStockMasterModel } from "../Models/StockMaster";
import StockScorecardModel, { initializeStockScorecardModel } from "../Models/StockScorecard";
import StockInvestmentRationaleModel, { initializeStockInvestmentRationaleModel } from "../Models/StockInvestmentRationale";
import StockPerformancePdfModel, { initializeStockPerformancePdfModel } from "../Models/StockPerformancePdf";
import { StockSectorOutlookModel, initializeStockSectorOutlookModel } from "../Models/StockSectorOutlook";
import { StockSectorOutlookAccordionModel, initializeStockSectorOutlookAccordionModel } from "../Models/StockSectorOutlookAccordion";
import { StockSectorInsightsPdfModel, initializeStockSectorInsightsPdfModel } from "../Models/StockSectorInsightsPdf";
import { MethodologyNote, initializeMethodologyNoteModel } from "../Models/MethodologyNote";
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
  
  // Initialize Bulk Deals model
  initializeBulkDealsModel(sequelize);
  
  // Initialize Stock Master model
  initializeStockMasterModel(sequelize);
  
  // Initialize Stock Scorecard model
  initializeStockScorecardModel(sequelize);
  
  // Initialize Stock Investment Rationale model
  initializeStockInvestmentRationaleModel(sequelize);
  
  // Initialize Stock Performance PDF model
  initializeStockPerformancePdfModel(sequelize);
  
  // Initialize Stock Sector Outlook models
  initializeStockSectorOutlookModel(sequelize);
  initializeStockSectorOutlookAccordionModel(sequelize);
  initializeStockSectorInsightsPdfModel(sequelize);
  
  // Initialize Methodology Note model
  initializeMethodologyNoteModel(sequelize);
  
  // Set up associations for Sector Outlook
  StockSectorOutlookModel.hasMany(StockSectorOutlookAccordionModel, {
    foreignKey: 'sector_outlook_id',
    as: 'accordions',
  });
  StockSectorOutlookAccordionModel.belongsTo(StockSectorOutlookModel, {
    foreignKey: 'sector_outlook_id',
    as: 'sectorOutlook',
  });
  
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
  sequelizePromise,
  get User() {
    if (!User) {
      throw new Error('User model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return User;
  },
  get UserVerification() {
    if (!UserVerification) {
      throw new Error('UserVerification model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return UserVerification;
  },
  get Product() {
    if (!Product) {
      throw new Error('Product model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Product;
  },
  get CmsUser() {
    if (!CmsUser) {
      throw new Error('CmsUser model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return CmsUser;
  },
  get EmailTemplate() {
    if (!EmailTemplate) {
      throw new Error('EmailTemplate model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return EmailTemplate;
  },
  get Enquiry() {
    if (!Enquiry) {
      throw new Error('Enquiry model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Enquiry;
  },
  get Subscriber() {
    if (!Subscriber) {
      throw new Error('Subscriber model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Subscriber;
  },
  get PrivateMarketNews() {
    if (!PrivateMarketNews) {
      throw new Error('PrivateMarketNews model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return PrivateMarketNews;
  },
  get Taxonomy() {
    if (!Taxonomy) {
      throw new Error('Taxonomy model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Taxonomy;
  },
  get NotableActivity() {
    if (!NotableActivity) {
      throw new Error('NotableActivity model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return NotableActivity;
  },
  get ActivityType() {
    if (!ActivityType) {
      throw new Error('ActivityType model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return ActivityType;
  },
  get BulkDeals() {
    if (!BulkDeals) {
      throw new Error('BulkDeals model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return BulkDeals;
  },
  get StockMaster() {
    if (!StockMaster) {
      throw new Error('StockMaster model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockMaster;
  },
  get StockScorecard() {
    if (!StockScorecardModel) {
      throw new Error('StockScorecard model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockScorecardModel;
  },
  get StockInvestmentRationale() {
    if (!StockInvestmentRationaleModel) {
      throw new Error('StockInvestmentRationale model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockInvestmentRationaleModel;
  },
  get StockPerformancePdf() {
    if (!StockPerformancePdfModel) {
      throw new Error('StockPerformancePdf model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockPerformancePdfModel;
  },
  get StockSectorOutlook() {
    if (!StockSectorOutlookModel) {
      throw new Error('StockSectorOutlook model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockSectorOutlookModel;
  },
  get StockSectorOutlookAccordion() {
    if (!StockSectorOutlookAccordionModel) {
      throw new Error('StockSectorOutlookAccordion model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockSectorOutlookAccordionModel;
  },
  get StockSectorInsightsPdf() {
    if (!StockSectorInsightsPdfModel) {
      throw new Error('StockSectorInsightsPdf model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockSectorInsightsPdfModel;
  },
  get MethodologyNote() {
    if (!MethodologyNote) {
      throw new Error('MethodologyNote model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return MethodologyNote;
  },
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
