/**
 * Identity Routes  (/api/identity)
 * ----------------------------------
 * Register a ZK identity using its commitment hash and a public key.
 * No personal data is ever stored — only cryptographic identifiers.
 */

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { createIdentity, getIdentity, deleteIdentity } = require('../controllers/identityController');

// POST /api/identity/create  — register a new ZK identity
router.post('/create',        asyncHandler(createIdentity));

// GET  /api/identity/:userId  — retrieve a user's public key
router.get('/:userId',        asyncHandler(getIdentity));

// DELETE /api/identity/:userId  — remove an identity (no transactions must exist)
router.delete('/:userId',     asyncHandler(deleteIdentity));

module.exports = router;
