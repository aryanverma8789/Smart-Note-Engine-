/**
 * server.js
 * ----------
 * Application entry point for the Smart Note Engine backend.
 *
 * Responsibilities:
 *   1. Load environment variables (.env).
 *   2. Initialise Express and apply global middleware (CORS, JSON, Helmet, Rate Limit).
 *   3. Connect to MongoDB via config/db.js.
 *   4. Mount API routes (auth, notes, tags).
 *   5. Global error handler.
 *   6. Start the HTTP server.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { helmetMiddleware, apiLimiter } = require('./middleware/securityMiddleware');

// ── Load environment variables ──────────────────────────────────────────────
dotenv.config();

// ── Initialise Express ──────────────────────────────────────────────────────
const app = express();

// ── Global Middleware ───────────────────────────────────────────────────────
app.use(helmetMiddleware);   // Secure HTTP headers
app.use(cors());             // Allow cross-origin requests (frontend ↔ backend)
app.use(express.json());     // Parse incoming JSON request bodies
app.use('/api', apiLimiter); // Rate-limit all /api routes

// ── Health-check Route ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));   // Auth: register, login
app.use('/api/notes', require('./routes/noteRoutes'));   // Notes: CRUD + network
app.use('/api/tags', require('./routes/tagRoutes'));    // Tags: Trie autocomplete

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ message: 'Internal server error.' });
});

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // Connect to MongoDB first
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/notes`);
    console.log(`   POST   /api/notes`);
    console.log(`   GET    /api/notes/:id`);
    console.log(`   PUT    /api/notes/:id`);
    console.log(`   DELETE /api/notes/:id`);
    console.log(`   GET    /api/notes/:id/network`);
    console.log(`   GET    /api/tags/suggest?q=...`);
  });
};

startServer();
