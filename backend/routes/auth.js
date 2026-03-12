const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (Admin only)
const { authenticateToken, requireRole } = require('../middleware/auth');
router.post('/register', authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!['Admin', 'Manager', 'Staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
