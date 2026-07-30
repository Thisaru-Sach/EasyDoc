const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendOTPEmail } = require('../config/mailer');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const userRole = ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient';

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [full_name.trim(), email.toLowerCase().trim(), hashedPassword, userRole]
    );

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

// POST /api/auth/login - User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

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


// 1. POST /api/auth/forgot-password - Generate & Send 5-min OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const sanitizedEmail = email.toLowerCase().trim();
    const userResult = await pool.query('SELECT id, full_name FROM users WHERE email = $1', [sanitizedEmail]);

    if (userResult.rows.length === 0) {
      // Security best practice: Don't disclose whether an email exists
      return res.json({ message: 'If this email is registered, an OTP has been sent.' });
    }

    const user = userResult.rows[0];

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to DB
    await pool.query(
      'UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3',
      [otp, expiresAt, user.id]
    );

    // Dispatch OTP Email
    await sendOTPEmail(sanitizedEmail, user.full_name, otp);

    res.json({ message: 'OTP sent successfully! Check your inbox.' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

// 2. POST /api/auth/reset-password - Verify OTP & Set New Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields (email, OTP, new password) are required.' });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Query matching user
    const userResult = await pool.query(
      'SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = $1',
      [sanitizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or OTP.' });
    }

    const user = userResult.rows[0];

    // Validate OTP and expiration
    if (!user.reset_otp || user.reset_otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    if (new Date() > new Date(user.reset_otp_expires)) {
      return res.status(400).json({ error: 'OTP has expired (valid for 5 minutes). Please request a new one.' });
    }

    // Hash new password and clear OTP fields
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// PATCH /api/auth/change-password - Change password for authenticated users
router.patch('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }

    // Fetch user from DB
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // Save updated password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHashedPassword, userId]);

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Change Password Error:', err.message);
    res.status(500).json({ error: 'Server error updating password.' });
  }
});

module.exports = router;