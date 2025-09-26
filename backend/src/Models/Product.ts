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
  valuation: string;
  price_per_share: number;
  percentage_change: number;
  founded: number;
  sector: string;
  subsector: string;
  headquarters: string;
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
  public valuation!: string;
  public price_per_share!: number;
  public percentage_change!: number;
  public founded!: number;
  public sector!: string;
  public subsector!: string;
  public headquarters!: string;
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
      valuation: {
        type: DataTypes.STRING(100),
        allowNull: false
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
      sector: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      subsector: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      headquarters: {
        type: DataTypes.STRING(200),
        allowNull: false
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
