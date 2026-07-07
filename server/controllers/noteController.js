/**
 * controllers/noteController.js
 * ------------------------------
 * CRUD operations for notes + BFS network endpoint.
 *
 * CRITICAL: Every query filters by req.user.id for user isolation.
 *
 * Endpoints:
 *   POST   /api/notes            → createNote
 *   GET    /api/notes             → getNotes
 *   GET    /api/notes/:id         → getNoteById
 *   PUT    /api/notes/:id         → updateNote
 *   DELETE /api/notes/:id         → deleteNote
 *   GET    /api/notes/:id/network → getNoteNetwork (BFS graph traversal)
 */

const Note = require('../models/Note');
const Graph = require('../data_structures/Graph');

// ── POST /api/notes — Create a new note ─────────────────────────────────────
const createNote = async (req, res) => {
  try {
    const { title, content, tags, links } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Note title is required.' });
    }

    // Validate that linked notes belong to the same user
    if (links && links.length > 0) {
      const validLinks = await Note.find({
        _id: { $in: links },
        userId: req.user._id,
      }).select('_id');
      
      if (validLinks.length !== links.length) {
        return res.status(400).json({ message: 'One or more linked notes are invalid or do not belong to you.' });
      }
    }

    const note = await Note.create({
      userId: req.user._id,
      title: title.trim(),
      content: content || '',
      tags: tags || [],
      links: links || [],
    });

    // Populate links for the response
    const populated = await Note.findById(note._id)
      .populate('links', 'title tags');

    res.status(201).json(populated);
  } catch (error) {
    console.error('createNote error:', error.message);
    res.status(500).json({ message: 'Failed to create note.' });
  }
};

// ── GET /api/notes — Get all notes for the authenticated user ───────────────
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('links', 'title tags');

    res.status(200).json(notes);
  } catch (error) {
    console.error('getNotes error:', error.message);
    res.status(500).json({ message: 'Failed to fetch notes.' });
  }
};

// ── GET /api/notes/:id — Get a single note ──────────────────────────────────
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id, // User isolation
    }).populate('links', 'title tags');

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('getNoteById error:', error.message);
    res.status(500).json({ message: 'Failed to fetch note.' });
  }
};

// ── PUT /api/notes/:id — Update a note ──────────────────────────────────────
const updateNote = async (req, res) => {
  try {
    const { title, content, tags, links } = req.body;

    // Find the note (user-scoped)
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Validate linked notes if provided
    if (links && links.length > 0) {
      const validLinks = await Note.find({
        _id: { $in: links },
        userId: req.user._id,
      }).select('_id');

      if (validLinks.length !== links.length) {
        return res.status(400).json({ message: 'One or more linked notes are invalid.' });
      }
    }

    // Update fields
    if (title !== undefined)   note.title   = title.trim();
    if (content !== undefined) note.content  = content;
    if (tags !== undefined)    note.tags     = tags;
    if (links !== undefined)   note.links    = links;

    await note.save();

    // Return populated note
    const populated = await Note.findById(note._id)
      .populate('links', 'title tags');

    res.status(200).json(populated);
  } catch (error) {
    console.error('updateNote error:', error.message);
    res.status(500).json({ message: 'Failed to update note.' });
  }
};

// ── DELETE /api/notes/:id — Delete a note ───────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // User isolation
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Also remove this note's ID from any other notes' links arrays
    await Note.updateMany(
      { userId: req.user._id, links: note._id },
      { $pull: { links: note._id } }
    );

    res.status(200).json({ message: 'Note deleted.', _id: note._id });
  } catch (error) {
    console.error('deleteNote error:', error.message);
    res.status(500).json({ message: 'Failed to delete note.' });
  }
};

// ── GET /api/notes/:id/network — BFS note network graph ────────────────────
const getNoteNetwork = async (req, res) => {
  try {
    // Fetch ALL notes for this user (needed to build the graph)
    const allNotes = await Note.find({ userId: req.user._id })
      .select('_id title tags links');

    // Verify the root note exists
    const rootNote = allNotes.find((n) => n._id.toString() === req.params.id);
    if (!rootNote) {
      return res.status(404).json({ message: 'Root note not found.' });
    }

    // Build graph from notes and run BFS
    const graph = Graph.buildFromNotes(allNotes);
    const { visited, edges } = graph.bfs(req.params.id, 3); // 3 degrees of separation

    // Map visited IDs back to note data
    const noteMap = new Map(allNotes.map((n) => [n._id.toString(), n]));
    const nodes = visited
      .filter((id) => noteMap.has(id))
      .map((id) => {
        const n = noteMap.get(id);
        return {
          _id: n._id,
          id: n._id.toString(),
          title: n.title,
          tags: n.tags,
        };
      });

    res.status(200).json({
      root: { _id: rootNote._id, title: rootNote.title, tags: rootNote.tags },
      nodes,
      links: edges,
    });
  } catch (error) {
    console.error('getNoteNetwork error:', error.message);
    res.status(500).json({ message: 'Failed to fetch note network.' });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteNetwork,
};
