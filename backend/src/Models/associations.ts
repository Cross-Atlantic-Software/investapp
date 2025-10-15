import FinancialKpi, { initializeFinancialKpiModel } from './FinancialKpi';
import StockFinancialData, { initializeStockFinancialDataModel } from './StockFinancialData';
import { Sector, initializeSectorModel } from './Sector';
import { Subsector, initializeSubsectorModel } from './Subsector';
import Wishlist, { initializeWishlistModel } from './Wishlist';
import Product from './Product';
import User from './User';
import BuyRequest, { initializeBuyRequestModel } from './BuyRequest';

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

export function initializeBuyRequestModels(sequelize: any) {
  // Initialize BuyRequest model first
  initializeBuyRequestModel(sequelize);

  // Check if associations are already defined to prevent duplicates
  if (BuyRequest.associations.User && BuyRequest.associations.Product) {
    return; // Associations already defined
  }

  // Define BuyRequest associations
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
}
