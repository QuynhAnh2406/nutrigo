require('dotenv').config();
const runMigrations = require('./src/database_schema/migrate');

async function migrate() {
  try {
    console.log("Starting database migration script...");
    await runMigrations();
    console.log("Migration script completed successfully!");
  } catch (e) {
    console.error("Migration script failed:", e);
  }
  process.exit();
}

migrate();
