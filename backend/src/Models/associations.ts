import FinancialKpi, { initializeFinancialKpiModel } from './FinancialKpi';
import StockFinancialData, { initializeStockFinancialDataModel } from './StockFinancialData';

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
