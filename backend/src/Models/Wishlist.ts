import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface WishlistAttributes {
  id: number;
  user_id: number;
  stock_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface WishlistCreationAttributes extends Optional<WishlistAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Wishlist extends Model<WishlistAttributes, WishlistCreationAttributes> implements WishlistAttributes {
  public id!: number;
  public user_id!: number;
  public stock_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export function initializeWishlistModel(sequelize: Sequelize) {
  Wishlist.init(
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
      tableName: 'wishlist',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

export default Wishlist;
