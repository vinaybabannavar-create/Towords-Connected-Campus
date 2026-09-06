import express from 'express';
import { executeQuery } from '../db.js';

const router = express.Router();

// POST /api/db/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { bec, password, role } = req.body || {};
    if (!bec || !password) {
      return res.status(400).json({ error: 'BEC / USN and Password are required.' });
    }

    const cleanBec = String(bec).trim();
    const cleanPassword = String(password).trim();

    let query = 'SELECT bec, name, department, year, role FROM students WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?)) AND password = ?';
    let params = [cleanBec, cleanPassword];

    if (role) {
      query += ' AND (LOWER(role) = LOWER(?) OR (role IS NULL AND LOWER(?) = "student"))';
      params.push(role, role);
    }
    query += ' LIMIT 1';

    const [rows] = await executeQuery(query, params);

    if (rows && rows.length > 0) {
      res.json({ success: true, student: rows[0] });
    } else {
      res.status(401).json({ error: 'Invalid ID, password, or role selection.' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Authentication service temporarily unavailable: ' + err.message });
  }
});

export default router;
