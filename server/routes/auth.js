import express from 'express';
import { getDbPool } from '../db.js';

const router = express.Router();

// POST /api/db/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { bec, password, role } = req.body || {};
    let query = 'SELECT bec, name, department, year, role FROM students WHERE bec = ? AND password = ?';
    let params = [bec, password];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    query += ' LIMIT 1';

    const db = await getDbPool();
    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      res.json({ success: true, student: rows[0] });
    } else {
      res.status(401).json({ error: 'Invalid BEC number, password, or role selection.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login authentication error: ' + err.message });
  }
});

export default router;
