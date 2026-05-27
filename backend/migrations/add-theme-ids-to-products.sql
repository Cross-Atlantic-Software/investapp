-- Add theme_ids column to products table
ALTER TABLE products 
ADD COLUMN theme_ids TEXT NULL 
COMMENT 'JSON array of theme IDs' 
AFTER subsector_ids;

