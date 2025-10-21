import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface KnowledgeCenterAttributes {
  id: number;
  slug: string;
  is_featured: boolean;
  title: string;
  blog_image: string;
  teaser: string;
  summary: string;
  content_type: 'TEXT' | 'VIDEO';
  first_part?: string; // Required when content_type is TEXT
  second_part?: string; // Required when content_type is TEXT
  video_file?: string; // Required when content_type is VIDEO, S3 URL
  knowledge_sector_id?: number;
  knowledge_subsector_ids?: string; // JSON string of array
  knowledge_topic_id?: number;
  knowledge_subtopic_ids?: string; // JSON string of array
  knowledge_theme_id?: number;
  company_ids?: string; // JSON string of array
  created_at: Date;
  updated_at: Date;
}

interface KnowledgeCenterCreationAttributes extends Optional<KnowledgeCenterAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class KnowledgeCenter extends Model<KnowledgeCenterAttributes, KnowledgeCenterCreationAttributes> implements KnowledgeCenterAttributes {
  public id!: number;
  public slug!: string;
  public is_featured!: boolean;
  public title!: string;
  public blog_image!: string;
  public teaser!: string;
  public summary!: string;
  public content_type!: 'TEXT' | 'VIDEO';
  public first_part?: string;
  public second_part?: string;
  public video_file?: string;
  public knowledge_sector_id?: number;
  public knowledge_subsector_ids?: string;
  public knowledge_topic_id?: number;
  public knowledge_subtopic_ids?: string;
  public knowledge_theme_id?: number;
  public company_ids?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeKnowledgeCenterModel(sequelize: Sequelize) {
  KnowledgeCenter.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      blog_image: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      teaser: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content_type: {
        type: DataTypes.ENUM('TEXT', 'VIDEO'),
        allowNull: false,
        defaultValue: 'TEXT',
      },
      first_part: {
        type: DataTypes.TEXT,
        allowNull: true, // Required when content_type is TEXT
      },
      second_part: {
        type: DataTypes.TEXT,
        allowNull: true, // Required when content_type is TEXT
      },
      video_file: {
        type: DataTypes.STRING(500),
        allowNull: true, // Required when content_type is VIDEO
        comment: 'S3 URL for uploaded video file'
      },
      knowledge_sector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'knowledge_sectors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      knowledge_subsector_ids: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of subsector IDs array'
      },
      knowledge_topic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'knowledge_topics',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      knowledge_subtopic_ids: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of subtopic IDs array'
      },
      knowledge_theme_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'knowledge_themes',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      company_ids: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string of company IDs array'
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
      tableName: 'knowledge_centers',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['slug'],
          name: 'unique_knowledge_center_slug'
        },
        {
          fields: ['is_featured'],
          name: 'idx_knowledge_centers_is_featured'
        },
        {
          fields: ['content_type'],
          name: 'idx_knowledge_centers_content_type'
        },
        {
          fields: ['knowledge_sector_id'],
          name: 'idx_knowledge_centers_sector_id'
        },
        {
          fields: ['knowledge_topic_id'],
          name: 'idx_knowledge_centers_topic_id'
        },
        {
          fields: ['knowledge_theme_id'],
          name: 'idx_knowledge_centers_theme_id'
        }
      ]
    }
  );
}

export default KnowledgeCenter;
