import { sequelizePromise, db } from "../utils/database";
import { UserRole } from "../utils/Roles";

const EMAIL = "superadmin@investapp.local";
const PASSWORD = "IBtlu6tucjLb";

async function main() {
  await sequelizePromise;

  const existing = await db.CmsUser.findOne({ where: { email: EMAIL } });
  if (existing) {
    console.log("Super admin already exists:", EMAIL);
    process.exit(0);
  }

  const user = await db.CmsUser.create({
    first_name: "Super",
    last_name: "Admin",
    email: EMAIL,
    password: PASSWORD,
    role: UserRole.SuperAdmin,
    auth_provider: "SuperAdmin",
    status: 1,
    email_verified: 1,
  });

  console.log("✅ Super admin created.");
  console.log("id:", user.id);
  console.log("email:", EMAIL);
  console.log("password:", PASSWORD);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to create super admin:", err);
  process.exit(1);
});
