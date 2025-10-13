import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface StockFinancialDataAttributes {
  id: number;
  stock_id: number;
  kpi_id: number;
  category: 'income_statement' | 'balance_sheet' | 'cash_flow';
  year: number;
  value: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface StockFinancialDataCreationAttributes extends Optional<StockFinancialDataAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class StockFinancialData extends Model<StockFinancialDataAttributes, StockFinancialDataCreationAttributes> implements StockFinancialDataAttributes {
  public id!: number;
  public stock_id!: number;
  public kpi_id!: number;
  public category!: 'income_statement' | 'balance_sheet' | 'cash_flow';
  public year!: number;
  public value!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeStockFinancialDataModel(sequelize: Sequelize) {
  StockFinancialData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'stocks',
          key: 'id',
        },
      },
              kpi_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                  model: 'financial_kpis',
                  key: 'id',
                },
              },
              category: {
                type: DataTypes.ENUM('income_statement', 'balance_sheet', 'cash_flow'),
                allowNull: false,
              },
              year: {
                type: DataTypes.INTEGER,
                allowNull: false,
              },
      value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'stock_financial_data',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['stock_id', 'kpi_id', 'year'],
        },
      ],
    }
  );
}

export default StockFinancialData;
