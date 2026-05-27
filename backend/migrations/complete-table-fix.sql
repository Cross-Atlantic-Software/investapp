-- Complete migration to fix both tables and update existing data

-- Fix private_market_news table
-- Add missing columns if they don't exist
ALTER TABLE private_market_news 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Rename taxonomy_tags to taxonomy_ids if needed
ALTER TABLE private_market_news 
CHANGE COLUMN taxonomy_tags taxonomy_ids TEXT NOT NULL DEFAULT '[]';

-- Remove columns that are no longer needed
ALTER TABLE private_market_news 
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by,
DROP COLUMN IF EXISTS impact_level,
DROP COLUMN IF EXISTS status;

-- Fix taxonomies table
-- Add missing columns if they don't exist
ALTER TABLE taxonomies 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add color column if it doesn't exist
ALTER TABLE taxonomies 
ADD COLUMN IF NOT EXISTS color VARCHAR(7) NOT NULL DEFAULT '#3B82F6';

-- Remove columns that are no longer needed
ALTER TABLE taxonomies 
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS status;

-- Update existing taxonomy data to have colors
UPDATE taxonomies SET color = '#3B82F6' WHERE color IS NULL OR color = '';
UPDATE taxonomies SET color = '#EF4444' WHERE name = 'High Impact';
UPDATE taxonomies SET color = '#F59E0B' WHERE name = 'Medium Impact';
UPDATE taxonomies SET color = '#10B981' WHERE name = 'Low Impact';
UPDATE taxonomies SET color = '#8B5CF6' WHERE name = 'Funding';
UPDATE taxonomies SET color = '#06B6D4' WHERE name = 'Corporate';
UPDATE taxonomies SET color = '#84CC16' WHERE name = 'Product';
