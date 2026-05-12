require('dotenv').config();
const db = require('./src/config/db');

async function test() {
  try {
    const res = await db.query('SELECT * FROM users');
    console.log(res.rows);
  } catch(e) {
    console.error("ERROR:", e);
  }
  process.exit();
}
test();
