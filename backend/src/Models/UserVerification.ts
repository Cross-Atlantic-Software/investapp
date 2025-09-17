import { DataTypes, Model , Sequelize} from "sequelize";

class UserVerification extends Model {
  public id!: number;
  public user_id!: number;
  public token!: string;
  public type!: string;
  public expires_at!: Date;
}

export function initializeUserVerificationModel(sequelize: Sequelize) {
UserVerification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "UserVerification" , tableName: "user_verifications",timestamps: true, }
);
return UserVerification;
}

export default UserVerification;