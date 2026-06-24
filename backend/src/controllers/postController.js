const db = require('../config/db');

// Giả định user ID = 1 nếu không có middleware xác thực
const getUserId = (req) => req.user ? req.user.id : 1;

exports.getPosts = async (req, res) => {
  const { search, filter, tab } = req.query;
  const userId = getUserId(req);
  
  try {
    let baseQuery = `
      SELECT p.*, u.full_name as author, u.avatar_url as avatar
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 AND p.is_recipe = TRUE
    `;
    const queryParams = [userId];
    let paramCount = 1;

    // Search filtering
    if (search) {
      paramCount++;
      baseQuery += ` AND (p.food_name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Execute base query
    const { rows: posts } = await db.query(baseQuery + ' ORDER BY p.created_at DESC', queryParams);

    // Fetch tags and ingredients for each post
    // This can be optimized with JSON_AGG in SQL, but doing it in JS for clarity and compatibility
    for (let post of posts) {
      // Map columns to match frontend expectations
      post.foodName = post.food_name;
      post.image = post.image_url;
      post.prepTime = post.prep_time;
      post.macros = { carbs: post.carbs, protein: post.protein, fat: post.fat };
      post.mealType = post.meal_type;
      post.category = post.category || 'food';
      post.healthLevel = post.health_level || 'medium';
      post.timeAgo = 'Vừa xong'; // Mock time
      post.comments = []; // Mock comments

      // Filter logic removed since tags are removed

      // Get Ingredients
      const ingRes = await db.query(`
        SELECT pi.ingredient_name as name, pi.amount, pi.calories, pi.weight_g,
               i.calories_per_100g, i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g, i.fiber_per_100g
        FROM post_ingredients pi
        LEFT JOIN ingredients i ON pi.ingredient_name = i.name
        WHERE pi.post_id = $1
      `, [post.id]);
      post.ingredients = ingRes.rows;

      // Get Instructions
      const instRes = await db.query('SELECT instruction FROM post_instruction_steps WHERE post_id = $1 ORDER BY step_number ASC', [post.id]);
      post.instructions = instRes.rows.map(r => r.instruction);
    }

    const finalPosts = posts.filter(p => !p.hidden);

    res.status(200).json({
      success: true,
      data: finalPosts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPostById = async (req, res) => {
  const userId = getUserId(req);
  const postId = req.params.id;
  
  try {
    let baseQuery = `
      SELECT p.*, u.full_name as author, u.avatar_url as avatar
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const { rows: posts } = await db.query(baseQuery, [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let post = posts[0];
    post.foodName = post.food_name;
    post.image = post.image_url;
    post.prepTime = post.prep_time;
    post.macros = { carbs: post.carbs, protein: post.protein, fat: post.fat };
    post.mealType = post.meal_type;
    post.category = post.category || 'food';
    post.healthLevel = post.health_level || 'medium';
    post.timeAgo = 'Vừa xong'; // Mock time
    post.comments = []; // Mock comments

    // Tags logic removed

    // Get Ingredients
    const ingRes = await db.query(`
      SELECT pi.ingredient_name as name, pi.amount, pi.calories, pi.weight_g,
             i.calories_per_100g, i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g, i.fiber_per_100g
      FROM post_ingredients pi
      LEFT JOIN ingredients i ON pi.ingredient_name = i.name
      WHERE pi.post_id = $1
    `, [post.id]);
    post.ingredients = ingRes.rows;

    // Get Instructions
    const instRes = await db.query('SELECT instruction FROM post_instruction_steps WHERE post_id = $1 ORDER BY step_number ASC', [post.id]);
    post.instructions = instRes.rows.map(r => r.instruction);

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.createPost = async (req, res) => {
  const { foodName, description, image, prepTime, difficulty, ingredients, instructions, isRecipe, mealType, category, healthLevel } = req.body;
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

    // 1. Insert post
    const postRes = await client.query(`
      INSERT INTO posts (user_id, food_name, description, image_url, prep_time, difficulty, calories, carbs, protein, fat, is_recipe, meal_type, category, health_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
    `, [
      userId, foodName, description, 
      image || 'https://images.unsplash.com/photo-1498837167922-41cfa6f500ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      prepTime || 'Unknown', difficulty || 'Medium', 
      Math.round(totalCal) > 0 ? Math.round(totalCal) : 300, 
      30, 20, 10, // Mock macros
      isRecipe !== undefined ? isRecipe : true,
      mealType || null,
      category || 'food',
      healthLevel || 'medium'
    ]);

    const postId = postRes.rows[0].id;

    // 2. Tags insertion removed

    // 3. Insert ingredients
    if (ingredients && Array.isArray(ingredients)) {
      for (let ing of ingredients) {
        await client.query('INSERT INTO post_ingredients (post_id, ingredient_name, amount, calories) VALUES ($1, $2, $3, $4)', 
          [postId, ing.name, ing.amount, ing.calories || 0]);
      }
    }

    // 4. Insert instructions
    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        await client.query('INSERT INTO post_instruction_steps (post_id, step_number, instruction) VALUES ($1, $2, $3)', 
          [postId, i + 1, instructions[i]]);
      }
    }

    await client.query('COMMIT');

    // Return mock-like response so frontend doesn't break
    const newPost = {
      id: postId,
      author: '@current_user',
      avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random',
      foodName,
      description,
      image: postRes.rows[0].image_url,
      calories: postRes.rows[0].calories,
      prepTime: postRes.rows[0].prep_time,
      difficulty: postRes.rows[0].difficulty,

      macros: { carbs: 30, protein: 20, fat: 10 },
      ingredients: ingredients || [],
      instructions: instructions || [],
      rating: 0,
      timeAgo: 'Vừa xong',
      comments: []
    };

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during post creation' });
  } finally {
    client.release();
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id;
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

    // 1. Update post basic info
    await client.query(`
      UPDATE posts 
      SET food_name = $1, description = $2, image_url = $3, prep_time = $4, difficulty = $5, calories = $6, category = $7, health_level = $8
      WHERE id = $9
    `, [
      foodName, description, 
      image || 'https://images.unsplash.com/photo-1498837167922-41cfa6f500ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      prepTime || 'Unknown', difficulty || 'Medium', 
      Math.round(totalCal) > 0 ? Math.round(totalCal) : 300, 
      category || 'food',
      healthLevel || 'medium',
      postId
    ]);

    // 2. Delete tags logic removed

    // 3. Delete and re-insert ingredients
    await client.query('DELETE FROM post_ingredients WHERE post_id = $1', [postId]);
    if (ingredients && Array.isArray(ingredients)) {
      for (let ing of ingredients) {
        await client.query('INSERT INTO post_ingredients (post_id, ingredient_name, amount, calories) VALUES ($1, $2, $3, $4)', 
          [postId, ing.name, ing.amount, ing.calories || 0]);
      }
    }

    // 4. Delete and re-insert instructions
    await client.query('DELETE FROM post_instruction_steps WHERE post_id = $1', [postId]);
    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        await client.query('INSERT INTO post_instruction_steps (post_id, step_number, instruction) VALUES ($1, $2, $3)', 
          [postId, i + 1, instructions[i]]);
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during post update' });
  } finally {
    client.release();
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = getUserId(req);

  try {
    const checkRes = await db.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Công thức không tồn tại' });
    }

    if (checkRes.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá công thức này' });
    }

    await db.query('DELETE FROM posts WHERE id = $1', [postId]);
    res.status(200).json({ success: true, message: 'Xoá công thức thành công' });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xoá công thức' });
  }
};

