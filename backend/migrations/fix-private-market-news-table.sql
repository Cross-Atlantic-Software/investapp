-- Fix private_market_news table structure to match the model
-- First, let's check if the table exists and what columns it has

-- Add missing columns if they don't exist
ALTER TABLE private_market_news 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Remove columns that are no longer needed
ALTER TABLE private_market_news 
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by,
DROP COLUMN IF EXISTS impact_level,
DROP COLUMN IF EXISTS status;

-- Rename taxonomy_tags to taxonomy_ids if needed
ALTER TABLE private_market_news 
CHANGE COLUMN taxonomy_tags taxonomy_ids TEXT NOT NULL DEFAULT '[]';

-- Ensure URL column exists (add if it doesn't exist)
ALTER TABLE private_market_news 
ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '' AFTER title;
