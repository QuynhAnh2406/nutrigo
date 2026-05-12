const db = require('../config/db');

const getUserId = (req) => (req.user && req.user.id ? req.user.id : 1);

const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

exports.getMyHealth = async (req, res) => {
  const userId = getUserId(req);

  try {
    const { rows } = await db.query(
      `SELECT
        date_of_birth,
        gender,
        height_cm,
        weight_kg,
        activity_level,
        goal,
        dietary_preference,
        allergies,
        cooking_skill
      FROM user_health_data
      WHERE user_id = $1`,
      [userId]
    );

    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.upsertMyHealth = async (req, res) => {
  const userId = getUserId(req);
  const {
    dateOfBirth,
    gender,
    height,
    weight,
    activityLevel,
    goal,
    dietaryPreference,
    allergies,
    cookingSkill,
  } = req.body || {};

  try {
    const { rows } = await db.query(
      `INSERT INTO user_health_data (
        user_id,
        date_of_birth,
        gender,
        height_cm,
        weight_kg,
        activity_level,
        goal,
        dietary_preference,
        allergies,
        cooking_skill
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      ON CONFLICT (user_id) DO UPDATE SET
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        activity_level = EXCLUDED.activity_level,
        goal = EXCLUDED.goal,
        dietary_preference = EXCLUDED.dietary_preference,
        allergies = EXCLUDED.allergies,
        cooking_skill = EXCLUDED.cooking_skill
      RETURNING
        date_of_birth,
        gender,
        height_cm,
        weight_kg,
        activity_level,
        goal,
        dietary_preference,
        allergies,
        cooking_skill`,
      [
        userId,
        dateOfBirth || null,
        gender || null,
        normalizeNumber(height),
        normalizeNumber(weight),
        activityLevel || null,
        goal || null,
        dietaryPreference || null,
        allergies || null,
        cookingSkill || null,
      ]
    );

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

