const db = require('../config/db');

// Giả định user ID = 1 nếu không có middleware xác thực
const getUserId = (req) => req.user ? req.user.id : 1;

exports.getRecipes = async (req, res) => {
  const { search, filter, tab } = req.query;
  const userId = getUserId(req);
  
  try {
    let baseQuery = `
      SELECT r.*, u.full_name as author, u.avatar_url as avatar
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.user_id = $1 AND r.is_recipe = TRUE
    `;
    const queryParams = [userId];
    let paramCount = 1;

    // Search filtering
    if (search) {
      paramCount++;
      baseQuery += ` AND (r.food_name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Execute base query
    const { rows: recipes } = await db.query(baseQuery + ' ORDER BY r.created_at DESC', queryParams);

    for (let recipe of recipes) {
      recipe.foodName = recipe.food_name;
      recipe.image = recipe.image_url;
      recipe.prepTime = recipe.prep_time;
      recipe.macros = { carbs: recipe.carbs, protein: recipe.protein, fat: recipe.fat };
      recipe.mealType = recipe.meal_types;
      recipe.category = recipe.category || 'food';
      recipe.healthLevel = recipe.health_level || 'medium';
      recipe.timeAgo = 'Vừa xong';
      recipe.comments = [];

      const ingRes = await db.query(`
        SELECT pi.ingredient_name as name, pi.amount, pi.calories, pi.weight_g,
               i.calories_per_100g, i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g, i.fiber_per_100g
        FROM recipe_ingredients pi
        LEFT JOIN ingredients i ON pi.ingredient_name = i.name
        WHERE pi.recipe_id = $1
      `, [recipe.id]);
      recipe.ingredients = ingRes.rows;

      const instRes = await db.query('SELECT instruction FROM recipe_instruction_steps WHERE recipe_id = $1 ORDER BY step_number ASC', [recipe.id]);
      recipe.instructions = instRes.rows.map(r => r.instruction);
    }

    const finalRecipes = recipes.filter(r => !r.hidden);

    res.status(200).json({
      success: true,
      data: finalRecipes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRecipeById = async (req, res) => {
  const userId = getUserId(req);
  const recipeId = req.params.id;
  
  try {
    let baseQuery = `
      SELECT p.*, u.full_name as author, u.avatar_url as avatar
      FROM recipes p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const { rows: recipes } = await db.query(baseQuery, [recipeId]);
    
    if (recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    let recipe = recipes[0];
    recipe.foodName = recipe.food_name;
    recipe.image = recipe.image_url;
    recipe.prepTime = recipe.prep_time;
    recipe.macros = { carbs: recipe.carbs, protein: recipe.protein, fat: recipe.fat };
    recipe.mealType = recipe.meal_types;
    recipe.category = recipe.category || 'food';
    recipe.healthLevel = recipe.health_level || 'medium';
    recipe.timeAgo = 'Vừa xong'; // Mock time
    recipe.comments = []; // Mock comments

    // Tags logic removed

    // Get Ingredients
    const ingRes = await db.query(`
      SELECT pi.ingredient_name as name, pi.amount, pi.calories, pi.weight_g,
             i.calories_per_100g, i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g, i.fiber_per_100g
      FROM recipe_ingredients pi
      LEFT JOIN ingredients i ON pi.ingredient_name = i.name
      WHERE pi.recipe_id = $1
    `, [recipe.id]);
    recipe.ingredients = ingRes.rows;

    // Get Instructions
    const instRes = await db.query('SELECT instruction FROM recipe_instruction_steps WHERE recipe_id = $1 ORDER BY step_number ASC', [recipe.id]);
    recipe.instructions = instRes.rows.map(r => r.instruction);

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.createRecipe = async (req, res) => {
  const { foodName, description, image, prepTime, ingredients, instructions, isRecipe, mealType, category, carbs, protein, fat, calories } = req.body;
  const userId = getUserId(req);

  if (!foodName || !ingredients || !instructions) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đủ thông tin món ăn.'
    });
  }

  let totalCal = 0;
  if (ingredients && Array.isArray(ingredients)) {
    ingredients.forEach(i => totalCal += Number(i.calories || 0));
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert recipe
    const recipeRes = await client.query(`
      INSERT INTO recipes (user_id, food_name, description, image_url, prep_time, calories, carbs, protein, fat, is_recipe, meal_types, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
    `, [
      userId, foodName, description, 
      image || 'https://images.unsplash.com/photo-1498837167922-41cfa6f500ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      prepTime || 'Unknown', 
      (calories !== undefined && !isNaN(Number(calories))) ? Number(calories) : (Math.round(totalCal) > 0 ? Math.round(totalCal) : 300), 
      (carbs !== undefined && !isNaN(Number(carbs))) ? Number(carbs) : 30, 
      (protein !== undefined && !isNaN(Number(protein))) ? Number(protein) : 20, 
      (fat !== undefined && !isNaN(Number(fat))) ? Number(fat) : 10,
      isRecipe !== undefined ? isRecipe : true,
      mealType || null,
      category || 'food'
    ]);

    const recipeId = recipeRes.rows[0].id;

    // 2. Tags insertion removed

    // 3. Insert ingredients
    if (ingredients && Array.isArray(ingredients)) {
      for (let ing of ingredients) {
        await client.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, calories) VALUES ($1, $2, $3, $4)', 
          [recipeId, ing.name || ing, ing.amount || '1 phần', ing.calories || 0]);
      }
    }

    // 4. Insert instructions
    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        await client.query('INSERT INTO recipe_instruction_steps (recipe_id, step_number, instruction) VALUES ($1, $2, $3)', 
          [recipeId, i + 1, instructions[i]]);
      }
    }

    await client.query('COMMIT');

    // Return mock-like response so frontend doesn't break
    const newRecipe = {
      id: recipeId,
      author: '@current_user',
      avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random',
      foodName,
      description,
      image: recipeRes.rows[0].image_url,
      calories: recipeRes.rows[0].calories,
      prepTime: recipeRes.rows[0].prep_time,
      difficulty: recipeRes.rows[0].difficulty,

      macros: { carbs: recipeRes.rows[0].carbs, protein: recipeRes.rows[0].protein, fat: recipeRes.rows[0].fat },
      ingredients: ingredients || [],
      instructions: instructions || [],
      rating: 0,
      timeAgo: 'Vừa xong',
      comments: []
    };

    res.status(201).json({ success: true, data: newRecipe });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  } finally {
    client.release();
  }
};

