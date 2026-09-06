import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const LOCAL_GATEPASS_FILE = path.resolve(process.cwd(), 'gate_passes_data.json');

const getLocalPasses = () => {
  try {
    if (fs.existsSync(LOCAL_GATEPASS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_GATEPASS_FILE, 'utf-8') || '[]');
    }
  } catch (e) {}
  return [];
};

const saveLocalPasses = (passes) => {
  try {
    fs.writeFileSync(LOCAL_GATEPASS_FILE, JSON.stringify(passes, null, 2), 'utf-8');
  } catch (e) {}
};

const readBody = (req) => (
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  })
);

const sendJSON = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY;
  const model = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  const tidbHost = env.TIDB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com';
  const tidbPort = Number(env.TIDB_PORT) || 4000;
  const tidbUser = env.TIDB_USER || 'ccdjxcTfxpVGx5J.root';
  const tidbPassword = env.TIDB_PASSWORD || 'FSU5fgIbgW7S0oyv';
  const tidbDatabase = env.TIDB_DATABASE || 'bec_portal';

  let pool = null;
  let initDbPromise = null;

  const getDbPool = async () => {
    if (!pool) {
      pool = mysql.createPool({
        host: tidbHost,
        port: tidbPort,
        user: tidbUser,
        password: tidbPassword,
        database: tidbDatabase,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 20000,
        ssl: { rejectUnauthorized: false }
      });
    }

    if (!initDbPromise) {
      initDbPromise = (async () => {
        try {
          const initConn = await mysql.createConnection({
            host: tidbHost,
            port: tidbPort,
            user: tidbUser,
            password: tidbPassword,
            database: 'test',
            connectTimeout: 20000,
            ssl: { rejectUnauthorized: false }
          });
          await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${tidbDatabase}\`;`);
          await initConn.end();

          await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
              bec VARCHAR(50) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              department VARCHAR(100) NOT NULL,
              year VARCHAR(50) NOT NULL,
              password VARCHAR(255) NOT NULL,
              role VARCHAR(50) DEFAULT 'student',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
          try {
            await pool.query("ALTER TABLE students ADD COLUMN role VARCHAR(50) DEFAULT 'student';");
          } catch (e) { /* Column exists */ }

          await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
              id VARCHAR(100) PRIMARY KEY,
              bec VARCHAR(50) NOT NULL,
              title VARCHAR(255) NOT NULL,
              guide VARCHAR(255),
              phase VARCHAR(100),
              progress INT,
              problem TEXT,
              stack JSON,
              repo_url TEXT,
              folders JSON,
              explanation JSON,
              ai_review LONGTEXT,
              features JSON,
              special TEXT,
              milestones JSON,
              created_at VARCHAR(100)
            );
          `);
          await pool.query(`
            CREATE TABLE IF NOT EXISTS gate_passes (
              id VARCHAR(100) PRIMARY KEY,
              bec VARCHAR(50) NOT NULL,
              name VARCHAR(255) NOT NULL,
              roll_no VARCHAR(50),
              branch VARCHAR(100),
              year_sem VARCHAR(100),
              college_name VARCHAR(255),
              department VARCHAR(100),
              reason TEXT,
              document_name VARCHAR(255),
              ai_priority VARCHAR(50) DEFAULT 'MEDIUM',
              security_key VARCHAR(50),
              date VARCHAR(50),
              out_time VARCHAR(50),
              return_time VARCHAR(50),
              contact VARCHAR(50),
              status VARCHAR(100),
              teacher_approval VARCHAR(255),
              hod_approval VARCHAR(255),
              rejection_reason TEXT,
              created_at VARCHAR(100)
            );
          `);
          try {
            await pool.query("ALTER TABLE gate_passes ADD COLUMN department VARCHAR(100);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN roll_no VARCHAR(50);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN branch VARCHAR(100);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN year_sem VARCHAR(100);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN college_name VARCHAR(255);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN document_name VARCHAR(255);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN ai_priority VARCHAR(50) DEFAULT 'MEDIUM';");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN security_key VARCHAR(50);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN teacher_approval VARCHAR(255);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN hod_approval VARCHAR(255);");
            await pool.query("ALTER TABLE gate_passes ADD COLUMN rejection_reason TEXT;");
          } catch (e) { /* Columns exist */ }
          console.log('✅ TiDB Cloud schema initialized & ready for multi-role staff data');
        } catch (err) {
          console.error('TiDB schema init notice:', err.message);
        }
      })();
    }

    await initDbPromise;
    return pool;
  };

  return {
    plugins: [
      react(),
      {
        name: 'bec-backend-api',
        configureServer(server) {
          // TiDB Database API Endpoints
          server.middlewares.use('/api/db', async (req, res) => {
            const url = new URL(req.url, 'http://localhost');
            const pathname = url.pathname;

            try {
              const db = await getDbPool();

              // Health Check
              if (pathname === '/status') {
                await db.query('SELECT 1');
                sendJSON(res, 200, { online: true, database: 'TiDB Cloud (' + tidbDatabase + ')' });
                return;
              }

              // Students / Staff Accounts
              if (pathname === '/students' && req.method === 'GET') {
                const [rows] = await db.query('SELECT bec, name, department, year, role, created_at FROM students ORDER BY created_at DESC');
                sendJSON(res, 200, { students: rows });
                return;
              }

              if (pathname === '/students' && req.method === 'POST') {
                const raw = await readBody(req);
                const body = JSON.parse(raw || '{}');
                const { bec, name, department, year, password, role } = body;

                if (!bec || !name || !password) {
                  sendJSON(res, 400, { error: 'BEC / Staff ID, name, and password are required.' });
                  return;
                }

                const userRole = role || 'student';

                await db.query(
                  'INSERT INTO students (bec, name, department, year, password, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), department = VALUES(department), year = VALUES(year), password = VALUES(password), role = VALUES(role)',
                  [bec, name, department || '', year || 'III Year', password, userRole]
                );

                sendJSON(res, 200, { success: true, message: 'Account saved to TiDB Cloud.' });
                return;
              }

              // Auth Login
              if (pathname === '/auth/login' && req.method === 'POST') {
                const raw = await readBody(req);
                const { bec, password, role } = JSON.parse(raw || '{}');

                let query = 'SELECT bec, name, department, year, role FROM students WHERE bec = ? AND password = ?';
                let params = [bec, password];

                if (role) {
                  query += ' AND role = ?';
                  params.push(role);
                }
                query += ' LIMIT 1';

                const [rows] = await db.query(query, params);

                if (rows.length > 0) {
                  sendJSON(res, 200, { success: true, student: rows[0] });
                } else {
                  sendJSON(res, 401, { error: 'Invalid BEC number, password, or role selection.' });
                }
                return;
              }

              // Projects
              if (pathname === '/projects' && req.method === 'GET') {
                const bec = url.searchParams.get('bec');
                let rows;
                if (bec) {
                  [rows] = await db.query('SELECT * FROM projects WHERE bec = ? ORDER BY id DESC', [bec]);
                } else {
                  [rows] = await db.query('SELECT * FROM projects ORDER BY id DESC');
                }
                sendJSON(res, 200, { projects: rows });
                return;
              }

              if (pathname === '/projects' && req.method === 'POST') {
                const raw = await readBody(req);
                const p = JSON.parse(raw || '{}');

                if (!p.id || !p.bec || !p.title) {
                  sendJSON(res, 400, { error: 'Project ID, BEC number, and title are required.' });
                  return;
                }

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

                sendJSON(res, 200, { success: true, message: 'Project saved to TiDB Cloud.' });
                return;
              }

              // Gate Passes
              if (pathname === '/gatepasses' && req.method === 'GET') {
                const bec = url.searchParams.get('bec');
                const local = getLocalPasses();
                let rows = [];
                try {
                  if (bec) {
                    [rows] = await db.query('SELECT * FROM gate_passes WHERE bec = ? ORDER BY created_at DESC', [bec]);
                  } else {
                    [rows] = await db.query('SELECT * FROM gate_passes ORDER BY created_at DESC');
                  }
                } catch (err) {}

                const map = new Map();
                local.forEach((p) => { if (p?.id) map.set(p.id, p); });
                rows.forEach((p) => { if (p?.id) map.set(p.id, { ...map.get(p.id), ...p }); });
                let merged = Array.from(map.values());
                if (bec) {
                  merged = merged.filter((p) => (p.bec || p.usn || '').toUpperCase() === bec.toUpperCase());
                }
                sendJSON(res, 200, { gatePasses: merged });
                return;
              }

              if (pathname === '/gatepasses' && req.method === 'POST') {
                const raw = await readBody(req);
                const g = JSON.parse(raw || '{}');

                if (!g.id || !g.bec || !g.reason) {
                  sendJSON(res, 400, { error: 'Gate pass ID, USN/BEC, and reason are required.' });
                  return;
                }

                const local = getLocalPasses();
                const nextLocal = [g, ...local.filter((p) => p.id !== g.id)];
                saveLocalPasses(nextLocal);

                try {
                  await db.query(
                    `INSERT INTO gate_passes (id, bec, name, roll_no, branch, year_sem, college_name, department, reason, document_name, ai_priority, security_key, date, out_time, return_time, contact, status, teacher_approval, hod_approval, rejection_reason, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE status=VALUES(status), teacher_approval=VALUES(teacher_approval), hod_approval=VALUES(hod_approval), rejection_reason=VALUES(rejection_reason), security_key=VALUES(security_key)`,
                    [
                      g.id,
                      g.bec || g.usn,
                      g.name || '',
                      g.roll_no || g.rollNo || '',
                      g.branch || 'CSE',
                      g.year_sem || g.yearSem || '3rd Yr, 6th Sem',
                      g.college_name || g.collegeName || 'Engineering College',
                      g.department || g.branch || 'CSE',
                      g.reason,
                      g.document_name || g.documentName || '',
                      g.ai_priority || g.aiPriority || 'MEDIUM',
                      g.security_key || g.securityKey || Math.random().toString(16).substring(2, 8).toUpperCase(),
                      g.date || new Date().toISOString().split('T')[0],
                      g.outTime || g.out_time || '',
                      g.returnTime || g.return_time || '',
                      g.contact || '',
                      g.status || 'Pending Class Teacher',
                      g.teacherApproval || null,
                      g.hodApproval || null,
                      g.rejectionReason || null,
                      g.createdAt || new Date().toLocaleString()
                    ]
                  );
                } catch (e) {}

                sendJSON(res, 200, { success: true, message: 'Gate pass saved.' });
                return;
              }

              if (pathname === '/gatepasses/status' && req.method === 'POST') {
                const raw = await readBody(req);
                const { id, status, teacherApproval, hodApproval, rejectionReason, securityKey } = JSON.parse(raw || '{}');

                if (!id || !status) {
                  sendJSON(res, 400, { error: 'Gate pass ID and status are required.' });
                  return;
                }

                const local = getLocalPasses();
                const nextLocal = local.map((p) =>
                  p.id === id
                    ? {
                        ...p,
                        status,
                        teacher_approval: teacherApproval || p.teacher_approval,
                        hod_approval: hodApproval || p.hod_approval,
                        rejection_reason: rejectionReason || p.rejection_reason,
                        security_key: securityKey || p.security_key
                      }
                    : p
                );
                saveLocalPasses(nextLocal);

                try {
                  await db.query(
                    `UPDATE gate_passes 
                     SET status = ?, 
                         teacher_approval = COALESCE(?, teacher_approval), 
                         hod_approval = COALESCE(?, hod_approval), 
                         rejection_reason = COALESCE(?, rejection_reason),
                         security_key = COALESCE(?, security_key)
                     WHERE id = ?`,
                    [status, teacherApproval || null, hodApproval || null, rejectionReason || null, securityKey || null, id]
                  );
                } catch (e) {}

                sendJSON(res, 200, { success: true, message: 'Gate pass approval status updated.' });
                return;
              }

              // Verify at Gate Scanner
              if (pathname === '/gatepasses/verify' && req.method === 'POST') {
                const raw = await readBody(req);
                const { keyOrId } = JSON.parse(raw || '{}');

                if (!keyOrId) {
                  sendJSON(res, 400, { error: 'Security key or QR ID is required.' });
                  return;
                }

                const clean = keyOrId.trim().toUpperCase();
                const local = getLocalPasses();
                let pass = local.find((p) => p.id === clean || p.security_key === clean || (p.bec || '').toUpperCase() === clean);

                if (!pass) {
                  try {
                    const [rows] = await db.query(
                      'SELECT * FROM gate_passes WHERE id = ? OR security_key = ? OR bec = ? LIMIT 1',
                      [clean, clean, clean]
                    );
                    if (rows.length > 0) pass = rows[0];
                  } catch (e) {}
                }

                if (!pass) {
                  sendJSON(res, 404, { error: 'Pass not found or invalid QR code.' });
                  return;
                }

                pass.status = 'USED';
                const nextLocal = local.map((p) => (p.id === pass.id ? { ...p, status: 'USED' } : p));
                saveLocalPasses(nextLocal);

                try {
                  await db.query('UPDATE gate_passes SET status = "USED" WHERE id = ?', [pass.id]);
                } catch (e) {}

                sendJSON(res, 200, { success: true, pass: { ...pass, status: 'USED' } });
                return;
              }

              // Delete pass from history
              if (pathname === '/gatepasses/delete' && req.method === 'POST') {
                const raw = await readBody(req);
                const { id } = JSON.parse(raw || '{}');

                if (!id) {
                  sendJSON(res, 400, { error: 'Pass ID is required to delete.' });
                  return;
                }

                const local = getLocalPasses();
                saveLocalPasses(local.filter((p) => p.id !== id));

                try {
                  await db.query('DELETE FROM gate_passes WHERE id = ?', [id]);
                } catch (e) {}

                sendJSON(res, 200, { success: true });
                return;
              }

              sendJSON(res, 404, { error: 'Database API route not found.' });
            } catch (dbErr) {
              console.error('TiDB API Error:', dbErr);
              sendJSON(res, 500, { error: 'TiDB Cloud error: ' + dbErr.message });
            }
          });

          // Gemini AI Endpoint
          server.middlewares.use('/api/ai', async (req, res) => {
            if (req.method !== 'POST') {
              sendJSON(res, 405, { error: 'Only POST requests are supported.' });
              return;
            }

            if (!apiKey) {
              sendJSON(res, 500, { error: 'Gemini API key is missing in .env.local.' });
              return;
            }

            try {
              const rawBody = await readBody(req);
              const body = JSON.parse(rawBody || '{}');

              const geminiPayload = {};

              // 1. Native systemInstruction
              if (body.systemInstruction && typeof body.systemInstruction === 'string' && body.systemInstruction.trim()) {
                geminiPayload.systemInstruction = {
                  parts: [{ text: body.systemInstruction.trim() }]
                };
              }

              // 2. Structured contents (alternating user/model)
              let contents = [];

              if (Array.isArray(body.history) && body.history.length > 0) {
                for (const item of body.history) {
                  if (item && item.text && typeof item.text === 'string' && item.text.trim()) {
                    const role = item.role === 'model' || item.role === 'assistant' ? 'model' : 'user';
                    contents.push({
                      role,
                      parts: [{ text: item.text.trim() }]
                    });
                  }
                }
              }

              // Append current user message or prompt
              if (body.message && typeof body.message === 'string' && body.message.trim()) {
                contents.push({
                  role: 'user',
                  parts: [{ text: body.message.trim() }]
                });
              } else if (contents.length === 0 && body.prompt && typeof body.prompt === 'string' && body.prompt.trim()) {
                contents.push({
                  role: 'user',
                  parts: [{ text: body.prompt.trim() }]
                });
              }

              // Ensure conversation starts with 'user' role for Gemini compliance
              while (contents.length > 0 && contents[0].role === 'model') {
                contents.shift();
              }

              if (contents.length === 0) {
                sendJSON(res, 400, { error: 'A message or prompt is required.' });
                return;
              }

              geminiPayload.contents = contents;
              geminiPayload.generationConfig = {
                temperature: body.temperature ?? 0.3,
                maxOutputTokens: body.maxOutputTokens ?? 600
              };

              const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(geminiPayload)
                }
              );

              const data = await geminiResponse.json();
              if (!geminiResponse.ok) {
                sendJSON(res, geminiResponse.status, { error: data.error?.message || 'Gemini request failed.' });
                return;
              }

              const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
              sendJSON(res, 200, { text: text || 'No response generated.' });
            } catch (error) {
              sendJSON(res, 500, { error: error.message || 'AI server error.' });
            }
          });
        }
      }
    ]
  };
});
