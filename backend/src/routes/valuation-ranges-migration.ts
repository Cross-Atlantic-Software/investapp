import express from "express";
import { db, sequelizePromise } from "../utils/database";

const router = express.Router();

// Create valuation_ranges table
router.post("/create-valuation-ranges-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-valuation-ranges-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'valuation_ranges'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'valuation_ranges' already exists");
      return res.json({
        success: true,
        message: "Table 'valuation_ranges' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE valuation_ranges (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL UNIQUE,
        min_value DECIMAL(15,2) NULL,
        max_value DECIMAL(15,2) NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort_order (sort_order),
        INDEX idx_value (value)
      )
    `);
    
    // Insert default ranges
    await db.sequelize.query(`
      INSERT INTO valuation_ranges (name, value, min_value, max_value, sort_order) VALUES
      ('Below 1000 Cr', 'below-1000', 0, 1000, 1),
      ('1000-2500 Cr', '1000-2500', 1000, 2500, 2),
      ('2500-5000 Cr', '2500-5000', 2500, 5000, 3),
      ('5000+ Cr', '5000-plus', 5000, NULL, 4)
    `);
    
    console.log("✅ Created valuation_ranges table with default data");
    
    res.json({
      success: true,
      message: "Valuation ranges table created successfully with default data"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
