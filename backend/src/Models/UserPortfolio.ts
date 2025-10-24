import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface UserPortfolioAttributes {
  id: number;
  user_id: number;
  total_investment: number;
  holding_number: number;
  price_change: number;
  percentage_change: number;
  portfolio_performance_score?: number;
  created_at: Date;
  updated_at: Date;
}

interface UserPortfolioCreationAttributes {
  user_id: number;
  total_investment: number;
  holding_number: number;
  price_change: number;
  percentage_change: number;
  portfolio_performance_score?: number;
}

export class UserPortfolio extends Model<UserPortfolioAttributes, UserPortfolioCreationAttributes> implements UserPortfolioAttributes {
  public id!: number;
  public user_id!: number;
  public total_investment!: number;
  public holding_number!: number;
  public price_change!: number;
  public percentage_change!: number;
  public portfolio_performance_score?: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeUserPortfolioModel(sequelize: Sequelize) {
  UserPortfolio.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One portfolio per user
        references: {
          model: 'users',
          key: 'id'
        }
      },
      total_investment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      holding_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      price_change: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      percentage_change: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      portfolio_performance_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "UserPortfolio",
      tableName: "user_portfolio",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['user_id'],
          name: 'unique_user_portfolio'
        },
        {
          fields: ['total_investment'],
          name: 'idx_user_portfolio_total_investment'
        },
        {
          fields: ['portfolio_performance_score'],
          name: 'idx_user_portfolio_performance_score'
        }
      ]
    }
  );
}

export default UserPortfolio;
