/**
 * routes/tagRoutes.js
 * --------------------
 * Maps tag autocomplete endpoint to the search controller.
 * Protected by authMiddleware — tags are user-scoped.
 *
 * GET /api/tags/suggest?q=<prefix> → searchController.suggestTags
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { suggestTags } = require('../controllers/searchController');

router.use(authMiddleware);

router.get('/suggest', suggestTags);

module.exports = router;
