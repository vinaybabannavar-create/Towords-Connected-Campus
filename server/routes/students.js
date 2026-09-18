import express from 'express';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/db/students/me (Fetch current authenticated student/user profile)
router.get('/students/me', requireAuth, async (req, res) => {
  try {
    const userBec = req.user?.bec;
    if (!userBec) {
      return res.status(400).json({ error: 'User identifier not found in session.' });
    }

    const [rows] = await executeQuery(
      'SELECT bec, name, department, year, role, created_at FROM students WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?)) LIMIT 1',
      [userBec]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({ student: rows[0] });
  } catch (err) {
    console.error('Fetch me error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/db/students (Fetch student and staff profiles without passwords)
router.get('/students', requireAuth, async (req, res) => {
  try {
    const [rows] = await executeQuery(
      'SELECT bec, name, department, year, role, created_at FROM students ORDER BY created_at DESC'
    );
    res.json({ students: rows || [] });
  } catch (err) {
    console.error('Fetch students error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/db/students (Create or Register Account)
router.post('/students', async (req, res) => {
  try {
    const { bec, name, department, year, password, role } = req.body || {};
    if (!bec || !name || !password) {
      return res.status(400).json({ error: 'BEC / Staff ID, name, and password are required.' });
    }

    const cleanBec = String(bec).trim().toUpperCase();
    const cleanPassword = String(password).trim();
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const userRole = role ? String(role).trim().toLowerCase() : 'student';

    await executeQuery(
      `INSERT INTO students (bec, name, department, year, password, role) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         department = VALUES(department), 
         year = VALUES(year), 
         password = VALUES(password), 
         role = VALUES(role)`,
      [cleanBec, String(name).trim(), department || '', year || 'III Year', hashedPassword, userRole]
    );

    res.json({ success: true, message: 'Account saved successfully.' });
  } catch (err) {
    console.error('Save student error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/db/students/update (Update Student Profile)
router.post('/students/update', requireAuth, async (req, res) => {
  try {
    const student = req.body || {};
    const { bec, name, department, year, password, role } = student;

    if (!bec) {
      return res.status(400).json({ error: 'BEC / USN identifier is required.' });
    }

    const cleanBec = String(bec).trim().toUpperCase();
    const callerBec = String(req.user?.bec || '').trim().toUpperCase();
    const callerRole = String(req.user?.role || '').trim().toLowerCase();

    // Only allow updating own record unless caller is HOD or Teacher
    const isSelf = callerBec === cleanBec;
    const isPrivileged = callerRole === 'hod' || callerRole === 'teacher';

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ error: 'Not authorized to update another user\'s profile.' });
    }

    // Role changes are strictly restricted to HOD
    const targetRole = (callerRole === 'hod' && role) ? String(role).trim().toLowerCase() : null;

    // Hash password if updating
    let hashedPassword = null;
    if (password && String(password).trim()) {
      hashedPassword = await bcrypt.hash(String(password).trim(), 10);
    }

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
        name ? String(name).trim() : null,
        department ? String(department).trim() : null,
        year ? String(year).trim() : null,
        hashedPassword,
        targetRole,
        cleanBec
      ]
    );

    if (result.affectedRows === 0) {
      const defaultPass = hashedPassword || (await bcrypt.hash('password123', 10));
      await executeQuery(
        `INSERT INTO students (bec, name, department, year, password, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cleanBec, name || '', department || '', year || 'III Year', defaultPass, targetRole || 'student']
      );
    }

    res.json({ success: true, message: 'Student profile updated successfully.' });
  } catch (err) {
    console.error('Update student error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
