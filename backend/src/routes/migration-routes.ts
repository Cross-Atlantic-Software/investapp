import express from "express";
import { db } from "../utils/database";

const router = express.Router();

// Run migration to create stock_price_data table
router.post("/create-stock-price-data-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-stock-price-data-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'stock_price_data'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'stock_price_data' already exists");
      return res.json({
        success: true,
        message: "Table 'stock_price_data' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE stock_price_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        stock_id INT NOT NULL,
        date DATE NOT NULL,
        open_price DECIMAL(10,2) NOT NULL,
        high_price DECIMAL(10,2) NOT NULL,
        low_price DECIMAL(10,2) NOT NULL,
        close_price DECIMAL(10,2) NOT NULL,
        volume BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (stock_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_stock_date (stock_id, date),
        INDEX idx_stock_date (stock_id, date),
        INDEX idx_date (date)
      )
    `);
    
    console.log("✅ Created stock_price_data table successfully");
    
    res.json({
      success: true,
      message: "Stock price data table created successfully"
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

// Run migration to create stock_drafts table
router.post("/create-stock-drafts-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-stock-drafts-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'stock_drafts'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'stock_drafts' already exists");
      return res.json({
        success: true,
        message: "Table 'stock_drafts' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE stock_drafts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_user_id VARCHAR(255) NOT NULL,
        draft_data JSON NOT NULL,
        current_step INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 7 DAY),
        INDEX idx_admin_user (admin_user_id),
        INDEX idx_expires_at (expires_at)
      )
    `);
    
    console.log("✅ Created stock_drafts table successfully");
    
    res.json({
      success: true,
      message: "Stock drafts table created successfully"
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

// Run migration to create shareholder_types table
router.post("/create-shareholder-types-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-shareholder-types-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'shareholder_types'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'shareholder_types' already exists");
      return res.json({
        success: true,
        message: "Table 'shareholder_types' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE shareholder_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default shareholder types
    await db.sequelize.query(`
      INSERT INTO shareholder_types (name) VALUES
      ('Promoters'),
      ('Institutional Investors'),
      ('Foreign Institutional Investors'),
      ('Retail Investors'),
      ('High Net Worth Individuals'),
      ('Employee Stock Ownership'),
      ('Government'),
      ('Other')
    `);
    
    console.log("✅ Created shareholder_types table successfully");
    
    res.json({
      success: true,
      message: "Shareholder types table created successfully"
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

// Run migration to add shareholder_type_id column to stock_shareholding
router.post("/add-shareholder-type-to-stock-shareholding", async (req, res) => {
  try {
    console.log("🔄 Running migration: add-shareholder-type-to-stock-shareholding");
    
    // Check if column already exists
    const [results] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'stock_shareholding' 
      AND COLUMN_NAME = 'shareholder_type_id'
    `);

    if (results.length > 0) {
      console.log("✅ Column 'shareholder_type_id' already exists");
      return res.json({
        success: true,
        message: "Column 'shareholder_type_id' already exists"
      });
    }

    // Add the column
    await db.sequelize.query(`
      ALTER TABLE stock_shareholding 
      ADD COLUMN shareholder_type_id INT NULL,
      ADD CONSTRAINT fk_stock_shareholding_shareholder_type 
      FOREIGN KEY (shareholder_type_id) REFERENCES shareholder_types(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    
    console.log("✅ Added shareholder_type_id column successfully");
    
    res.json({
      success: true,
      message: "Shareholder type column added successfully"
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

// Run migration to create stock_news_section table
router.post("/create-stock-news-section-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-stock-news-section-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'stock_news_section'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'stock_news_section' already exists");
      return res.json({
        success: true,
        message: "Table 'stock_news_section' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE stock_news_section (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        stock_id INT NOT NULL,
        url VARCHAR(500) NOT NULL,
        banner VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (stock_id) REFERENCES products(id) ON DELETE CASCADE,
        
        INDEX idx_stock_news_stock_id (stock_id),
        INDEX idx_stock_news_created_at (created_at)
      )
    `);
    
    console.log("✅ Created stock_news_section table successfully");
    
    res.json({
      success: true,
      message: "Stock news section table created successfully"
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