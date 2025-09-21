-- Migration to add last_active column to cms_users table
-- Run this script if you have an existing database without the last_active column

-- Add the last_active column
ALTER TABLE cms_users 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have their last_active set to their updatedAt timestamp
UPDATE cms_users 
SET last_active = updatedAt 
WHERE last_active IS NULL;

-- Create an index on last_active for better query performance
CREATE INDEX IF NOT EXISTS idx_cms_users_last_active ON cms_users(last_active);

-- Create an index on role for better filtering performance
CREATE INDEX IF NOT EXISTS idx_cms_users_role ON cms_users(role);

-- Create an index on auth_provider for better filtering performance
CREATE INDEX IF NOT EXISTS idx_cms_users_auth_provider ON cms_users(auth_provider);

-- Create a composite index for search optimization
CREATE INDEX IF NOT EXISTS idx_cms_users_search ON cms_users USING gin(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(phone, '')
  )
);
