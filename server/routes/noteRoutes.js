/**
 * routes/noteRoutes.js
 * ---------------------
 * Maps note CRUD and network endpoints to controller functions.
 * ALL routes are protected by authMiddleware (JWT required).
 *
 * POST   /api/notes            → createNote
 * GET    /api/notes             → getNotes
 * GET    /api/notes/:id         → getNoteById
 * PUT    /api/notes/:id         → updateNote
 * DELETE /api/notes/:id         → deleteNote
 * GET    /api/notes/:id/network → getNoteNetwork (BFS graph)
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteNetwork,
} = require('../controllers/noteController');

// All note routes require authentication
router.use(authMiddleware);

router.post('/',           createNote);
router.get('/',            getNotes);
router.get('/:id',         getNoteById);
router.put('/:id',         updateNote);
router.delete('/:id',      deleteNote);
router.get('/:id/network', getNoteNetwork);

module.exports = router;
