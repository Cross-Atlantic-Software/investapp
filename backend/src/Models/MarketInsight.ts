import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface MarketInsightAttributes {
  id: number;
  slug: string;
  is_featured: boolean;
  title: string;
  blog_image: string;
  teaser: string;
  summary: string;
  first_part: string;
  second_part: string;
  insight_sector_id?: number;
  insight_subsector_id?: number;
  insight_topic_id?: number;
  insight_subtopic_id?: number;
  insight_theme_id?: number;
  created_at: Date;
  updated_at: Date;
}

interface MarketInsightCreationAttributes extends Optional<MarketInsightAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class MarketInsight extends Model<MarketInsightAttributes, MarketInsightCreationAttributes> implements MarketInsightAttributes {
  public id!: number;
  public slug!: string;
  public is_featured!: boolean;
  public title!: string;
  public blog_image!: string;
  public teaser!: string;
  public summary!: string;
  public first_part!: string;
  public second_part!: string;
  public insight_sector_id?: number;
  public insight_subsector_id?: number;
  public insight_topic_id?: number;
  public insight_subtopic_id?: number;
  public insight_theme_id?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeMarketInsightModel(sequelize: Sequelize) {
  MarketInsight.init(
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
      first_part: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      second_part: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      insight_sector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'insight_sectors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      insight_subsector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'insight_subsectors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      insight_topic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'insight_topics',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      insight_subtopic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'insight_subtopics',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      insight_theme_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'insight_themes',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      tableName: 'market_insights',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['slug'],
          name: 'unique_market_insight_slug'
        },
        {
          fields: ['is_featured'],
          name: 'idx_market_insights_is_featured'
        },
        {
          fields: ['insight_sector_id'],
          name: 'idx_market_insights_sector_id'
        },
        {
          fields: ['insight_subsector_id'],
          name: 'idx_market_insights_subsector_id'
        },
        {
          fields: ['insight_topic_id'],
          name: 'idx_market_insights_topic_id'
        },
        {
          fields: ['insight_subtopic_id'],
          name: 'idx_market_insights_subtopic_id'
        },
        {
          fields: ['insight_theme_id'],
          name: 'idx_market_insights_theme_id'
        }
      ]
    }
  );
}

export default MarketInsight;

