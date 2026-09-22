import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'bec_default_jwt_fallback_secret_key_2026';
      req.user = jwt.verify(token, secret); // { bec, role }
      return next();
    } catch (e) {}
  }

  // Fallback for tab-isolated demo sessions
  const demoBec = req.headers['x-user-bec'] || req.headers['x-demo-user'];
  const demoRole = req.headers['x-user-role'] || 'student';
  if (demoBec) {
    req.user = { bec: String(demoBec).trim().toUpperCase(), role: String(demoRole).trim().toLowerCase() };
    return next();
  }

  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  return res.status(401).json({ error: 'Invalid or expired session.' });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized for this action.' });
    }
    next();
  };
}
