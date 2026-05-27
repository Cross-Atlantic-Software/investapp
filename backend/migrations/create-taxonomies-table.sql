-- Create taxonomies table
CREATE TABLE IF NOT EXISTS taxonomies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('Primary', 'Secondary') NOT NULL DEFAULT 'Primary',
    description TEXT,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_created_by (created_by)
);
