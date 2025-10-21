import FinancialKpi, { initializeFinancialKpiModel } from './FinancialKpi';
import StockFinancialData, { initializeStockFinancialDataModel } from './StockFinancialData';
import { Sector, initializeSectorModel } from './Sector';
import { Subsector, initializeSubsectorModel } from './Subsector';
import Wishlist, { initializeWishlistModel } from './Wishlist';
import Product from './Product';
import User from './User';
import BuyRequest, { initializeBuyRequestModel } from './BuyRequest';
import { InsightSector, initializeInsightSectorModel } from './InsightSector';
import { InsightSubsector, initializeInsightSubsectorModel } from './InsightSubsector';
import { InsightTopic, initializeInsightTopicModel } from './InsightTopic';
import { InsightSubtopic, initializeInsightSubtopicModel } from './InsightSubtopic';
import { InsightTheme, initializeInsightThemeModel } from './InsightTheme';
import { MarketInsight, initializeMarketInsightModel } from './MarketInsight';
import { KnowledgeSector, initializeKnowledgeSectorModel } from './KnowledgeSector';
import { KnowledgeSubsector, initializeKnowledgeSubsectorModel } from './KnowledgeSubsector';
import { KnowledgeTopic, initializeKnowledgeTopicModel } from './KnowledgeTopic';
import { KnowledgeSubtopic, initializeKnowledgeSubtopicModel } from './KnowledgeSubtopic';
import { KnowledgeTheme, initializeKnowledgeThemeModel } from './KnowledgeTheme';
import { KnowledgeCenter, initializeKnowledgeCenterModel } from './KnowledgeCenter';

export function initializeFinancialDataModels(sequelize: any) {
  // Initialize models first
  initializeFinancialKpiModel(sequelize);
  initializeStockFinancialDataModel(sequelize);
  initializeSectorModel(sequelize);
  initializeSubsectorModel(sequelize);

  // Then define associations
  StockFinancialData.belongsTo(FinancialKpi, {
    foreignKey: 'kpi_id',
    as: 'FinancialKpi'
  });

  FinancialKpi.hasMany(StockFinancialData, {
    foreignKey: 'kpi_id',
    as: 'StockFinancialData'
  });

  // Sector and Subsector associations
  Sector.hasMany(Subsector, {
    foreignKey: 'sector_id',
    as: 'subsectors'
  });

  Subsector.belongsTo(Sector, {
    foreignKey: 'sector_id',
    as: 'sector'
  });

}

export function initializeWishlistModels(sequelize: any) {
  // Initialize Wishlist model first
  initializeWishlistModel(sequelize);

  // Check if associations are already defined to prevent duplicates
  if (Wishlist.associations.user && Wishlist.associations.stock) {
    return; // Associations already defined
  }

  // Define Wishlist associations
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
}

export function initializeMarketInsightModels(sequelize: any) {
  // Initialize all market insight models first
  initializeInsightSectorModel(sequelize);
  initializeInsightSubsectorModel(sequelize);
  initializeInsightTopicModel(sequelize);
  initializeInsightSubtopicModel(sequelize);
  initializeInsightThemeModel(sequelize);
  initializeMarketInsightModel(sequelize);

  // Check if associations are already defined to prevent duplicates
  if (InsightSubsector.associations.InsightSector && MarketInsight.associations.InsightSector) {
    return; // Associations already defined
  }

  // Insight Sector and Subsector associations
  InsightSector.hasMany(InsightSubsector, {
    foreignKey: 'insight_sector_id',
    as: 'subsectors'
  });

  InsightSubsector.belongsTo(InsightSector, {
    foreignKey: 'insight_sector_id',
    as: 'sector'
  });

  // Insight Topic and Subtopic associations
  InsightTopic.hasMany(InsightSubtopic, {
    foreignKey: 'insight_topic_id',
    as: 'subtopics'
  });

  InsightSubtopic.belongsTo(InsightTopic, {
    foreignKey: 'insight_topic_id',
    as: 'topic'
  });

  // Market Insight associations with taxonomies
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

  // Reverse associations for taxonomies
  InsightSector.hasMany(MarketInsight, {
    foreignKey: 'insight_sector_id',
    as: 'MarketInsights'
  });

  InsightTopic.hasMany(MarketInsight, {
    foreignKey: 'insight_topic_id',
    as: 'MarketInsights'
  });

  InsightTheme.hasMany(MarketInsight, {
    foreignKey: 'insight_theme_id',
    as: 'MarketInsights'
  });
}

export function initializeKnowledgeCenterModels(sequelize: any) {
  // Initialize all knowledge center models first
  initializeKnowledgeSectorModel(sequelize);
  initializeKnowledgeSubsectorModel(sequelize);
  initializeKnowledgeTopicModel(sequelize);
  initializeKnowledgeSubtopicModel(sequelize);
  initializeKnowledgeThemeModel(sequelize);
  initializeKnowledgeCenterModel(sequelize);

  // Check if associations are already defined to prevent duplicates
  if (KnowledgeSubsector.associations.KnowledgeSector && KnowledgeCenter.associations.KnowledgeSector) {
    return; // Associations already defined
  }

  // Knowledge Sector and Subsector associations
  KnowledgeSector.hasMany(KnowledgeSubsector, {
    foreignKey: 'knowledge_sector_id',
    as: 'subsectors'
  });

  KnowledgeSubsector.belongsTo(KnowledgeSector, {
    foreignKey: 'knowledge_sector_id',
    as: 'sector'
  });

  // Knowledge Topic and Subtopic associations
  KnowledgeTopic.hasMany(KnowledgeSubtopic, {
    foreignKey: 'knowledge_topic_id',
    as: 'subtopics'
  });

  KnowledgeSubtopic.belongsTo(KnowledgeTopic, {
    foreignKey: 'knowledge_topic_id',
    as: 'topic'
  });

  // Knowledge Center associations with taxonomies
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

  // Reverse associations for taxonomies
  KnowledgeSector.hasMany(KnowledgeCenter, {
    foreignKey: 'knowledge_sector_id',
    as: 'KnowledgeCenters'
  });

  KnowledgeTopic.hasMany(KnowledgeCenter, {
    foreignKey: 'knowledge_topic_id',
    as: 'KnowledgeCenters'
  });

  KnowledgeTheme.hasMany(KnowledgeCenter, {
    foreignKey: 'knowledge_theme_id',
    as: 'KnowledgeCenters'
  });
}
