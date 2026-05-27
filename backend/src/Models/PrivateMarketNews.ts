import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface PrivateMarketNewsAttributes {
  id: number;
  title: string;
  url: string;
  icon: string;
  taxonomy_ids: string; // JSON string of taxonomy IDs
  created_at?: Date;
  updated_at?: Date;
}

interface PrivateMarketNewsCreationAttributes extends Optional<PrivateMarketNewsAttributes, 'id' | 'created_at' | 'updated_at'> {}

class PrivateMarketNews extends Model<PrivateMarketNewsAttributes, PrivateMarketNewsCreationAttributes> implements PrivateMarketNewsAttributes {
  public id!: number;
  public title!: string;
  public url!: string;
  public icon!: string;
  public taxonomy_ids!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializePrivateMarketNewsModel(sequelize: Sequelize) {
  PrivateMarketNews.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      taxonomy_ids: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
      },
    },
    {
      sequelize,
      modelName: "PrivateMarketNews",
      tableName: "private_market_news",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PrivateMarketNews;
}

export default PrivateMarketNews;
