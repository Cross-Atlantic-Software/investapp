import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface ActivityTypeAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ActivityTypeCreationAttributes extends Optional<ActivityTypeAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ActivityType extends Model<ActivityTypeAttributes, ActivityTypeCreationAttributes> implements ActivityTypeAttributes {
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeActivityTypeModel(sequelize: Sequelize) {
  ActivityType.init(
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
      modelName: "ActivityType",
      tableName: "activity_types",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ActivityType;
}

export default ActivityType;
