import FinancialKpi, { initializeFinancialKpiModel } from './FinancialKpi';
import StockFinancialData, { initializeStockFinancialDataModel } from './StockFinancialData';
import Wishlist, { initializeWishlistModel } from './Wishlist';
import Product from './Product';
import User from './User';

export function initializeFinancialDataModels(sequelize: any) {
  // Initialize models first
  initializeFinancialKpiModel(sequelize);
  initializeStockFinancialDataModel(sequelize);

  // Then define associations
  StockFinancialData.belongsTo(FinancialKpi, {
    foreignKey: 'kpi_id',
    as: 'FinancialKpi'
  });

  FinancialKpi.hasMany(StockFinancialData, {
    foreignKey: 'kpi_id',
    as: 'StockFinancialData'
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
