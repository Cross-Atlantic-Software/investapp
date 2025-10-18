import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface InsightSubsectorAttributes {
  id: number;
  insight_sector_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface InsightSubsectorCreationAttributes extends Optional<InsightSubsectorAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class InsightSubsector extends Model<InsightSubsectorAttributes, InsightSubsectorCreationAttributes> implements InsightSubsectorAttributes {
  public id!: number;
  public insight_sector_id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeInsightSubsectorModel(sequelize: Sequelize) {
  InsightSubsector.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      insight_sector_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'insight_sectors',
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
      tableName: 'insight_subsectors',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['insight_sector_id'],
          name: 'idx_insight_subsectors_sector_id'
        },
        {
          fields: ['is_active'],
          name: 'idx_insight_subsectors_is_active'
        },
        {
          unique: true,
          fields: ['insight_sector_id', 'name'],
          name: 'unique_insight_subsector_per_sector'
        }
      ]
    }
  );
}

export default InsightSubsector;

