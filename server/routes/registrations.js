import express from 'express';
import fs from 'fs';
import path from 'path';
import { getDbPool } from '../db.js';

const router = express.Router();
const LOCAL_REGISTRATIONS_FILE = path.resolve(process.cwd(), 'placement_registrations_data.json');

const getLocalRegistrations = () => {
  try {
    if (fs.existsSync(LOCAL_REGISTRATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_REGISTRATIONS_FILE, 'utf-8') || '[]');
    }
  } catch (e) {}
  return [];
};

const saveLocalRegistrations = (regs) => {
  try {
    fs.writeFileSync(LOCAL_REGISTRATIONS_FILE, JSON.stringify(regs, null, 2), 'utf-8');
  } catch (e) {}
};

// GET /api/db/registrations
router.get('/registrations', async (req, res) => {
  try {
    const local = getLocalRegistrations();
    let rows = [];
    try {
      const db = await getDbPool();
      [rows] = await db.query('SELECT * FROM placement_registrations ORDER BY registered_at DESC');
    } catch (err) {}

    const map = new Map();
    local.forEach((r) => { if (r?.id) map.set(r.id, r); });
    rows.forEach((r) => { if (r?.id) map.set(r.id, { ...map.get(r.id), ...r }); });
    res.json({ registrations: Array.from(map.values()) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch placement registrations: ' + err.message });
  }
});

// POST /api/db/registrations
router.post('/registrations', async (req, res) => {
  try {
    const r = req.body || {};
    if (!r.id || !r.driveId || !r.studentBec) {
      return res.status(400).json({ error: 'Registration ID, Drive ID, and Student BEC are required.' });
    }

    const local = getLocalRegistrations();
    const nextLocal = [r, ...local.filter((item) => item.id !== r.id)];
    saveLocalRegistrations(nextLocal);

    try {
      const db = await getDbPool();
      await db.query(
        `INSERT INTO placement_registrations (id, drive_id, student_bec, student_name, department, year, cgpa, phone, email, skills, resume_url, resume_name, registered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE student_name=VALUES(student_name), department=VALUES(department), year=VALUES(year), cgpa=VALUES(cgpa), phone=VALUES(phone), email=VALUES(email), skills=VALUES(skills), resume_url=VALUES(resume_url), resume_name=VALUES(resume_name)`,
        [
          r.id,
          r.driveId || r.drive_id,
          r.studentBec || r.student_bec,
          r.studentName || r.student_name || 'Student',
          r.department || 'CSE',
          r.year || 'III Year',
          r.cgpa || '',
          r.phone || '',
          r.email || '',
          r.skills || '',
          r.resumeUrl || r.resume_url || '',
          r.resumeName || r.resume_name || '',
          r.registeredAt || r.registered_at || new Date().toISOString()
        ]
      );
    } catch (e) {}

    res.json({ success: true, message: 'Placement registration saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save registration: ' + err.message });
  }
});

export default router;
