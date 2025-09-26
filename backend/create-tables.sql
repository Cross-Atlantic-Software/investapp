-- Simple SQL commands to create the required tables
-- Run these commands in your MySQL database (phpMyAdmin, MySQL Workbench, or command line)

USE invest_app;

-- Create activity_types table
CREATE TABLE IF NOT EXISTS activity_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Create notable_activities table
CREATE TABLE IF NOT EXISTS notable_activities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_type_ids VARCHAR(255) NOT NULL DEFAULT '[]',
    icon VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activity_type_ids (activity_type_ids),
    INDEX idx_created_at (created_at)
);

-- Insert sample activity types
INSERT INTO activity_types (name) VALUES
('Large Trade'),
('New Listing'),
('High Interest'),
('Low Interest'),
('Market Update'),
('Sector Analysis'),
('Investment Alert'),
('Portfolio News');

-- Insert sample notable activities
INSERT INTO notable_activities (activity_type_ids, icon, description) VALUES
('[1]', '', 'Institutional buy of ₹2.5M in Tech sector'),
('[2]', '', 'Green Energy shares now available for trading'),
('[3]', '', '400% spike in FinTech sector views'),
('[4]', '', '350% spike in FinTech sector views'),
('[5]', '', 'Market shows strong bullish momentum'),
('[6]', '', 'Healthcare sector analysis reveals growth potential'),
('[7]', '', 'New investment opportunity in renewable energy'),
('[8]', '', 'Portfolio diversification recommendations updated');
