const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'setup-notable-activities.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root', // Using password from config
      database: 'invest_app'
    });
    
    console.log('Connected to MySQL database');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
            console.log('⚠ Skipped (already exists):', statement.substring(0, 50) + '...');
          } else {
            console.error('✗ Error executing:', statement.substring(0, 50) + '...');
            console.error('Error:', error.message);
          }
        }
      }
    }
    
    // Verify tables were created
    console.log('\n--- Verifying tables ---');
    const [tables] = await connection.execute("SHOW TABLES LIKE '%notable%'");
    console.log('Notable activities table:', tables.length > 0 ? '✓ Created' : '✗ Missing');
    
    const [activityTables] = await connection.execute("SHOW TABLES LIKE '%activity%'");
    console.log('Activity types table:', activityTables.length > 0 ? '✓ Created' : '✗ Missing');
    
    // Check data
    const [activityTypes] = await connection.execute("SELECT COUNT(*) as count FROM activity_types");
    console.log('Activity types count:', activityTypes[0].count);
    
    const [activities] = await connection.execute("SELECT COUNT(*) as count FROM notable_activities");
    console.log('Notable activities count:', activities[0].count);
    
    await connection.end();
    console.log('\n✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nPlease make sure:');
    console.log('1. MySQL is running');
    console.log('2. Database "investapp" exists');
    console.log('3. You have the correct MySQL credentials');
  }
}

setupDatabase();
