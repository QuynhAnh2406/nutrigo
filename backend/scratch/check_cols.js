require('dotenv').config();
const db = require('../src/config/db');

async function run() {
  try {
    const res = await db.query("SELECT * FROM posts LIMIT 1");
    console.log("COLUMNS:", Object.keys(res.rows[0] || {}));
  } catch(e) {
    console.error("ERROR:", e);
  }
  process.exit();
}
run();
