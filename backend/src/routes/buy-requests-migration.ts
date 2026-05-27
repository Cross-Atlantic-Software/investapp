import express from "express";
import { db, sequelizePromise } from "../utils/database";

const router = express.Router();

// Create buy_requests table
router.post("/create-buy-requests-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-buy-requests-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'buy_requests'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'buy_requests' already exists");
      return res.json({
        success: true,
        message: "Table 'buy_requests' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE buy_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        stock_id INT NOT NULL,
        stock_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_stock_id (stock_id),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log("✅ Created buy_requests table successfully");
    
    res.json({
      success: true,
      message: "Buy requests table created successfully"
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

