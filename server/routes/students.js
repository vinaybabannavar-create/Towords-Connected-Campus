import express from 'express';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const parseStudentWithProfile = (row) => {
  if (!row) return null;
  let profile = {};
  if (row.profile_data) {
    try {
      profile = typeof row.profile_data === 'string' ? JSON.parse(row.profile_data) : row.profile_data;
    } catch (e) {}
  }
  const { profile_data, ...rest } = row;
  return { ...profile, ...rest, ...profile };
};

// GET /api/db/students/me (Fetch current authenticated student/user profile)
router.get('/students/me', requireAuth, async (req, res) => {
  try {
    const userBec = req.user?.bec;
    if (!userBec) {
      return res.status(400).json({ error: 'User identifier not found in session.' });
    }

    const [rows] = await executeQuery(
      'SELECT bec, name, department, year, semester, role, profile_data, created_at FROM students WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?)) LIMIT 1',
      [userBec]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({ student: parseStudentWithProfile(rows[0]) });
  } catch (err) {
    console.error('Fetch me error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/db/students (Fetch student and staff profiles without passwords)
router.get('/students', requireAuth, async (req, res) => {
  try {
    const [rows] = await executeQuery(
      'SELECT bec, name, department, year, semester, role, profile_data, created_at FROM students ORDER BY created_at DESC'
    );
    const parsedStudents = (rows || []).map(parseStudentWithProfile);
    res.json({ students: parsedStudents });
  } catch (err) {
    console.error('Fetch students error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/db/students (Create or Register Account)
router.post('/students', async (req, res) => {
  try {
    const { bec, name, department, year, semester, password, role, college, email, phone } = req.body || {};
    if (!bec || !name || !password) {
      return res.status(400).json({ error: 'BEC / Staff ID, name, and password are required.' });
    }

    const cleanBec = String(bec).trim().toUpperCase();
    const cleanPassword = String(password).trim();
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const userRole = role ? String(role).trim().toLowerCase() : 'student';

    // Build initial profile data
    const initialProfile = {
      college: college || 'T. John Institute Of Technology',
      email: email || '',
      phone: phone || '',
      isProfileSaved: false
    };

    // Add columns if not exists (safe migration)
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN IF NOT EXISTS semester VARCHAR(20) DEFAULT ''`);
      await executeQuery(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_data LONGTEXT`);
    } catch (e) { /* column may already exist */ }

    await executeQuery(
      `INSERT INTO students (bec, name, department, year, semester, password, role, profile_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         department = VALUES(department), 
         year = VALUES(year), 
         semester = VALUES(semester),
         password = VALUES(password), 
         role = VALUES(role),
         profile_data = VALUES(profile_data)`,
      [cleanBec, String(name).trim(), department || '', year || 'III Year', semester || '', hashedPassword, userRole, JSON.stringify(initialProfile)]
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
    const {
      bec, name, department, year, semester, password, role,
      college, email, phone, bio, skills, github, linkedin, portfolio, resume,
      assignedClass, subjects, cabin, specialization, experience, officeHours, division, gatePost, shift,
      isProfileSaved
    } = student;

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

    // Fetch existing profile_data to cleanly merge
    let existingProfile = {};
    try {
      const [existingRows] = await executeQuery('SELECT profile_data FROM students WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?)) LIMIT 1', [cleanBec]);
      if (existingRows?.[0]?.profile_data) {
        existingProfile = typeof existingRows[0].profile_data === 'string'
          ? JSON.parse(existingRows[0].profile_data)
          : existingRows[0].profile_data;
      }
    } catch (e) {}

    const updatedProfile = {
      ...existingProfile,
      college: college !== undefined ? college : existingProfile.college || 'T. John Institute Of Technology',
      email: email !== undefined ? email : existingProfile.email || '',
      phone: phone !== undefined ? phone : existingProfile.phone || '',
      bio: bio !== undefined ? bio : existingProfile.bio || '',
      skills: Array.isArray(skills) ? skills : existingProfile.skills || [],
      github: github !== undefined ? github : existingProfile.github || '',
      linkedin: linkedin !== undefined ? linkedin : existingProfile.linkedin || '',
      portfolio: portfolio !== undefined ? portfolio : existingProfile.portfolio || '',
      resume: resume !== undefined ? resume : existingProfile.resume || null,
      assignedClass: assignedClass !== undefined ? assignedClass : existingProfile.assignedClass || '',
      subjects: subjects !== undefined ? subjects : existingProfile.subjects || '',
      cabin: cabin !== undefined ? cabin : existingProfile.cabin || '',
      specialization: specialization !== undefined ? specialization : existingProfile.specialization || '',
      experience: experience !== undefined ? experience : existingProfile.experience || '',
      officeHours: officeHours !== undefined ? officeHours : existingProfile.officeHours || '',
      division: division !== undefined ? division : existingProfile.division || '',
      gatePost: gatePost !== undefined ? gatePost : existingProfile.gatePost || '',
      shift: shift !== undefined ? shift : existingProfile.shift || '',
      isProfileSaved: true
    };

    const profileDataStr = JSON.stringify(updatedProfile);

    // Make sure column exists
    try {
      await executeQuery(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_data LONGTEXT`);
    } catch (e) {}

    const [result] = await executeQuery(
      `UPDATE students 
       SET 
         name = COALESCE(?, name), 
         department = COALESCE(?, department), 
         year = COALESCE(?, year), 
         semester = COALESCE(?, semester),
         password = COALESCE(?, password), 
         role = COALESCE(?, role),
         profile_data = ?
       WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?))`,
      [
        name ? String(name).trim() : null,
        department ? String(department).trim() : null,
        year ? String(year).trim() : null,
        semester ? String(semester).trim() : null,
        hashedPassword,
        targetRole,
        profileDataStr,
        cleanBec
      ]
    );

    if (result.affectedRows === 0) {
      const defaultPass = hashedPassword || (await bcrypt.hash('password123', 10));
      await executeQuery(
        `INSERT INTO students (bec, name, department, year, semester, password, role, profile_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cleanBec, name || '', department || '', year || 'III Year', semester || '', defaultPass, targetRole || 'student', profileDataStr]
      );
    }

    res.json({ success: true, message: 'Student profile updated successfully.' });
  } catch (err) {
    console.error('Update student error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
