/**
 * middleware/securityMiddleware.js
 * --------------------------------
 * Global security middleware:
 *   - Helmet: sets secure HTTP headers
 *   - Rate Limiter: prevents brute-force / DDoS on API routes
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ── Helmet — Secure HTTP headers ────────────────────────────────────────────
const helmetMiddleware = helmet();

// ── Rate Limiter — 100 requests per 15 min per IP ──────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  standardHeaders: true,     // return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,      // disable `X-RateLimit-*` headers
  message: { message: 'Too many requests. Please try again later.' },
});

// ── Stricter rate limiter for auth routes (20 per 15 min) ───────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login/register attempts. Please try again later.' },
});

module.exports = { helmetMiddleware, apiLimiter, authLimiter };
