-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default themes
INSERT INTO themes (name, created_at, updated_at) VALUES 
  ('Technology', NOW(), NOW()),
  ('Healthcare', NOW(), NOW()),
  ('Finance', NOW(), NOW()),
  ('E-commerce', NOW(), NOW()),
  ('SaaS', NOW(), NOW()),
  ('Green Energy', NOW(), NOW()),
  ('EdTech', NOW(), NOW()),
  ('FinTech', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

