-- Migration to add new fields to products table
-- Run this SQL script to update your existing products table

USE investapp;

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN demand ENUM('High Demand', 'Low Demand') NOT NULL DEFAULT 'Low Demand' AFTER category,
ADD COLUMN homeDisplay ENUM('yes', 'no') NOT NULL DEFAULT 'no' AFTER demand,
ADD COLUMN bannerDisplay ENUM('yes', 'no') NOT NULL DEFAULT 'no' AFTER homeDisplay,
ADD COLUMN valuation VARCHAR(100) NOT NULL DEFAULT 'N/A' AFTER bannerDisplay,
ADD COLUMN price_per_share DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER valuation,
ADD COLUMN percentage_change DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER price_per_share;

-- Update existing records with default values
UPDATE products SET 
  demand = 'High Demand',
  homeDisplay = 'yes',
  bannerDisplay = 'no',
  valuation = 'Undervalued',
  price_per_share = price,
  percentage_change = price_change
WHERE id > 0;

-- Show the updated table structure
DESCRIBE products;
