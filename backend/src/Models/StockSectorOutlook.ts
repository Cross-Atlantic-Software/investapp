import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface StockSectorOutlookAttributes {
  id: number;
  stock_id: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StockSectorOutlookCreationAttributes extends Optional<StockSectorOutlookAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class StockSectorOutlookModel extends Model<StockSectorOutlookAttributes, StockSectorOutlookCreationAttributes> implements StockSectorOutlookAttributes {
  public id!: number;
  public stock_id!: number;
  public description?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export function initializeStockSectorOutlookModel(sequelize: Sequelize): typeof StockSectorOutlookModel {
  StockSectorOutlookModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'stock_sector_outlooks',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StockSectorOutlookModel;
}
