import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface KYCApplicationAttributes {
  id: number;
  user_id: number;
  pan_number: string;
  name_pan: string;
  dob: Date;
  father_name: string;
  residency_status: 'Indian' | 'NRI';
  aadhar_number: string;
  account_number: string;
  ifsc_code: string;
  bank_proof: string;
  demat_type: 'Individual' | 'Joint' | 'NRI(repatriable)' | 'Non-repatriable NRI' | 'Corporate' | 'Minor' | 'HUF' | 'Trust/Society/Partnership';
  demat_account_id: string;
  sign: string;
  pan: string;
  aadhar: string;
  demat: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface KYCApplicationCreationAttributes extends Optional<KYCApplicationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class KYCApplication extends Model<KYCApplicationAttributes, KYCApplicationCreationAttributes> implements KYCApplicationAttributes {
  public id!: number;
  public user_id!: number;
  public pan_number!: string;
  public name_pan!: string;
  public dob!: Date;
  public father_name!: string;
  public residency_status!: 'Indian' | 'NRI';
  public aadhar_number!: string;
  public account_number!: string;
  public ifsc_code!: string;
  public bank_proof!: string;
  public demat_type!: 'Individual' | 'Joint' | 'NRI(repatriable)' | 'Non-repatriable NRI' | 'Corporate' | 'Minor' | 'HUF' | 'Trust/Society/Partnership';
  public demat_account_id!: string;
  public sign!: string;
  public pan!: string;
  public aadhar!: string;
  public demat!: string;
  public status!: 'pending' | 'verified' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
export function initializeKYCApplicationModel(sequelize: Sequelize) {
  KYCApplication.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      pan_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      name_pan: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      father_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      residency_status: {
        type: DataTypes.ENUM('Indian', 'NRI'),
        allowNull: false,
        defaultValue: 'Indian',
      },
      aadhar_number: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      account_number: {
        type: DataTypes.STRING(18),
        allowNull: false,
      },
      ifsc_code: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      bank_proof: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      demat_type: {
        type: DataTypes.ENUM('Individual', 'Joint', 'NRI(repatriable)', 'Non-repatriable NRI', 'Corporate', 'Minor', 'HUF', 'Trust/Society/Partnership'),
        allowNull: false,
      },
      demat_account_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      sign: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      pan: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      aadhar: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      demat: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
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
      tableName: 'kyc_applications',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
}

export default KYCApplication;
