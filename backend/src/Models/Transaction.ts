import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TransactionAttributes {
  id: number;
  user_id: number;
  stock_id: number;
  buy_request_id: number;
  transaction_type: 'buy' | 'sell';
  status: 'pending' | 'completed' | 'rejected';
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees: number | null;
  taxes: number | null;
  net_amount: number | null;
  transaction_id: string;
  order_date: Date;
  execution_date: Date | null;
  settlement_date: Date | null;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  admin_approved_by: number | null;
  admin_approved_at: Date | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'fees' | 'taxes' | 'net_amount' | 'execution_date' | 'settlement_date' | 'admin_approved_by' | 'admin_approved_at' | 'rejection_reason' | 'notes' | 'created_at' | 'updated_at'> {}

export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public user_id!: number;
  public stock_id!: number;
  public buy_request_id!: number;
  public transaction_type!: 'buy' | 'sell';
  public status!: 'pending' | 'completed' | 'rejected';
  public quantity!: number;
  public price_per_unit!: number;
  public total_amount!: number;
  public fees!: number | null;
  public taxes!: number | null;
  public net_amount!: number | null;
  public transaction_id!: string;
  public order_date!: Date;
  public execution_date!: Date | null;
  public settlement_date!: Date | null;
  public payment_method!: string;
  public payment_status!: 'pending' | 'completed' | 'failed';
  public admin_approved_by!: number | null;
  public admin_approved_at!: Date | null;
  public rejection_reason!: string | null;
  public notes!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeTransactionModel(sequelize: Sequelize) {
  Transaction.init(
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
      buy_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'buy_requests',
          key: 'id',
        },
      },
      transaction_type: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price_per_unit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      taxes: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      transaction_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      execution_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      settlement_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'manual',
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'completed',
      },
      admin_approved_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'cms_users',
          key: 'id',
        },
      },
      admin_approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
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
      tableName: 'transactions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['user_id'],
          name: 'idx_user_id'
        },
        {
          fields: ['stock_id'],
          name: 'idx_stock_id'
        },
        {
          fields: ['buy_request_id'],
          name: 'idx_buy_request_id'
        },
        {
          fields: ['transaction_id'],
          name: 'idx_transaction_id',
          unique: true
        },
        {
          fields: ['status'],
          name: 'idx_status'
        },
        {
          fields: ['order_date'],
          name: 'idx_order_date'
        },
        {
          fields: ['created_at'],
          name: 'idx_created_at'
        }
      ]
    }
  );
}

export default Transaction;

