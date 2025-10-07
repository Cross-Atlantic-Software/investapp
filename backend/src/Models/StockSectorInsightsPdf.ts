import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface StockSectorInsightsPdfAttributes {
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
  created_at: Date;
  updated_at: Date;
}

export interface StockSectorInsightsPdfCreationAttributes extends Optional<StockSectorInsightsPdfAttributes, 'id' | 'page_count' | 'order_index' | 'is_active' | 'created_at' | 'updated_at'> {}

export class StockSectorInsightsPdfModel extends Model<StockSectorInsightsPdfAttributes, StockSectorInsightsPdfCreationAttributes> implements StockSectorInsightsPdfAttributes {
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
  public created_at!: Date;
  public updated_at!: Date;
}

export function initializeStockSectorInsightsPdfModel(sequelize: Sequelize): typeof StockSectorInsightsPdfModel {
  StockSectorInsightsPdfModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
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
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'stock_sector_insights_pdfs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StockSectorInsightsPdfModel;
}
