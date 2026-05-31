const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

/**
 * Middleware: verify JWT and attach user to req.user
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'User account no longer exists. Please log in again.' });
    }

    req.user = result.rows[0]; // { id, email, role }
    next();
  } catch (err) {
    if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') {
      console.error(err);
      return res.status(500).json({ error: 'Authentication failed.' });
    }
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Middleware: restrict route to admins only
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
