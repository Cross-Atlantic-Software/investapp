-- Seed initial data for Notable Activities system

-- Insert sample activity types
INSERT INTO activity_types (name, created_at, updated_at) VALUES
('Large Trade', NOW(), NOW()),
('New Listing', NOW(), NOW()),
('High Interest', NOW(), NOW()),
('Low Interest', NOW(), NOW()),
('Market Update', NOW(), NOW()),
('Sector Analysis', NOW(), NOW()),
('Investment Alert', NOW(), NOW()),
('Portfolio News', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample notable activities
INSERT INTO notable_activities (activity_type_ids, icon, description, created_at, updated_at) VALUES
('[1]', '', 'Institutional buy of ₹2.5M in Tech sector', NOW() - INTERVAL 15 MINUTE, NOW() - INTERVAL 15 MINUTE),
('[2]', '', 'Green Energy shares now available for trading', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR),
('[3]', '', '400% spike in FinTech sector views', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR),
('[4]', '', '350% spike in FinTech sector views', NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 5 HOUR),
('[5]', '', 'Market shows strong bullish momentum', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
('[6]', '', 'Healthcare sector analysis reveals growth potential', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
('[7]', '', 'New investment opportunity in renewable energy', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
('[8]', '', 'Portfolio diversification recommendations updated', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY)
ON DUPLICATE KEY UPDATE description = VALUES(description);
