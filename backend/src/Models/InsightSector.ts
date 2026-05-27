import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface InsightSectorAttributes {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface InsightSectorCreationAttributes extends Optional<InsightSectorAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class InsightSector extends Model<InsightSectorAttributes, InsightSectorCreationAttributes> implements InsightSectorAttributes {
  public id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeInsightSectorModel(sequelize: Sequelize) {
  InsightSector.init(
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
      tableName: 'insight_sectors',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'unique_insight_sector_name'
        },
        {
          fields: ['is_active'],
          name: 'idx_insight_sectors_is_active'
        }
      ]
    }
  );
}

export default InsightSector;

