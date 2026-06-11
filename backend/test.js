const db = require('./src/config/db');

async function run() {
  try {
    const res = await db.query("SELECT * FROM users");
    console.log("Users:", res.rows);
    
    // Test the insert
    const userId = 1;
    const postRes = await db.query(`
      INSERT INTO posts (user_id, food_name, calories, protein, carbs, fat, description, prep_time, image_url, is_recipe)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      userId, 
      'Test Name', 
      300, 
      10, 
      20, 
      5, 
      'Test description', 
      '30 min',
      '',
      false
    ]);
    console.log("Post inserted:", postRes.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    process.exit(0);
  }
}
run();
