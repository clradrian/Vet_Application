const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vet_app_db',
  user: process.env.DB_USER || 'vet_user',
  password: process.env.DB_PASSWORD || 'vet_password'
});

module.exports = pool;