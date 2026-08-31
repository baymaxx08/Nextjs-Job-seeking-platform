const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Clear cache and reload env
delete require.cache[require.resolve('dotenv')];
require('dotenv').config({ override: true, path: path.join(__dirname, '.env') });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  console.log('Using connection string:', connectionString.replace(/:[^@]*@/, ':***@'));

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    application_name: 'migration',
    statement_timeout: 30000,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf-8');
    
    console.log('Running migration...');
    await client.query(migrationSQL);
    client.release();
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
