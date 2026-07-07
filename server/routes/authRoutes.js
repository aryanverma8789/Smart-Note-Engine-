/**
 * routes/authRoutes.js
 * ---------------------
 * Maps authentication endpoints to controller functions.
 *
 * POST /api/auth/register  → authController.register
 * POST /api/auth/login     → authController.login
 */

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authLimiter } = require('../middleware/securityMiddleware');

// Apply stricter rate limiting to auth routes
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);

module.exports = router;