exports.updateRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const { foodName, description, image, prepTime, difficulty, ingredients, instructions, category, healthLevel } = req.body;
  const userId = getUserId(req);

  if (!foodName || !ingredients || !instructions) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đủ thông tin món ăn.'
    });
  }

  let totalCal = 0;
  if (ingredients && Array.isArray(ingredients)) {
    ingredients.forEach(i => totalCal += Number(i.calories || 0));
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update Recipe basic info
    await client.query(`
      UPDATE recipes 
      SET food_name = $1, description = $2, image_url = $3, prep_time = $4, difficulty = $5, calories = $6, category = $7, health_level = $8
      WHERE id = $9
    `, [
      foodName, description, 
      image || 'https://images.unsplash.com/photo-1498837167922-41cfa6f500ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      prepTime || 'Unknown', difficulty || 'Medium', 
      Math.round(totalCal) > 0 ? Math.round(totalCal) : 300, 
      category || 'food',
      healthLevel || 'medium',
      recipeId
    ]);

    // 2. Delete tags logic removed

    // 3. Delete and re-insert ingredients
    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
    if (ingredients && Array.isArray(ingredients)) {
      for (let ing of ingredients) {
        await client.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, calories) VALUES ($1, $2, $3, $4)', 
          [recipeId, ing.name, ing.amount, ing.calories || 0]);
      }
    }

    // 4. Delete and re-insert instructions
    await client.query('DELETE FROM recipe_instruction_steps WHERE recipe_id = $1', [recipeId]);
    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        await client.query('INSERT INTO recipe_instruction_steps (recipe_id, step_number, instruction) VALUES ($1, $2, $3)', 
          [recipeId, i + 1, instructions[i]]);
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during Recipe update' });
  } finally {
    client.release();
  }
};

exports.deleteRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const userId = getUserId(req);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const checkRes = await client.query('SELECT user_id FROM recipes WHERE id = $1', [recipeId]);
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    
    if (checkRes.rows[0].user_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await client.query('DELETE FROM recipes WHERE id = $1', [recipeId]);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

