import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import gatePassRoutes from './routes/gatepasses.js';
import driveRoutes from './routes/drives.js';
import registrationRoutes from './routes/registrations.js';
import projectRoutes from './routes/projects.js';
import aiRoutes from './routes/ai.js';
import { getDbPool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Database Health Check Route
app.get('/api/db/status', async (req, res) => {
  try {
    const db = await getDbPool();
    await db.query('SELECT 1');
    res.json({ online: true, database: 'TiDB Cloud (' + (process.env.TIDB_DATABASE || 'bec_portal') + ')' });
  } catch (err) {
    res.status(500).json({ online: false, error: err.message });
  }
});

// API Routes
app.use('/api/db', authRoutes);
app.use('/api/db', gatePassRoutes);
app.use('/api/db', driveRoutes);
app.use('/api/db', registrationRoutes);
app.use('/api/db', projectRoutes);
app.use('/api', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Express Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Initialize DB and Start Server
getDbPool().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Towards Connected Campus Express Backend Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
