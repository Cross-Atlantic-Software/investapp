import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface UserWalletAttributes {
  id: number;
  user_id: number;
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

interface UserWalletCreationAttributes extends Optional<UserWalletAttributes, 'id' | 'available_balance' | 'pending_balance' | 'total_deposited' | 'total_withdrawn' | 'last_updated' | 'created_at' | 'updated_at'> {}

export class UserWallet extends Model<UserWalletAttributes, UserWalletCreationAttributes> implements UserWalletAttributes {
  public id!: number;
  public user_id!: number;
  public available_balance!: number;
  public pending_balance!: number;
  public total_deposited!: number;
  public total_withdrawn!: number;
  public last_updated!: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeUserWalletModel(sequelize: Sequelize) {
  UserWallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true, // One wallet per user
        references: {
          model: 'users',
          key: 'id'
        }
      },
      available_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Available for trading'
      },
      pending_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Funds pending settlement'
      },
      total_deposited: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Lifetime total deposits'
      },
      total_withdrawn: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Lifetime total withdrawals'
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
      modelName: "UserWallet",
      tableName: "user_wallet",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['user_id'],
          name: 'unique_user_wallet'
        },
        {
          fields: ['user_id'],
          name: 'idx_user_id'
        },
        {
          fields: ['last_updated'],
          name: 'idx_last_updated'
        }
      ]
    }
  );
}

export default UserWallet;

