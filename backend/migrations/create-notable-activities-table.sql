-- Create notable_activities table
CREATE TABLE IF NOT EXISTS notable_activities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_type_ids VARCHAR(255) NOT NULL DEFAULT '[]', -- JSON array of activity type IDs
    icon VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_activity_type_ids (activity_type_ids),
    INDEX idx_created_at (created_at)
);
