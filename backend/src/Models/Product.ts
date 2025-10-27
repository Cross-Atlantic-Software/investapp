import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface ProductAttributes {
  id: number;
  company_name: string;
  logo: string;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  demand: 'High Demand' | 'Low Demand';
  homeDisplay: 'yes' | 'no';
  bannerDisplay: 'yes' | 'no';
  valuation_id?: number;
  valuation?: string;
  price_per_share: number;
  percentage_change: number;
  founded: number;
  sector_ids: string;
  subsector_ids: string;
  theme_ids: string;
  headquarters: string;
  min_units: number;
  lot_size: number;
  stock_master_ids?: string;
  price_change_period_id?: number;
  stock_performance_score_id?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<
  ProductAttributes,
  "id"
>;

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public company_name!: string;
  public logo!: string;
  public price_change!: number;
  public teaser!: string;
  public short_description!: string;
  public analysis!: string;
  public demand!: 'High Demand' | 'Low Demand';
  public homeDisplay!: 'yes' | 'no';
  public bannerDisplay!: 'yes' | 'no';
  public valuation_id?: number;
  public valuation?: string;
  public price_per_share!: number;
  public percentage_change!: number;
  public founded!: number;
  public sector_ids!: string;
  public subsector_ids!: string;
  public theme_ids!: string;
  public headquarters!: string;
  public min_units!: number;
  public lot_size!: number;
  public stock_master_ids?: string;
  public price_change_period_id?: number;
  public stock_performance_score_id?: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
export function initializeProductModel(sequelize: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price_change: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      teaser: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      short_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      analysis: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      demand: {
        type: DataTypes.ENUM('High Demand', 'Low Demand'),
        allowNull: false
      },
      homeDisplay: {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: false,
        defaultValue: 'no'
      },
      bannerDisplay: {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: false,
        defaultValue: 'no'
      },
      valuation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'valuations',
          key: 'id'
        }
      },
      valuation: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      price_per_share: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      percentage_change: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      founded: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sector_ids: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      subsector_ids: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      theme_ids: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      headquarters: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      min_units: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lot_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock_master_ids: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price_change_period_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      stock_performance_score_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'stock_performance_scores',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
    }
  );

  return Product;
}

export default Product;
