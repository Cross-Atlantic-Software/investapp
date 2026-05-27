import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface EmailTemplateAttributes {
  id: number;
  type: string;
  subject: string;
  body: string;
  created_by: number;
  updated_by: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailTemplateCreationAttributes extends Optional<EmailTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class EmailTemplate extends Model<EmailTemplateAttributes, EmailTemplateCreationAttributes> implements EmailTemplateAttributes {
  public id!: number;
  public type!: string;
  public subject!: string;
  public body!: string;
  public created_by!: number;
  public updated_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initializeEmailTemplateModel(sequelize: Sequelize) {
  EmailTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'email_templates',
      timestamps: true,
    }
  );
  return EmailTemplate;
}

export default EmailTemplate;
