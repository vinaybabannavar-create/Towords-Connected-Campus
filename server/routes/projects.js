import express from 'express';
import { getDbPool } from '../db.js';

const router = express.Router();

// GET /api/db/projects
router.get('/projects', async (req, res) => {
  try {
    const bec = req.query.bec;
    const db = await getDbPool();
    let rows;
    if (bec) {
      [rows] = await db.query('SELECT * FROM projects WHERE bec = ? ORDER BY id DESC', [bec]);
    } else {
      [rows] = await db.query('SELECT * FROM projects ORDER BY id DESC');
    }
    res.json({ projects: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects: ' + err.message });
  }
});

// POST /api/db/projects (Save Project)
router.post('/projects', async (req, res) => {
  try {
    const p = req.body || {};
    if (!p.id || !p.bec || !p.title) {
      return res.status(400).json({ error: 'Project ID, BEC number, and title are required.' });
    }

    const db = await getDbPool();
    await db.query(
      `INSERT INTO projects (id, bec, title, guide, phase, progress, problem, stack, repo_url, folders, explanation, ai_review, features, special, milestones, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), progress=VALUES(progress), problem=VALUES(problem), stack=VALUES(stack), ai_review=VALUES(ai_review), special=VALUES(special)`,
      [
        p.id,
        p.bec,
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
    res.status(500).json({ error: 'Failed to save project: ' + err.message });
  }
});

// POST /api/db/projects/delete
router.post('/projects/delete', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Project ID is required to delete.' });
    }

    const db = await getDbPool();
    await db.query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project: ' + err.message });
  }
});

export default router;
