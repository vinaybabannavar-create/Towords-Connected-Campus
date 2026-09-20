import express from 'express';
import { executeQuery } from '../db.js';

const router = express.Router();

// ─── INITIALIZE ATTENDANCE TABLE ──────────────────────────────────────────────
export const initAttendanceTable = async () => {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(20) NOT NULL,
        branch VARCHAR(50) NOT NULL,
        year_sem VARCHAR(50) NOT NULL,
        subject VARCHAR(150) NOT NULL,
        student_bec VARCHAR(50) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL, -- 'PRESENT' | 'ABSENT'
        marked_by VARCHAR(50) NOT NULL,
        marked_by_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student_bec (student_bec),
        INDEX idx_branch_year (branch, year_sem),
        INDEX idx_date (date),
        INDEX idx_subject (subject)
      );
    `);
    console.log('✅ Attendance table ready');
  } catch (err) {
    console.warn('⚠️ Attendance table init notice:', err.message);
  }
};

// ─── GET ATTENDANCE FOR A SPECIFIC STUDENT ─────────────────────────────────────
// Returns all attendance logs for a student + subject stats + monthly stats + overall %
router.get('/student/:bec', async (req, res) => {
  try {
    const rawBec = req.params.bec.trim().toUpperCase();
    const [records] = await executeQuery(
      `SELECT * FROM attendance_records 
       WHERE UPPER(TRIM(student_bec)) = ? 
       ORDER BY date DESC, created_at DESC`,
      [rawBec]
    );

    res.json({ records: records || [] });
  } catch (err) {
    console.error('Fetch student attendance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch attendance.' });
  }
});

// ─── GET ATTENDANCE BY BRANCH, YEAR, SUBJECT & DATE (FOR TEACHER) ──────────────
router.get('/class', async (req, res) => {
  try {
    const { branch, yearSem, subject, date } = req.query;
    if (!branch) {
      return res.status(400).json({ error: 'Branch is required' });
    }

    let query = `SELECT * FROM attendance_records WHERE UPPER(TRIM(branch)) = UPPER(TRIM(?))`;
    const params = [branch];

    if (yearSem && yearSem !== 'ALL') {
      query += ` AND UPPER(TRIM(year_sem)) = UPPER(TRIM(?))`;
      params.push(yearSem);
    }
    if (subject && subject !== 'ALL') {
      query += ` AND UPPER(TRIM(subject)) = UPPER(TRIM(?))`;
      params.push(subject);
    }
    if (date) {
      query += ` AND date = ?`;
      params.push(date);
    }

    query += ` ORDER BY date DESC, student_name ASC`;

    const [records] = await executeQuery(query, params);
    res.json({ records: records || [] });
  } catch (err) {
    console.error('Fetch class attendance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch class records.' });
  }
});

// ─── GET ALL ATTENDANCE STATS FOR TEACHER DASHBOARD OVERVIEW ───────────────────
router.get('/all', async (req, res) => {
  try {
    const { branch } = req.query;
    let query = `SELECT * FROM attendance_records`;
    const params = [];

    if (branch && branch !== 'ALL') {
      query += ` WHERE UPPER(TRIM(branch)) = UPPER(TRIM(?))`;
      params.push(branch);
    }

    query += ` ORDER BY date DESC`;
    const [records] = await executeQuery(query, params);
    res.json({ records: records || [] });
  } catch (err) {
    console.error('Fetch all attendance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch attendance.' });
  }
});

// ─── BATCH SUBMIT / SAVE ATTENDANCE (CLASSROOM SESSION) ────────────────────────
// Teacher marks multiple students in one session
router.post('/submit', async (req, res) => {
  try {
    const { branch, yearSem, subject, date, records, teacherBec, teacherName } = req.body || {};

    if (!branch || !subject || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Missing required attendance data fields.' });
    }

    const cleanBranch = String(branch).trim().toUpperCase();
    const cleanYear = String(yearSem || 'III Year').trim();
    const cleanSubject = String(subject).trim();
    const cleanDate = String(date).trim();
    const cleanTeacherBec = String(teacherBec || 'TEACHER01').trim().toUpperCase();
    const cleanTeacherName = String(teacherName || 'Faculty').trim();

    // Prepare batch insert values
    // Using ON DUPLICATE KEY UPDATE so teacher can edit/update today's attendance safely
    for (const item of records) {
      const studentBec = String(item.bec || item.student_bec).trim().toUpperCase();
      const studentName = String(item.name || item.student_name || studentBec).trim();
      const status = item.status === 'PRESENT' ? 'PRESENT' : 'ABSENT';
      const recordId = `att_${cleanDate}_${cleanSubject.replace(/[^a-zA-Z0-9]/g, '_')}_${studentBec}`;

      await executeQuery(
        `INSERT INTO attendance_records 
          (id, date, branch, year_sem, subject, student_bec, student_name, status, marked_by, marked_by_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           status = VALUES(status), 
           marked_by = VALUES(marked_by), 
           marked_by_name = VALUES(marked_by_name)`,
        [
          recordId,
          cleanDate,
          cleanBranch,
          cleanYear,
          cleanSubject,
          studentBec,
          studentName,
          status,
          cleanTeacherBec,
          cleanTeacherName
        ]
      );
    }

    res.json({ success: true, count: records.length, message: 'Attendance recorded successfully.' });
  } catch (err) {
    console.error('Submit attendance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to submit attendance.' });
  }
});

// ─── DELETE SPECIFIC ATTENDANCE RECORD ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery(`DELETE FROM attendance_records WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Attendance record deleted.' });
  } catch (err) {
    console.error('Delete attendance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to delete record.' });
  }
});

export default router;
