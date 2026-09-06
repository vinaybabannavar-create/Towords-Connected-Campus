import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import statusRoutes from './routes/status.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
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
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
// Root status check
app.get('/', (req, res) => {
  res.json({
    name: 'Towards Connected Campus API Backend',
    status: 'online',
    frontend: 'http://localhost:5173',
    version: '1.0.0',
    endpoints: {
      health: '/api/db/status',
      auth: '/api/db/auth/login',
      students: '/api/db/students',
      gatepasses: '/api/db/gatepasses',
      drives: '/api/db/drives',
      registrations: '/api/db/registrations',
      projects: '/api/db/projects',
      ai: '/api/ai'
    }
  });
});

// API Routes
app.use('/api/db', statusRoutes);
app.use('/api/db', authRoutes);
app.use('/api/db', studentRoutes);
app.use('/api/db', gatePassRoutes);
app.use('/api/db', driveRoutes);
app.use('/api/db/drives', driveRoutes);
app.use('/api/db', registrationRoutes);
app.use('/api/db/registrations', registrationRoutes);
app.use('/api/db', projectRoutes);
app.use('/api', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Express Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Towards Connected Campus Express Backend Server running on http://localhost:${PORT}`);
});

// Initialize DB pool in background
getDbPool().catch((err) => {
  console.warn('⚠️ DB pool background initialization notice:', err.message);
});

export default app;
