import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface SubsectorAttributes {
  id: number;
  sector_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface SubsectorCreationAttributes extends Optional<SubsectorAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Subsector extends Model<SubsectorAttributes, SubsectorCreationAttributes> implements SubsectorAttributes {
  public id!: number;
  public sector_id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeSubsectorModel(sequelize: Sequelize) {
  Subsector.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sector_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sectors',
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
      tableName: 'subsectors',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['sector_id'],
          name: 'idx_subsectors_sector_id'
        },
        {
          fields: ['is_active'],
          name: 'idx_subsectors_is_active'
        },
        {
          unique: true,
          fields: ['sector_id', 'name'],
          name: 'unique_subsector_per_sector'
        }
      ]
    }
  );
}

export default Subsector;
