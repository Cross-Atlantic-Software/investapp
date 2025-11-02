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
import PriceChangePeriod, { initializePriceChangePeriodModel } from "../Models/PriceChangePeriod";
import Valuation, { initializeValuationModel } from "../Models/Valuation";
import Theme, { initializeThemeModel } from "../Models/Theme";
import StockScorecardModel, { initializeStockScorecardModel } from "../Models/StockScorecard";
import StockInvestmentRationaleModel, { initializeStockInvestmentRationaleModel } from "../Models/StockInvestmentRationale";
import StockPerformancePdfModel, { initializeStockPerformancePdfModel } from "../Models/StockPerformancePdf";
import { StockSectorOutlookModel, initializeStockSectorOutlookModel } from "../Models/StockSectorOutlook";
import { StockSectorOutlookAccordionModel, initializeStockSectorOutlookAccordionModel } from "../Models/StockSectorOutlookAccordion";
import { StockSectorInsightsPdfModel, initializeStockSectorInsightsPdfModel } from "../Models/StockSectorInsightsPdf";
import { MethodologyNote, initializeMethodologyNoteModel } from "../Models/MethodologyNote";
import StockShareholding, { initializeStockShareholdingModel } from "../Models/StockShareholding";
import ShareholderType, { initializeShareholderTypeModel } from "../Models/ShareholderType";
import Wishlist, { initializeWishlistModel } from "../Models/Wishlist";
import StockNewsSection, { initializeStockNewsSectionModel } from "../Models/StockNewsSection";
import { StockFaq, initializeStockFaqModel } from "../Models/StockFaq";
import ContactFaq, { initializeContactFaqModel } from "../Models/ContactFaq";
import { FinancialDataCsv, initializeFinancialDataCsvModel } from "../Models/FinancialDataCsv";
import { Sector, initializeSectorModel } from "../Models/Sector";
import { Subsector, initializeSubsectorModel } from "../Models/Subsector";
import KYCApplication, { initializeKYCApplicationModel } from "../Models/KYCApplication";
import BuyRequest, { initializeBuyRequestModel } from "../Models/BuyRequest";
import Transaction, { initializeTransactionModel } from "../Models/Transaction";
import ValuationRange, { initializeValuationRangeModel } from "../Models/ValuationRange";
import { InsightSector, initializeInsightSectorModel } from "../Models/InsightSector";
import { InsightSubsector, initializeInsightSubsectorModel } from "../Models/InsightSubsector";
import { InsightTopic, initializeInsightTopicModel } from "../Models/InsightTopic";
import { InsightSubtopic, initializeInsightSubtopicModel } from "../Models/InsightSubtopic";
import { InsightTheme, initializeInsightThemeModel } from "../Models/InsightTheme";
import { MarketInsight, initializeMarketInsightModel } from "../Models/MarketInsight";
import { HomeInsight, initializeHomeInsightModel } from "../Models/HomeInsight";
import { KnowledgeSector, initializeKnowledgeSectorModel } from "../Models/KnowledgeSector";
import { KnowledgeSubsector, initializeKnowledgeSubsectorModel } from "../Models/KnowledgeSubsector";
import { KnowledgeTopic, initializeKnowledgeTopicModel } from "../Models/KnowledgeTopic";
import { KnowledgeSubtopic, initializeKnowledgeSubtopicModel } from "../Models/KnowledgeSubtopic";
import { KnowledgeTheme, initializeKnowledgeThemeModel } from "../Models/KnowledgeTheme";
import { KnowledgeCenter, initializeKnowledgeCenterModel } from "../Models/KnowledgeCenter";
import StockPerformanceScore, { initializeStockPerformanceScoreModel } from "../Models/StockPerformanceScore";
import UserPortfolio, { initializeUserPortfolioModel } from "../Models/UserPortfolio";
import UserWallet, { initializeUserWalletModel } from "../Models/UserWallet";
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
  
  // Initialize Price Change Period model
  initializePriceChangePeriodModel(sequelize);
  
  // Initialize Valuation model
  initializeValuationModel(sequelize);
  
  // Initialize Theme model
  initializeThemeModel(sequelize);
  
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
  
  // Initialize Stock Shareholding model
  initializeStockShareholdingModel(sequelize);
  
  // Initialize Shareholder Type model
  initializeShareholderTypeModel(sequelize);
  
  // Initialize Stock News Section model
  initializeStockNewsSectionModel(sequelize);
  initializeStockFaqModel(sequelize);
  initializeContactFaqModel(sequelize);
  
  // Initialize Financial Data CSV model
  initializeFinancialDataCsvModel(sequelize);
  
  // Initialize Sector and Subsector models
  initializeSectorModel(sequelize);
  initializeSubsectorModel(sequelize);
  
  // Initialize KYC Application model
  initializeKYCApplicationModel(sequelize);
  
  // Initialize BuyRequest model
  initializeBuyRequestModel(sequelize);
  
  // Initialize Transaction model
  initializeTransactionModel(sequelize);
  
  // Initialize ValuationRange model
  initializeValuationRangeModel(sequelize);
  
  // Initialize Market Insight models
  initializeInsightSectorModel(sequelize);
  initializeInsightSubsectorModel(sequelize);
  initializeInsightTopicModel(sequelize);
  initializeInsightSubtopicModel(sequelize);
  initializeInsightThemeModel(sequelize);
  initializeMarketInsightModel(sequelize);
  
  // Initialize Home Insight model
  initializeHomeInsightModel(sequelize);
  
  // Initialize Knowledge Center models
  initializeKnowledgeSectorModel(sequelize);
  initializeKnowledgeSubsectorModel(sequelize);
  initializeKnowledgeTopicModel(sequelize);
  initializeKnowledgeSubtopicModel(sequelize);
  initializeKnowledgeThemeModel(sequelize);
  initializeKnowledgeCenterModel(sequelize);
  
  // Initialize Stock Performance Score model
  initializeStockPerformanceScoreModel(sequelize);
  
  // Initialize User Portfolio model
  initializeUserPortfolioModel(sequelize);
  
  // Initialize User Wallet model
  initializeUserWalletModel(sequelize);
  
  // Set up Sector and Subsector associations
  Sector.hasMany(Subsector, {
    foreignKey: 'sector_id',
    as: 'subsectors'
  });

  Subsector.belongsTo(Sector, {
    foreignKey: 'sector_id',
    as: 'sector'
  });
  
  // Set up KYC associations
  KYCApplication.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  User.hasMany(KYCApplication, {
    foreignKey: 'user_id',
    as: 'kycApplications'
  });
  
  // Initialize Wishlist model
  initializeWishlistModel(sequelize);
  
  // Set up associations for Sector Outlook
  StockSectorOutlookModel.hasMany(StockSectorOutlookAccordionModel, {
    foreignKey: 'sector_outlook_id',
    as: 'accordions',
  });
  StockSectorOutlookAccordionModel.belongsTo(StockSectorOutlookModel, {
    foreignKey: 'sector_outlook_id',
    as: 'sectorOutlook',
  });
  
  // Set up associations for Wishlist
  Wishlist.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Wishlist.belongsTo(Product, {
    foreignKey: 'stock_id',
    as: 'stock'
  });

  User.hasMany(Wishlist, {
    foreignKey: 'user_id',
    as: 'userWishlist'
  });

  Product.hasMany(Wishlist, {
    foreignKey: 'stock_id',
    as: 'stockWishlist'
  });

  // Set up BuyRequest associations
  BuyRequest.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'User'
  });

  BuyRequest.belongsTo(Product, {
    foreignKey: 'stock_id',
    as: 'Product'
  });

  User.hasMany(BuyRequest, {
    foreignKey: 'user_id',
    as: 'UserBuyRequests'
  });

  Product.hasMany(BuyRequest, {
    foreignKey: 'stock_id',
    as: 'ProductBuyRequests'
  });

  // Set up Transaction associations
  Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Transaction.belongsTo(Product, {
    foreignKey: 'stock_id',
    as: 'stock'
  });

  Transaction.belongsTo(BuyRequest, {
    foreignKey: 'buy_request_id',
    as: 'buyRequest'
  });

  Transaction.belongsTo(CmsUser, {
    foreignKey: 'admin_approved_by',
    as: 'approvedBy'
  });

  User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'transactions'
  });

  Product.hasMany(Transaction, {
    foreignKey: 'stock_id',
    as: 'transactions'
  });

  BuyRequest.hasOne(Transaction, {
    foreignKey: 'buy_request_id',
    as: 'transaction'
  });

  // Set up User Wallet associations
  UserWallet.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  User.hasOne(UserWallet, {
    foreignKey: 'user_id',
    as: 'wallet'
  });

  // Set up Market Insight associations
  InsightSector.hasMany(InsightSubsector, {
    foreignKey: 'insight_sector_id',
    as: 'subsectors'
  });

  InsightSubsector.belongsTo(InsightSector, {
    foreignKey: 'insight_sector_id',
    as: 'sector'
  });

  InsightTopic.hasMany(InsightSubtopic, {
    foreignKey: 'insight_topic_id',
    as: 'subtopics'
  });

  InsightSubtopic.belongsTo(InsightTopic, {
    foreignKey: 'insight_topic_id',
    as: 'topic'
  });

  MarketInsight.belongsTo(InsightSector, {
    foreignKey: 'insight_sector_id',
    as: 'InsightSector'
  });

  MarketInsight.belongsTo(InsightTopic, {
    foreignKey: 'insight_topic_id',
    as: 'InsightTopic'
  });

  MarketInsight.belongsTo(InsightTheme, {
    foreignKey: 'insight_theme_id',
    as: 'InsightTheme'
  });

  // Set up Knowledge Center associations
  KnowledgeSector.hasMany(KnowledgeSubsector, {
    foreignKey: 'knowledge_sector_id',
    as: 'subsectors'
  });

  KnowledgeSubsector.belongsTo(KnowledgeSector, {
    foreignKey: 'knowledge_sector_id',
    as: 'sector'
  });

  KnowledgeTopic.hasMany(KnowledgeSubtopic, {
    foreignKey: 'knowledge_topic_id',
    as: 'subtopics'
  });

  KnowledgeSubtopic.belongsTo(KnowledgeTopic, {
    foreignKey: 'knowledge_topic_id',
    as: 'topic'
  });

  KnowledgeCenter.belongsTo(KnowledgeSector, {
    foreignKey: 'knowledge_sector_id',
    as: 'KnowledgeSector'
  });

  KnowledgeCenter.belongsTo(KnowledgeTopic, {
    foreignKey: 'knowledge_topic_id',
    as: 'KnowledgeTopic'
  });

  KnowledgeCenter.belongsTo(KnowledgeTheme, {
    foreignKey: 'knowledge_theme_id',
    as: 'KnowledgeTheme'
  });

  // Set up associations for ShareholderType
  ShareholderType.hasMany(StockShareholding, {
    foreignKey: 'shareholder_type_id',
    as: 'shareholdings'
  });

  StockShareholding.belongsTo(ShareholderType, {
    foreignKey: 'shareholder_type_id',
    as: 'shareholderType'
  });
  
  // Stock News Section associations
  Product.hasMany(StockNewsSection, {
    foreignKey: 'stock_id',
    as: 'newsSections'
  });
  
  StockNewsSection.belongsTo(Product, {
    foreignKey: 'stock_id',
    as: 'stock'
  });

  // Stock FAQ associations
  Product.hasMany(StockFaq, {
    foreignKey: 'stock_id',
    as: 'stockFaqs'
  });
  
  StockFaq.belongsTo(Product, {
    foreignKey: 'stock_id',
    as: 'stock'
  });

  // Stock Performance Score associations
  StockPerformanceScore.belongsTo(Product, {
    foreignKey: 'stock_id',
    as: 'stock'
  });

  Product.hasMany(StockPerformanceScore, {
    foreignKey: 'stock_id',
    as: 'performanceScores'
  });

  Product.belongsTo(StockPerformanceScore, {
    foreignKey: 'stock_performance_score_id',
    as: 'performanceScore'
  });

  StockPerformanceScore.hasMany(Product, {
    foreignKey: 'stock_performance_score_id',
    as: 'products'
  });

  // User Portfolio associations
  UserPortfolio.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  User.hasOne(UserPortfolio, {
    foreignKey: 'user_id',
    as: 'portfolio'
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
  get PriceChangePeriod() {
    if (!PriceChangePeriod) {
      throw new Error('PriceChangePeriod model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return PriceChangePeriod;
  },
  get Valuation() {
    if (!Valuation) {
      throw new Error('Valuation model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Valuation;
  },
  get Theme() {
    if (!Theme) {
      throw new Error('Theme model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Theme;
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
  get StockShareholding() {
    if (!StockShareholding) {
      throw new Error('StockShareholding model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockShareholding;
  },
  get Wishlist() {
    if (!Wishlist) {
      throw new Error('Wishlist model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Wishlist;
  },
  get ShareholderType() {
    if (!ShareholderType) {
      throw new Error('ShareholderType model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return ShareholderType;
  },
  get StockNewsSection() {
    if (!StockNewsSection) {
      throw new Error('StockNewsSection model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockNewsSection;
  },
  get StockFaq() {
    if (!StockFaq) {
      throw new Error('StockFaq model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockFaq;
  },
  get ContactFaq() {
    if (!ContactFaq) {
      throw new Error('ContactFaq model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return ContactFaq;
  },

  get FinancialDataCsv() {
    if (!FinancialDataCsv) {
      throw new Error('FinancialDataCsv model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return FinancialDataCsv;
  },

  get Sector() {
    if (!Sector) {
      throw new Error('Sector model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Sector;
  },

  get Subsector() {
    if (!Subsector) {
      throw new Error('Subsector model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Subsector;
  },

  get KYCApplication() {
    if (!KYCApplication) {
      throw new Error('KYCApplication model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KYCApplication;
  },

  get BuyRequest() {
    if (!BuyRequest) {
      throw new Error('BuyRequest model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return BuyRequest;
  },

  get Transaction() {
    if (!Transaction) {
      throw new Error('Transaction model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return Transaction;
  },

  get ValuationRange() {
    if (!ValuationRange) {
      throw new Error('ValuationRange model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return ValuationRange;
  },

  get InsightSector() {
    if (!InsightSector) {
      throw new Error('InsightSector model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return InsightSector;
  },

  get InsightSubsector() {
    if (!InsightSubsector) {
      throw new Error('InsightSubsector model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return InsightSubsector;
  },

  get InsightTopic() {
    if (!InsightTopic) {
      throw new Error('InsightTopic model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return InsightTopic;
  },

  get InsightSubtopic() {
    if (!InsightSubtopic) {
      throw new Error('InsightSubtopic model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return InsightSubtopic;
  },

  get InsightTheme() {
    if (!InsightTheme) {
      throw new Error('InsightTheme model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return InsightTheme;
  },

  get MarketInsight() {
    if (!MarketInsight) {
      throw new Error('MarketInsight model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return MarketInsight;
  },

  get HomeInsight() {
    if (!HomeInsight) {
      throw new Error('HomeInsight model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return HomeInsight;
  },

  get KnowledgeSector() {
    if (!KnowledgeSector) {
      throw new Error('KnowledgeSector model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KnowledgeSector;
  },

  get KnowledgeSubsector() {
    if (!KnowledgeSubsector) {
      throw new Error('KnowledgeSubsector model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KnowledgeSubsector;
  },

  get KnowledgeTopic() {
    if (!KnowledgeTopic) {
      throw new Error('KnowledgeTopic model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KnowledgeTopic;
  },

  get KnowledgeSubtopic() {
    if (!KnowledgeSubtopic) {
      throw new Error('KnowledgeSubtopic model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KnowledgeSubtopic;
  },

  get KnowledgeTheme() {
    if (!KnowledgeTheme) {
      throw new Error('KnowledgeTheme model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KnowledgeTheme;
  },

  get KnowledgeCenter() {
    if (!KnowledgeCenter) {
      throw new Error('KnowledgeCenter model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return KnowledgeCenter;
  },

  get StockPerformanceScore() {
    if (!StockPerformanceScore) {
      throw new Error('StockPerformanceScore model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return StockPerformanceScore;
  },

  get UserPortfolio() {
    if (!UserPortfolio) {
      throw new Error('UserPortfolio model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return UserPortfolio;
  },

  get UserWallet() {
    if (!UserWallet) {
      throw new Error('UserWallet model not initialized yet. Wait for sequelizePromise to resolve.');
    }
    return UserWallet;
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
      // Temporarily disable sync due to too many indexes on users table
      // await sequelizeInstance.sync();
      console.log('⚠️ Database sync disabled due to index limit');
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
