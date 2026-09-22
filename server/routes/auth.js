import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { executeQuery } from '../db.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

const DEFAULT_AUTH_USERS = [
  { bec: '1XY21CS001', name: 'Student', department: 'CSE', year: 'IV Year', role: 'student', password: 'password123' },
  { bec: 'BEC233040', name: 'Student', department: 'CSE', year: 'IV Year', role: 'student', password: 'password123' },
  { bec: 'BEC01', name: 'Class Teacher', department: 'CSE', year: 'Staff', role: 'teacher', password: 'password123' },
  { bec: 'TEACHER01', name: 'Class Teacher', department: 'CSE', year: 'Staff', role: 'teacher', password: 'password123' },
  { bec: 'HOD01', name: 'Head of Department', department: 'CSE', year: 'Staff', role: 'hod', password: 'password123' },
  { bec: 'HODCSE01', name: 'Head of Department', department: 'CSE', year: 'Staff', role: 'hod', password: 'password123' },
  { bec: 'PO01', name: 'Placement Officer', department: 'Placement Cell', year: 'Staff', role: 'po', password: 'password123' },
  { bec: 'GUARD01', name: 'Main Gate Security', department: 'Security', year: 'Staff', role: 'guard', password: 'password123' }
];

const sanitizeUser = (user) => {
  if (!user) return null;
  let profile = {};
  if (user.profile_data) {
    try {
      profile = typeof user.profile_data === 'string' ? JSON.parse(user.profile_data) : user.profile_data;
    } catch (e) {}
  }
  const { password, profile_data, ...safeUser } = user;
  return { ...profile, ...safeUser, ...profile };
};

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'bec_default_jwt_fallback_secret_key_2026';
  return jwt.sign(
    { bec: user.bec, role: user.role || 'student' },
    secret,
    { expiresIn: '12h' }
  );
};

// POST /api/db/auth/login
router.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { bec, password, role } = req.body || {};
    if (!bec || !password) {
      return res.status(400).json({ error: 'BEC / USN and Password are required.' });
    }

    const cleanBec = String(bec).trim().toUpperCase();
    const cleanPassword = String(password).trim();
    const cleanRole = role ? String(role).trim().toLowerCase() : '';

    let query = 'SELECT bec, name, department, year, role, password, profile_data FROM students WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?))';
    let params = [cleanBec];

    if (cleanRole) {
      query += ' AND (LOWER(role) = LOWER(?) OR (role IS NULL AND LOWER(?) = "student"))';
      params.push(cleanRole, cleanRole);
    }
    query += ' LIMIT 1';

    const [rows] = await executeQuery(query, params);

    if (rows && rows.length > 0) {
      const dbUser = rows[0];
      let isPasswordMatch = false;
      try {
        isPasswordMatch = await bcrypt.compare(cleanPassword, dbUser.password || '');
      } catch (e) {}
      if (!isPasswordMatch && dbUser.password === cleanPassword) {
        isPasswordMatch = true;
      }
      if (isPasswordMatch) {
        const safeStudent = sanitizeUser(dbUser);
        const token = generateToken(safeStudent);
        return res.json({ success: true, token, student: safeStudent });
      }
    }

    // Check default accounts only if ALLOW_DEMO_LOGINS is true
    if (process.env.ALLOW_DEMO_LOGINS === 'true') {
      const match = DEFAULT_AUTH_USERS.find(
        (u) =>
          u.bec.toUpperCase() === cleanBec &&
          (!cleanRole || u.role.toLowerCase() === cleanRole) &&
          u.password === cleanPassword
      );

      if (match) {
        const safeStudent = sanitizeUser(match);
        const token = generateToken(safeStudent);
        return res.json({ success: true, token, student: safeStudent });
      }
    }

    return res.status(401).json({ error: 'Invalid ID, password, or role selection.' });
  } catch (err) {
    console.error('Login error:', err.message);

    // Fallback demo accounts check only if ALLOW_DEMO_LOGINS is true
    if (process.env.ALLOW_DEMO_LOGINS === 'true') {
      const cleanBec = String(req.body?.bec || '').trim().toUpperCase();
      const cleanRole = String(req.body?.role || '').trim().toLowerCase();
      const cleanPassword = String(req.body?.password || '').trim();
      const match = DEFAULT_AUTH_USERS.find(
        (u) =>
          u.bec.toUpperCase() === cleanBec &&
          (!cleanRole || u.role.toLowerCase() === cleanRole) &&
          u.password === cleanPassword
      );
      if (match) {
        const safeStudent = sanitizeUser(match);
        const token = generateToken(safeStudent);
        return res.json({ success: true, token, student: safeStudent });
      }
    }

    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
