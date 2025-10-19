const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin@localhost:5432/vet_app_db'
});

module.exports = pool;