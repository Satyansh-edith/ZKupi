/**
 * Identity Routes — /api/identity
 * ===============================
 * Routes connecting to the identityController.
 */

const express = require('express');
const router  = express.Router();

// Import the async wrapper to eliminate try/catch blocks
const { asyncHandler } = require('../utils/errorHandler');

// Import controller functions
const {
  createIdentity,
  getIdentity,
  deleteIdentity,
} = require('../controllers/identityController');

// ── Routing ───────────────────────────────────────────────────────────────────

/**
 * POST /api/identity/create
 * Creates a new anonymous user identity.
 * Expects: { identityHash: string, publicKey: string }
 */
router.post('/create', asyncHandler(createIdentity));

/**
 * GET /api/identity/:userId
 * Retrieves the public key for a given user ID.
 */
router.get('/:userId', asyncHandler(getIdentity));

/**
 * DELETE /api/identity/:userId
 * Deletes a user identity permanently.
 */
router.delete('/:userId', asyncHandler(deleteIdentity));

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = router;
