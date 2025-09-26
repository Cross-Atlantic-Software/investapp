import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface BulkDealsAttributes {
  id: number;
  icon: string;
  value: string;
  label: string;
  created_at?: Date;
  updated_at?: Date;
}

interface BulkDealsCreationAttributes extends Optional<BulkDealsAttributes, 'id' | 'created_at' | 'updated_at'> {}

class BulkDeals extends Model<BulkDealsAttributes, BulkDealsCreationAttributes> implements BulkDealsAttributes {
  public id!: number;
  public icon!: string;
  public value!: string;
  public label!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeBulkDealsModel(sequelize: Sequelize) {
  BulkDeals.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      label: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BulkDeals",
      tableName: "bulk_deals",
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return BulkDeals;
}

export default BulkDeals;
