import express from 'express';
import { executeQuery } from '../db.js';

const router = express.Router();

// ─── INIT TABLES ─────────────────────────────────────────────────────────────
export const initChatTables = async () => {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS chat_connections (
        id VARCHAR(100) PRIMARY KEY,
        user1_bec VARCHAR(50) NOT NULL,
        user2_bec VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        requested_by VARCHAR(50),
        created_at VARCHAR(100),
        updated_at VARCHAR(100),
        INDEX idx_user1 (user1_bec),
        INDEX idx_user2 (user2_bec)
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(100) PRIMARY KEY,
        conversation_id VARCHAR(200) NOT NULL,
        sender_bec VARCHAR(50) NOT NULL,
        recipient_bec VARCHAR(200),
        content TEXT,
        type VARCHAR(50) DEFAULT 'text',
        file_name VARCHAR(255),
        file_url LONGTEXT,
        is_group TINYINT(1) DEFAULT 0,
        seen TINYINT(1) DEFAULT 0,
        created_at VARCHAR(100),
        INDEX idx_conv (conversation_id),
        INDEX idx_sender (sender_bec)
      );
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS chat_groups (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by VARCHAR(50) NOT NULL,
        members JSON,
        avatar VARCHAR(10),
        created_at VARCHAR(100),
        INDEX idx_creator (created_by)
      );
    `);

    console.log('✅ Chat tables ready');
  } catch (err) {
    console.warn('⚠️ Chat table init:', err.message);
  }
};

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────

// GET all connections for a BEC
router.get('/connections/:bec', async (req, res) => {
  try {
    const bec = req.params.bec.trim().toUpperCase();
    const [rows] = await executeQuery(
      `SELECT * FROM chat_connections WHERE user1_bec = ? OR user2_bec = ? ORDER BY updated_at DESC`,
      [bec, bec]
    );
    res.json({ connections: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save / upsert a connection
router.post('/connections', async (req, res) => {
  try {
    const c = req.body;
    if (!c?.id || !c?.user1_bec || !c?.user2_bec) return res.status(400).json({ error: 'Missing fields' });
    await executeQuery(
      `INSERT INTO chat_connections (id, user1_bec, user2_bec, status, requested_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = VALUES(updated_at)`,
      [c.id, c.user1_bec.toUpperCase(), c.user2_bec.toUpperCase(), c.status || 'pending',
       c.requested_by || c.user1_bec, c.created_at || new Date().toISOString(), new Date().toISOString()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update connection status (accept/reject)
router.patch('/connections/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await executeQuery(
      `UPDATE chat_connections SET status = ?, updated_at = ? WHERE id = ?`,
      [status, new Date().toISOString(), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE connection
router.delete('/connections/:id', async (req, res) => {
  try {
    await executeQuery(`DELETE FROM chat_connections WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

// GET messages for a conversation
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const convId = req.params.conversationId;
    const [rows] = await executeQuery(
      `SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 200`,
      [convId]
    );
    res.json({ messages: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save a message
router.post('/messages', async (req, res) => {
  try {
    const m = req.body;
    if (!m?.id || !m?.conversation_id || !m?.sender_bec) return res.status(400).json({ error: 'Missing fields' });
    await executeQuery(
      `INSERT IGNORE INTO chat_messages
       (id, conversation_id, sender_bec, recipient_bec, content, type, file_name, file_url, is_group, seen, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.conversation_id, m.sender_bec.toUpperCase(),
       m.recipient_bec || '', m.content || '', m.type || 'text',
       m.file_name || '', m.file_url || '', m.is_group ? 1 : 0,
       m.seen ? 1 : 0, m.created_at || new Date().toISOString()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark messages as seen
router.patch('/messages/seen', async (req, res) => {
  try {
    const { conversation_id, reader_bec } = req.body;
    await executeQuery(
      `UPDATE chat_messages SET seen = 1 WHERE conversation_id = ? AND sender_bec != ?`,
      [conversation_id, reader_bec.toUpperCase()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all messages in a conversation (clear chat)
router.delete('/messages/:conversationId', async (req, res) => {
  try {
    await executeQuery(`DELETE FROM chat_messages WHERE conversation_id = ?`, [req.params.conversationId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GROUPS ──────────────────────────────────────────────────────────────────

// GET all groups (all are visible to members)
router.get('/groups', async (req, res) => {
  try {
    const [rows] = await executeQuery(`SELECT * FROM chat_groups ORDER BY created_at DESC`);
    const groups = rows.map(g => ({
      ...g,
      members: (() => { try { return JSON.parse(g.members); } catch { return []; } })()
    }));
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create group
router.post('/groups', async (req, res) => {
  try {
    const g = req.body;
    if (!g?.id || !g?.name || !g?.created_by) return res.status(400).json({ error: 'Missing fields' });
    await executeQuery(
      `INSERT IGNORE INTO chat_groups (id, name, description, created_by, members, avatar, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [g.id, g.name, g.description || '', g.created_by.toUpperCase(),
       JSON.stringify(g.members || []), g.avatar || '👥', g.created_at || new Date().toISOString()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update group members
router.patch('/groups/:id', async (req, res) => {
  try {
    const { members, name, description } = req.body;
    await executeQuery(
      `UPDATE chat_groups SET members = ?, name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
      [JSON.stringify(members || []), name || null, description || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE group
router.delete('/groups/:id', async (req, res) => {
  try {
    await executeQuery(`DELETE FROM chat_groups WHERE id = ?`, [req.params.id]);
    await executeQuery(`DELETE FROM chat_messages WHERE conversation_id = ?`, [`group_${req.params.id}`]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
