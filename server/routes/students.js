import express from 'express';
import { getDbPool } from '../db.js';

const router = express.Router();

// GET /api/db/students (Fetch student and staff profiles)
router.get('/students', async (req, res) => {
  try {
    const db = await getDbPool();
    const [rows] = await db.query(
      'SELECT bec, name, department, year, role, created_at FROM students ORDER BY created_at DESC'
    );
    res.json({ students: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
  }
});

// POST /api/db/students (Create or Save Account)
router.post('/students', async (req, res) => {
  try {
    const { bec, name, department, year, password, role } = req.body || {};
    if (!bec || !name || !password) {
      return res.status(400).json({ error: 'BEC / Staff ID, name, and password are required.' });
    }

    const userRole = role || 'student';
    const db = await getDbPool();

    await db.query(
      `INSERT INTO students (bec, name, department, year, password, role) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         department = VALUES(department), 
         year = VALUES(year), 
         password = VALUES(password), 
         role = VALUES(role)`,
      [bec, name, department || '', year || 'III Year', password, userRole]
    );

    res.json({ success: true, message: 'Account saved to TiDB Cloud.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save account: ' + err.message });
  }
});

// POST /api/db/students/update (Update Student Profile)
router.post('/students/update', async (req, res) => {
  try {
    const student = req.body || {};
    const { bec, name, department, year, password, role } = student;

    if (!bec) {
      return res.status(400).json({ error: 'BEC / USN identifier is required.' });
    }

    const db = await getDbPool();
    await db.query(
      `INSERT INTO students (bec, name, department, year, password, role) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         name = COALESCE(VALUES(name), name), 
         department = COALESCE(VALUES(department), department), 
         year = COALESCE(VALUES(year), year), 
         password = COALESCE(VALUES(password), password), 
         role = COALESCE(VALUES(role), role)`,
      [bec, name || '', department || '', year || 'III Year', password || 'password123', role || 'student']
    );

    res.json({ success: true, message: 'Student profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student profile: ' + err.message });
  }
});

export default router;
