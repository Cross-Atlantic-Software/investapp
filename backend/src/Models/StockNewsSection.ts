import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface StockNewsSectionAttributes {
  id: number;
  title: string;
  stock_id: number;
  url: string;
  banner: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface StockNewsSectionCreationAttributes extends Optional<StockNewsSectionAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class StockNewsSection extends Model<StockNewsSectionAttributes, StockNewsSectionCreationAttributes> implements StockNewsSectionAttributes {
  public id!: number;
  public title!: string;
  public stock_id!: number;
  public url!: string;
  public banner!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeStockNewsSectionModel(sequelize: Sequelize) {
  StockNewsSection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      banner: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'stock_news_section',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default StockNewsSection;
