import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface FinancialKpiAttributes {
  id: number;
  category: 'income_statement' | 'balance_sheet' | 'cash_flow';
  name: string;
  display_order: number;
  unit: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface FinancialKpiCreationAttributes extends Optional<FinancialKpiAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class FinancialKpi extends Model<FinancialKpiAttributes, FinancialKpiCreationAttributes> implements FinancialKpiAttributes {
  public id!: number;
  public category!: 'income_statement' | 'balance_sheet' | 'cash_flow';
  public name!: string;
  public display_order!: number;
  public unit!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeFinancialKpiModel(sequelize: Sequelize) {
  FinancialKpi.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category: {
        type: DataTypes.ENUM('income_statement', 'balance_sheet', 'cash_flow'),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      unit: {
        type: DataTypes.STRING(50),
        defaultValue: 'Rs. Crore',
      },
    },
    {
      sequelize,
      tableName: 'financial_kpis',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default FinancialKpi;
