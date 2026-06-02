const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email or password incorrect' });
    }

    const user = result.rows[0];
    // Check password (ignoring bcrypt if the dummy password is '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890' for now)
    const isMatch = await bcrypt.compare(password, user.password_hash).catch(() => false);
    
    // For demo purposes, we will also allow login if the plain password matches password_hash (if not using bcrypt correctly)
    if (!isMatch && password !== user.password_hash) {
       return res.status(401).json({ success: false, message: 'Email or password incorrect' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatar: user.avatar_url,
        isPremium: user.is_premium,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, full_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hash, fullName || 'New User', `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'New User')}&background=random`]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatar: user.avatar_url,
        isPremium: user.is_premium,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
