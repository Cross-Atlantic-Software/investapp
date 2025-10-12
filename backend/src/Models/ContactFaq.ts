import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ContactFaqAttributes {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFaqCreationAttributes {
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
}

class ContactFaq extends Model<ContactFaqAttributes, ContactFaqCreationAttributes> implements ContactFaqAttributes {
  public id!: number;
  public question!: string;
  public answer!: string;
  public display_order!: number;
  public is_active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initializeContactFaqModel(sequelize: Sequelize) {
  ContactFaq.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'contact_faq',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
}

export default ContactFaq;
