-- Remove created_by and updated_by fields from taxonomies table
ALTER TABLE taxonomies 
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by;

-- Remove created_by and updated_by fields from private_market_news table
ALTER TABLE private_market_news 
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by;
