const express = require("express");
const pool = require("../db");
const { authenticate, requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

const CATEGORY_ALIASES = {
  bag: "Bag",
  bags: "Bag",
  electronics: "Electronics",
  clothing: "Clothing",
  accessories: "Accessories",
  document: "Documents",
  documents: "Documents",
  wallet: "Wallet",
  phone: "Phone",
  phones: "Phone",
  laptop: "Laptop",
  jewelry: "Jewelry",
  jewellery: "Jewelry",
  book: "Book",
  books: "Book",
  stationery: "Stationery",
  other: "Other",
  "personal item": "Personal Items",
  "personal items": "Personal Items",
};

const normalizeCategory = (category) => {
  const normalized = String(category || "")
    .trim()
    .toLowerCase();
  if (!normalized) return normalized;
  return CATEGORY_ALIASES[normalized] || normalized;
};

// ── GET /api/items — list all items (public, with filters) ────
router.get("/", async (req, res) => {
  const { status, category, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email
    FROM items i
    JOIN users u ON i.reported_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND i.status = $${params.length}`;
  }
  if (category) {
    params.push(category);
    query += ` AND i.category = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (i.title ILIKE $${params.length} OR i.description ILIKE $${params.length} OR i.location ILIKE $${params.length})`;
  }

  const countQuery = query.replace(
    "SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email",
    "SELECT COUNT(*)",
  );

  query += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit), offset);

  try {
    const [items, total] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      items: items.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(total.rows[0].count / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items." });
  }
});

// ── GET /api/items/:id — single item ─────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email, u.phone AS reporter_phone
       FROM items i JOIN users u ON i.reported_by = u.id
       WHERE i.id = $1`,
      [req.params.id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Item not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item." });
  }
});

// ── POST /api/items — create item (with optional image) ───────
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  const { title, description, category, status, location, date_lost_found } =
    req.body;

  if (!title || !description || !category || !location || !date_lost_found)
    return res.status(400).json({
      error: "title, description, category, location, and date are required.",
    });

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const normalizedCategory = normalizeCategory(category);

  try {
    const result = await pool.query(
      `INSERT INTO items (title, description, category, status, location, date_lost_found, image_url, reported_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        title,
        description,
        normalizedCategory,
        status || "lost",
        location,
        date_lost_found,
        image_url,
        req.user.id,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create item." });
  }
});

// ── PUT /api/items/:id — update item ─────────────────────────
router.put("/:id", authenticate, upload.single("image"), async (req, res) => {
  const { title, description, category, status, location, date_lost_found } =
    req.body;

  try {
    const existing = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing.rows[0])
      return res.status(404).json({ error: "Item not found." });

    const item = existing.rows[0];
    // Only owner or admin may update
    if (item.reported_by !== req.user.id && req.user.role !== "admin")
      return res
        .status(403)
        .json({ error: "Only the item owner or an admin can edit this item." });

    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : item.image_url;
    const normalizedCategory =
      typeof category === "undefined"
        ? item.category
        : normalizeCategory(category);

    const result = await pool.query(
      `UPDATE items SET
        title = $1, description = $2, category = $3, status = $4,
        location = $5, date_lost_found = $6, image_url = $7
       WHERE id = $8 RETURNING *`,
      [
        title || item.title,
        description || item.description,
        normalizedCategory,
        status || item.status,
        location || item.location,
        date_lost_found || item.date_lost_found,
        image_url,
        req.params.id,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item." });
  }
});

// ── PUT /api/items/:id/mark-resolved — mark an item as resolved (owner/admin) ─
router.put("/:id/mark-resolved", authenticate, async (req, res) => {
  try {
    const existing = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing.rows[0])
      return res.status(404).json({ error: "Item not found." });

    const item = existing.rows[0];
    if (item.reported_by !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only the item owner or an admin can mark it as resolved.",
      });
    }

    const result = await pool.query(
      `UPDATE items SET status = 'resolved' WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark item as resolved." });
  }
});

// ── PUT /api/items/:id/mark-found — mark a lost item as found ─
router.put("/:id/mark-found", authenticate, async (req, res) => {
  try {
    const existing = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing.rows[0])
      return res.status(404).json({ error: "Item not found." });

    const item = existing.rows[0];
    if (item.status !== "lost") {
      return res
        .status(400)
        .json({ error: "Only lost items can be marked as found." });
    }

    const result = await pool.query(
      `UPDATE items
       SET status = 'found', date_lost_found = CURRENT_DATE
       WHERE id = $1
       RETURNING *`,
      [req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark item as found." });
  }
});

// ── DELETE /api/items/:id ─────────────────────────────────────
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await pool.query("SELECT * FROM items WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing.rows[0])
      return res.status(404).json({ error: "Item not found." });

    const item = existing.rows[0];
    if (item.reported_by !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({
        error: "Only the item owner or an admin can delete this item.",
      });

    await pool.query("DELETE FROM items WHERE id = $1", [req.params.id]);
    res.json({ message: "Item deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item." });
  }
});

// ── GET /api/items/user/mine — current user's items ──────────
router.get("/user/mine", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE reported_by = $1 ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your items." });
  }
});

module.exports = router;
