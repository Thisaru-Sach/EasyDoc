// server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, authorizeRoles } = require('./middleware/auth');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' })); // Restrict CORS to frontend port
app.use(express.json()); // Body parser

// -------------------------------------------------------------
// GET /api/doctors - Fetch all doctors with optional search
// -------------------------------------------------------------
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialty } = req.query;

    if (specialty) {
      // PREVENT SQL INJECTION: Using parameterized query ($1) instead of string concatenation!
      const result = await pool.query(
        'SELECT * FROM doctors WHERE LOWER(specialty) LIKE LOWER($1) ORDER BY id DESC',
        [`%${specialty}%`]
      );
      return res.json(result.rows);
    }

    const result = await pool.query('SELECT * FROM doctors ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ error: 'Server error retrieving doctors' });
  }
});

// -------------------------------------------------------------
// POST /api/doctors - Add a new doctor
// -------------------------------------------------------------
app.post('/api/doctors', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, specialty, status } = req.body;

    // Basic server-side input validation
    if (!name || !specialty) {
      return res.status(400).json({ error: 'Name and specialty are required.' });
    }

    // Safe SQL insertion using parameters ($1, $2, $3)
    const newDoctor = await pool.query(
      'INSERT INTO doctors (name, specialty, status) VALUES ($1, $2, $3) RETURNING *',
      [name, specialty, status || 'Available']
    );

    res.status(201).json(newDoctor.rows[0]);
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ error: 'Server error creating doctor' });
  }
});

// -------------------------------------------------------------
// POST /api/auth/register - Register new user (Patient / Doctor / Admin)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // 1. Basic Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Default to 'patient' if no valid role is supplied
    const userRole = ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient';

    // 2. Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // 3. Hash the password (Salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert into database using parameterized query
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [full_name.trim(), email.toLowerCase().trim(), hashedPassword, userRole]
    );

    // 5. Generate JWT Token
    const user = newUser.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user
    });

  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// -------------------------------------------------------------
// POST /api/auth/login - User Login
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    // 1. Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // 2. Compare hashed password with user input
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EasyDoc server running on http://localhost:${PORT}`);
});