import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface StockPerformanceScoreAttributes {
  id: number;
  stock_id: number;
  score: string; // Text field that accepts numbers 1-100
  createdAt?: Date;
  updatedAt?: Date;
}

type StockPerformanceScoreCreationAttributes = Optional<
  StockPerformanceScoreAttributes,
  "id" | "createdAt" | "updatedAt"
>;

class StockPerformanceScore
  extends Model<StockPerformanceScoreAttributes, StockPerformanceScoreCreationAttributes>
  implements StockPerformanceScoreAttributes
{
  public id!: number;
  public stock_id!: number;
  public score!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
export function initializeStockPerformanceScoreModel(sequelize: Sequelize) {
  StockPerformanceScore.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      score: {
        type: DataTypes.STRING(3), // Max 3 characters for "100"
        allowNull: false,
        validate: {
          isNumeric: true,
          min: 1,
          max: 100
        }
      }
    }, {
      sequelize,
      modelName: "StockPerformanceScore",
      tableName: "stock_performance_scores",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StockPerformanceScore;
}

export default StockPerformanceScore;
