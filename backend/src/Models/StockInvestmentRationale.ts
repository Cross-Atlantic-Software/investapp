import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Interface for StockInvestmentRationale attributes
export interface StockInvestmentRationaleAttributes {
  id: number;
  stock_id: number;
  type: 'pros' | 'risks';
  title: string;
  description: string;
  order_index: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for StockInvestmentRationale creation attributes
export interface StockInvestmentRationaleCreationAttributes extends Optional<StockInvestmentRationaleAttributes, 'id' | 'order_index' | 'created_at' | 'updated_at'> {}

// StockInvestmentRationale model class
export class StockInvestmentRationaleModel extends Model<StockInvestmentRationaleAttributes, StockInvestmentRationaleCreationAttributes> implements StockInvestmentRationaleAttributes {
  public id!: number;
  public stock_id!: number;
  public type!: 'pros' | 'risks';
  public title!: string;
  public description!: string;
  public order_index!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the StockInvestmentRationale model
export const initializeStockInvestmentRationaleModel = (sequelize: Sequelize) => {
  StockInvestmentRationaleModel.init(
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
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.ENUM('pros', 'risks'),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'stock_investment_rationales',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['stock_id'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['order_index'],
        },
        {
          fields: ['created_at'],
        },
        {
          unique: true,
          fields: ['stock_id', 'type', 'title'],
          name: 'unique_stock_type_title',
        },
      ],
    }
  );
};

export default StockInvestmentRationaleModel;
