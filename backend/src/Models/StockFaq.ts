import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface StockFaqAttributes {
  id: number;
  stock_id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface StockFaqCreationAttributes extends Optional<StockFaqAttributes, 'id' | 'display_order' | 'is_active' | 'created_at' | 'updated_at'> {}

export class StockFaq extends Model<StockFaqAttributes, StockFaqCreationAttributes> implements StockFaqAttributes {
  public id!: number;
  public stock_id!: number;
  public question!: string;
  public answer!: string;
  public display_order!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): typeof StockFaq {
    StockFaq.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        stock_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          }
        },
        question: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        answer: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        display_order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
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
        tableName: 'stock_faq',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    );

    return StockFaq;
  }
}

export function initializeStockFaqModel(sequelize: Sequelize): typeof StockFaq {
  return StockFaq.initialize(sequelize);
}

