const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const SALT_ROUNDS = 10;

// ── POST /api/auth/register ───────────────────────────────────
router.post("/register", async (req, res) => {
  const { full_name, email, password, student_id, phone } = req.body;

  if (!full_name || !email || !password)
    return res
      .status(400)
      .json({ error: "full_name, email and password are required." });

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (exists.rows.length > 0)
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, student_id, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, student_id, created_at`,
      [full_name, email, password_hash, student_id || null, phone || null],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, student_id, phone, created_at FROM users WHERE id = $1",
      [req.user.id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "User not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch user." });
  }
});

module.exports = router;
