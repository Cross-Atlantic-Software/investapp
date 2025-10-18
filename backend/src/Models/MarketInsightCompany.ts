import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface MarketInsightCompanyAttributes {
  id: number;
  market_insight_id: number;
  product_id: number;
  created_at: Date;
  updated_at: Date;
}

interface MarketInsightCompanyCreationAttributes extends Optional<MarketInsightCompanyAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class MarketInsightCompany extends Model<MarketInsightCompanyAttributes, MarketInsightCompanyCreationAttributes> implements MarketInsightCompanyAttributes {
  public id!: number;
  public market_insight_id!: number;
  public product_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeMarketInsightCompanyModel(sequelize: Sequelize) {
  MarketInsightCompany.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      market_insight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'market_insights',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
      tableName: 'market_insight_companies',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['market_insight_id'],
          name: 'idx_market_insight_companies_insight_id'
        },
        {
          fields: ['product_id'],
          name: 'idx_market_insight_companies_product_id'
        },
        {
          unique: true,
          fields: ['market_insight_id', 'product_id'],
          name: 'unique_market_insight_company'
        }
      ]
    }
  );
}

export default MarketInsightCompany;

