import express from 'express';
import os from 'os';
import { executeQuery } from '../db.js';

const router = express.Router();

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// GET /api/db/status (Health check endpoint)
router.get('/status', async (req, res) => {
  const serverIp = getLocalIpAddress();
  try {
    await executeQuery('SELECT 1');
    const dbName = process.env.TIDB_DATABASE || 'bec_portal';
    res.json({
      online: true,
      database: `TiDB Cloud (${dbName})`,
      serverIp,
      lanIp: serverIp,
      frontendUrl: `http://${serverIp}:5173`
    });
  } catch (err) {
    res.status(500).json({
      online: false,
      error: 'Database connection failed: ' + err.message,
      serverIp,
      lanIp: serverIp,
      frontendUrl: `http://${serverIp}:5173`
    });
  }
});

export default router;
