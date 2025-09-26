-- Seed initial taxonomy data
INSERT INTO taxonomies (name, category, description, created_by, updated_by) VALUES
('Funding', 'Primary', 'News related to funding rounds and investments', 1, 1),
('Corporate', 'Primary', 'Corporate announcements and business news', 1, 1),
('Product', 'Primary', 'Product launches and updates', 1, 1),
('High Impact', 'Secondary', 'High impact news items', 1, 1),
('Medium Impact', 'Secondary', 'Medium impact news items', 1, 1),
('Low Impact', 'Secondary', 'Low impact news items', 1, 1);

-- Seed initial activity types
INSERT INTO activity_types (name, description, created_by, updated_by) VALUES
('Large Trade', 'Significant trading activity', 1, 1),
('New Listing', 'New company listings', 1, 1),
('High Interest', 'High interest or demand activity', 1, 1),
('Market Update', 'General market updates', 1, 1),
('Price Movement', 'Significant price movements', 1, 1);

-- Seed sample private market news
INSERT INTO private_market_news (title, url, icon, taxonomy_tags, impact_level, created_by, updated_by) VALUES
('CloudTech raises ₹150M Series B', 'https://example.com/cloudtech-funding', 'CL', '["Funding", "High Impact"]', 'High Impact', 1, 1),
('RetailCorp announces 200 layoffs', 'https://example.com/retailcorp-layoffs', 'RE', '["Corporate", "Medium Impact"]', 'Medium Impact', 1, 1),
('AI startup launches revolutionary product', 'https://example.com/ai-startup-product', 'NE', '["Product", "High Impact"]', 'High Impact', 1, 1);

-- Seed sample notable activities
INSERT INTO notable_activities (activity_type, icon, description, created_by, updated_by) VALUES
('Large Trade', 'LT', 'Institutional buy of ₹2.5M in Tech', 1, 1),
('New Listing', 'NL', 'Green energy shares now available', 1, 1),
('High Interest', 'HI', '400% spike in FinTech', 1, 1);
