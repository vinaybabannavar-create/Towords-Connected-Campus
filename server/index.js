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
import chatRoutes, { initChatTables } from './routes/chat.js';
import { getDbPool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// Create HTTP server & Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: allowedOrigin, credentials: true }));
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
app.use('/api/db/chat', chatRoutes);
app.use('/api', aiRoutes);

// Socket.IO Real-Time Messaging, Online Status & Typing Indicators
const onlineSockets = new Map(); // socket.id -> bec

io.on('connection', (socket) => {
  console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);

  // Register user BEC room and mark online
  socket.on('join_user', ({ bec }) => {
    if (!bec) return;
    const cleanBec = String(bec).trim().toUpperCase();
    socket.join(`user_${cleanBec}`);
    onlineSockets.set(socket.id, cleanBec);

    const onlineList = Array.from(new Set(onlineSockets.values()));
    io.emit('online_users_list', onlineList);
    console.log(`👤 User joined: ${cleanBec} (Socket: ${socket.id}). Online users: [${onlineList.join(', ')}]`);
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

  // Live Typing Indicators
  socket.on('typing_start', ({ senderBec, senderName, targetId, isGroup }) => {
    if (!targetId || !senderBec) return;
    if (isGroup) {
      socket.broadcast.emit('user_typing', { senderBec, senderName, targetId, isGroup: true, isTyping: true });
    } else {
      const recipientRoom = `user_${String(targetId).trim().toUpperCase()}`;
      socket.to(recipientRoom).emit('user_typing', { senderBec, senderName, targetId, isGroup: false, isTyping: true });
    }
  });

  socket.on('typing_stop', ({ senderBec, targetId, isGroup }) => {
    if (!targetId || !senderBec) return;
    if (isGroup) {
      socket.broadcast.emit('user_typing', { senderBec, targetId, isGroup: true, isTyping: false });
    } else {
      const recipientRoom = `user_${String(targetId).trim().toUpperCase()}`;
      socket.to(recipientRoom).emit('user_typing', { senderBec, targetId, isGroup: false, isTyping: false });
    }
  });

  // Live Chat Message Broadcast
  socket.on('send_message', (msgData) => {
    if (!msgData) return;

    if (msgData.isGroup || (msgData.conversationId && String(msgData.conversationId).startsWith('group_'))) {
      io.emit('receive_message', msgData);
    } else {
      const recipientBec = String(msgData.recipientBec || msgData.conversationId).trim().toUpperCase();
      const senderBec = String(msgData.senderBec).trim().toUpperCase();
      const recipientRoom = `user_${recipientBec}`;
      const senderRoom = `user_${senderBec}`;
      io.to(recipientRoom).to(senderRoom).emit('receive_message', msgData);
    }
    console.log(`💬 Message broadcasted from ${msgData.senderBec} to ${msgData.recipientBec || msgData.conversationId}`);
  });

  // Group Created Live Broadcast
  socket.on('create_group', (groupData) => {
    io.emit('group_created', groupData);
  });

  // Mark Messages Seen Live Broadcast
  socket.on('mark_seen', ({ senderBec, readerBec }) => {
    if (!senderBec || !readerBec) return;
    const senderRoom = `user_${String(senderBec).trim().toUpperCase()}`;
    io.to(senderRoom).emit('messages_seen', { senderBec, readerBec });
  });

  // Clear Chat Live Broadcast (Sender's own device/tab sync only)
  socket.on('clear_chat', ({ senderBec, targetId }) => {
    if (!targetId || !senderBec) return;
    const senderRoom = `user_${String(senderBec).trim().toUpperCase()}`;
    io.to(senderRoom).emit('chat_cleared', { senderBec, targetId });
  });

  // Delete event broadcast
  socket.on('delete_event', (payload) => {
    io.emit('sync_delete_event', payload);
  });

  socket.on('disconnect', () => {
    const bec = onlineSockets.get(socket.id);
    onlineSockets.delete(socket.id);
    const onlineList = Array.from(new Set(onlineSockets.values()));
    io.emit('online_users_list', onlineList);
    console.log(`🔌 Client disconnected: ${socket.id} (${bec || 'unknown'}). Online users: [${onlineList.join(', ')}]`);
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

// Initialize chat tables
initChatTables().catch((err) => {
  console.warn('⚠️ Chat table init notice:', err.message);
});

export default app;
