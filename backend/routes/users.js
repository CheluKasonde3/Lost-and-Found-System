const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/users — list all users (admin) ───────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, student_id, phone, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ── GET /api/users/stats — dashboard stats (admin) ────────────
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [items, users, claims] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'lost')     AS lost,
          COUNT(*) FILTER (WHERE status = 'found')    AS found,
          COUNT(*) FILTER (WHERE status = 'claimed')  AS claimed,
          COUNT(*) FILTER (WHERE status = 'resolved') AS resolved,
          COUNT(*)                                    AS total
        FROM items
      `),
      pool.query('SELECT COUNT(*) AS total FROM users'),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'pending')  AS pending,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved,
          COUNT(*)                                    AS total
        FROM claims
      `),
    ]);

    res.json({
      items: items.rows[0],
      users: users.rows[0],
      claims: claims.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ── PUT /api/users/profile — update own profile ───────────────
router.put('/profile', authenticate, async (req, res) => {
  const { full_name, phone, student_id, current_password, new_password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let password_hash = user.password_hash;

    if (new_password) {
      if (!current_password)
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
      password_hash = await bcrypt.hash(new_password, 10);
    }

    const result = await pool.query(
      `UPDATE users SET
        full_name = $1, phone = $2, student_id = $3, password_hash = $4
       WHERE id = $5
       RETURNING id, full_name, email, role, student_id, phone, created_at`,
      [full_name || user.full_name, phone || user.phone, student_id || user.student_id, password_hash, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── PUT /api/users/:id/role — change user role (admin) ────────
router.put('/:id/role', authenticate, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['student', 'staff', 'admin'].includes(role))
    return res.status(400).json({ error: 'Invalid role.' });

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role',
      [role, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

module.exports = router;
