import express from 'express';
import { getDbPool } from '../db.js';

const router = express.Router();

// GET /api/db/students
router.get('/students', async (req, res) => {
  try {
    const db = await getDbPool();
    const [rows] = await db.query('SELECT bec, name, department, year, role, created_at FROM students ORDER BY created_at DESC');
    res.json({ students: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student accounts: ' + err.message });
  }
});

// POST /api/db/students (Save/Update Account)
router.post('/students', async (req, res) => {
  try {
    const { bec, name, department, year, password, role } = req.body || {};
    if (!bec || !name || !password) {
      return res.status(400).json({ error: 'BEC / Staff ID, name, and password are required.' });
    }

    const userRole = role || 'student';
    const db = await getDbPool();

    await db.query(
      'INSERT INTO students (bec, name, department, year, password, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), department = VALUES(department), year = VALUES(year), password = VALUES(password), role = VALUES(role)',
      [bec, name, department || '', year || 'III Year', password, userRole]
    );

    res.json({ success: true, message: 'Account saved to TiDB Cloud.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save account: ' + err.message });
  }
});

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
