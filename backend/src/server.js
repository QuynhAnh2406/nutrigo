const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup database migrations
const db = require('./config/db');
(async () => {
  try {
    console.log("Running server-side migrations...");
    await db.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS is_recipe BOOLEAN DEFAULT FALSE
    `);

    console.log("Adding meal_date column to meal_plans table...");
    await db.query(`
      ALTER TABLE meal_plans 
      ADD COLUMN IF NOT EXISTS meal_date DATE
    `);

    // Populate meal_date for existing rows
    await db.query(`
      UPDATE meal_plans 
      SET meal_date = CURRENT_DATE + (
        CASE day_name
          WHEN 'Monday' THEN 0
          WHEN 'Tuesday' THEN 1
          WHEN 'Wednesday' THEN 2
          WHEN 'Thursday' THEN 3
          WHEN 'Friday' THEN 4
          WHEN 'Saturday' THEN 5
          WHEN 'Sunday' THEN 6
          ELSE 0
        END
      )::int
      WHERE meal_date IS NULL
    `);

    // Make meal_date NOT NULL
    await db.query(`
      ALTER TABLE meal_plans 
      ALTER COLUMN meal_date SET NOT NULL
    `);

    // Drop unique keys on meal_plans that are not based on meal_date
    const conRes = await db.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'meal_plans'::regclass AND contype = 'u'
    `);
    
    for (let row of conRes.rows) {
      if (row.conname.includes('day_name') || row.conname.includes('user_day_meal_post') || row.conname.includes('user_id_day_name_meal_type')) {
        console.log(`Dropping constraint: ${row.conname}`);
        await db.query(`ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS ${row.conname}`);
      }
    }

    // Add new unique constraint UNIQUE (user_id, meal_date, meal_type, post_id)
    const checkDateKey = await db.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'meal_plans'::regclass AND conname = 'meal_plans_user_date_meal_post_key'
    `);

    if (checkDateKey.rows.length === 0) {
      console.log("Adding unique constraint UNIQUE (user_id, meal_date, meal_type, post_id)...");
      await db.query(`
        ALTER TABLE meal_plans 
        ADD CONSTRAINT meal_plans_user_date_meal_post_key UNIQUE (user_id, meal_date, meal_type, post_id)
      `);
    }

    console.log("Server-side migrations completed!");
  } catch (err) {
    console.error("Server-side migrations failed:", err);
  }
})();

// Setup routes
app.use('/api', routes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// 404 for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Generic error handler
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
