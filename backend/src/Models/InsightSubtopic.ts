import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface InsightSubtopicAttributes {
  id: number;
  insight_topic_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface InsightSubtopicCreationAttributes extends Optional<InsightSubtopicAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class InsightSubtopic extends Model<InsightSubtopicAttributes, InsightSubtopicCreationAttributes> implements InsightSubtopicAttributes {
  public id!: number;
  public insight_topic_id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeInsightSubtopicModel(sequelize: Sequelize) {
  InsightSubtopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      insight_topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'insight_topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      tableName: 'insight_subtopics',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['insight_topic_id'],
          name: 'idx_insight_subtopics_topic_id'
        },
        {
          fields: ['is_active'],
          name: 'idx_insight_subtopics_is_active'
        },
        {
          unique: true,
          fields: ['insight_topic_id', 'name'],
          name: 'unique_insight_subtopic_per_topic'
        }
      ]
    }
  );
}

export default InsightSubtopic;

