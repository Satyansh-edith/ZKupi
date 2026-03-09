/**
 * Proof Routes — /api/verify
 * ===========================
 * Endpoints mapped to the proofController for validating ZK proofs.
 */

const express = require('express');
const router  = express.Router();

const { asyncHandler } = require('../utils/errorHandler');
const {
  verifySingleProof,
  verifyBatchProofs,
  getVerificationKey,
} = require('../controllers/proofController');

// ── Rate Limiting (Placeholder for Production) ────────────────────────────────
// Real SNARK verification is CPU intensive. In a real app, use express-rate-limit:
// const rateLimit = require('express-rate-limit');
// const verifyLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20 });
const verifyLimiter = (req, res, next) => next();

// ── Routing ───────────────────────────────────────────────────────────────────

/**
 * POST /api/verify/proof
 * Validates a single proof against the public signals.
 */
router.post('/proof', verifyLimiter, asyncHandler(verifySingleProof));

/**
 * POST /api/verify/batch
 * Validates an array of proofs concurrently. Max 50 per request.
 */
router.post('/batch', verifyLimiter, asyncHandler(verifyBatchProofs));

/**
 * GET /api/verify/key
 * Returns the public cryptographic curve parameters used by the loaded verification key.
 */
router.get('/key', asyncHandler(getVerificationKey));

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = router;
