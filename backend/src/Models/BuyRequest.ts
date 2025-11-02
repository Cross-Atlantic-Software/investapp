import { Model, DataTypes, Sequelize } from 'sequelize';

export interface BuyRequestAttributes {
  id: number;
  user_id: number;
  stock_id: number;
  stock_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  transaction_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BuyRequestCreationAttributes {
  user_id: number;
  stock_id: number;
  stock_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  transaction_id?: string | null;
}

export class BuyRequest extends Model<BuyRequestAttributes, BuyRequestCreationAttributes> implements BuyRequestAttributes {
  public id!: number;
  public user_id!: number;
  public stock_id!: number;
  public stock_name!: string;
  public quantity!: number;
  public price!: number;
  public total_amount!: number;
  public transaction_id!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeBuyRequestModel(sequelize: Sequelize) {
  BuyRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      stock_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
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
      tableName: 'buy_requests',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default BuyRequest;

