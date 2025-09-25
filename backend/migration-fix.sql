-- Fix database structure for new stock fields
-- Run this SQL script in your MySQL database

USE invest_app;

-- Add missing columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS homeDisplay ENUM('yes', 'no') NOT NULL DEFAULT 'no',
ADD COLUMN IF NOT EXISTS bannerDisplay ENUM('yes', 'no') NOT NULL DEFAULT 'no',
ADD COLUMN IF NOT EXISTS demand ENUM('High Demand', 'Low Demand') NOT NULL DEFAULT 'Low Demand',
ADD COLUMN IF NOT EXISTS valuation VARCHAR(100) NOT NULL DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS price_per_share DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS percentage_change DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Update existing stocks with display flags for testing
UPDATE products 
SET homeDisplay = 'yes',
    bannerDisplay = 'yes',
    demand = 'High Demand',
    price_per_share = COALESCE(price_per_share, price),
    percentage_change = COALESCE(percentage_change, price_change),
    valuation = COALESCE(valuation, 'Undervalued')
WHERE id IN (1, 2, 3, 4);

-- Show the updated table structure
DESCRIBE products;

-- Show stocks with homeDisplay='yes'
SELECT id, company_name, homeDisplay, bannerDisplay, demand FROM products WHERE homeDisplay = 'yes';
