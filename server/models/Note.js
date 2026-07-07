/**
 * models/Note.js
 * ---------------
 * Mongoose schema and model for the Notes collection.
 *
 * Each note belongs to a single user (userId) and can link to other notes
 * via the `links` array — these are the **edges** of the note graph.
 *
 * Fields:
 *   - userId  : ObjectId ref → User  (indexed, required)
 *   - title   : Note title            (indexed for text search)
 *   - content : Note body text
 *   - tags    : Array of tag strings   (e.g. ["DSA", "React"])
 *   - links   : Array of ObjectId refs → Note (graph edges)
 *
 * Indexes:
 *   - Text index on `title` for MongoDB full-text search.
 *   - Compound index { userId, createdAt desc } for efficient per-user listing.
 */

const mongoose = require('mongoose');

// ── Schema Definition ───────────────────────────────────────────────────────
const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required — every note must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
    },
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    links: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Indexes ─────────────────────────────────────────────────────────────────

// Text index on title and content — enables MongoDB $text search queries
noteSchema.index({ title: 'text', content: 'text' });

// Compound index for fast per-user note listing sorted by newest first
noteSchema.index({ userId: 1, createdAt: -1 });

// Compound index for searching notes by tag within a user's scope
noteSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
