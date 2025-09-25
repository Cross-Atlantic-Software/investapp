import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface EnquiryAttributes {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface EnquiryCreationAttributes extends Optional<EnquiryAttributes, 'id' | 'phone' | 'company' | 'subject' | 'status' | 'createdAt' | 'updatedAt'> {}

class Enquiry extends Model<EnquiryAttributes, EnquiryCreationAttributes> implements EnquiryAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone?: string;
  public company?: string;
  public subject?: string;
  public message!: string;
  public status!: 'new' | 'read' | 'replied' | 'closed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Export function to initialize the model
export function initializeEnquiryModel(sequelize: Sequelize) {
  Enquiry.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('new', 'read', 'replied', 'closed'),
        defaultValue: 'new',
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'enquiries',
      timestamps: true,
    }
  );
}

export default Enquiry;
