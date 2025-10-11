import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface FinancialDataCsvAttributes {
  id: number;
  stock_id: number;
  category: string;
  original_filename: string;
  s3_key: string;
  s3_url: string;
  file_size: number;
  uploaded_at: Date;
  csv_content: string;
  created_at: Date;
  updated_at: Date;
}

interface FinancialDataCsvCreationAttributes extends Optional<FinancialDataCsvAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class FinancialDataCsv extends Model<FinancialDataCsvAttributes, FinancialDataCsvCreationAttributes> implements FinancialDataCsvAttributes {
  public id!: number;
  public stock_id!: number;
  public category!: string;
  public original_filename!: string;
  public s3_key!: string;
  public s3_url!: string;
  public file_size!: number;
  public uploaded_at!: Date;
  public csv_content!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the model
export function initializeFinancialDataCsvModel(sequelize: Sequelize) {
  FinancialDataCsv.init(
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
        type: DataTypes.ENUM('income_statement', 'balance_sheet', 'cash_flow'),
        allowNull: false,
      },
      original_filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      s3_key: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      s3_url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      csv_content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
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
      tableName: 'financial_data_csv',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['stock_id', 'category'],
          name: 'unique_stock_category'
        },
        {
          fields: ['stock_id'],
          name: 'idx_financial_data_csv_stock_id'
        },
        {
          fields: ['category'],
          name: 'idx_financial_data_csv_category'
        }
      ]
    }
  );
}

export default FinancialDataCsv;
