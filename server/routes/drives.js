import express from 'express';
import fs from 'fs';
import path from 'path';
import { getDbPool } from '../db.js';

const router = express.Router();
const LOCAL_DRIVES_FILE = path.resolve(process.cwd(), 'placement_drives_data.json');

const getLocalDrives = () => {
  try {
    if (fs.existsSync(LOCAL_DRIVES_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_DRIVES_FILE, 'utf-8') || '[]');
    }
  } catch (e) {}
  return [];
};

const saveLocalDrives = (drives) => {
  try {
    fs.writeFileSync(LOCAL_DRIVES_FILE, JSON.stringify(drives, null, 2), 'utf-8');
  } catch (e) {}
};

// GET /api/db/drives
router.get('/drives', async (req, res) => {
  try {
    const local = getLocalDrives();
    let rows = [];
    try {
      const db = await getDbPool();
      [rows] = await db.query('SELECT * FROM placement_drives ORDER BY created_at DESC');
    } catch (err) {}

    const map = new Map();
    local.forEach((d) => { if (d?.id) map.set(d.id, d); });
    rows.forEach((d) => { if (d?.id) map.set(d.id, { ...map.get(d.id), ...d }); });
    res.json({ drives: Array.from(map.values()) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch placement drives: ' + err.message });
  }
});

// POST /api/db/drives (Create / Update Drive)
router.post('/drives', async (req, res) => {
  try {
    const d = req.body || {};
    if (!d.id || !d.company || !d.role) {
      return res.status(400).json({ error: 'Drive ID, company name, and role are required.' });
    }

    const local = getLocalDrives();
    const nextLocal = [d, ...local.filter((item) => item.id !== d.id)];
    saveLocalDrives(nextLocal);

    try {
      const db = await getDbPool();
      await db.query(
        `INSERT INTO placement_drives (id, company, domain, role, type, salary, skills, min_cgpa, branches, drive_date, deadline, description, pdf_url, pdf_name, status, posted_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE company=VALUES(company), domain=VALUES(domain), role=VALUES(role), type=VALUES(type), salary=VALUES(salary), skills=VALUES(skills), min_cgpa=VALUES(min_cgpa), branches=VALUES(branches), drive_date=VALUES(drive_date), deadline=VALUES(deadline), description=VALUES(description), pdf_url=VALUES(pdf_url), pdf_name=VALUES(pdf_name), status=VALUES(status)`,
        [
          d.id,
          d.company,
          d.domain || '',
          d.role,
          d.type || 'Full-Time',
          d.salary || '',
          d.skills || '',
          d.minCgpa || d.min_cgpa || '',
          JSON.stringify(Array.isArray(d.branches) ? d.branches : (d.branches || '').split(',').map((b) => b.trim()).filter(Boolean)),
          d.driveDate || d.drive_date || '',
          d.deadline || '',
          d.description || '',
          d.pdfUrl || d.pdf_url || '',
          d.pdfName || d.pdf_name || '',
          d.status || 'Active',
          d.postedBy || d.posted_by || 'Placement Cell (PO)',
          d.createdAt || d.created_at || new Date().toISOString().split('T')[0]
        ]
      );
    } catch (e) {}

    res.json({ success: true, message: 'Placement drive saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save drive: ' + err.message });
  }
});

// POST /api/db/drives/delete
router.post('/drives/delete', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Drive ID is required to delete.' });
    }

    const local = getLocalDrives();
    saveLocalDrives(local.filter((d) => d.id !== id));

    try {
      const db = await getDbPool();
      await db.query('DELETE FROM placement_drives WHERE id = ?', [id]);
    } catch (e) {}

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete placement drive: ' + err.message });
  }
});

export default router;
