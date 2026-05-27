-- Update private_market_news table to simplified schema
ALTER TABLE private_market_news 
DROP COLUMN IF EXISTS impact_level,
DROP COLUMN IF EXISTS status;

-- Rename taxonomy_tags to taxonomy_ids
ALTER TABLE private_market_news 
CHANGE COLUMN taxonomy_tags taxonomy_ids TEXT NOT NULL DEFAULT '[]';

-- Ensure URL column exists (add if it doesn't exist)
ALTER TABLE private_market_news 
ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '' AFTER title;

-- Update taxonomies table to simplified schema
ALTER TABLE taxonomies 
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS status;

-- Add color column to taxonomies
ALTER TABLE taxonomies 
ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#3B82F6' AFTER name;

-- Update existing taxonomy data with default colors
UPDATE taxonomies SET color = '#3B82F6' WHERE color IS NULL OR color = '';
