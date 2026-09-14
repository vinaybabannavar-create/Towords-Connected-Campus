import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Automatically load .env.local or .env if present
try {
  if (typeof process.loadEnvFile === 'function') {
    if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
    if (fs.existsSync('.env')) process.loadEnvFile('.env');
  } else {
    ['.env.local', '.env'].forEach((file) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        content.split('\n').forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && !process.env[match[1]]) {
            process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
          }
        });
      }
    });
  }
} catch (e) {}

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

// Create HTTP server & Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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

// Socket.IO Real-Time Messaging & Friend Request Handling
io.on('connection', (socket) => {
  console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);

  // Register user BEC room
  socket.on('join_user', ({ bec }) => {
    if (!bec) return;
    const cleanBec = String(bec).trim().toUpperCase();
    socket.join(`user_${cleanBec}`);
    console.log(`👤 Socket ${socket.id} joined room user_${cleanBec}`);
  });

  // Friend Request Sent Live Broadcast
  socket.on('send_connect_request', (connData) => {
    if (!connData || !connData.user2_bec) return;
    const targetRoom = `user_${String(connData.user2_bec).trim().toUpperCase()}`;
    io.to(targetRoom).emit('new_connect_request', connData);
    io.emit('sync_connections_update', connData);
    console.log(`📡 Broadcasted connect request to ${targetRoom}`);
  });

  // Accept / Decline / Delete Connection Broadcast
  socket.on('update_connection_status', (data) => {
    io.emit('connection_status_updated', data);
  });

  // Live Chat Message Broadcast
  socket.on('send_message', (msgData) => {
    if (!msgData || !msgData.conversationId) return;

    const convId = String(msgData.conversationId).trim().toUpperCase();
    if (convId.startsWith('GROUP_')) {
      io.emit('receive_message', msgData);
    } else {
      // Direct message: broadcast to recipient room and sender room
      const recipientRoom = `user_${convId}`;
      const senderRoom = `user_${String(msgData.senderBec).trim().toUpperCase()}`;
      io.to(recipientRoom).to(senderRoom).emit('receive_message', msgData);
    }
    console.log(`💬 Message broadcasted for conversation ${convId}`);
  });

  // Group Created Live Broadcast
  socket.on('create_group', (groupData) => {
    io.emit('group_created', groupData);
  });

  // Delete event broadcast
  socket.on('delete_event', (payload) => {
    io.emit('sync_delete_event', payload);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Express Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Towards Connected Campus Express Backend Server running on http://localhost:${PORT}`);
});

// Initialize DB pool in background
getDbPool().catch((err) => {
  console.warn('⚠️ DB pool background initialization notice:', err.message);
});

export default app;
