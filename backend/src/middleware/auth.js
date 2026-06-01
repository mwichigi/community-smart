const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Require valid JWT
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, name, email, phone, whatsapp, user_type, avatar_url, is_active FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows.length) return res.status(401).json({ message: 'User no longer exists.' });
    if (!result.rows[0].is_active) return res.status(401).json({ message: 'Account has been deactivated.' });
    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired. Please log in again.' });
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// Optional auth — attaches user if token present, continues either way
const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query('SELECT id, name, email, phone, whatsapp, user_type FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length) req.user = result.rows[0];
    }
  } catch { /* silently continue without user */ }
  next();
};

// Restrict to specific user types
const restrictTo = (...types) => (req, res, next) => {
  if (!types.includes(req.user?.user_type)) {
    return res.status(403).json({ message: `Access restricted to: ${types.join(', ')}` });
  }
  next();
};

module.exports = { protect, optionalAuth, restrictTo };
