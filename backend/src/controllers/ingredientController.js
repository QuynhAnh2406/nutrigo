const db = require('../config/db');

const fallbackNutritionDB = {
  'Ức gà': { cal: 165, p: 31, c: 0, f: 3.6, fiber: 0 },
  'Trứng': { cal: 155, p: 13, c: 1.1, f: 11, fiber: 0 },
  'Gạo lứt': { cal: 111, p: 2.6, c: 23, f: 0.9, fiber: 1.8 },
  'Bơ': { cal: 160, p: 2, c: 9, f: 15, fiber: 6.7 },
  'Súp lơ': { cal: 34, p: 2.8, c: 7, f: 0.4, fiber: 2.6 },
  'Cà chua': { cal: 18, p: 0.9, c: 3.9, f: 0.2, fiber: 1.2 },
  'Cá hồi': { cal: 208, p: 20, c: 0, f: 13, fiber: 0 },
  'Sữa chua': { cal: 59, p: 10, c: 3.6, f: 0.4, fiber: 0 },
  'Khoai lang': { cal: 86, p: 1.6, c: 20, f: 0.1, fiber: 3 },
  'Chuối': { cal: 89, p: 1.1, c: 23, f: 0.3, fiber: 2.6 },
  'Thịt bò': { cal: 250, p: 26, c: 0, f: 15, fiber: 0 },
  'Đậu phụ': { cal: 76, p: 8, c: 1.9, f: 4.8, fiber: 0.3 },
  'Hạt điều': { cal: 553, p: 18, c: 30, f: 44, fiber: 3.3 }
};

exports.getIngredients = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ingredients');
    
    if (result.rows.length === 0) {
      // Fallback to mock data if DB is empty to prevent frontend crash
      return res.status(200).json({ success: true, data: fallbackNutritionDB });
    }

    const nutritionDB = {};
    result.rows.forEach(row => {
      nutritionDB[row.name] = {
        cal: parseFloat(row.calories_per_100g),
        p: parseFloat(row.protein_per_100g),
        c: parseFloat(row.carbs_per_100g),
        f: parseFloat(row.fat_per_100g),
        fiber: parseFloat(row.fiber_per_100g || 0),
        type: row.type || 'ingredient',
        servingUnit: row.serving_unit || '100g',
        category: row.category || 'food',
        brandName: row.brand_name || null,
        image_url: row.image_url || null
      };
    });

    res.status(200).json({
      success: true,
      data: nutritionDB
    });
  } catch (error) {
    console.error(error);
    // Fallback if DB connection fails
    res.status(200).json({
      success: true,
      data: fallbackNutritionDB
    });
  }
};

exports.addIngredient = async (req, res) => {
  const { name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, type, serving_unit, category, brand_name, image_url } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Tên nguyên liệu không được để trống!' });
  }

  try {
    const check = await db.query('SELECT 1 FROM ingredients WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (check.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Nguyên liệu này đã tồn tại!' });
    }

    const result = await db.query(`
      INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, type, serving_unit, category, brand_name, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      name.trim(), 
      parseFloat(calories_per_100g) || 0, 
      parseFloat(protein_per_100g) || 0, 
      parseFloat(carbs_per_100g) || 0, 
      parseFloat(fat_per_100g) || 0, 
      parseFloat(fiber_per_100g) || 0,
      type || 'ingredient',
      serving_unit || '100g',
      category || 'food',
      brand_name && brand_name.trim() ? brand_name.trim() : null,
      image_url && image_url.trim() ? image_url.trim() : null
    ]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm nguyên liệu!' });
  }
};
