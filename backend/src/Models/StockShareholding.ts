import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface StockShareholdingAttributes {
  id: number;
  stock_id: number;
  holder_name: string;
  percentage: number;
  holder_type?: string;
  display_order: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface StockShareholdingCreationAttributes extends Optional<StockShareholdingAttributes, 'id' | 'display_order' | 'created_at' | 'updated_at'> {}

export class StockShareholding extends Model<StockShareholdingAttributes, StockShareholdingCreationAttributes> implements StockShareholdingAttributes {
  public id!: number;
  public stock_id!: number;
  public holder_name!: string;
  public percentage!: number;
  public holder_type?: string;
  public display_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeStockShareholdingModel(sequelize: Sequelize) {
  StockShareholding.init(
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
          model: 'products',
          key: 'id',
        },
      },
      holder_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'stock_shareholding',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default StockShareholding;
