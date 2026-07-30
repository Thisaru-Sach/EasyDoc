const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// POST /api/appointments - Book a new appointment
router.post("/", verifyToken, authorizeRoles("patient"), async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, notes } = req.body;
    const patient_id = req.user.id;

    // 1. Validate input FIRST
    if (!doctor_id || !appointment_date || !appointment_time) {
      return res
        .status(400)
        .json({ error: "Doctor, date, and time are required." });
    }

    // 2. Then check for overbooking
    const existingBooking = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'`,
      [doctor_id, appointment_date, appointment_time],
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({
        error:
          "This doctor is already booked for the selected date and time slot.",
      });
    }

    const newAppointment = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patient_id, doctor_id, appointment_date, appointment_time, notes || ""],
    );

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: newAppointment.rows[0],
    });
  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(500).json({ error: "Server error booking appointment." });
  }
});

// GET /api/appointments - Retrieve appointments based on role
router.get("/", verifyToken, async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = "";
    let params = [id];

    if (role === "patient") {
      query = `
        SELECT a.*, d.name AS doctor_name, d.specialty 
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    } else if (role === "doctor") {
      query = `
        SELECT a.*, u.full_name AS patient_name, u.email AS patient_email
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        WHERE a.doctor_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    } else {
      query = `
        SELECT a.*, u.full_name AS patient_name, d.name AS doctor_name 
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY a.appointment_date DESC`;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Appointments Error:", err.message);
    res.status(500).json({ error: "Server error retrieving appointments." });
  }
});

// PATCH /api/appointments/:id/status - Approve or Decline Appointment
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("doctor", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["Confirmed", "Cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status option." });
      }

      const updated = await pool.query(
        "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
        [status, id],
      );

      if (updated.rows.length === 0) {
        return res.status(404).json({ error: "Appointment record not found." });
      }

      res.json({
        message: `Appointment successfully marked as ${status}`,
        appointment: updated.rows[0],
      });
    } catch (err) {
      console.error("Update Status Error:", err.message);
      res
        .status(500)
        .json({ error: "Server error updating appointment status." });
    }
  },
);

// DELETE or PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', verifyToken, authorizeRoles('patient'), async (req, res) => {
  try {
    const { id } = req.params;
    const patient_id = req.user.id;

    const result = await pool.query(
      `UPDATE appointments SET status = 'Cancelled' 
       WHERE id = $1 AND patient_id = $2 RETURNING *`,
      [id, patient_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized.' });
    }

    res.json({ message: 'Appointment cancelled successfully.', appointment: result.rows[0] });
  } catch (err) {
    console.error('Cancel Error:', err.message);
    res.status(500).json({ error: 'Server error cancelling appointment.' });
  }
});

module.exports = router;
