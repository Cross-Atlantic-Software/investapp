import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface InsightTopicAttributes {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface InsightTopicCreationAttributes extends Optional<InsightTopicAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class InsightTopic extends Model<InsightTopicAttributes, InsightTopicCreationAttributes> implements InsightTopicAttributes {
  public id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeInsightTopicModel(sequelize: Sequelize) {
  InsightTopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'insight_topics',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'unique_insight_topic_name'
        },
        {
          fields: ['is_active'],
          name: 'idx_insight_topics_is_active'
        }
      ]
    }
  );
}

export default InsightTopic;

