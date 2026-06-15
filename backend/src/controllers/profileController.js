const db = require('../config/db');

const getUserId = (req) => (req.user && req.user.id ? req.user.id : 1);

const normalizeNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

exports.getMyHealth = async(req, res) => {
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
        TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        u.avatar_url
      FROM users u
      LEFT JOIN user_health_data uh ON u.id = uh.user_id
      WHERE u.id = $1`, [userId]
        );

        const data = rows[0] || null;
        if (data) {
            if (data.height_cm !== null && data.height_cm !== undefined) {
                data.height_cm = parseFloat(data.height_cm);
            }
            if (data.weight_kg !== null && data.weight_kg !== undefined) {
                data.weight_kg = parseFloat(data.weight_kg);
            }
        }

        res.json({ success: true, data });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.upsertMyHealth = async(req, res) => {
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
        phone,
        email,
        avatarUrl,
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
        phone`, [
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

        const currentUserResult = await db.query('SELECT email, avatar_url FROM users WHERE id = $1', [userId]);
        const currentUser = currentUserResult.rows[0] || {};
        const updates = [];
        const updateValues = [];

        if (email && email !== currentUser.email) {
            updates.push('email = $' + (updateValues.length + 1));
            updateValues.push(email);
        }

        if (avatarUrl && avatarUrl !== currentUser.avatar_url) {
            updates.push('avatar_url = $' + (updateValues.length + 1));
            updateValues.push(avatarUrl);
        }

        if (updates.length > 0) {
            await db.query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = $${updateValues.length + 1}`, [...updateValues, userId]
            );
        }

        const responseRow = {
            ...rows[0],
            avatar_url: avatarUrl || currentUser.avatar_url || null
        };
        if (responseRow.height_cm !== null && responseRow.height_cm !== undefined) {
            responseRow.height_cm = parseFloat(responseRow.height_cm);
        }
        if (responseRow.weight_kg !== null && responseRow.weight_kg !== undefined) {
            responseRow.weight_kg = parseFloat(responseRow.weight_kg);
        }

        res.json({ success: true, data: responseRow });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return res.status(400).json({ success: false, message: 'Email đã tồn tại.' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};