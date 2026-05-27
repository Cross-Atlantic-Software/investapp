import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface TaxonomyAttributes {
  id: number;
  name: string;
  color: string; // Hex color code
  created_at?: Date;
  updated_at?: Date;
}

interface TaxonomyCreationAttributes extends Optional<TaxonomyAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Taxonomy extends Model<TaxonomyAttributes, TaxonomyCreationAttributes> implements TaxonomyAttributes {
  public id!: number;
  public name!: string;
  public color!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeTaxonomyModel(sequelize: Sequelize) {
  Taxonomy.init(
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
      color: {
        type: DataTypes.STRING(10), // Hex color code like #FF5733 or #000400
        allowNull: false,
        defaultValue: '#3B82F6',
      },
    },
    {
      sequelize,
      modelName: "Taxonomy",
      tableName: "taxonomies",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Taxonomy;
}

export default Taxonomy;
