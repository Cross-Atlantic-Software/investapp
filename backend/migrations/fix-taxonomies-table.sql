-- Fix taxonomies table structure to match the model
-- Add missing columns if they don't exist
ALTER TABLE taxonomies 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Remove columns that are no longer needed
ALTER TABLE taxonomies 
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS status;

-- Add color column if it doesn't exist
ALTER TABLE taxonomies 
ADD COLUMN IF NOT EXISTS color VARCHAR(7) NOT NULL DEFAULT '#3B82F6';
