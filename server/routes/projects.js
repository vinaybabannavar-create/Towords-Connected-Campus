import express from 'express';
import { getDbPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/db/projects
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const bec = req.query.bec;
    const db = await getDbPool();
    let rows;
    if (bec) {
      [rows] = await db.query('SELECT * FROM projects WHERE UPPER(TRIM(bec)) = UPPER(TRIM(?)) ORDER BY id DESC', [bec]);
    } else {
      [rows] = await db.query('SELECT * FROM projects ORDER BY id DESC');
    }
    res.json({ projects: rows || [] });
  } catch (err) {
    console.error('Fetch projects error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/db/projects (Save Project)
router.post('/projects', requireAuth, async (req, res) => {
  try {
    const p = req.body || {};
    if (!p.id || !p.bec || !p.title) {
      return res.status(400).json({ error: 'Project ID, BEC number, and title are required.' });
    }

    const projectBec = String(p.bec).trim().toUpperCase();
    const callerBec = String(req.user?.bec || '').trim().toUpperCase();
    const callerRole = String(req.user?.role || '').trim().toLowerCase();

    // Students can only save projects under their own BEC unless teacher / hod
    if (callerRole === 'student' && projectBec !== callerBec) {
      return res.status(403).json({ error: 'Students can only save projects under their own BEC / USN.' });
    }

    const db = await getDbPool();
    await db.query(
      `INSERT INTO projects (id, bec, title, guide, phase, progress, problem, stack, repo_url, folders, explanation, ai_review, features, special, milestones, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), guide=VALUES(guide), phase=VALUES(phase), progress=VALUES(progress), problem=VALUES(problem), stack=VALUES(stack), repo_url=VALUES(repo_url), folders=VALUES(folders), explanation=VALUES(explanation), ai_review=VALUES(ai_review), features=VALUES(features), special=VALUES(special), milestones=VALUES(milestones)`,
      [
        p.id,
        projectBec,
        p.title,
        p.guide || 'Guide not assigned',
        p.phase || 'Planning',
        p.progress || 0,
        p.problem || '',
        JSON.stringify(p.stack || []),
        p.repoUrl || '',
        JSON.stringify(p.folders || []),
        JSON.stringify(p.explanation || null),
        p.aiReview || '',
        JSON.stringify(p.features || []),
        p.special || '',
        JSON.stringify(p.milestones || []),
        p.createdAt || new Date().toLocaleDateString()
      ]
    );

    res.json({ success: true, message: 'Project saved to TiDB Cloud.' });
  } catch (err) {
    console.error('Save project error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/db/projects/delete
router.post('/projects/delete', requireAuth, async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Project ID is required to delete.' });
    }

    const callerBec = String(req.user?.bec || '').trim().toUpperCase();
    const callerRole = String(req.user?.role || '').trim().toLowerCase();

    const db = await getDbPool();

    // If caller is student, verify they own the project
    if (callerRole === 'student') {
      const [rows] = await db.query('SELECT bec FROM projects WHERE id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) {
        const ownerBec = String(rows[0].bec || '').trim().toUpperCase();
        if (ownerBec !== callerBec) {
          return res.status(403).json({ error: 'You can only delete your own projects.' });
        }
      }
    }

    await db.query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete project error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
