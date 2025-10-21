import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface KnowledgeThemeAttributes {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface KnowledgeThemeCreationAttributes extends Optional<KnowledgeThemeAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class KnowledgeTheme extends Model<KnowledgeThemeAttributes, KnowledgeThemeCreationAttributes> implements KnowledgeThemeAttributes {
  public id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeKnowledgeThemeModel(sequelize: Sequelize) {
  KnowledgeTheme.init(
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
      tableName: 'knowledge_themes',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'unique_knowledge_theme_name'
        },
        {
          fields: ['is_active'],
          name: 'idx_knowledge_themes_is_active'
        }
      ]
    }
  );
}

export default KnowledgeTheme;
