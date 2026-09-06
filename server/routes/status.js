import express from 'express';
import { executeQuery } from '../db.js';

const router = express.Router();

// GET /api/db/status (Health check endpoint)
router.get('/status', async (req, res) => {
  try {
    await executeQuery('SELECT 1');
    const dbName = process.env.TIDB_DATABASE || 'bec_portal';
    res.json({ online: true, database: `TiDB Cloud (${dbName})` });
  } catch (err) {
    res.status(500).json({ online: false, error: 'Database connection failed: ' + err.message });
  }
});

export default router;
