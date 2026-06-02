require('dotenv').config();
const db = require('./src/config/db');

async function migrate() {
  try {
    console.log("Starting database migration...");
    
    // Ensure is_recipe column exists in posts
    console.log("Checking and adding is_recipe column to posts table...");
    await db.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS is_recipe BOOLEAN DEFAULT FALSE
    `);

    // Find unique constraint name
    const res = await db.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'meal_plans'::regclass AND contype = 'u'
    `);
    
    console.log("Existing unique constraints on meal_plans:", res.rows);
    
    for (let row of res.rows) {
      if (row.conname.includes('day_name') && row.conname.includes('meal_type')) {
        console.log(`Dropping constraint: ${row.conname}`);
        await db.query(`ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS ${row.conname}`);
      }
    }
    
    // Check if the unique constraint with post_id already exists
    const checkPostIdKey = await db.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'meal_plans'::regclass AND conname = 'meal_plans_user_day_meal_post_key'
    `);

    if (checkPostIdKey.rows.length === 0) {
      console.log("Adding new unique constraint UNIQUE(user_id, day_name, meal_type, post_id)...");
      await db.query(`
        ALTER TABLE meal_plans 
        ADD CONSTRAINT meal_plans_user_day_meal_post_key UNIQUE (user_id, day_name, meal_type, post_id)
      `);
    } else {
      console.log("Unique constraint meal_plans_user_day_meal_post_key already exists.");
    }
    
    console.log("Migration completed successfully!");
  } catch (e) {
    console.error("Migration failed:", e);
  }
  process.exit();
}

migrate();
