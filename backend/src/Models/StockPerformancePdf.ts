import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Interface for StockPerformancePdf attributes
export interface StockPerformancePdfAttributes {
  id: number;
  stock_id: number;
  title: string;
  description?: string;
  pdf_url: string;
  file_name: string;
  file_size: number;
  page_count: number;
  order_index: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for StockPerformancePdf creation attributes
export interface StockPerformancePdfCreationAttributes extends Optional<StockPerformancePdfAttributes, 'id' | 'description' | 'page_count' | 'order_index' | 'is_active' | 'created_at' | 'updated_at'> {}

// StockPerformancePdf model class
export class StockPerformancePdfModel extends Model<StockPerformancePdfAttributes, StockPerformancePdfCreationAttributes> implements StockPerformancePdfAttributes {
  public id!: number;
  public stock_id!: number;
  public title!: string;
  public description?: string;
  public pdf_url!: string;
  public file_name!: string;
  public file_size!: number;
  public page_count!: number;
  public order_index!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the StockPerformancePdf model
export const initializeStockPerformancePdfModel = (sequelize: Sequelize) => {
  StockPerformancePdfModel.init(
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pdf_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      page_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: 'stock_performance_pdfs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['stock_id'],
        },
        {
          fields: ['order_index'],
        },
        {
          fields: ['is_active'],
        },
        {
          fields: ['created_at'],
        },
        {
          unique: true,
          fields: ['stock_id', 'title'],
          name: 'unique_stock_title',
        },
      ],
    }
  );
};

export default StockPerformancePdfModel;
