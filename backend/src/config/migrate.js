const db = require('./db');

async function runMigrations() {
  try {
    console.log("Running database migrations...");
    
    // 1. Ensure is_recipe column exists in posts
    console.log("Checking and adding is_recipe column to posts table...");
    await db.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS is_recipe BOOLEAN DEFAULT FALSE
    `);

    // 2. Ensure meal_date column exists in meal_plans
    console.log("Adding meal_date column to meal_plans table...");
    await db.query(`
      ALTER TABLE meal_plans 
      ADD COLUMN IF NOT EXISTS meal_date DATE
    `);

    // 3. Populate meal_date for existing rows
    console.log("Populating meal_date for existing rows...");
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

    // 4. Make meal_date NOT NULL
    console.log("Making meal_date NOT NULL...");
    await db.query(`
      ALTER TABLE meal_plans 
      ALTER COLUMN meal_date SET NOT NULL
    `);

    // 5. Drop old constraints on meal_plans that are not based on meal_date
    console.log("Checking and dropping old constraints on meal_plans...");
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

    // 6. Add new unique constraint UNIQUE (user_id, meal_date, meal_type, post_id)
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
    } else {
      console.log("Unique constraint meal_plans_user_date_meal_post_key already exists.");
    }

    // 7. Ensure fiber_per_100g column exists in ingredients
    console.log("Checking and adding fiber_per_100g column to ingredients table...");
    await db.query(`
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS fiber_per_100g NUMERIC(6,2) DEFAULT 0
    `);

    // Populate fiber values for existing ingredients
    console.log("Updating fiber values for existing ingredients...");
    await db.query(`
      UPDATE ingredients SET fiber_per_100g = 1.3 WHERE name = 'Gạo tẻ' AND (fiber_per_100g IS NULL OR fiber_per_100g = 0);
      UPDATE ingredients SET fiber_per_100g = 2.6 WHERE name = 'Súp lơ xanh' AND (fiber_per_100g IS NULL OR fiber_per_100g = 0);
      UPDATE ingredients SET fiber_per_100g = 6.7 WHERE name = 'Quả bơ' AND (fiber_per_100g IS NULL OR fiber_per_100g = 0);
      UPDATE ingredients SET fiber_per_100g = 3.0 WHERE name = 'Khoai lang' AND (fiber_per_100g IS NULL OR fiber_per_100g = 0);
      UPDATE ingredients SET fiber_per_100g = 1.2 WHERE name = 'Xà lách' AND (fiber_per_100g IS NULL OR fiber_per_100g = 0);
    `);

    // 8. Ensure type column exists in ingredients
    console.log("Checking and adding type column to ingredients table...");
    await db.query(`
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'ingredient'
    `);

    // 9. Ensure serving_unit column exists in ingredients
    console.log("Checking and adding serving_unit column to ingredients table...");
    await db.query(`
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS serving_unit VARCHAR(50) DEFAULT '100g'
    `);

    // 10. Ensure category column exists in ingredients
    console.log("Checking and adding category column to ingredients table...");
    await db.query(`
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'food'
    `);

    // 11. Ensure brand_name column exists in ingredients
    console.log("Checking and adding brand_name column to ingredients table...");
    await db.query(`
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS brand_name VARCHAR(100)
    `);

    // Insert brand items and update types
    console.log("Inserting brand items and updating types, categories, and brands...");
    await db.query(`
      UPDATE ingredients SET type = 'ingredient' WHERE type IS NULL;
      UPDATE ingredients SET serving_unit = '100g' WHERE serving_unit IS NULL;
      UPDATE ingredients SET category = 'food' WHERE category IS NULL;
      
      INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, type, serving_unit, category, brand_name)
      VALUES 
      ('Gạo tẻ', 130, 2.7, 28, 0.3, 1.3, 'ingredient', '100g', 'food', NULL),
      ('Ức gà', 165, 31, 0, 3.6, 0, 'ingredient', '100g', 'food', NULL),
      ('Súp lơ xanh', 34, 2.8, 7, 0.4, 2.6, 'ingredient', '100g', 'food', NULL),
      ('Trứng gà', 155, 13, 1.1, 11, 0, 'ingredient', '100g', 'food', NULL),
      ('Thịt bò thăn', 250, 26, 0, 15, 0, 'ingredient', '100g', 'food', NULL),
      ('Cá hồi', 208, 20, 0, 13, 0, 'ingredient', '100g', 'food', NULL),
      ('Quả bơ', 160, 2, 9, 15, 6.7, 'ingredient', '100g', 'food', NULL),
      ('Khoai lang', 86, 1.6, 20, 0.1, 3.0, 'ingredient', '100g', 'food', NULL),
      ('Dầu oliu', 884, 0, 0, 100, 0, 'ingredient', '100g', 'food', NULL),
      ('Xà lách', 15, 1.4, 2.9, 0.2, 1.2, 'ingredient', '100g', 'food', NULL),
      ('Trà sữa trân châu Gong Cha', 350, 1.5, 55, 8.5, 0, 'brand', '1 ly', 'drink', 'Gong Cha'),
      ('Bánh mì Huỳnh Hoa', 450, 18, 60, 16, 1.5, 'brand', '1 cái', 'food', 'Huỳnh Hoa'),
      ('Pizza Hut Pepperoni (1 miếng)', 290, 12, 32, 11, 1, 'brand', '1 miếng', 'food', 'Pizza Hut'),
      ('Trà sữa Phúc Long', 380, 2.0, 58, 9.0, 0, 'brand', '1 ly', 'drink', 'Phúc Long'),
      ('KFC Gà Rán (1 miếng)', 290, 19, 12, 18, 0, 'brand', '1 miếng', 'food', 'KFC'),
      ('Highlands Phin Sữa Đá', 180, 4, 32, 4, 0, 'brand', '1 ly', 'drink', 'Highlands'),
      ('Khoai tây chiên KFC', 310, 4, 40, 15, 2, 'brand', '1 phần', 'snack', 'KFC'),
      ('Highlands Freeze Trà Xanh', 280, 5, 48, 8, 0, 'brand', '1 ly', 'drink', 'Highlands'),
      ('Snack khoai tây Lays', 150, 2, 15, 10, 1.5, 'brand', '1 gói', 'snack', 'Lays')
      ON CONFLICT (name) DO UPDATE SET 
          calories_per_100g = EXCLUDED.calories_per_100g,
          protein_per_100g = EXCLUDED.protein_per_100g,
          carbs_per_100g = EXCLUDED.carbs_per_100g,
          fat_per_100g = EXCLUDED.fat_per_100g,
          fiber_per_100g = EXCLUDED.fiber_per_100g,
          type = EXCLUDED.type,
          serving_unit = EXCLUDED.serving_unit,
          category = EXCLUDED.category,
          brand_name = EXCLUDED.brand_name;
    `);

    // 12. Ensure meal_type, category, and health_level columns exist in posts table
    console.log("Checking and adding meal_type, category, and health_level columns to posts table...");
    await db.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'food',
      ADD COLUMN IF NOT EXISTS health_level VARCHAR(50) DEFAULT 'medium'
    `);
    
    // Set default values for existing posts
    await db.query(`
      UPDATE posts SET category = 'food' WHERE category IS NULL;
      UPDATE posts SET health_level = 'medium' WHERE health_level IS NULL;
      UPDATE posts SET health_level = 'excellent', meal_type = 'lunch' WHERE id = 1;
    `);

    console.log("Database migrations completed successfully!");
  } catch (err) {
    console.error("Database migrations failed:", err);
    throw err;
  }
}

module.exports = runMigrations;
