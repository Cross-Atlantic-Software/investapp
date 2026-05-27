import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface NotableActivityAttributes {
  id: number;
  activity_type_ids: string; // JSON string of activity type IDs
  icon: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

interface NotableActivityCreationAttributes extends Optional<NotableActivityAttributes, 'id' | 'created_at' | 'updated_at'> {}

class NotableActivity extends Model<NotableActivityAttributes, NotableActivityCreationAttributes> implements NotableActivityAttributes {
  public id!: number;
  public activity_type_ids!: string;
  public icon!: string;
  public description!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeNotableActivityModel(sequelize: Sequelize) {
  NotableActivity.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      activity_type_ids: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "NotableActivity",
      tableName: "notable_activities",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return NotableActivity;
}

export default NotableActivity;
