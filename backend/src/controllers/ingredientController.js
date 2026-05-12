const db = require('../config/db');

const fallbackNutritionDB = {
  'Ức gà': { cal: 165, p: 31, c: 0, f: 3.6 },
  'Trứng': { cal: 155, p: 13, c: 1.1, f: 11 },
  'Gạo lứt': { cal: 111, p: 2.6, c: 23, f: 0.9 },
  'Bơ': { cal: 160, p: 2, c: 9, f: 15 },
  'Súp lơ': { cal: 34, p: 2.8, c: 7, f: 0.4 },
  'Cà chua': { cal: 18, p: 0.9, c: 3.9, f: 0.2 },
  'Cá hồi': { cal: 208, p: 20, c: 0, f: 13 },
  'Sữa chua': { cal: 59, p: 10, c: 3.6, f: 0.4 },
  'Khoai lang': { cal: 86, p: 1.6, c: 20, f: 0.1 },
  'Chuối': { cal: 89, p: 1.1, c: 23, f: 0.3 },
  'Thịt bò': { cal: 250, p: 26, c: 0, f: 15 },
  'Đậu phụ': { cal: 76, p: 8, c: 1.9, f: 4.8 },
  'Hạt điều': { cal: 553, p: 18, c: 30, f: 44 }
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
        f: parseFloat(row.fat_per_100g)
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
