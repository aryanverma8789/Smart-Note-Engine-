/**
 * controllers/authController.js
 * ------------------------------
 * Handles user registration and login.
 *
 * register: Creates a new user, returns JWT + user info.
 * login:    Validates credentials, returns JWT + user info.
 *
 * JWT payload: { id: user._id }
 * Token expiry: 7 days
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate JWT ────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({ message: `${field} already exists.` });
    }

    // Create user (password is hashed by the pre-save hook via passwordHash field)
    const user = await User.create({
      username,
      email,
      passwordHash: password, // pre-save hook will bcrypt this
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = { register, login };
