/**
 * controllers/searchController.js
 * --------------------------------
 * Trie-powered tag autocomplete controller.
 *
 * The Trie is built per-request from the authenticated user's tags,
 * ensuring user isolation and up-to-date suggestions.
 *
 * Endpoint:
 *   GET /api/tags/suggest?q=<prefix>  → { suggestions: [...] }
 *
 * Time Complexity: O(L + N) per query where L = prefix length, N = matches
 */

const Note = require('../models/Note');
const Trie = require('../data_structures/Trie');

// ── GET /api/tags/suggest?q=<prefix> ────────────────────────────────────────
const suggestTags = async (req, res) => {
  try {
    const prefix = req.query.q;

    if (!prefix || !prefix.trim()) {
      return res.status(200).json({ suggestions: [] });
    }

    // Fetch all unique tags for this user
    const notes = await Note.find({ userId: req.user._id }).select('tags');
    
    // Build a fresh Trie from the user's tags
    const trie = new Trie();
    const tagSet = new Set();

    for (const note of notes) {
      for (const tag of (note.tags || [])) {
        const cleaned = tag.toLowerCase().trim();
        if (cleaned && !tagSet.has(cleaned)) {
          tagSet.add(cleaned);
          trie.insert(cleaned);
        }
      }
    }

    // Search the Trie with the given prefix
    const suggestions = trie.searchPrefix(prefix.toLowerCase().trim());

    res.status(200).json({ suggestions: suggestions.slice(0, 10) }); // Limit to 10
  } catch (error) {
    console.error('suggestTags error:', error.message);
    res.status(500).json({ message: 'Failed to fetch tag suggestions.' });
  }
};

module.exports = { suggestTags };
