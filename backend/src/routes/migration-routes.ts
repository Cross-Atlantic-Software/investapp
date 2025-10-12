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

  // Add buy_request column to users table
  router.post("/add-buy-request-to-users", async (req, res) => {
    try {
      await sequelizePromise;
      
      // Check if column already exists
      const [results] = await db.sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'buy_request'
      `);

      if (results.length > 0) {
        return res.status(200).json({
          success: true,
          message: "buy_request column already exists in users table"
        });
      }

      // Add buy_request column
      await db.sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN buy_request TEXT 
        AFTER phone_verified
      `);

      // Update existing users to have empty array
      await db.sequelize.query(`
        UPDATE users 
        SET buy_request = '[]' 
        WHERE buy_request IS NULL
      `);

      res.status(200).json({
        success: true,
        message: "Successfully added buy_request column to users table"
      });
    } catch (error) {
      console.error("Error adding buy_request column:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add buy_request column",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

export default router;