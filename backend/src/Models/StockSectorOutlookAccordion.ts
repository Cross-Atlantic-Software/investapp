import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface StockSectorOutlookAccordionAttributes {
  id: number;
  sector_outlook_id: number;
  title: string;
  analysis: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface StockSectorOutlookAccordionCreationAttributes extends Optional<StockSectorOutlookAccordionAttributes, 'id' | 'order_index' | 'created_at' | 'updated_at'> {}

export class StockSectorOutlookAccordionModel extends Model<StockSectorOutlookAccordionAttributes, StockSectorOutlookAccordionCreationAttributes> implements StockSectorOutlookAccordionAttributes {
  public id!: number;
  public sector_outlook_id!: number;
  public title!: string;
  public analysis!: string;
  public order_index!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

export function initializeStockSectorOutlookAccordionModel(sequelize: Sequelize): typeof StockSectorOutlookAccordionModel {
  StockSectorOutlookAccordionModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sector_outlook_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      analysis: {
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
      tableName: 'stock_sector_outlook_accordions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StockSectorOutlookAccordionModel;
}
