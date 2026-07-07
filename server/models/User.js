/**
 * models/User.js
 * ---------------
 * Mongoose schema and model for the Users collection.
 *
 * Fields:
 *   - username   : unique display name (indexed)
 *   - email      : unique email address (indexed, stored lowercase)
 *   - passwordHash: bcrypt-hashed password
 *
 * Hooks:
 *   - pre('save') : Automatically hashes the password when it is new or modified.
 *
 * Methods:
 *   - matchPassword(plain) : Compares a plaintext password to the stored hash.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Schema Definition ───────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-save Hook: Hash password before persisting ──────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the passwordHash field has been set or modified
  if (!this.isModified('passwordHash')) return next();

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ── Instance Method: Compare plaintext password against stored hash ─────────
userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
