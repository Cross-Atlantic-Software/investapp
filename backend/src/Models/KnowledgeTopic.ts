import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface KnowledgeTopicAttributes {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface KnowledgeTopicCreationAttributes extends Optional<KnowledgeTopicAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class KnowledgeTopic extends Model<KnowledgeTopicAttributes, KnowledgeTopicCreationAttributes> implements KnowledgeTopicAttributes {
  public id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeKnowledgeTopicModel(sequelize: Sequelize) {
  KnowledgeTopic.init(
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
      tableName: 'knowledge_topics',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'unique_knowledge_topic_name'
        },
        {
          fields: ['is_active'],
          name: 'idx_knowledge_topics_is_active'
        }
      ]
    }
  );
}

export default KnowledgeTopic;
