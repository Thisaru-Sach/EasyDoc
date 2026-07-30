const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// GET /api/admin/users - Fetch all registered users (Admin Only)
router.get('/users', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Users Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve user accounts.' });
  }
});

// POST /api/admin/users - Provision new Doctor or Admin account
router.post('/users', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
    }

    if (!['doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either doctor or admin.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, created_at',
      [full_name.trim(), email.toLowerCase().trim(), hashedPassword, role]
    );

    // If account created successfully, send credentials via Email
    try {
      await sendCredentialsEmail(email.toLowerCase().trim(), full_name.trim(), role, password);
    } catch (mailErr) {
      console.error('Email Delivery Failed:', mailErr.message);
      // We still respond with 201 because the user account was created
      return res.status(201).json({
        message: `Account created successfully, but welcome email failed to send.`,
        user: newUser.rows[0],
      });
    }

    res.status(201).json({
      message: `Account created & credentials email sent successfully!`,
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error('Provisioning Error:', err.message);
    res.status(500).json({ error: 'Server error creating staff account.' });
  }
});

module.exports = router;