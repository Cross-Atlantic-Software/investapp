import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface ThemeAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ThemeCreationAttributes extends Optional<ThemeAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Theme extends Model<ThemeAttributes, ThemeCreationAttributes> implements ThemeAttributes {
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeThemeModel(sequelize: Sequelize) {
  Theme.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Theme",
      tableName: "themes",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Theme;
}

export default Theme;

