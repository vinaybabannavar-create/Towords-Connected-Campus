import express from 'express';

const router = express.Router();

// POST /api/ai
router.post('/ai', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing in environment variables.' });
  }

  try {
    const body = req.body || {};
    const geminiPayload = {};

    // 1. Native systemInstruction
    if (body.systemInstruction && typeof body.systemInstruction === 'string' && body.systemInstruction.trim()) {
      geminiPayload.systemInstruction = {
        parts: [{ text: body.systemInstruction.trim() }]
      };
    }

    // 2. Structured contents
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

    while (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    if (contents.length === 0) {
      return res.status(400).json({ error: 'A message or prompt is required.' });
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
      return res.status(geminiResponse.status).json({ error: data.error?.message || 'Gemini AI request failed.' });
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
    res.json({ text: text || 'No response generated.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'AI server error.' });
  }
});

export default router;
