import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface HomeInsightAttributes {
  id: number;
  title: string;
  file: string;
  created_at: Date;
  updated_at: Date;
}

interface HomeInsightCreationAttributes extends Optional<HomeInsightAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class HomeInsight extends Model<HomeInsightAttributes, HomeInsightCreationAttributes> implements HomeInsightAttributes {
  public id!: number;
  public title!: string;
  public file!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeHomeInsightModel(sequelize: Sequelize) {
  HomeInsight.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'S3 URL or file path'
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
      tableName: 'home_insights',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['created_at'],
          name: 'idx_home_insights_created_at'
        },
        {
          fields: ['updated_at'],
          name: 'idx_home_insights_updated_at'
        }
      ]
    }
  );
}

export default HomeInsight;

