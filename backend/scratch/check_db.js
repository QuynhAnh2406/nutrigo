const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkHealthData() {
  try {
    const res = await pool.query('SELECT * FROM user_health_data');
    console.log('--- Health Data Rows ---');
    console.table(res.rows);
    
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_health_data'
      ORDER BY ordinal_position
    `);
    console.log('--- Table Structure ---');
    console.table(tableInfo.rows);

    const constraints = await pool.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'user_health_data'::regclass
    `);
    console.log('--- Constraints ---');
    console.table(constraints.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await pool.end();
  }
}

checkHealthData();
