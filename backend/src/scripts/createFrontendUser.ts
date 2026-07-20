import { sequelizePromise, db } from "../utils/database";
import { UserRole } from "../utils/Roles";

const EMAIL = "testuser@example.com";
const PASSWORD = "yQSa9qLH9jqf";

async function main() {
  await sequelizePromise;

  const existing = await db.User.findOne({ where: { email: EMAIL } });
  if (existing) {
    console.log("Frontend test user already exists:", EMAIL);
    process.exit(0);
  }

  const user = await db.User.create({
    first_name: "Test",
    last_name: "User",
    email: EMAIL,
    password: PASSWORD,
    role: UserRole.RetailInvestor,
    auth_provider: "Email",
    status: 1,
    email_verified: 1,
  });

  console.log("✅ Frontend test user created.");
  console.log("id:", user.id);
  console.log("email:", EMAIL);
  console.log("password:", PASSWORD);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to create frontend user:", err);
  process.exit(1);
});
