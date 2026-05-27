import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface KnowledgeSubtopicAttributes {
  id: number;
  knowledge_topic_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface KnowledgeSubtopicCreationAttributes extends Optional<KnowledgeSubtopicAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class KnowledgeSubtopic extends Model<KnowledgeSubtopicAttributes, KnowledgeSubtopicCreationAttributes> implements KnowledgeSubtopicAttributes {
  public id!: number;
  public knowledge_topic_id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeKnowledgeSubtopicModel(sequelize: Sequelize) {
  KnowledgeSubtopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      knowledge_topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'knowledge_topics',
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
      tableName: 'knowledge_subtopics',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['knowledge_topic_id'],
          name: 'idx_knowledge_subtopics_topic_id'
        },
        {
          fields: ['is_active'],
          name: 'idx_knowledge_subtopics_is_active'
        },
        {
          unique: true,
          fields: ['knowledge_topic_id', 'name'],
          name: 'unique_knowledge_subtopic_per_topic'
        }
      ]
    }
  );
}

export default KnowledgeSubtopic;
