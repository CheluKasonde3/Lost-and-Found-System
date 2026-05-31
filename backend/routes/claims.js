const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/claims — list claims for admin review ───────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status = 'pending' } = req.query;

  if (!['pending', 'approved', 'rejected', 'all'].includes(status)) {
    return res.status(400).json({ error: 'Invalid claim status.' });
  }

  try {
    const params = [];
    let statusFilter = '';
    if (status !== 'all') {
      params.push(status);
      statusFilter = `WHERE c.status = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT c.*, u.full_name, u.email, u.student_id,
              i.title AS item_title, i.status AS item_status, i.location AS item_location
       FROM claims c
       JOIN users u ON c.claimed_by = u.id
       JOIN items i ON c.item_id = i.id
       ${statusFilter}
       ORDER BY c.created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch claims.' });
  }
});

// ── POST /api/claims — submit a claim ────────────────────────
router.post('/', authenticate, async (req, res) => {
  const { item_id, description } = req.body;
  if (!item_id || !description)
    return res.status(400).json({ error: 'item_id and description are required.' });

  if (req.user.role === 'admin') {
    return res.status(400).json({ error: 'Admins cannot submit claims.' });
  }

  try {
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [item_id]);
    if (!item.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    if (item.rows[0].reported_by === req.user.id)
      return res.status(400).json({ error: 'You cannot claim an item you reported.' });
    if (['claimed', 'resolved'].includes(item.rows[0].status))
      return res.status(400).json({ error: 'This item has already been claimed.' });

    const result = await pool.query(
      `INSERT INTO claims (item_id, claimed_by, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [item_id, req.user.id, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'You have already submitted a claim for this item.' });
    console.error(err);
    res.status(500).json({ error: 'Failed to submit claim.' });
  }
});

// ── GET /api/claims/item/:item_id — claims for an item (admin) ─
router.get('/item/:item_id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name, u.email, u.student_id
       FROM claims c JOIN users u ON c.claimed_by = u.id
       WHERE c.item_id = $1 ORDER BY c.created_at DESC`,
      [req.params.item_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claims.' });
  }
});

// ── GET /api/claims/mine — my claims ─────────────────────────
router.get('/mine', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, i.title AS item_title, i.status AS item_status, i.image_url
       FROM claims c JOIN items i ON c.item_id = i.id
       WHERE c.claimed_by = $1 ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your claims.' });
  }
});

// ── PUT /api/claims/:id — approve or reject a claim (admin) ──
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });

  try {
    const claim = await pool.query('SELECT * FROM claims WHERE id = $1', [req.params.id]);
    if (!claim.rows[0]) return res.status(404).json({ error: 'Claim not found.' });

    const result = await pool.query(
      'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    // If approved, mark the item as claimed
    if (status === 'approved') {
      await pool.query(
        'UPDATE items SET status = $1, claimed_by = $2 WHERE id = $3',
        ['claimed', claim.rows[0].claimed_by, claim.rows[0].item_id]
      );
      // Reject all other pending claims for this item
      await pool.query(
        `UPDATE claims SET status = 'rejected'
         WHERE item_id = $1 AND id != $2 AND status = 'pending'`,
        [claim.rows[0].item_id, req.params.id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update claim.' });
  }
});

module.exports = router;
