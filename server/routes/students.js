import express from 'express';
import { executeQuery } from '../db.js';

const router = express.Router();

// GET /api/db/students (Fetch student and staff profiles)
router.get('/students', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      'SELECT bec, name, department, year, role, password, created_at FROM students ORDER BY created_at DESC'
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

    const cleanBec = String(bec).trim().toUpperCase();
    const cleanPassword = String(password).trim();
    const userRole = role || 'student';

    await executeQuery(
      `INSERT INTO students (bec, name, department, year, password, role) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         department = VALUES(department), 
         year = VALUES(year), 
         password = VALUES(password), 
         role = VALUES(role)`,
      [cleanBec, String(name).trim(), department || '', year || 'III Year', cleanPassword, userRole]
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

    const cleanBec = String(bec).trim().toUpperCase();

    const [result] = await executeQuery(
      `UPDATE students 
       SET 
         name = COALESCE(?, name), 
         department = COALESCE(?, department), 
         year = COALESCE(?, year), 
         password = COALESCE(?, password), 
         role = COALESCE(?, role)
       WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?))`,
      [
        name ?? null,
        department ?? null,
        year ?? null,
        password ?? null,
        role ?? null,
        cleanBec
      ]
    );

    if (result.affectedRows === 0) {
      await executeQuery(
        `INSERT INTO students (bec, name, department, year, password, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cleanBec, name || '', department || '', year || 'III Year', password || 'password123', role || 'student']
      );
    }

    res.json({ success: true, message: 'Student profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student profile: ' + err.message });
  }
});

export default router;
