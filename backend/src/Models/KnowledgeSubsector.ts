import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface KnowledgeSubsectorAttributes {
  id: number;
  knowledge_sector_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface KnowledgeSubsectorCreationAttributes extends Optional<KnowledgeSubsectorAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class KnowledgeSubsector extends Model<KnowledgeSubsectorAttributes, KnowledgeSubsectorCreationAttributes> implements KnowledgeSubsectorAttributes {
  public id!: number;
  public knowledge_sector_id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeKnowledgeSubsectorModel(sequelize: Sequelize) {
  KnowledgeSubsector.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      knowledge_sector_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'knowledge_sectors',
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
      tableName: 'knowledge_subsectors',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['knowledge_sector_id'],
          name: 'idx_knowledge_subsectors_sector_id'
        },
        {
          fields: ['is_active'],
          name: 'idx_knowledge_subsectors_is_active'
        },
        {
          unique: true,
          fields: ['knowledge_sector_id', 'name'],
          name: 'unique_knowledge_subsector_per_sector'
        }
      ]
    }
  );
}

export default KnowledgeSubsector;
