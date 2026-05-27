import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface StockMasterAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface StockMasterCreationAttributes extends Optional<StockMasterAttributes, 'id' | 'created_at' | 'updated_at'> {}

class StockMaster extends Model<StockMasterAttributes, StockMasterCreationAttributes> implements StockMasterAttributes {
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeStockMasterModel(sequelize: Sequelize) {
  StockMaster.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "StockMaster",
      tableName: "stock_master",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StockMaster;
}

export default StockMaster;
