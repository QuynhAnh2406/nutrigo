require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'nutrigo',
  port: process.env.DB_PORT || 5432,
});

async function alterDB() {
  try {
    await pool.query('ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS image_url TEXT');
    console.log('Successfully added image_url column to ingredients table.');
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    pool.end();
  }
}

alterDB();
