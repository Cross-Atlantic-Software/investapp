-- ============================================================
--  InvestApp – full schema + seed data
--  Run via: docker exec -i investapp_db mysql -uroot -proot investapp < seed.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── Sectors ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sectors (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_sector_name (name)
);

-- ── Subsectors ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subsectors (
  id         INT          NOT NULL AUTO_INCREMENT,
  sector_id  INT          NOT NULL,
  name       VARCHAR(100) NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_subsector_per_sector (sector_id, name)
);

-- ── Themes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS themes (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
);

-- ── Taxonomies ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxonomies (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#3B82F6',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
);

-- ── Activity types ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_types (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
);

-- ── Valuations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS valuations (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  valuation_name VARCHAR(100) NOT NULL,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY valuation_name (valuation_name)
);

-- ── Stock performance scores ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_performance_scores (
  id         INT          NOT NULL AUTO_INCREMENT,
  score      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Stock masters ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_masters (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(200) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Price change periods ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_change_periods (
  id         INT          NOT NULL AUTO_INCREMENT,
  period     VARCHAR(50)  NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Products (stocks) ──────────────────────────────────────────────────────
DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products (
  id                         INT          NOT NULL AUTO_INCREMENT,
  company_name               VARCHAR(255) NOT NULL,
  logo                       VARCHAR(500) NOT NULL,
  price_change               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  teaser                     TEXT         NOT NULL,
  short_description          TEXT         NOT NULL,
  analysis                   TEXT         NOT NULL,
  demand                     ENUM('High Demand','Low Demand') NOT NULL,
  homeDisplay                ENUM('yes','no') NOT NULL DEFAULT 'no',
  bannerDisplay              ENUM('yes','no') NOT NULL DEFAULT 'no',
  valuation_id               INT UNSIGNED DEFAULT NULL,
  valuation                  VARCHAR(200) DEFAULT NULL,
  price_per_share            DECIMAL(10,2) NOT NULL,
  percentage_change          DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  founded                    INT          NOT NULL,
  sector_ids                 TEXT,
  subsector_ids              TEXT,
  theme_ids                  TEXT,
  headquarters               VARCHAR(200) NOT NULL,
  min_units                  INT          NOT NULL DEFAULT 1,
  lot_size                   INT          NOT NULL DEFAULT 1,
  stock_master_ids           TEXT,
  price_change_period_id     INT          DEFAULT NULL,
  stock_performance_score_id INT          DEFAULT NULL,
  createdAt                  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updatedAt                  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Private market news ────────────────────────────────────────────────────
DROP TABLE IF EXISTS private_market_news;
CREATE TABLE IF NOT EXISTS private_market_news (
  id           INT          NOT NULL AUTO_INCREMENT,
  title        VARCHAR(500) NOT NULL,
  url          VARCHAR(1000),
  icon         VARCHAR(10),
  taxonomy_ids TEXT         NOT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Notable activities ─────────────────────────────────────────────────────
DROP TABLE IF EXISTS notable_activities;
CREATE TABLE IF NOT EXISTS notable_activities (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  activity_type_ids TEXT         NOT NULL,
  icon              VARCHAR(255) NOT NULL,
  description       TEXT         NOT NULL,
  created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── Users (minimal – needed for FK targets) ────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  email      VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name  VARCHAR(100),
  phone      VARCHAR(20),
  password   VARCHAR(255),
  role       VARCHAR(50)  DEFAULT 'user',
  status     VARCHAR(50)  DEFAULT 'active',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
);

-- ── CMS users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_users (
  id         INT          NOT NULL AUTO_INCREMENT,
  email      VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(200),
  role       VARCHAR(50)  DEFAULT 'admin',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Sectors
INSERT IGNORE INTO sectors (name) VALUES
  ('Technology'),
  ('Finance'),
  ('Healthcare'),
  ('Energy'),
  ('Consumer Goods'),
  ('Real Estate');

-- Subsectors
INSERT IGNORE INTO subsectors (sector_id, name)
SELECT s.id, sub.name
FROM sectors s
JOIN (
  SELECT 'Technology' AS sector, 'SaaS'             AS name UNION ALL
  SELECT 'Technology',           'AI / ML'                   UNION ALL
  SELECT 'Technology',           'FinTech'                   UNION ALL
  SELECT 'Technology',           'Cybersecurity'             UNION ALL
  SELECT 'Finance',              'Private Equity'            UNION ALL
  SELECT 'Finance',              'Venture Capital'           UNION ALL
  SELECT 'Finance',              'Asset Management'          UNION ALL
  SELECT 'Healthcare',           'Biotech'                   UNION ALL
  SELECT 'Healthcare',           'MedTech'                   UNION ALL
  SELECT 'Energy',               'Renewable Energy'          UNION ALL
  SELECT 'Energy',               'Clean Tech'                UNION ALL
  SELECT 'Consumer Goods',       'D2C Brands'                UNION ALL
  SELECT 'Real Estate',          'PropTech'
) sub ON s.name = sub.sector;

-- Themes
INSERT IGNORE INTO themes (name) VALUES
  ('Growth'),
  ('Dividend'),
  ('ESG'),
  ('Turnaround'),
  ('Emerging Market');

-- Taxonomies
INSERT IGNORE INTO taxonomies (name, color) VALUES
  ('Funding',       '#8B5CF6'),
  ('Corporate',     '#06B6D4'),
  ('Product',       '#84CC16'),
  ('High Impact',   '#EF4444'),
  ('Medium Impact', '#F59E0B'),
  ('Low Impact',    '#10B981');

-- Activity types
INSERT IGNORE INTO activity_types (name) VALUES
  ('Large Trade'),
  ('New Listing'),
  ('High Interest'),
  ('Market Update'),
  ('Price Movement');

-- Products (stocks)
INSERT INTO products
  (company_name, logo, price_change, teaser, short_description, analysis,
   demand, homeDisplay, bannerDisplay, valuation, price_per_share,
   percentage_change, founded, sector_ids, subsector_ids, theme_ids,
   headquarters, min_units, lot_size, createdAt, updatedAt)
VALUES
(
  'NovaTech Solutions',
  'https://ui-avatars.com/api/?name=NovaTech&background=1e3a5f&color=fff&size=128',
  12.50,
  'India fastest-growing B2B SaaS platform for mid-market enterprises.',
  'NovaTech builds cloud-native ERP and CRM solutions adopted by 3,000+ SMEs across India and South-East Asia. The company has expanded into 6 international markets in FY25.',
  'Revenue grew 78% YoY to 420 Cr in FY25. EBITDA margins expanding towards 22%. Series D round oversubscribed. Backed by marquee global funds.',
  'High Demand', 'yes', 'yes',
  'Rs. 4,200 Cr',
  840.00, 12.50, 2017,
  '[1]', '[1,2]', '[1]',
  'Bengaluru, Karnataka', 5, 5, NOW(), NOW()
),
(
  'GreenGrid Energy',
  'https://ui-avatars.com/api/?name=GreenGrid&background=0d7c4d&color=fff&size=128',
  -3.20,
  'Utility-scale solar and wind developer with 1.4 GW portfolio across 8 states.',
  'GreenGrid develops, owns and operates renewable energy projects under long-term PPAs with state DISCOMs and large C&I consumers.',
  'Order book at Rs. 2,100 Cr. Targeting 3 GW capacity by 2027. Backed by marquee infra funds. Strong DSCR ratios across all assets.',
  'High Demand', 'yes', 'no',
  'Rs. 3,500 Cr',
  700.00, -3.20, 2015,
  '[4]', '[10,11]', '[3]',
  'Pune, Maharashtra', 10, 10, NOW(), NOW()
),
(
  'MediCore Diagnostics',
  'https://ui-avatars.com/api/?name=MediCore&background=c0392b&color=fff&size=128',
  5.80,
  'Next-generation diagnostic network leveraging AI for early disease detection.',
  'MediCore operates 220 diagnostic labs in Tier 1 & 2 cities and processes 1.2M tests per month. AI-powered reporting cuts turnaround time by 60%.',
  'Revenue Rs. 310 Cr, growing 55% YoY. Gross margin 58%. Expanding into home-collection and tele-diagnostics. Pre-IPO round underway.',
  'High Demand', 'yes', 'yes',
  'Rs. 2,800 Cr',
  560.00, 5.80, 2019,
  '[3]', '[8,9]', '[1,2]',
  'Hyderabad, Telangana', 5, 5, NOW(), NOW()
),
(
  'UrbanNest PropTech',
  'https://ui-avatars.com/api/?name=UrbanNest&background=7f3fbf&color=fff&size=128',
  2.10,
  'Fractional real-estate ownership platform democratising commercial property investment.',
  'UrbanNest allows retail investors to own fractions of Grade-A commercial assets starting at Rs. 10,000. Quarterly rental distributions paid consistently.',
  'AUM crossed Rs. 900 Cr. 45,000 registered investors. Targeting Rs. 2,500 Cr AUM by end of FY26. SEBI-regulated Small Finance REIT structure.',
  'Low Demand', 'no', 'no',
  'Rs. 1,200 Cr',
  240.00, 2.10, 2021,
  '[6]', '[13]', '[5]',
  'Mumbai, Maharashtra', 5, 5, NOW(), NOW()
),
(
  'FinEdge Capital',
  'https://ui-avatars.com/api/?name=FinEdge&background=2471a3&color=fff&size=128',
  8.40,
  'Alternative asset manager focused on private credit and structured finance.',
  'FinEdge manages Rs. 6,200 Cr across private credit, structured equity and special situations strategies for family offices and institutional investors.',
  'Consistent 14-16% net IRR across vintages. Strong co-investor network. AIF Category II registered. FY25 deployment at Rs. 1,800 Cr.',
  'High Demand', 'yes', 'no',
  'Rs. 5,000 Cr',
  1000.00, 8.40, 2014,
  '[2]', '[5,6]', '[2]',
  'Mumbai, Maharashtra', 10, 10, NOW(), NOW()
),
(
  'PureLeaf Organics',
  'https://ui-avatars.com/api/?name=PureLeaf&background=1e8449&color=fff&size=128',
  -1.50,
  'Vertically integrated organic F&B brand with 600+ SKUs across 18 states.',
  'PureLeaf sources directly from 12,000 certified organic farmers and sells through modern trade, e-commerce and D2C. Zero artificial preservatives policy.',
  'Revenue Rs. 185 Cr, growing 42% YoY. Gross margin 58%. Pursuing Series B to fund national expansion and launch in UAE and Singapore.',
  'Low Demand', 'no', 'no',
  'Rs. 800 Cr',
  160.00, -1.50, 2020,
  '[5]', '[12]', '[3,4]',
  'Bengaluru, Karnataka', 5, 5, NOW(), NOW()
);

-- Private market news
INSERT INTO private_market_news (title, url, icon, taxonomy_ids, created_at, updated_at) VALUES
  ('NovaTech closes Rs. 600 Cr Series D at Rs. 4,200 Cr valuation',
   'https://example.com/novatech-series-d', 'NT', '[1,4]', NOW(), NOW()),
  ('GreenGrid wins 400 MW solar project in Rajasthan',
   'https://example.com/greengrid-solar', 'GG', '[2,4]', NOW(), NOW()),
  ('MediCore Diagnostics expands to 50 new Tier-2 cities',
   'https://example.com/medicore-expansion', 'MC', '[3,5]', NOW(), NOW()),
  ('FinEdge raises Rs. 1,200 Cr for new private credit AIF',
   'https://example.com/finedge-aif', 'FE', '[1,4]', NOW(), NOW()),
  ('PureLeaf signs distribution deal with D-Mart and Reliance Smart',
   'https://example.com/pureleaf-dist', 'PL', '[3,6]', NOW(), NOW()),
  ('Private market activity surges 34% in Q1 FY26',
   'https://example.com/market-update', 'PM', '[2,5]', NOW(), NOW());

-- Notable activities (activity_type_ids is a JSON array of activity_types.id)
INSERT INTO notable_activities (activity_type_ids, icon, description, created_at, updated_at) VALUES
  ('[1]', 'LT', 'Institutional block purchase of Rs. 4.5 Cr in NovaTech', NOW(), NOW()),
  ('[2]', 'NL', 'GreenGrid Energy shares now available on the platform', NOW(), NOW()),
  ('[3]', 'HI', '620% spike in search interest for MediCore Diagnostics', NOW(), NOW()),
  ('[5]', 'PM', 'FinEdge up 8.4% following strong quarterly results', NOW(), NOW()),
  ('[4]', 'MU', 'Private market AUM crosses Rs. 1.2 lakh Cr industry-wide', NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Seeding complete!' AS status;
