import express from "express";
import { db, sequelizePromise } from "../utils/database";

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

// Stock FAQ migration
router.post('/create-stock-faq-table', async (req, res) => {
  try {
    console.log("🔄 Running migration: create-stock-faq-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'stock_faq'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'stock_faq' already exists");
      return res.json({
        success: true,
        message: "Stock FAQ table already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE stock_faq (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stock_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (stock_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_stock_faq_stock_id (stock_id),
        INDEX idx_stock_faq_active (is_active),
        INDEX idx_stock_faq_order (display_order)
      )
    `);
    
    console.log("✅ Created stock_faq table successfully");
    
    res.json({
      success: true,
      message: "Stock FAQ table created successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});


// Financial Data CSV table migration
router.post('/create-financial-data-csv-table', async (req, res) => {
  try {
    console.log("🔄 Running migration: create-financial-data-csv-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME = 'financial_data_csv'
    `);
    
    if ((results as any)[0].count > 0) {
      console.log("✅ Table 'financial_data_csv' already exists");
      
      // Check if csv_content column exists
      const [columnResults] = await db.sequelize.query(`
        SELECT COUNT(*) as count
        FROM information_schema.columns 
        WHERE table_schema = DATABASE()
        AND TABLE_NAME = 'financial_data_csv'
        AND COLUMN_NAME = 'csv_content'
      `);
      
      if ((columnResults as any)[0].count === 0) {
        console.log("🔄 Adding missing csv_content column");
        await db.sequelize.query(`
          ALTER TABLE financial_data_csv 
          ADD COLUMN csv_content LONGTEXT NOT NULL AFTER uploaded_at
        `);
        console.log("✅ Added csv_content column successfully");
      }
      
      return res.json({
        success: true,
        message: "Financial Data CSV table already exists and updated"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE financial_data_csv (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stock_id INT NOT NULL,
        category ENUM('income_statement', 'balance_sheet', 'cash_flow') NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        s3_key VARCHAR(500) NOT NULL,
        s3_url VARCHAR(1000) NOT NULL,
        file_size INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        csv_content LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (stock_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_stock_category (stock_id, category),
        INDEX idx_financial_data_csv_stock_id (stock_id),
        INDEX idx_financial_data_csv_category (category)
      )
    `);

    console.log("✅ Created financial_data_csv table successfully");
    res.json({
      success: true,
      message: "Financial Data CSV table created successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Sectors and Subsectors tables migration
router.post('/create-sectors-and-subsectors', async (req, res) => {
  try {
    console.log("🔄 Running migration: create-sectors-and-subsectors");
    
    // Check if sectors table already exists
    const [sectorsResults] = await db.sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME = 'sectors'
    `);
    
    if ((sectorsResults as any)[0].count > 0) {
      console.log("✅ Table 'sectors' already exists");
    } else {
      console.log("📝 Creating sectors table...");
      await db.sequelize.query(`
        CREATE TABLE sectors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Sectors table created");
    }

    // Check if subsectors table already exists
    const [subsectorsResults] = await db.sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME = 'subsectors'
    `);
    
    if ((subsectorsResults as any)[0].count > 0) {
      console.log("✅ Table 'subsectors' already exists");
    } else {
      console.log("📝 Creating subsectors table...");
      await db.sequelize.query(`
        CREATE TABLE subsectors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sector_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
        )
      `);
      console.log("✅ Subsectors table created");
    }

    // Check if products table has sector_ids and subsector_ids columns
    const [columnsResults] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME IN ('sector_ids', 'subsector_ids')
    `);
    
    const existingColumns = (columnsResults as any).map((row: any) => row.COLUMN_NAME);
    
    if (!existingColumns.includes('sector_ids')) {
      console.log("📝 Adding sector_ids column to products table...");
      await db.sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN sector_ids TEXT AFTER founded
      `);
      console.log("✅ sector_ids column added");
    } else {
      console.log("✅ sector_ids column already exists");
    }
    
    if (!existingColumns.includes('subsector_ids')) {
      console.log("📝 Adding subsector_ids column to products table...");
      await db.sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN subsector_ids TEXT AFTER sector_ids
      `);
      console.log("✅ subsector_ids column added");
    } else {
      console.log("✅ subsector_ids column already exists");
    }

    // Insert sample data if tables are empty
    const [sectorCount] = await db.sequelize.query(`SELECT COUNT(*) as count FROM sectors`);
    if ((sectorCount as any)[0].count === 0) {
      console.log("📝 Inserting sample sectors...");
      await db.sequelize.query(`
        INSERT INTO sectors (name) VALUES
        ('Technology'),
        ('Healthcare'),
        ('Finance'),
        ('Manufacturing'),
        ('Energy')
      `);
      console.log("✅ Sample sectors inserted");
    }

    const [subsectorCount] = await db.sequelize.query(`SELECT COUNT(*) as count FROM subsectors`);
    if ((subsectorCount as any)[0].count === 0) {
      console.log("📝 Inserting sample subsectors...");
      await db.sequelize.query(`
        INSERT INTO subsectors (sector_id, name) VALUES
        (1, 'Software'),
        (1, 'Hardware'),
        (1, 'Internet'),
        (2, 'Pharmaceuticals'),
        (2, 'Medical Devices'),
        (2, 'Healthcare Services'),
        (3, 'Banking'),
        (3, 'Insurance'),
        (3, 'Investment'),
        (4, 'Automotive'),
        (4, 'Aerospace'),
        (4, 'Chemicals'),
        (5, 'Oil & Gas'),
        (5, 'Renewable Energy'),
        (5, 'Utilities')
      `);
      console.log("✅ Sample subsectors inserted");
    }

    console.log("🎉 Migration completed successfully!");
    res.json({
      success: true,
      message: "Sectors and subsectors tables created successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Add missing columns to products table
router.post('/add-sector-columns-to-products', async (req, res) => {
  try {
    console.log("🔄 Adding sector_ids and subsector_ids columns to products table...");
    
    // Check if sector_ids column exists
    const [sectorIdsResults] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'sector_ids'
    `);
    
    if ((sectorIdsResults as any).length === 0) {
      console.log("📝 Adding sector_ids column...");
      await db.sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN sector_ids TEXT AFTER founded
      `);
      console.log("✅ sector_ids column added");
    } else {
      console.log("✅ sector_ids column already exists");
    }
    
    // Check if subsector_ids column exists
    const [subsectorIdsResults] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'subsector_ids'
    `);
    
    if ((subsectorIdsResults as any).length === 0) {
      console.log("📝 Adding subsector_ids column...");
      await db.sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN subsector_ids TEXT AFTER sector_ids
      `);
      console.log("✅ subsector_ids column added");
    } else {
      console.log("✅ subsector_ids column already exists");
    }

    console.log("🎉 Migration completed successfully!");
    res.json({
      success: true,
      message: "Sector columns added to products table successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Run migration to create KYC applications table
router.post("/create-kyc-applications-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-kyc-applications-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'kyc_applications'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'kyc_applications' already exists");
      return res.json({
        success: true,
        message: "Table 'kyc_applications' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE kyc_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        pan_number VARCHAR(10) NOT NULL,
        name_pan VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        father_name VARCHAR(255) NOT NULL,
        aadhar_number VARCHAR(12) NOT NULL,
        account_number VARCHAR(18) NOT NULL,
        ifsc_code VARCHAR(11) NOT NULL,
        bank_proof VARCHAR(500) NOT NULL,
        demat_type ENUM('Individual', 'Joint', 'NRI(repatriable)', 'Non-repatriable NRI', 'Corporate', 'Minor', 'HUF', 'Trust/Society/Partnership') NOT NULL,
        demat_account_id VARCHAR(50) NOT NULL,
        sign VARCHAR(500) NOT NULL,
        status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_pan_number (pan_number),
        INDEX idx_aadhar_number (aadhar_number)
      )
    `);
    
    console.log("✅ Created kyc_applications table successfully");
    
    res.json({
      success: true,
      message: "KYC applications table created successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

  // Add residency_status column to kyc_applications table
  router.post("/add-residency-status-to-kyc", async (req, res) => {
    try {
      // Check if column already exists
      const [results] = await db.sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'kyc_applications' 
        AND COLUMN_NAME = 'residency_status'
      `);

      if (results.length > 0) {
        return res.status(200).json({
          success: true,
          message: "residency_status column already exists in kyc_applications table"
        });
      }

      // Add the column
      await db.sequelize.query(`
        ALTER TABLE kyc_applications 
        ADD COLUMN residency_status ENUM('Indian', 'NRI') NOT NULL DEFAULT 'Indian' 
        AFTER father_name
      `);

      // Add index for better performance
      await db.sequelize.query(`
        CREATE INDEX idx_residency_status ON kyc_applications(residency_status)
      `);

      res.status(200).json({
        success: true,
        message: "Successfully added residency_status column to kyc_applications table"
      });
    } catch (error) {
      console.error("Error adding residency_status column:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add residency_status column",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add KYC verification email template
  router.post("/add-kyc-verification-email-template", async (req, res) => {
    try {
      // Ensure database is ready
      await sequelizePromise;
      
      // Check if template already exists
      const [results] = await db.sequelize.query(`
        SELECT id FROM email_templates WHERE type = 'KYC_Verification'
      `);

      if (results.length > 0) {
        return res.status(200).json({
          success: true,
          message: "KYC verification email template already exists"
        });
      }

      // Insert KYC verification email template
      await db.sequelize.query(`
        INSERT INTO email_templates (type, subject, body, created_by, updated_by, createdAt, updatedAt)
        VALUES (
          'KYC_Verification',
          'KYC Verification Complete - Welcome to InvestAPP',
          '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c5530; margin: 0; font-size: 28px;">🎉 KYC Verification Complete!</h1>
              </div>
              
              <div style="margin-bottom: 25px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  Dear {{userName}},
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  Congratulations! Your KYC (Know Your Customer) verification has been successfully completed and approved.
                </p>
              </div>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2c5530;">
                <h3 style="color: #2c5530; margin: 0 0 10px 0; font-size: 18px;">✅ What this means:</h3>
                <ul style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Your account is now fully verified and activated</li>
                  <li>You can start trading immediately</li>
                  <li>All investment features are now available to you</li>
                  <li>Your account is compliant with regulatory requirements</li>
                </ul>
              </div>
              
              <div style="margin: 25px 0;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  You can now log in to your account and start exploring investment opportunities in the private market.
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  If you have any questions or need assistance, please don''t hesitate to contact our support team.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://investapp.com/login" style="background-color: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                  Thank you for choosing InvestAPP for your investment journey.
                </p>
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                  Best regards,<br>
                  The InvestAPP Team
                </p>
              </div>
            </div>
          </div>',
          1,
          1,
          NOW(),
          NOW()
        )
      `);

      res.status(200).json({
        success: true,
        message: "KYC verification email template created successfully"
      });
    } catch (error) {
      console.error("Error creating KYC verification email template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create KYC verification email template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add KYC submission acknowledgement email template
  router.post("/add-kyc-submission-email-template", async (req, res) => {
    try {
      // Ensure database is ready
      await sequelizePromise;
      
      // Check if template already exists
      const [results] = await db.sequelize.query(`
        SELECT id FROM email_templates WHERE type = 'KYC_Submission'
      `);

      if (results.length > 0) {
        return res.status(200).json({
          success: true,
          message: "KYC submission email template already exists"
        });
      }

      // Insert KYC submission email template
      await db.sequelize.query(`
        INSERT INTO email_templates (type, subject, body, created_by, updated_by, createdAt, updatedAt)
        VALUES (
          'KYC_Submission',
          'KYC Application Submitted - InvestAPP',
          '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c5530; margin: 0; font-size: 28px;">✅ KYC Application Submitted</h1>
              </div>
              
              <div style="margin-bottom: 25px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  Dear {{userName}},
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  Thank you for submitting your KYC (Know Your Customer) application. We have successfully received your documents and information.
                </p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 18px;">📋 What happens next:</h3>
                <ul style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Your application is now under review by our verification team</li>
                  <li>Review typically takes 24-48 hours</li>
                  <li>You will receive an email notification once the review is complete</li>
                  <li>If additional documents are required, we will contact you</li>
                </ul>
              </div>
              
              <div style="margin: 25px 0;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  Please ensure all your submitted documents are valid and up-to-date. Once your KYC is verified, you will be able to start trading on our platform.
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                  If you have any questions or need assistance, please don''t hesitate to contact our support team.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://investapp.com/dashboard" style="background-color: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  View Dashboard
                </a>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                  Thank you for choosing InvestAPP for your investment journey.
                </p>
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                  Best regards,<br>
                  The InvestAPP Team
                </p>
              </div>
            </div>
          </div>',
          1,
          1,
          NOW(),
          NOW()
        )
      `);

      res.status(200).json({
        success: true,
        message: "KYC submission email template created successfully"
      });
    } catch (error) {
      console.error("Error creating KYC submission email template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create KYC submission email template",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create contact_faq table
  router.post("/create-contact-faq-table", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if table already exists
      const [results] = await db.sequelize.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'contact_faq'
      `);

      if (results.length > 0) {
        return res.status(200).json({
          success: true,
          message: "contact_faq table already exists"
        });
      }

      // Create contact_faq table
      await db.sequelize.query(`
        CREATE TABLE contact_faq (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          display_order INT NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await db.sequelize.query(`
        CREATE INDEX idx_contact_faq_display_order ON contact_faq(display_order)
      `);

      await db.sequelize.query(`
        CREATE INDEX idx_contact_faq_is_active ON contact_faq(is_active)
      `);

      res.status(200).json({
        success: true,
        message: "Successfully created contact_faq table"
      });
    } catch (error) {
      console.error("Error creating contact_faq table:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create contact_faq table",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });


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
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort_order (sort_order),
        INDEX idx_value (value)
      )
    `);
    
    // Insert default ranges
    await db.sequelize.query(`
      INSERT INTO valuation_ranges (name, value, sort_order) VALUES
      ('Below 1000 Cr', 'below-1000', 1),
      ('1000-2500 Cr', '1000-2500', 2),
      ('2500-5000 Cr', '2500-5000', 3),
      ('5000+ Cr', '5000-plus', 4)
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

// Insert default valuation ranges
router.post("/insert-default-valuation-ranges", async (req, res) => {
  try {
    console.log("🔄 Running migration: insert-default-valuation-ranges");
    
    // Check if data already exists
    const [existingData] = await db.sequelize.query(`
      SELECT COUNT(*) as count FROM valuation_ranges
    `) as [{ count: number }[], unknown];
    
    if (existingData[0].count > 0) {
      console.log("✅ Default valuation ranges already exist");
      return res.json({
        success: true,
        message: "Default valuation ranges already exist"
      });
    }

    // Insert default ranges
    await db.sequelize.query(`
      INSERT INTO valuation_ranges (name, value, sort_order, created_at, updated_at) VALUES
      ('Below 1000 Cr', 'below-1000', 1, NOW(), NOW()),
      ('1000-2500 Cr', '1000-2500', 2, NOW(), NOW()),
      ('2500-5000 Cr', '2500-5000', 3, NOW(), NOW()),
      ('5000+ Cr', '5000-plus', 4, NOW(), NOW())
    `);
    
    console.log("✅ Inserted default valuation ranges successfully");
    
    res.json({
      success: true,
      message: "Default valuation ranges inserted successfully"
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

  // Drop buy_request column from users table
  router.post("/drop-buy-request-from-users", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if column exists
      const [results] = await db.sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'buy_request'
      `);

      if (results.length === 0) {
        return res.status(200).json({
          success: true,
          message: "buy_request column does not exist in users table"
        });
      }

      // Drop buy_request column
      await db.sequelize.query(`
        ALTER TABLE users 
        DROP COLUMN buy_request
      `);

      res.status(200).json({
        success: true,
        message: "Successfully dropped buy_request column from users table"
      });
    } catch (error) {
      console.error("Error dropping buy_request column:", error);
      res.status(500).json({
        success: false,
        message: "Failed to drop buy_request column",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create price_change_period table and add column to products
  router.post("/create-price-change-period-table", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if price_change_period table already exists
      const [tableResults] = await db.sequelize.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'price_change_period'
      `);

      if (tableResults.length === 0) {
        // Create price_change_period table
        await db.sequelize.query(`
          CREATE TABLE price_change_period (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            period VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);

        // Insert default periods
        await db.sequelize.query(`
          INSERT INTO price_change_period (period) VALUES 
          ('1 Month'),
          ('3 Months'),
          ('6 Months'),
          ('12 Months'),
          ('2 Years'),
          ('3 Years'),
          ('5 Years')
        `);

        console.log("✅ Created price_change_period table with default periods");
      } else {
        console.log("✅ price_change_period table already exists");
      }

      // Check if price_change_period_id column already exists in products table
      const [columnResults] = await db.sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'price_change_period_id'
      `);

      if (columnResults.length === 0) {
        // Add price_change_period_id column to products table
        await db.sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN price_change_period_id INT 
          DEFAULT 4
          AFTER stock_master_ids
        `);

        console.log("✅ Added price_change_period_id column to products table");
      } else {
        console.log("✅ price_change_period_id column already exists in products table");
      }

      res.status(200).json({
        success: true,
        message: "Successfully created price_change_period table and added column to products"
      });
    } catch (error) {
      console.error("Error creating price_change_period table:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create price_change_period table",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Insert default price change periods
  router.post("/insert-default-price-change-periods", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if periods already exist
      const [existingPeriods] = await db.sequelize.query(`
        SELECT COUNT(*) as count FROM price_change_period
      `);

      if ((existingPeriods[0] as any).count > 0) {
        return res.status(200).json({
          success: true,
          message: "Default price change periods already exist"
        });
      }

      // Insert default periods
      await db.sequelize.query(`
        INSERT INTO price_change_period (period, created_at, updated_at) VALUES 
        ('1 Month', NOW(), NOW()),
        ('3 Months', NOW(), NOW()),
        ('6 Months', NOW(), NOW()),
        ('12 Months', NOW(), NOW()),
        ('2 Years', NOW(), NOW()),
        ('3 Years', NOW(), NOW()),
        ('5 Years', NOW(), NOW())
      `);

      res.status(200).json({
        success: true,
        message: "Successfully inserted default price change periods"
      });
    } catch (error) {
      console.error("Error inserting default price change periods:", error);
      res.status(500).json({
        success: false,
        message: "Failed to insert default price change periods",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Fix price_change_period_id column to use IDs instead of names
  router.post("/fix-price-change-period-ids", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if column exists and is VARCHAR (needs fixing)
      const [columnResults] = await db.sequelize.query(`
        SELECT DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'price_change_period_id'
      `);

      if (columnResults.length === 0) {
        return res.status(200).json({
          success: true,
          message: "price_change_period_id column does not exist"
        });
      }

      const columnType = (columnResults[0] as any).DATA_TYPE;
      
      if (columnType === 'varchar') {
        // Column exists but is VARCHAR, need to convert to INT
        console.log("Converting price_change_period_id from VARCHAR to INT...");
        
        // First, update existing data to use IDs instead of names
        await db.sequelize.query(`
          UPDATE products 
          SET price_change_period_id = CASE 
            WHEN price_change_period_id = '1 Month' THEN 1
            WHEN price_change_period_id = '3 Months' THEN 2
            WHEN price_change_period_id = '6 Months' THEN 3
            WHEN price_change_period_id = '12 Months' THEN 4
            WHEN price_change_period_id = '2 Years' THEN 5
            WHEN price_change_period_id = '3 Years' THEN 6
            WHEN price_change_period_id = '5 Years' THEN 7
            ELSE 4
          END
        `);

        // Drop the old column
        await db.sequelize.query(`
          ALTER TABLE products DROP COLUMN price_change_period_id
        `);

        // Add the new INT column
        await db.sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN price_change_period_id INT 
          DEFAULT 4
          AFTER stock_master_ids
        `);

        console.log("✅ Successfully converted price_change_period_id to INT");
      } else {
        console.log("✅ price_change_period_id column is already INT type");
      }

      res.status(200).json({
        success: true,
        message: "Successfully fixed price_change_period_id column"
      });
    } catch (error) {
      console.error("Error fixing price_change_period_id column:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fix price_change_period_id column",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create valuations table and update products table
  router.post("/create-valuations-table", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if valuations table exists
      const [tableResults] = await db.sequelize.query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'valuations'
      `);
      
      if (tableResults.length === 0) {
        // Create valuations table
        await db.sequelize.query(`
          CREATE TABLE valuations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            valuation_name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        // Insert default valuations
        await db.sequelize.query(`
          INSERT INTO valuations (valuation_name, created_at, updated_at) VALUES 
          ('Under ₹100 Cr', NOW(), NOW()),
          ('₹100-500 Cr', NOW(), NOW()),
          ('₹500-1000 Cr', NOW(), NOW()),
          ('₹1000-5000 Cr', NOW(), NOW()),
          ('₹5000-10000 Cr', NOW(), NOW()),
          ('Above ₹10000 Cr', NOW(), NOW())
        `);
        
        console.log("✅ Created valuations table with default data");
      } else {
        console.log("✅ Valuations table already exists");
      }

      // Check if valuation_id column exists in products table
      const [columnResults] = await db.sequelize.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'valuation_id'
      `);
      
      if (columnResults.length === 0) {
        // Add valuation_id column to products table
        await db.sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN valuation_id INT UNSIGNED AFTER bannerDisplay,
          ADD FOREIGN KEY (valuation_id) REFERENCES valuations(id)
        `);
        
        // Update existing products to use default valuation (₹100-500 Cr = ID 2)
        await db.sequelize.query(`
          UPDATE products SET valuation_id = 2 WHERE valuation_id IS NULL
        `);
        
        console.log("✅ Added valuation_id column to products table");
      } else {
        console.log("✅ valuation_id column already exists in products table");
      }

      res.status(200).json({
        success: true,
        message: "Successfully created valuations table and updated products table"
      });
    } catch (error) {
      console.error("Error creating valuations table:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create valuations table",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Drop min_value and max_value columns from valuations table
  router.post("/drop-valuation-value-columns", async (req, res) => {
    try {
      const { db } = await import("../utils/database");
      
      // Check if min_value column exists
      const [columnResults] = await db.sequelize.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'valuations' 
        AND COLUMN_NAME = 'min_value'
      `);
      
      if (columnResults.length > 0) {
        // Drop min_value and max_value columns
        await db.sequelize.query(`
          ALTER TABLE valuations 
          DROP COLUMN min_value,
          DROP COLUMN max_value
        `);
        
        res.json({
          success: true,
          message: "Min value and max value columns dropped successfully from valuations table"
        });
      } else {
        res.json({
          success: true,
          message: "Min value and max value columns do not exist in valuations table"
        });
      }
    } catch (error) {
      console.error("Error dropping valuation value columns:", error);
      res.status(500).json({
        success: false,
        message: "Failed to drop valuation value columns",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

// Run migration to create market insights tables
router.post("/create-market-insights-tables", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-market-insights-tables");
    
    // Create insight_sectors table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS insight_sectors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active)
      )
    `);

    // Create insight_subsectors table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS insight_subsectors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        insight_sector_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (insight_sector_id) REFERENCES insight_sectors(id) ON DELETE CASCADE,
        UNIQUE KEY unique_subsector_per_sector (insight_sector_id, name),
        INDEX idx_sector_id (insight_sector_id),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create insight_topics table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS insight_topics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active)
      )
    `);

    // Create insight_subtopics table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS insight_subtopics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        insight_topic_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (insight_topic_id) REFERENCES insight_topics(id) ON DELETE CASCADE,
        UNIQUE KEY unique_subtopic_per_topic (insight_topic_id, name),
        INDEX idx_topic_id (insight_topic_id),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create insight_themes table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS insight_themes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active)
      )
    `);

    // Create market_insights table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS market_insights (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(255) NOT NULL UNIQUE,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        title VARCHAR(255) NOT NULL,
        blog_image VARCHAR(500) NOT NULL,
        teaser TEXT NOT NULL,
        summary TEXT NOT NULL,
        first_part TEXT NOT NULL,
        second_part TEXT NOT NULL,
        insight_sector_id INT NULL,
        insight_subsector_id INT NULL,
        insight_topic_id INT NULL,
        insight_subtopic_id INT NULL,
        insight_theme_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (insight_sector_id) REFERENCES insight_sectors(id) ON DELETE SET NULL,
        FOREIGN KEY (insight_subsector_id) REFERENCES insight_subsectors(id) ON DELETE SET NULL,
        FOREIGN KEY (insight_topic_id) REFERENCES insight_topics(id) ON DELETE SET NULL,
        FOREIGN KEY (insight_subtopic_id) REFERENCES insight_subtopics(id) ON DELETE SET NULL,
        FOREIGN KEY (insight_theme_id) REFERENCES insight_themes(id) ON DELETE SET NULL,
        INDEX idx_is_featured (is_featured),
        INDEX idx_sector_id (insight_sector_id),
        INDEX idx_subsector_id (insight_subsector_id),
        INDEX idx_topic_id (insight_topic_id),
        INDEX idx_subtopic_id (insight_subtopic_id),
        INDEX idx_theme_id (insight_theme_id)
      )
    `);

    // Create market_insight_companies junction table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS market_insight_companies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        market_insight_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (market_insight_id) REFERENCES market_insights(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_insight_company (market_insight_id, product_id),
        INDEX idx_insight_id (market_insight_id),
        INDEX idx_product_id (product_id)
      )
    `);

    // Create market_insight_subsectors junction table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS market_insight_subsectors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        market_insight_id INT NOT NULL,
        insight_subsector_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (market_insight_id) REFERENCES market_insights(id) ON DELETE CASCADE,
        FOREIGN KEY (insight_subsector_id) REFERENCES insight_subsectors(id) ON DELETE CASCADE,
        UNIQUE KEY unique_insight_subsector (market_insight_id, insight_subsector_id),
        INDEX idx_insight_id (market_insight_id),
        INDEX idx_subsector_id (insight_subsector_id)
      )
    `);

    // Create market_insight_subtopics junction table
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS market_insight_subtopics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        market_insight_id INT NOT NULL,
        insight_subtopic_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (market_insight_id) REFERENCES market_insights(id) ON DELETE CASCADE,
        FOREIGN KEY (insight_subtopic_id) REFERENCES insight_subtopics(id) ON DELETE CASCADE,
        UNIQUE KEY unique_insight_subtopic (market_insight_id, insight_subtopic_id),
        INDEX idx_insight_id (market_insight_id),
        INDEX idx_subtopic_id (insight_subtopic_id)
      )
    `);
    
    console.log("✅ Created market insights tables successfully");
    
    res.json({
      success: true,
      message: "Market insights tables created successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Run migration to insert default market insights taxonomy data
router.post("/insert-default-market-insights-taxonomy", async (req, res) => {
  try {
    console.log("🔄 Running migration: insert-default-market-insights-taxonomy");
    
    // Insert default insight sectors
    await db.sequelize.query(`
      INSERT IGNORE INTO insight_sectors (name, is_active, created_at, updated_at) VALUES
      ('Technology', true, NOW(), NOW()),
      ('Healthcare', true, NOW(), NOW()),
      ('Finance', true, NOW(), NOW()),
      ('Energy', true, NOW(), NOW()),
      ('Consumer Goods', true, NOW(), NOW())
    `);

    // Insert default insight subsectors
    await db.sequelize.query(`
      INSERT IGNORE INTO insight_subsectors (insight_sector_id, name, is_active, created_at, updated_at) VALUES
      (1, 'Software', true, NOW(), NOW()),
      (1, 'Hardware', true, NOW(), NOW()),
      (2, 'Pharmaceuticals', true, NOW(), NOW()),
      (2, 'Medical Devices', true, NOW(), NOW()),
      (3, 'Banking', true, NOW(), NOW()),
      (3, 'Insurance', true, NOW(), NOW())
    `);

    // Insert default insight topics
    await db.sequelize.query(`
      INSERT IGNORE INTO insight_topics (name, is_active, created_at, updated_at) VALUES
      ('Market Analysis', true, NOW(), NOW()),
      ('Company Updates', true, NOW(), NOW()),
      ('Sector Trends', true, NOW(), NOW()),
      ('Policy & Rates', true, NOW(), NOW()),
      ('Private Markets', true, NOW(), NOW())
    `);

    // Insert default insight subtopics
    await db.sequelize.query(`
      INSERT IGNORE INTO insight_subtopics (insight_topic_id, name, is_active, created_at, updated_at) VALUES
      (1, 'Market Outlook', true, NOW(), NOW()),
      (1, 'Economic Indicators', true, NOW(), NOW()),
      (2, 'Earnings Reports', true, NOW(), NOW()),
      (2, 'Mergers & Acquisitions', true, NOW(), NOW()),
      (3, 'Industry Growth', true, NOW(), NOW()),
      (3, 'Competitive Landscape', true, NOW(), NOW())
    `);

    // Insert default insight themes
    await db.sequelize.query(`
      INSERT IGNORE INTO insight_themes (name, is_active, created_at, updated_at) VALUES
      ('Growth Investing', true, NOW(), NOW()),
      ('Value Investing', true, NOW(), NOW()),
      ('ESG Investing', true, NOW(), NOW()),
      ('Technology Disruption', true, NOW(), NOW()),
      ('Market Volatility', true, NOW(), NOW())
    `);
    
    console.log("✅ Inserted default market insights taxonomy data successfully");
    
    res.json({
      success: true,
      message: "Default market insights taxonomy data inserted successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Add multiselect fields to market_insights table
router.post("/add-company-ids-to-market-insights", async (req, res) => {
  try {
    console.log("🔄 Running migration: add-company-ids-to-market-insights");
    
    // Add company_ids column
    await db.sequelize.query(`
      ALTER TABLE market_insights 
      ADD COLUMN company_ids TEXT NULL COMMENT 'JSON string of company IDs array'
    `);
    
    console.log("✅ Added company_ids field to market_insights table successfully");
    
    res.json({
      success: true,
      message: "Company IDs field added to market_insights table successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Add content type and video file fields to market insights
router.post("/add-content-type-to-market-insights", async (req, res) => {
  try {
    console.log("🔄 Running migration: add-content-type-to-market-insights");
    
    // Add content_type column with default value TEXT
    await db.sequelize.query(`
      ALTER TABLE market_insights 
      ADD COLUMN content_type ENUM('TEXT', 'VIDEO') NOT NULL DEFAULT 'TEXT'
    `);
    
    // Add video_file column
    await db.sequelize.query(`
      ALTER TABLE market_insights 
      ADD COLUMN video_file VARCHAR(500) NULL COMMENT 'S3 URL for uploaded video file'
    `);
    
    // Modify first_part and second_part to allow NULL
    await db.sequelize.query(`
      ALTER TABLE market_insights 
      MODIFY COLUMN first_part TEXT NULL
    `);
    
    await db.sequelize.query(`
      ALTER TABLE market_insights 
      MODIFY COLUMN second_part TEXT NULL
    `);
    
    // Add index for content_type
    await db.sequelize.query(`
      ALTER TABLE market_insights 
      ADD INDEX idx_market_insights_content_type (content_type)
    `);
    
    console.log("✅ Added content_type and video_file fields to market_insights table successfully");
    
    res.json({
      success: true,
      message: "Content type and video file fields added to market_insights table successfully"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Fix portfolio_performance_score to be nullable
router.post("/fix-portfolio-performance-nullable", async (req, res) => {
  try {
    await sequelizePromise;
    console.log("🔄 Running migration: fix-portfolio-performance-nullable");
    
    await db.sequelize.query(`
      ALTER TABLE user_portfolio MODIFY COLUMN portfolio_performance_score DECIMAL(5,2) NULL;
    `);
    
    console.log("✅ Fixed portfolio_performance_score column");
    
    res.json({
      success: true,
      message: "portfolio_performance_score column is now nullable"
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Update valuation_ranges with min_value and max_value
router.post("/update-valuation-ranges-with-values", async (req, res) => {
  try {
    console.log("🔄 Running migration: update-valuation-ranges-with-values");
    await sequelizePromise;
    
    // Ensure min_value column exists
    const [minCol] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'valuation_ranges' 
        AND COLUMN_NAME = 'min_value'
    `);
    if ((minCol as any).length === 0) {
      await db.sequelize.query(`
        ALTER TABLE valuation_ranges
        ADD COLUMN min_value DECIMAL(15,2) NULL AFTER value
      `);
      console.log("✅ Added min_value column to valuation_ranges");
    } else {
      console.log("ℹ️ min_value column already exists");
    }

    // Ensure max_value column exists
    const [maxCol] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'valuation_ranges' 
        AND COLUMN_NAME = 'max_value'
    `);
    if ((maxCol as any).length === 0) {
      await db.sequelize.query(`
        ALTER TABLE valuation_ranges
        ADD COLUMN max_value DECIMAL(15,2) NULL AFTER min_value
      `);
      console.log("✅ Added max_value column to valuation_ranges");
    } else {
      console.log("ℹ️ max_value column already exists");
    }
    
    // Update existing rows with min/max values
    await db.sequelize.query(`
      UPDATE valuation_ranges SET min_value = 0, max_value = 1000 WHERE value = 'below-1000'
    `);
    
    await db.sequelize.query(`
      UPDATE valuation_ranges SET min_value = 1000, max_value = 2500 WHERE value = '1000-2500'
    `);
    
    await db.sequelize.query(`
      UPDATE valuation_ranges SET min_value = 2500, max_value = 5000 WHERE value = '2500-5000'
    `);
    
    await db.sequelize.query(`
      UPDATE valuation_ranges SET min_value = 5000, max_value = 999999999 WHERE value = '5000-plus'
    `);
    
    console.log("✅ Updated valuation_ranges with min_value and max_value");
    
    res.json({
      success: true,
      message: "Valuation ranges updated successfully"
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

// Run migration to create home_insights table
router.post("/create-home-insights-table", async (req, res) => {
  try {
    console.log("🔄 Running migration: create-home-insights-table");
    
    // Check if table already exists
    const [results] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'investapp' 
      AND TABLE_NAME = 'home_insights'
    `);

    if (results.length > 0) {
      console.log("✅ Table 'home_insights' already exists");
      return res.json({
        success: true,
        message: "Table 'home_insights' already exists"
      });
    }

    // Create the table
    await db.sequelize.query(`
      CREATE TABLE home_insights (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file VARCHAR(500) NOT NULL COMMENT 'S3 URL or file path',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_created_at (created_at),
        INDEX idx_updated_at (updated_at)
      )
    `);
    
    console.log("✅ Created home_insights table successfully");
    
    res.json({
      success: true,
      message: "Home insights table created successfully"
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