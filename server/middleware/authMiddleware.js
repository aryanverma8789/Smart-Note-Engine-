/**
 * middleware/authMiddleware.js
 * ----------------------------
 * Protects routes by verifying the JWT in the Authorization header.
 *
 * Extracts: Bearer <token>
 * On success: attaches decoded user payload to req.user
 * On failure: returns 401 Unauthorized
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user to request (excluding passwordHash)
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User not found. Token invalid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Authorization denied.' });
  }
};

module.exports = authMiddleware;
