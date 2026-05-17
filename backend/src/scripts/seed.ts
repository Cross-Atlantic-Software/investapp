/**
 * Seed script — creates all tables (sync) then inserts sample data.
 * Run with:  npx ts-node src/scripts/seed.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { sequelizePromise } from "../utils/database";

async function seed() {
  console.log("⏳ Waiting for Sequelize to initialise…");
  const sequelize = await sequelizePromise;

  // ── 1. Create tables ──────────────────────────────────────────────────────
  console.log("🔨 Syncing all models (createTable if not exists)…");
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await sequelize.sync({ force: false });
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("✅ Tables ready.");

  const q = (sql: string) => sequelize.query(sql);

  // ── 2. Sectors ────────────────────────────────────────────────────────────
  console.log("🌱 Seeding sectors…");
  await q(`
    INSERT IGNORE INTO sectors (name, is_active, created_at, updated_at) VALUES
      ('Technology',      1, NOW(), NOW()),
      ('Finance',         1, NOW(), NOW()),
      ('Healthcare',      1, NOW(), NOW()),
      ('Energy',          1, NOW(), NOW()),
      ('Consumer Goods',  1, NOW(), NOW()),
      ('Real Estate',     1, NOW(), NOW());
  `);

  // ── 3. Subsectors ─────────────────────────────────────────────────────────
  console.log("🌱 Seeding subsectors…");
  await q(`
    INSERT IGNORE INTO subsectors (sector_id, name, is_active, created_at, updated_at)
    SELECT s.id, sub.name, 1, NOW(), NOW()
    FROM sectors s
    JOIN (
      SELECT 'Technology'     AS sector, 'SaaS'               AS name UNION ALL
      SELECT 'Technology',              'AI / ML'                      UNION ALL
      SELECT 'Technology',              'FinTech'                      UNION ALL
      SELECT 'Technology',              'Cybersecurity'                UNION ALL
      SELECT 'Finance',                 'Private Equity'               UNION ALL
      SELECT 'Finance',                 'Venture Capital'              UNION ALL
      SELECT 'Finance',                 'Asset Management'             UNION ALL
      SELECT 'Healthcare',              'Biotech'                      UNION ALL
      SELECT 'Healthcare',              'MedTech'                      UNION ALL
      SELECT 'Energy',                  'Renewable Energy'             UNION ALL
      SELECT 'Energy',                  'Clean Tech'                   UNION ALL
      SELECT 'Consumer Goods',          'D2C Brands'                   UNION ALL
      SELECT 'Real Estate',             'PropTech'
    ) sub ON s.name = sub.sector;
  `);

  // ── 4. Themes ─────────────────────────────────────────────────────────────
  console.log("🌱 Seeding themes…");
  await q(`
    INSERT IGNORE INTO themes (name, created_at, updated_at) VALUES
      ('Growth',          NOW(), NOW()),
      ('Dividend',        NOW(), NOW()),
      ('ESG',             NOW(), NOW()),
      ('Turnaround',      NOW(), NOW()),
      ('Emerging Market', NOW(), NOW());
  `);

  // ── 5. Taxonomies ─────────────────────────────────────────────────────────
  console.log("🌱 Seeding taxonomies…");
  await q(`
    INSERT IGNORE INTO taxonomies (name, color, created_at, updated_at) VALUES
      ('Funding',        '#8B5CF6', NOW(), NOW()),
      ('Corporate',      '#06B6D4', NOW(), NOW()),
      ('Product',        '#84CC16', NOW(), NOW()),
      ('High Impact',    '#EF4444', NOW(), NOW()),
      ('Medium Impact',  '#F59E0B', NOW(), NOW()),
      ('Low Impact',     '#10B981', NOW(), NOW());
  `);

  // ── 6. Activity types ─────────────────────────────────────────────────────
  console.log("🌱 Seeding activity_types…");
  await q(`
    INSERT IGNORE INTO activity_types (name, description, created_at, updated_at) VALUES
      ('Large Trade',    'Significant block trading activity',   NOW(), NOW()),
      ('New Listing',    'New company listings on platform',     NOW(), NOW()),
      ('High Interest',  'Surge in investor interest',          NOW(), NOW()),
      ('Market Update',  'General market update',               NOW(), NOW()),
      ('Price Movement', 'Notable price movement detected',     NOW(), NOW());
  `);

  // ── 7. Products (stocks) ──────────────────────────────────────────────────
  console.log("🌱 Seeding products (stocks)…");
  await q(`
    INSERT INTO products
      (company_name, logo, price_change, teaser, short_description, analysis,
       demand, homeDisplay, bannerDisplay, valuation, price_per_share,
       percentage_change, founded, sector_ids, subsector_ids, theme_ids,
       headquarters, min_units, lot_size, createdAt, updatedAt)
    VALUES
    (
      'NovaTech Solutions',
      'https://ui-avatars.com/api/?name=NovaTech&background=1e3a5f&color=fff&size=64',
      12.50,
      'India's fastest-growing B2B SaaS platform for mid-market enterprises.',
      'NovaTech builds cloud-native ERP and CRM solutions adopted by 3 000+ SMEs across India and South-East Asia.',
      'Revenue grew 78% YoY to ₹420 Cr in FY25. EBITDA margins expanding towards 22%. Series D round oversubscribed.',
      'High Demand', 'yes', 'yes',
      '₹4,200 Cr',
      840.00, 12.50, 2017,
      '[1]', '[1,2]', '[1]',
      'Bengaluru, Karnataka', 5, 5,
      NOW(), NOW()
    ),
    (
      'GreenGrid Energy',
      'https://ui-avatars.com/api/?name=GreenGrid&background=0d7c4d&color=fff&size=64',
      -3.20,
      'Utility-scale solar and wind developer with 1.4 GW portfolio across 8 states.',
      'GreenGrid develops, owns and operates renewable energy projects under long-term PPAs with state DISCOMs.',
      'Order book at ₹2 100 Cr. Targeting 3 GW capacity by 2027. Backed by marquee infra funds.',
      'High Demand', 'yes', 'no',
      '₹3,500 Cr',
      700.00, -3.20, 2015,
      '[4]', '[10,11]', '[3]',
      'Pune, Maharashtra', 10, 10,
      NOW(), NOW()
    ),
    (
      'MediCore Diagnostics',
      'https://ui-avatars.com/api/?name=MediCore&background=c0392b&color=fff&size=64',
      5.80,
      'Next-generation diagnostic network leveraging AI for early disease detection.',
      'MediCore operates 220 diagnostic labs in Tier 1 & 2 cities and processes 1.2M tests per month.',
      'Revenue ₹310 Cr, growing 55% YoY. Expanding into home-collection and tele-diagnostics segments.',
      'High Demand', 'yes', 'yes',
      '₹2,800 Cr',
      560.00, 5.80, 2019,
      '[3]', '[8,9]', '[1,2]',
      'Hyderabad, Telangana', 5, 5,
      NOW(), NOW()
    ),
    (
      'UrbanNest PropTech',
      'https://ui-avatars.com/api/?name=UrbanNest&background=7f3fbf&color=fff&size=64',
      2.10,
      'Fractional real-estate ownership platform democratising commercial property investment.',
      'UrbanNest allows retail investors to own fractions of Grade-A commercial assets starting at ₹10 000.',
      'AUM crossed ₹900 Cr. 45 000 registered investors. Targeting ₹2 500 Cr AUM by end of FY26.',
      'Low Demand', 'no', 'no',
      '₹1,200 Cr',
      240.00, 2.10, 2021,
      '[6]', '[13]', '[5]',
      'Mumbai, Maharashtra', 5, 5,
      NOW(), NOW()
    ),
    (
      'FinEdge Capital',
      'https://ui-avatars.com/api/?name=FinEdge&background=2471a3&color=fff&size=64',
      8.40,
      'Alternative asset manager focused on private credit and structured finance.',
      'FinEdge manages ₹6 200 Cr across private credit, structured equity and special situations strategies.',
      'Consistent 14–16% net IRR across vintages. Strong co-investor network. AIF Category II registered.',
      'High Demand', 'yes', 'no',
      '₹5,000 Cr',
      1000.00, 8.40, 2014,
      '[2]', '[5,6]', '[2]',
      'Mumbai, Maharashtra', 10, 10,
      NOW(), NOW()
    ),
    (
      'PureLeaf Organics',
      'https://ui-avatars.com/api/?name=PureLeaf&background=1e8449&color=fff&size=64',
      -1.50,
      'Vertically integrated organic F&B brand with 600+ SKUs across 18 states.',
      'PureLeaf sources directly from 12 000 certified organic farmers and sells through modern trade and D2C.',
      'Revenue ₹185 Cr, growing 42% YoY. Gross margin 58%. Pursuing Series B to fund national expansion.',
      'Low Demand', 'no', 'no',
      '₹800 Cr',
      160.00, -1.50, 2020,
      '[5]', '[12]', '[3,4]',
      'Bengaluru, Karnataka', 5, 5,
      NOW(), NOW()
    );
  `);

  // ── 8. Private market news ────────────────────────────────────────────────
  console.log("🌱 Seeding private_market_news…");
  await q(`
    INSERT INTO private_market_news (title, url, icon, taxonomy_ids, created_at, updated_at) VALUES
      ('NovaTech closes ₹600 Cr Series D at ₹4 200 Cr valuation',
       'https://example.com/novatech-series-d', 'NT',
       '[1,4]', NOW(), NOW()),
      ('GreenGrid wins 400 MW solar project in Rajasthan',
       'https://example.com/greengrid-solar', 'GG',
       '[2,4]', NOW(), NOW()),
      ('MediCore expands to 50 new Tier-2 cities',
       'https://example.com/medicore-expansion', 'MC',
       '[3,5]', NOW(), NOW()),
      ('FinEdge raises ₹1 200 Cr for new private credit fund',
       'https://example.com/finedge-aif', 'FE',
       '[1,4]', NOW(), NOW()),
      ('PureLeaf signs distribution deal with D-Mart and Reliance Smart',
       'https://example.com/pureleaf-distribution', 'PL',
       '[3,6]', NOW(), NOW());
  `);

  // ── 9. Notable activities ─────────────────────────────────────────────────
  console.log("🌱 Seeding notable_activities…");
  await q(`
    INSERT INTO notable_activities (activity_type, icon, description, created_at, updated_at) VALUES
      ('Large Trade',    'LT', 'Institutional block purchase of ₹4.5 Cr in NovaTech',    NOW(), NOW()),
      ('New Listing',    'NL', 'GreenGrid Energy shares now available on the platform',   NOW(), NOW()),
      ('High Interest',  'HI', '620% spike in search interest for MediCore Diagnostics', NOW(), NOW()),
      ('Price Movement', 'PM', 'FinEdge up 8.4% following strong quarterly numbers',     NOW(), NOW()),
      ('Market Update',  'MU', 'Private market activity up 34% in Q1 FY26',              NOW(), NOW());
  `);

  console.log("\n🎉 Seeding complete! Summary:");
  const [[{ sectors }]]    = await sequelize.query("SELECT COUNT(*) AS sectors FROM sectors")    as any;
  const [[{ subsectors }]] = await sequelize.query("SELECT COUNT(*) AS subsectors FROM subsectors") as any;
  const [[{ themes }]]     = await sequelize.query("SELECT COUNT(*) AS themes FROM themes")      as any;
  const [[{ products }]]   = await sequelize.query("SELECT COUNT(*) AS products FROM products")  as any;
  const [[{ news }]]       = await sequelize.query("SELECT COUNT(*) AS news FROM private_market_news") as any;
  console.table({ sectors, subsectors, themes, products, news });

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
