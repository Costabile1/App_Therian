const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../models/init.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await db.query(schema);
    
    console.log('Database setup completed successfully!');
    
    // Test with a simple query
    const result = await db.query('SELECT COUNT(*) FROM locations');
    console.log(`Sample locations created: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
