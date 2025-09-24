import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcryptjs";

// Updated Roles
import { UserRole } from "../utils/Roles";

interface CmsUserAttributes {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  role: number; // numeric role
  phone?: string;
  status: number;
  country_code?: string;
  auth_provider: string;
  email_verified?: number;
  phone_verified?: number;
  last_active?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type CmsUserCreationAttributes = Optional<
  CmsUserAttributes,
  "id" | "status" | "email_verified" | "phone_verified" | "auth_provider"
>;

class CmsUser
  extends Model<CmsUserAttributes, CmsUserCreationAttributes>
  implements CmsUserAttributes
{
  public id!: number;
  public first_name?: string;
  public last_name?: string;
  public email!: string;
  public password!: string;
  public role!: number;
  public phone?: string;
  public status!: number;
  public country_code?: string;
  public email_verified?: number;
  public phone_verified?: number;
  public phone_verified_code?: number;
  public email_verified_code?: number;
  public auth_provider!: string;
  public last_active?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// Initialize the model
export function initializeCmsUserModel(sequelize: Sequelize) {
  CmsUser.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: { type: DataTypes.STRING },
      last_name: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: UserRole.Blogger, // Default role set to BLOGGER (12)
        validate: {
          isIn: [[
            UserRole.Admin,
            UserRole.SuperAdmin,
            UserRole.Blogger,
            UserRole.SiteManager,
          ]],
        },
      },
      auth_provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Admin", // Default for admin-created users
        validate: {
          isIn: [[
            "Admin",
            "SuperAdmin",
            "Email",
            "Google",
            "Phone",
          ]],
        },
      },
      phone: { type: DataTypes.STRING },
      status: { type: DataTypes.INTEGER, defaultValue: 1 },
      country_code: { type: DataTypes.STRING },
      email_verified: { type: DataTypes.INTEGER, defaultValue: 1 }, // Admin-created users are verified
      phone_verified: { type: DataTypes.INTEGER, defaultValue: 0 },
      last_active: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "CmsUser",
      tableName: "cms_users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user: CmsUser) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user: CmsUser) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return CmsUser;
}

export default CmsUser;
