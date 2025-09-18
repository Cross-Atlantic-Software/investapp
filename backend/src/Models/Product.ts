import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface ProductAttributes {
  id: number;
  title: string;
  icon?: string;
  company_name?: string;
  price_per_share?: string;
  valuation?: string;
  price_change?: string;
  percentage_change?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<
  ProductAttributes,
  "id" | "icon" | "company_name" | "price_per_share" | "valuation" | "price_change" | "percentage_change"
>;

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public title!: string;
  public icon?: string;
  public company_name?: string;
  public price_per_share?: string;
  public valuation?: string;
  public price_change?: string;
  public percentage_change?: string;
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
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      icon: {
        type: DataTypes.STRING
      },
      company_name: {
        type: DataTypes.STRING
      },
      price_per_share: {
        type: DataTypes.STRING
      },
      valuation: {
        type: DataTypes.STRING
      },
      price_change: {
        type: DataTypes.STRING
      },
      percentage_change: {
        type: DataTypes.STRING
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
