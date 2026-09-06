import express from 'express';
import fs from 'fs';
import path from 'path';
import { getDbPool } from '../db.js';

const router = express.Router();
const LOCAL_GATEPASS_FILE = path.resolve(process.cwd(), 'gate_passes_data.json');

const getLocalPasses = () => {
  try {
    if (fs.existsSync(LOCAL_GATEPASS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_GATEPASS_FILE, 'utf-8') || '[]');
    }
  } catch (e) {}
  return [];
};

const saveLocalPasses = (passes) => {
  try {
    fs.writeFileSync(LOCAL_GATEPASS_FILE, JSON.stringify(passes, null, 2), 'utf-8');
  } catch (e) {}
};

// GET /api/db/gatepasses
router.get('/gatepasses', async (req, res) => {
  try {
    const bec = req.query.bec;
    const local = getLocalPasses();
    let rows = [];

    try {
      const db = await getDbPool();
      if (bec) {
        [rows] = await db.query('SELECT * FROM gate_passes WHERE bec = ? ORDER BY created_at DESC', [bec]);
      } else {
        [rows] = await db.query('SELECT * FROM gate_passes ORDER BY created_at DESC');
      }
    } catch (err) {}

    const map = new Map();
    local.forEach((p) => { if (p?.id) map.set(p.id, p); });
    rows.forEach((p) => { if (p?.id) map.set(p.id, { ...map.get(p.id), ...p }); });
    let merged = Array.from(map.values());

    if (bec) {
      merged = merged.filter((p) => (p.bec || p.usn || '').toUpperCase() === bec.toUpperCase());
    }

    res.json({ gatePasses: merged });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gate passes: ' + err.message });
  }
});

// POST /api/db/gatepasses (Create / Save Gate Pass)
router.post('/gatepasses', async (req, res) => {
  try {
    const g = req.body || {};
    if (!g.id || !g.bec || !g.reason) {
      return res.status(400).json({ error: 'Gate pass ID, USN/BEC, and reason are required.' });
    }

    const local = getLocalPasses();
    const nextLocal = [g, ...local.filter((p) => p.id !== g.id)];
    saveLocalPasses(nextLocal);

    try {
      const db = await getDbPool();
      await db.query(
        `INSERT INTO gate_passes (id, bec, name, roll_no, branch, year_sem, college_name, department, reason, document_name, ai_priority, security_key, date, out_time, return_time, contact, status, teacher_approval, hod_approval, rejection_reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), teacher_approval=VALUES(teacher_approval), hod_approval=VALUES(hod_approval), rejection_reason=VALUES(rejection_reason), security_key=VALUES(security_key)`,
        [
          g.id,
          g.bec || g.usn,
          g.name || '',
          g.roll_no || g.rollNo || '',
          g.branch || 'CSE',
          g.year_sem || g.yearSem || '3rd Yr, 6th Sem',
          g.college_name || g.collegeName || 'Engineering College',
          g.department || g.branch || 'CSE',
          g.reason,
          g.document_name || g.documentName || '',
          g.ai_priority || g.aiPriority || 'MEDIUM',
          g.security_key || g.securityKey || Math.random().toString(16).substring(2, 8).toUpperCase(),
          g.date || new Date().toISOString().split('T')[0],
          g.outTime || g.out_time || '',
          g.returnTime || g.return_time || '',
          g.contact || '',
          g.status || 'Pending Class Teacher',
          g.teacherApproval || null,
          g.hodApproval || null,
          g.rejectionReason || null,
          g.createdAt || new Date().toLocaleString()
        ]
      );
    } catch (e) {}

    res.json({ success: true, message: 'Gate pass saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save gate pass: ' + err.message });
  }
});

// POST /api/db/gatepasses/status (Teacher / HOD Sign-off)
router.post('/gatepasses/status', async (req, res) => {
  try {
    const { id, status, teacherApproval, hodApproval, rejectionReason, securityKey } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'Gate pass ID and status are required.' });
    }

    const local = getLocalPasses();
    const nextLocal = local.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            teacher_approval: teacherApproval || p.teacher_approval,
            hod_approval: hodApproval || p.hod_approval,
            rejection_reason: rejectionReason || p.rejection_reason,
            security_key: securityKey || p.security_key
          }
        : p
    );
    saveLocalPasses(nextLocal);

    try {
      const db = await getDbPool();
      await db.query(
        `UPDATE gate_passes 
         SET status = ?, 
             teacher_approval = COALESCE(?, teacher_approval), 
             hod_approval = COALESCE(?, hod_approval), 
             rejection_reason = COALESCE(?, rejection_reason),
             security_key = COALESCE(?, security_key)
         WHERE id = ?`,
        [status, teacherApproval || null, hodApproval || null, rejectionReason || null, securityKey || null, id]
      );
    } catch (e) {}

    res.json({ success: true, message: 'Gate pass approval status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gate pass status: ' + err.message });
  }
});

// POST /api/db/gatepasses/verify (Security Guard QR Scanner)
router.post('/gatepasses/verify', async (req, res) => {
  try {
    const { keyOrId } = req.body || {};
    if (!keyOrId) {
      return res.status(400).json({ error: 'Security key or QR ID is required.' });
    }

    const clean = keyOrId.trim().toUpperCase();
    const local = getLocalPasses();
    let pass = local.find((p) => p.id === clean || p.security_key === clean || (p.bec || '').toUpperCase() === clean);

    if (!pass) {
      try {
        const db = await getDbPool();
        const [rows] = await db.query(
          'SELECT * FROM gate_passes WHERE id = ? OR security_key = ? OR bec = ? LIMIT 1',
          [clean, clean, clean]
        );
        if (rows.length > 0) pass = rows[0];
      } catch (e) {}
    }

    if (!pass) {
      return res.status(404).json({ error: 'Pass not found or invalid QR code.' });
    }

    pass.status = 'USED';
    const nextLocal = local.map((p) => (p.id === pass.id ? { ...p, status: 'USED' } : p));
    saveLocalPasses(nextLocal);

    try {
      const db = await getDbPool();
      await db.query('UPDATE gate_passes SET status = "USED" WHERE id = ?', [pass.id]);
    } catch (e) {}

    res.json({ success: true, pass: { ...pass, status: 'USED' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify pass: ' + err.message });
  }
});

// POST /api/db/gatepasses/delete
router.post('/gatepasses/delete', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Pass ID is required to delete.' });
    }

    const local = getLocalPasses();
    saveLocalPasses(local.filter((p) => p.id !== id));

    try {
      const db = await getDbPool();
      await db.query('DELETE FROM gate_passes WHERE id = ?', [id]);
    } catch (e) {}

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gate pass: ' + err.message });
  }
});

export default router;
