const db = require('../config/db');

// Helper to get week start (Monday)
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getUserId = async (req) => {
  if (req.user) return req.user.id;
  const { rows } = await db.query('SELECT id FROM users LIMIT 1');
  return rows.length > 0 ? rows[0].id : 1;
};

exports.getWeeklyPlan = async (req, res) => {
  const userId = await getUserId(req);
  const { weekStart } = req.query; // YYYY-MM-DD format

  try {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Parse start date of the week
    let start = weekStart ? new Date(weekStart) : getWeekStart(new Date());
    start = getWeekStart(start);
    
    // Generate the 7 dates of the week
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      weekDates.push(`${year}-${month}-${date}`);
    }

    // Initialize plan structure mapped to weekday names
    let weeklyPlan = daysOfWeek.map((day, idx) => ({
      day,
      date: weekDates[idx], // Send the actual date string to the frontend
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      }
    }));

    // Fetch user's meal plan for the specific week dates
    const { rows: planRows } = await db.query(`
      SELECT mp.id as meal_plan_id, TO_CHAR(mp.meal_date, 'YYYY-MM-DD') as meal_date_str, mp.meal_type, 
             r.id as recipe_id, r.food_name, r.calories, r.image_url, r.protein, r.carbs, r.fat
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.meal_date >= $2 AND mp.meal_date <= $3
    `, [userId, weekDates[0], weekDates[6]]);

    planRows.forEach(row => {
      const rowDateStr = row.meal_date_str;
      const dayIndex = weeklyPlan.findIndex(d => d.date === rowDateStr);
      if (dayIndex !== -1 && mealTypes.includes(row.meal_type)) {
        weeklyPlan[dayIndex].meals[row.meal_type].push({
          mealPlanId: row.meal_plan_id,
          id: row.recipe_id,
          title: row.food_name,
          calories: row.calories,
          protein: row.protein,
          carbs: row.carbs,
          fat: row.fat,
          image_url: row.image_url,
          ingredients: [] // Will be populated next
        });
      }
    });

    // Populate ingredients for all meals in weeklyPlan
    for (let dayPlan of weeklyPlan) {
      for (let type of mealTypes) {
        for (let meal of dayPlan.meals[type]) {
          const { rows: ingredients } = await db.query(`
            SELECT pi.ingredient_name as name
            FROM recipe_ingredients pi
            WHERE pi.recipe_id = $1
          `, [meal.id]);
          meal.ingredients = ingredients.map(i => i.name);
        }
      }
    }

    res.json({ success: true, data: weeklyPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  const userId = await getUserId(req);
  const { year, month, start, end } = req.query;

  try {
    let startDateStr, endDateStr;
    if (start && end) {
      startDateStr = start;
      endDateStr = end;
    } else {
      const y = parseInt(year);
      const m = parseInt(month) - 1; // JS months are 0-indexed
      const startOfMonth = new Date(y, m, 1);
      const endOfMonth = new Date(y, m + 1, 0);
      
      const startYear = startOfMonth.getFullYear();
      const startM = String(startOfMonth.getMonth() + 1).padStart(2, '0');
      const startD = String(startOfMonth.getDate()).padStart(2, '0');
      
      const endYear = endOfMonth.getFullYear();
      const endM = String(endOfMonth.getMonth() + 1).padStart(2, '0');
      const endD = String(endOfMonth.getDate()).padStart(2, '0');

      startDateStr = `${startYear}-${startM}-${startD}`;
      endDateStr = `${endYear}-${endM}-${endD}`;
    }

    const { rows } = await db.query(`
      SELECT DISTINCT TO_CHAR(meal_date, 'YYYY-MM-DD') as meal_date_str
      FROM meal_plans
      WHERE user_id = $1 AND meal_date >= $2 AND meal_date <= $3
    `, [userId, startDateStr, endDateStr]);

    const daysWithMeals = rows.map(r => r.meal_date_str);

    res.json({ success: true, data: daysWithMeals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  const { day, mealType, recipeId, mealPlanId, mealDate } = req.body;
  const userId = await getUserId(req);

  try {
    if (mealPlanId) {
      // Clear specific meal by its ID
      await db.query(`
        DELETE FROM meal_plans 
        WHERE id = $1 AND user_id = $2
      `, [mealPlanId, userId]);
    } else if (recipeId && mealDate) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysOfWeek[new Date(mealDate).getDay()];

      // Insert new plan item on a specific calendar date
      await db.query(`
        INSERT INTO meal_plans (user_id, day_name, meal_type, recipe_id, meal_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, meal_date, meal_type, recipe_id) 
        DO NOTHING
      `, [userId, dayName, mealType, recipeId, mealDate]);
    } else if (mealDate) {
      // Clear all meals in slot on that date
      await db.query(`
        DELETE FROM meal_plans 
        WHERE user_id = $1 AND meal_date = $2 AND meal_type = $3
      `, [userId, mealDate, mealType]);
    }

    // Pass the weekStart of mealDate back to getWeeklyPlan to load the correct week
    if (mealDate) {
      const start = getWeekStart(new Date(mealDate));
      req.query.weekStart = start.toISOString().split('T')[0];
    }
    exports.getWeeklyPlan(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.clearDay = async (req, res) => {
  const { mealDate } = req.body;
  const userId = await getUserId(req);

  try {
    if (!mealDate) {
      return res.status(400).json({ success: false, message: 'mealDate is required' });
    }
    
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(mealDate).getDay()];

    const result = await db.query(`
      DELETE FROM meal_plans 
      WHERE user_id = $1 AND (meal_date = $2 OR (meal_date IS NULL AND day_name = $3))
    `, [userId, mealDate, dayName]);

    res.json({ success: true, deletedCount: result.rowCount });
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
    const { rows: recipes } = await db.query('SELECT id, food_name as name, calories, prep_time as "prepTime" FROM recipes');
    
    const suggestions = [];

    for (let recipe of recipes) {
      const ingRes = await db.query('SELECT ingredient_name FROM recipe_ingredients WHERE recipe_id = $1', [recipe.id]);
      const recipeIngs = ingRes.rows.map(r => r.ingredient_name);
      
      const totalNeeded = recipeIngs.length;
      if (totalNeeded === 0) continue; // Skip recipes with no ingredients

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
        ...recipe,
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
    const { rows } = await db.query('SELECT id, food_name as name, calories FROM recipes LIMIT 20');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.autoFillWeek = async (req, res) => {
  const userId = await getUserId(req);
  const { weekStart } = req.query;

  try {
    const { rows: recipes } = await db.query('SELECT id FROM recipes LIMIT 50');
    if (recipes.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipes available to autofill' });
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    // Generate week dates
    let start = weekStart ? new Date(weekStart) : getWeekStart(new Date());
    start = getWeekStart(start);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      weekDates.push(`${year}-${month}-${date}`);
    }

    for (let i = 0; i < 7; i++) {
      const day = daysOfWeek[i];
      const date = weekDates[i];
      for (let type of mealTypes) {
        // Check if empty on that date
        const check = await db.query('SELECT 1 FROM meal_plans WHERE user_id = $1 AND meal_date = $2 AND meal_type = $3', [userId, date, type]);
        if (check.rows.length === 0) {
          const randomRecipeId = recipes[Math.floor(Math.random() * recipes.length)].id;
          await db.query(`
            INSERT INTO meal_plans (user_id, day_name, meal_type, recipe_id, meal_date)
            VALUES ($1, $2, $3, $4, $5)
          `, [userId, day, type, randomRecipeId, date]);
        }
      }
    }

    exports.getWeeklyPlan(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getIngredients = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM ingredients ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserRecipes = async (req, res) => {
  const userId = await getUserId(req);
  try {
    // 1. Fetch own recipes
    const { rows: ownRecipes } = await db.query(`
      SELECT id, food_name as name, calories, carbs, protein, fat, description, image_url, prep_time, category, meal_type, 'my_recipe' as source
      FROM recipes 
      WHERE user_id = $1 AND is_recipe = TRUE
      ORDER BY created_at DESC
    `, [userId]);

    // 2. Fetch favorited recipes (table missing)
    const favRecipes = [];

    // 3. Merge and deduplicate
    const combined = [...ownRecipes];
    favRecipes.forEach(fav => {
      if (!combined.some(r => r.id === fav.id)) {
        combined.push(fav);
      }
    });

    // 4. Fetch ingredients for each recipe
    for (let recipe of combined) {
      const { rows: ingredients } = await db.query(`
        SELECT pi.ingredient_name as name, pi.weight_g, i.calories_per_100g, i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g
        FROM recipe_ingredients pi
        LEFT JOIN ingredients i ON pi.ingredient_name = i.name
        WHERE pi.recipe_id = $1
      `, [recipe.id]);
      recipe.ingredients = ingredients;
    }

    res.json({ success: true, data: combined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addMealWithRecipe = async (req, res) => {
  const { day, mealType, recipeData, saveToMyRecipe, updateExistingRecipe, mealDate } = req.body;
  const userId = await getUserId(req);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    let recipeId = recipeData.id;

    // Calculate totals and ensure they are numbers
    const totalCals = recipeData.ingredients.reduce((sum, ing) => sum + (Number(ing.calories_per_100g || 0) * Number(ing.weight_g || 0) / 100), 0);
    const totalProtein = recipeData.ingredients.reduce((sum, ing) => sum + (Number(ing.protein_per_100g || 0) * Number(ing.weight_g || 0) / 100), 0);
    const totalCarbs = recipeData.ingredients.reduce((sum, ing) => sum + (Number(ing.carbs_per_100g || 0) * Number(ing.weight_g || 0) / 100), 0);
    const totalFat = recipeData.ingredients.reduce((sum, ing) => sum + (Number(ing.fat_per_100g || 0) * Number(ing.weight_g || 0) / 100), 0);

    if (recipeId && updateExistingRecipe) {
      // Update existing recipe
      await client.query(`
        UPDATE recipes 
        SET food_name = $1, calories = $2, protein = $3, carbs = $4, fat = $5, description = $6, prep_time = $7, image_url = $8, category = $9
        WHERE id = $10 AND user_id = $11
      `, [
        recipeData.name, 
        Math.round(totalCals), 
        totalProtein, 
        totalCarbs, 
        totalFat, 
        recipeData.description || 'Added via Meal Plan', 
        recipeData.prepTime || '30 min',
        recipeData.imageUrl || '',
        recipeData.category || 'food',
        recipeId,
        userId
      ]);

      // Delete old ingredients and insert new ones
      await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
      
      for (let ing of recipeData.ingredients) {
        const ingCals = (Number(ing.calories_per_100g || 0) * Number(ing.weight_g || 0) / 100);
        await client.query(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, weight_g, calories)
          VALUES ($1, $2, $3, $4)
        `, [recipeId, ing.name, Number(ing.weight_g || 0), ingCals]);
      }

      // Delete old instructions and insert new ones
      await client.query('DELETE FROM recipe_instruction_steps WHERE recipe_id = $1', [recipeId]);
      if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
        for (let i = 0; i < recipeData.instructions.length; i++) {
          await client.query(`
            INSERT INTO recipe_instruction_steps (recipe_id, step_number, instruction)
            VALUES ($1, $2, $3)
          `, [recipeId, i + 1, recipeData.instructions[i]]);
        }
      }
    } else if (!recipeId || saveToMyRecipe || (recipeId && !updateExistingRecipe)) {
      // Create new recipe (or clone if recipeId exists but updateExistingRecipe is false)
      const recipeRes = await client.query(`
        INSERT INTO recipes (user_id, food_name, calories, protein, carbs, fat, description, prep_time, image_url, is_recipe, meal_type, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        userId, 
        recipeData.name, 
        Math.round(totalCals), 
        totalProtein, 
        totalCarbs, 
        totalFat, 
        recipeData.description || 'Added via Meal Plan', 
        recipeData.prepTime || '30 min',
        recipeData.imageUrl || '',
        // Nếu là clone (chọn món nhưng không chọn cập nhật bản gốc) thì is_recipe = false. Ngược lại dùng saveToMyRecipe
        (recipeId && !updateExistingRecipe) ? false : (saveToMyRecipe === true || saveToMyRecipe === 'true'),
        mealType || null,
        recipeData.category || 'food'
      ]);
      
      recipeId = recipeRes.rows[0].id;

      // Insert ingredients
      for (let ing of recipeData.ingredients) {
        const ingCals = (Number(ing.calories_per_100g || 0) * Number(ing.weight_g || 0) / 100);
        await client.query(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, weight_g, calories)
          VALUES ($1, $2, $3, $4)
        `, [recipeId, ing.name, Number(ing.weight_g || 0), ingCals]);
      }

      // Insert instructions
      if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
        for (let i = 0; i < recipeData.instructions.length; i++) {
          await client.query(`
            INSERT INTO recipe_instruction_steps (recipe_id, step_number, instruction)
            VALUES ($1, $2, $3)
          `, [recipeId, i + 1, recipeData.instructions[i]]);
        }
      }
    }

    // Add to meal plan
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = mealDate ? daysOfWeek[new Date(mealDate).getDay()] : day;
    const targetDate = mealDate || new Date().toISOString().split('T')[0];

    await client.query(`
      INSERT INTO meal_plans (user_id, day_name, meal_type, recipe_id, meal_date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, meal_date, meal_type, recipe_id) 
      DO NOTHING
    `, [userId, dayName, mealType, recipeId, targetDate]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Meal added successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("ADD MEAL ERROR:", error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  } finally {
    client.release();
  }
};
