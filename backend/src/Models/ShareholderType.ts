import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface ShareholderTypeAttributes {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShareholderTypeCreationAttributes extends Optional<ShareholderTypeAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

export class ShareholderType extends Model<ShareholderTypeAttributes, ShareholderTypeCreationAttributes> implements ShareholderTypeAttributes {
  public id!: number;
  public name!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeShareholderTypeModel(sequelize: Sequelize) {
  ShareholderType.init(
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
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'shareholder_types',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default ShareholderType;
