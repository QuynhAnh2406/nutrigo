const { Pool } = require('pg');

const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'nutrigo',
      port: process.env.DB_PORT || 5432,
    });

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database successfully');
});

// Self-healing schema migration to ensure required columns exist
pool.query(`
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS meal_types VARCHAR(50);
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'food';
`).then(() => {
  console.log('Database self-healing schema checks completed.');
}).catch(err => {
  console.error('Database self-healing schema check failed:', err);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
