import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface ValuationAttributes {
  id: number;
  valuation_name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ValuationCreationAttributes extends Optional<ValuationAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Valuation extends Model<ValuationAttributes, ValuationCreationAttributes> implements ValuationAttributes {
  public id!: number;
  public valuation_name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeValuationModel(sequelize: Sequelize) {
  Valuation.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      valuation_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Valuation",
      tableName: "valuations",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Valuation;
}

export default Valuation;

