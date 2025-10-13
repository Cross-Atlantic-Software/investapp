import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface PriceChangePeriodAttributes {
  id: number;
  period: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PriceChangePeriodCreationAttributes extends Optional<PriceChangePeriodAttributes, 'id' | 'created_at' | 'updated_at'> {}

class PriceChangePeriod extends Model<PriceChangePeriodAttributes, PriceChangePeriodCreationAttributes> implements PriceChangePeriodAttributes {
  public id!: number;
  public period!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializePriceChangePeriodModel(sequelize: Sequelize) {
  PriceChangePeriod.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      period: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "PriceChangePeriod",
      tableName: "price_change_period",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PriceChangePeriod;
}

export default PriceChangePeriod;
