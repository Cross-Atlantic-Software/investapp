-- Sample data for Private Market News and Notable Activity features
-- Run this in your MySQL database to get started

USE invest_app;

-- Insert sample taxonomies
INSERT INTO taxonomies (name, category, description, status, created_by, updated_by, created_at, updated_at) VALUES 
('Funding', 'Primary', 'News related to funding rounds and investments', 'active', 1, 1, NOW(), NOW()),
('Corporate', 'Primary', 'Corporate announcements and business news', 'active', 1, 1, NOW(), NOW()),
('Product', 'Primary', 'Product launches and updates', 'active', 1, 1, NOW(), NOW()),
('High Impact', 'Secondary', 'High impact news items', 'active', 1, 1, NOW(), NOW()),
('Medium Impact', 'Secondary', 'Medium impact news items', 'active', 1, 1, NOW(), NOW()),
('Low Impact', 'Secondary', 'Low impact news items', 'active', 1, 1, NOW(), NOW());

-- Insert sample activity types
INSERT INTO activity_types (name, description, status, created_by, updated_by, created_at, updated_at) VALUES 
('Large Trade', 'Significant trading activity', 'active', 1, 1, NOW(), NOW()),
('New Listing', 'New company listings', 'active', 1, 1, NOW(), NOW()),
('High Interest', 'High interest or demand activity', 'active', 1, 1, NOW(), NOW()),
('Market Update', 'General market updates', 'active', 1, 1, NOW(), NOW()),
('Price Movement', 'Significant price movements', 'active', 1, 1, NOW(), NOW());

-- Insert sample private market news
INSERT INTO private_market_news (title, url, icon, taxonomy_tags, impact_level, status, created_by, updated_by, created_at, updated_at) VALUES 
('CloudTech raises ₹150M Series B', 'https://example.com/cloudtech-funding', 'CL', '["Funding", "High Impact"]', 'High Impact', 'active', 1, 1, NOW(), NOW()),
('RetailCorp announces 200 layoffs', 'https://example.com/retailcorp-layoffs', 'RE', '["Corporate", "Medium Impact"]', 'Medium Impact', 'active', 1, 1, NOW(), NOW()),
('AI startup launches revolutionary product', 'https://example.com/ai-startup-product', 'NE', '["Product", "High Impact"]', 'High Impact', 'active', 1, 1, NOW(), NOW()),
('FinTech company secures ₹50M seed funding', 'https://example.com/fintech-seed', 'FT', '["Funding", "Medium Impact"]', 'Medium Impact', 'active', 1, 1, NOW(), NOW()),
('Green Energy startup goes public', 'https://example.com/green-energy-ipo', 'GE', '["Corporate", "High Impact"]', 'High Impact', 'active', 1, 1, NOW(), NOW());

-- Insert sample notable activities
INSERT INTO notable_activities (activity_type, icon, description, status, created_by, updated_by, created_at, updated_at) VALUES 
('Large Trade', 'LT', 'Institutional buy of ₹2.5M in TechCorp shares', 'active', 1, 1, NOW(), NOW()),
('New Listing', 'NL', 'Green Energy shares now available for trading', 'active', 1, 1, NOW(), NOW()),
('High Interest', 'HI', '400% spike in FinTech sector views', 'active', 1, 1, NOW(), NOW()),
('Price Movement', 'PM', 'CloudTech shares up 15% in morning session', 'active', 1, 1, NOW(), NOW()),
('Market Update', 'MU', 'Private market valuation reaches new high', 'active', 1, 1, NOW(), NOW());
