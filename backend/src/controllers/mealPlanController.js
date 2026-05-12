const db = require('../config/db');

// Giả định user ID = 1 nếu không có middleware xác thực
const getUserId = (req) => req.user ? req.user.id : 1;

exports.getWeeklyPlan = async (req, res) => {
  const userId = getUserId(req);

  try {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Initialize empty plan
    let weeklyPlan = daysOfWeek.map(day => ({
      day,
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null
      }
    }));

    // Fetch user's meal plan
    const { rows: planRows } = await db.query(`
      SELECT mp.day_name, mp.meal_type, 
             p.id, p.food_name, p.calories
      FROM meal_plans mp
      JOIN posts p ON mp.post_id = p.id
      WHERE mp.user_id = $1
    `, [userId]);

    planRows.forEach(row => {
      const dayIndex = weeklyPlan.findIndex(d => d.day === row.day_name);
      if (dayIndex !== -1 && mealTypes.includes(row.meal_type)) {
        weeklyPlan[dayIndex].meals[row.meal_type] = {
          id: row.id,
          name: row.food_name,
          calories: row.calories
        };
      }
    });

    res.json({ success: true, data: weeklyPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  const { day, mealType, recipeId } = req.body;
  const userId = getUserId(req);

  try {
    if (recipeId) {
      // Update or Insert
      await db.query(`
        INSERT INTO meal_plans (user_id, day_name, meal_type, post_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, day_name, meal_type) 
        DO UPDATE SET post_id = EXCLUDED.post_id
      `, [userId, day, mealType, recipeId]);
    } else {
      // Clear meal
      await db.query(`
        DELETE FROM meal_plans 
        WHERE user_id = $1 AND day_name = $2 AND meal_type = $3
      `, [userId, day, mealType]);
    }

    // Call getWeeklyPlan logic internally to return updated plan
    exports.getWeeklyPlan(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.suggestMeals = async (req, res) => {
  const { userIngredients } = req.body; 
  
  if (!userIngredients || !Array.isArray(userIngredients)) {
    return res.status(400).json({ success: false, message: 'Invalid ingredients list' });
  }

  try {
    const { rows: posts } = await db.query('SELECT id, food_name as name, calories, prep_time as "prepTime" FROM posts');
    
    const suggestions = [];

    for (let post of posts) {
      const ingRes = await db.query('SELECT ingredient_name FROM post_ingredients WHERE post_id = $1', [post.id]);
      const recipeIngs = ingRes.rows.map(r => r.ingredient_name);
      
      const totalNeeded = recipeIngs.length;
      if (totalNeeded === 0) continue; // Skip posts with no ingredients

      let matchCount = 0;
      const userIngsLower = userIngredients.map(i => i.toLowerCase().trim());
      
      recipeIngs.forEach(ing => {
        if (userIngsLower.includes(ing.toLowerCase())) {
          matchCount++;
        }
      });

      const matchPercentage = Math.round((matchCount / totalNeeded) * 100);
      const missingCount = totalNeeded - matchCount;

      let matchStatus = '';
      if (missingCount === 0) matchStatus = 'Cook now';
      else if (missingCount === 1) matchStatus = 'Missing 1 ingredient';
      else if (missingCount === 2) matchStatus = 'Missing 2 ingredients';
      else matchStatus = `Missing ${missingCount} ingredients`;

      suggestions.push({
        ...post,
        ingredients: recipeIngs,
        matchPercentage,
        missingCount,
        matchStatus
      });
    }

    suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage);
    res.json({ success: true, data: suggestions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRecipes = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, food_name as name, calories FROM posts LIMIT 20');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.autoFillWeek = async (req, res) => {
  const userId = getUserId(req);

  try {
    const { rows: posts } = await db.query('SELECT id FROM posts LIMIT 50');
    if (posts.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipes available to autofill' });
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    for (let day of daysOfWeek) {
      for (let type of mealTypes) {
        // Check if empty
        const check = await db.query('SELECT 1 FROM meal_plans WHERE user_id = $1 AND day_name = $2 AND meal_type = $3', [userId, day, type]);
        if (check.rows.length === 0) {
          const randomPostId = posts[Math.floor(Math.random() * posts.length)].id;
          await db.query(`
            INSERT INTO meal_plans (user_id, day_name, meal_type, post_id)
            VALUES ($1, $2, $3, $4)
          `, [userId, day, type, randomPostId]);
        }
      }
    }

    exports.getWeeklyPlan(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
