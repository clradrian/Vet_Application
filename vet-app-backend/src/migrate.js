const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found.');
    process.exit(0);
  }
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log('Applying migration', file);
    try {
      await pool.query(sql);
      console.log('Applied', file);
    } catch (err) {
      console.error('Error applying', file, err.message);
      process.exit(1);
    }
  }
  console.log('All migrations applied.');
  process.exit(0);
}

runMigrations();
