-- Create private_market_news table
CREATE TABLE IF NOT EXISTS private_market_news (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    taxonomy_tags TEXT NOT NULL DEFAULT '[]',
    impact_level ENUM('High Impact', 'Medium Impact', 'Low Impact') NOT NULL DEFAULT 'Medium Impact',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_impact_level (impact_level),
    INDEX idx_created_at (created_at),
    INDEX idx_created_by (created_by)
);
