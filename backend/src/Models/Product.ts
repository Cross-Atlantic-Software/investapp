import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface ProductAttributes {
  id: number;
  company_name: string;
  logo: string;
  price: number;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
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
  public price!: number;
  public price_change!: number;
  public teaser!: string;
  public short_description!: string;
  public analysis!: string;
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
      price: {
        type: DataTypes.DECIMAL(10, 2),
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
