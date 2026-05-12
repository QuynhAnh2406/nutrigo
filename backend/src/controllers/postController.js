const db = require('../config/db');

// Giả định user ID = 1 nếu không có middleware xác thực
const getUserId = (req) => req.user ? req.user.id : 1;

exports.getPosts = async (req, res) => {
  const { search, filter, tab } = req.query;
  const userId = getUserId(req);
  
  try {
    let baseQuery = `
      SELECT p.*, u.full_name as author, u.avatar_url as avatar,
      (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes,
      EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) as "isLiked",
      EXISTS(SELECT 1 FROM post_favorites pf WHERE pf.post_id = p.id AND pf.user_id = $1) as "isSaved"
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const queryParams = [userId];
    let paramCount = 1;

    // Search filtering
    if (search) {
      paramCount++;
      baseQuery += ` AND (p.food_name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Tab filtering
    if (tab === 'Món Ăn Của Tôi') {
      paramCount++;
      baseQuery += ` AND p.user_id = $${paramCount}`;
      queryParams.push(userId);
    } else if (tab === 'Following') {
      // Mock Following filter for now
    } else if (tab === 'Popular') {
      // Order by rating or likes later
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
      post.timeAgo = 'Vừa xong'; // Mock time
      post.comments = []; // Mock comments

      // Get Tags
      const tagsRes = await db.query('SELECT tag_name FROM post_tags WHERE post_id = $1', [post.id]);
      post.tags = tagsRes.rows.map(t => t.tag_name);

      // Filter by tag if needed
      if (filter && filter !== 'All' && !post.tags.includes(filter)) {
         post.hidden = true;
      }

      // Get Ingredients
      const ingRes = await db.query('SELECT ingredient_name as name, amount, calories FROM post_ingredients WHERE post_id = $1', [post.id]);
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

exports.createPost = async (req, res) => {
  const { foodName, description, image, prepTime, difficulty, tags, ingredients, instructions } = req.body;
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
      INSERT INTO posts (user_id, food_name, description, image_url, prep_time, difficulty, calories, carbs, protein, fat, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [
      userId, foodName, description, 
      image || 'https://images.unsplash.com/photo-1498837167922-41cfa6f500ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      prepTime || 'Unknown', difficulty || 'Medium', 
      totalCal > 0 ? totalCal : 300, 
      30, 20, 10, 0 // Mock macros
    ]);

    const postId = postRes.rows[0].id;

    // 2. Insert tags
    if (tags && Array.isArray(tags)) {
      for (let tag of tags) {
        await client.query('INSERT INTO post_tags (post_id, tag_name) VALUES ($1, $2)', [postId, tag.trim()]);
      }
    }

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
      tags: tags || [],
      macros: { carbs: 30, protein: 20, fat: 10 },
      ingredients: ingredients || [],
      instructions: instructions || [],
      rating: 0,
      likes: 0,
      isLiked: false,
      isSaved: false,
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

exports.likePost = async (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);

  try {
    const checkRes = await db.query('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);
    let isLiked = false;

    if (checkRes.rows.length > 0) {
      await db.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);
      isLiked = false;
    } else {
      await db.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [id, userId]);
      isLiked = true;
    }

    const likesRes = await db.query('SELECT COUNT(*) FROM post_likes WHERE post_id = $1', [id]);
    res.json({ success: true, isLiked, likes: parseInt(likesRes.rows[0].count) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.favoritePost = async (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);

  try {
    const checkRes = await db.query('SELECT 1 FROM post_favorites WHERE post_id = $1 AND user_id = $2', [id, userId]);
    let isSaved = false;

    if (checkRes.rows.length > 0) {
      await db.query('DELETE FROM post_favorites WHERE post_id = $1 AND user_id = $2', [id, userId]);
      isSaved = false;
    } else {
      await db.query('INSERT INTO post_favorites (post_id, user_id) VALUES ($1, $2)', [id, userId]);
      isSaved = true;
    }

    res.json({ success: true, isSaved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.commentPost = (req, res) => {
  // Not fully implemented with DB yet, returning mock success
  const { id } = req.params;
  const { text } = req.body;
  if(text) {
    const newComment = { id: Date.now(), user: '@current_user', text };
    res.json({ success: true, comment: newComment });
  } else {
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
};

exports.reportPost = (req, res) => {
  res.json({ success: true, message: 'Đã báo cáo bài viết. Chúng tôi sẽ xem xét.' });
};
