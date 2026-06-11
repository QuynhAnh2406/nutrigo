const db=require('./src/config/db'); 
async function run() { 
  try { 
    const res = await db.query('SELECT COUNT(*) FROM meal_plans'); 
    console.log('Meal plans count:', res.rows[0].count); 
    const res2 = await db.query('SELECT COUNT(*) FROM posts'); 
    console.log('Posts count:', res2.rows[0].count); 
    const res3 = await db.query('SELECT COUNT(*) FROM users'); 
    console.log('Users count:', res3.rows[0].count); 
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  } 
} 
run();
