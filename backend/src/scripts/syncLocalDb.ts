import { sequelizePromise } from "../utils/database";

async function main() {
  const sequelize = await sequelizePromise;
  await sequelize.sync();
  console.log("✅ Schema created on local database.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to sync schema:", err);
  process.exit(1);
});
