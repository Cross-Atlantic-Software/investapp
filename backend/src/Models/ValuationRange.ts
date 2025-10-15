import { Model, DataTypes, Sequelize } from 'sequelize';

export interface ValuationRangeAttributes {
  id: number;
  name: string;
  value: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ValuationRangeCreationAttributes {
  name: string;
  value: string;
  sort_order?: number;
}

export class ValuationRange extends Model<ValuationRangeAttributes, ValuationRangeCreationAttributes> implements ValuationRangeAttributes {
  public id!: number;
  public name!: string;
  public value!: string;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeValuationRangeModel(sequelize: Sequelize) {
  ValuationRange.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      tableName: 'valuation_ranges',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default ValuationRange;
