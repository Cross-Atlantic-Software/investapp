-- Fix taxonomy color column length to accommodate longer hex codes
USE investapp;

-- Update the color column to allow longer hex codes
ALTER TABLE taxonomies 
MODIFY COLUMN color VARCHAR(10) NOT NULL DEFAULT '#3B82F6';
