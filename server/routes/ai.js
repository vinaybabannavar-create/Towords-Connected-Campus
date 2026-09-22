import express from 'express';
import fs from 'fs';
import https from 'https';

const router = express.Router();

// ─── CONFIG HELPERS ───────────────────────────────────────────────────────────

const getApiKey = () => {
  let key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    try {
      ['.env.local', '.env'].forEach((file) => {
        if (!key && fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8');
          const match = content.match(/GEMINI_API_KEY\s*=\s*(.*)/);
          if (match) key = match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      });
    } catch (e) {}
  }
  return key;
};

const getApiBase = () => {
  let base = process.env.GEMINI_API_BASE;
  if (!base) {
    try {
      ['.env.local', '.env'].forEach((file) => {
        if (!base && fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8');
          const match = content.match(/GEMINI_API_BASE\s*=\s*(.*)/);
          if (match) base = match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      });
    } catch (e) {}
  }
  return base || 'https://llm.hidevs.xyz/v1';
};

// ─── Helper: make HTTPS POST using native Node https module ──────────────────
function httpsPost(urlStr, headers, body, timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = JSON.stringify(body);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: timeoutMs
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: { error: { message: raw } } });
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// ─── POST /api/ai ─────────────────────────────────────────────────────────────
router.post('/ai', async (req, res) => {
  const apiKey = getApiKey();
  const apiBase = getApiBase();
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key is missing. Please verify GEMINI_API_KEY in .env.local.'
    });
  }

  try {
    const body = req.body || {};

    // Build OpenAI-compatible messages array
    const messages = [];

    // System instruction
    if (body.systemInstruction && typeof body.systemInstruction === 'string' && body.systemInstruction.trim()) {
      messages.push({ role: 'system', content: body.systemInstruction.trim() });
    }

    // Chat history (supports both {role, text} and {role, content} formats)
    if (Array.isArray(body.history) && body.history.length > 0) {
      for (const item of body.history) {
        const content = (item.text || item.content || '').trim();
        if (!content) continue;
        const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
        messages.push({ role, content });
      }
    }

    // Current user message
    const userMessage = (body.message || body.prompt || '').trim();
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    if (messages.filter(m => m.role !== 'system').length === 0) {
      return res.status(400).json({ error: 'A message or prompt is required.' });
    }

    const payload = {
      model,
      messages,
      temperature: body.temperature ?? 0.3,
      max_tokens: body.maxOutputTokens ?? 2500
    };

    const headers = { 'Authorization': `Bearer ${apiKey}` };
    const endpoint = `${apiBase}/chat/completions`;

    let result;
    let lastError = null;

    // Retry up to 3 times on transient errors
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await httpsPost(endpoint, headers, payload, 35000);
        if (result.status >= 200 && result.status < 300) {
          lastError = null;
          break;
        }
        lastError = new Error(result.body?.error?.message || `API returned status ${result.status}`);
        if (attempt < 3 && (result.status === 429 || result.status >= 500)) {
          await new Promise((r) => setTimeout(r, 1200 * attempt));
          continue;
        }
        break;
      } catch (err) {
        lastError = err;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    if (!result || result.status < 200 || result.status >= 300) {
      const errMsg = lastError?.message || 'AI request failed.';
      console.warn('⚠️ AI API error:', errMsg);
      return res.status(result?.status || 500).json({ error: errMsg });
    }

    const text = result.body?.choices?.[0]?.message?.content?.trim();
    res.json({ text: text || 'No response generated.' });

  } catch (error) {
    console.error('❌ AI route error:', error);
    res.status(500).json({ error: error.message || 'AI server error.' });
  }
});

export default router;
