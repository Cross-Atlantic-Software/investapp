import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Interface for StockScorecard attributes
export interface StockScorecardAttributes {
  id: number;
  stock_id: number;
  category: string;
  score_value: number;
  score_tag: 'Low Risk' | 'Medium Risk' | 'High Risk';
  analysis: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for StockScorecard creation attributes
export interface StockScorecardCreationAttributes extends Optional<StockScorecardAttributes, 'id' | 'created_at' | 'updated_at'> {}

// StockScorecard model class
export class StockScorecardModel extends Model<StockScorecardAttributes, StockScorecardCreationAttributes> implements StockScorecardAttributes {
  public id!: number;
  public stock_id!: number;
  public category!: string;
  public score_value!: number;
  public score_tag!: 'Low Risk' | 'Medium Risk' | 'High Risk';
  public analysis!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the StockScorecard model
export const initializeStockScorecardModel = (sequelize: Sequelize) => {
  StockScorecardModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      score_value: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: false,
        validate: {
          min: 0,
          max: 10,
        },
      },
      score_tag: {
        type: DataTypes.ENUM('Low Risk', 'Medium Risk', 'High Risk'),
        allowNull: false,
      },
      analysis: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'stock_scorecards',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['stock_id'],
        },
        {
          fields: ['category'],
        },
        {
          fields: ['score_tag'],
        },
        {
          fields: ['created_at'],
        },
        {
          unique: true,
          fields: ['stock_id', 'category'],
          name: 'unique_stock_category',
        },
      ],
    }
  );
};

export default StockScorecardModel;
