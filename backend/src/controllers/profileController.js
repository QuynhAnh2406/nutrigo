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
        uh.gender,
        uh.height_cm,
        uh.weight_kg,
        uh.activity_level,
        uh.goal,
        uh.dietary_preference,
        uh.allergies,
        uh.cooking_skill,
        uh.phone,
        TO_CHAR(uh.date_of_birth, 'YYYY-MM-DD') as date_of_birth,
        TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM users u
      LEFT JOIN user_health_data uh ON u.id = uh.user_id
      WHERE u.id = $1`,
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
  console.log('--- UPSERT ATTEMPT ---');
  console.log('User ID:', userId);
  console.log('Request Body:', req.body);

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
    phone,
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
        cooking_skill,
        phone
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
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
        cooking_skill = EXCLUDED.cooking_skill,
        phone = EXCLUDED.phone
      RETURNING
        TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
        gender,
        height_cm,
        weight_kg,
        activity_level,
        goal,
        dietary_preference,
        allergies,
        cooking_skill,
        phone`,
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
        phone || null,
      ]
    );

    // Update email in users table
    if (req.body.email) {
      await db.query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [req.body.email, userId]
      );
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

