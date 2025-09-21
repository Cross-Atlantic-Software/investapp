import express from "express";
import { db } from "../utils/database";

const router = express.Router();

// Run migration to add last_active column
router.post("/add-last-active-column", async (req, res) => {
  try {
    console.log("🔄 Running migration: add-last-active-column");
    
    // Check if column already exists
    const [results] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'invest_app' 
      AND TABLE_NAME = 'cms_users' 
      AND COLUMN_NAME = 'last_active'
    `);

    if (results.length > 0) {
      console.log("✅ Column 'last_active' already exists, updating existing users...");
      
      // Update existing users to have their last_active set to their updatedAt timestamp
      await db.sequelize.query(`
        UPDATE cms_users 
        SET last_active = updatedAt 
        WHERE last_active IS NULL OR last_active = '0000-00-00 00:00:00'
      `);
      
      console.log("✅ Updated existing users with last_active timestamps");
    } else {
      console.log("📝 Adding last_active column...");
      
      // Add the last_active column
      await db.sequelize.query(`
        ALTER TABLE cms_users 
        ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      // Update existing users to have their last_active set to their updatedAt timestamp
      await db.sequelize.query(`
        UPDATE cms_users 
        SET last_active = updatedAt 
        WHERE last_active IS NULL
      `);
    }

    // Create indexes for better performance (with error handling for existing indexes)
    try {
      await db.sequelize.query(`
        CREATE INDEX idx_cms_users_last_active ON cms_users(last_active)
      `);
      console.log("✅ Created index on last_active");
    } catch (error: any) {
      if (error.message.includes('Duplicate key name')) {
        console.log("Index idx_cms_users_last_active already exists");
      } else {
        throw error;
      }
    }

    try {
      await db.sequelize.query(`
        CREATE INDEX idx_cms_users_role ON cms_users(role)
      `);
      console.log("✅ Created index on role");
    } catch (error: any) {
      if (error.message.includes('Duplicate key name')) {
        console.log("Index idx_cms_users_role already exists");
      } else {
        throw error;
      }
    }

    try {
      await db.sequelize.query(`
        CREATE INDEX idx_cms_users_auth_provider ON cms_users(auth_provider)
      `);
      console.log("✅ Created index on auth_provider");
    } catch (error: any) {
      if (error.message.includes('Duplicate key name')) {
        console.log("Index idx_cms_users_auth_provider already exists");
      } else {
        throw error;
      }
    }

    console.log("✅ Migration completed successfully");

    res.status(200).json({
      success: true,
      message: "Migration completed successfully"
    });

  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;