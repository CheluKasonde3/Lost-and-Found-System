const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const claimRoutes = require('./routes/claims');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/items',  itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/users',  userRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', time: new Date() }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
