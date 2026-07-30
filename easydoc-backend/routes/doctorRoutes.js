const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// GET /api/doctors - Fetch all doctors with optional search
router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;

    if (specialty) {
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

// POST /api/doctors - Add a new doctor (Admin only)
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, specialty, status } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({ error: 'Name and specialty are required.' });
    }

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

module.exports = router;