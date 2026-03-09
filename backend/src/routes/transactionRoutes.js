/**
 * Transaction Routes — /api/transactions
 * ======================================
 * Endpoints mapped to the transactionController for history, status, and proof.
 */

const express = require('express');
const router  = express.Router();

const { asyncHandler } = require('../utils/errorHandler');
const {
  getTransactionStatus,
  getUserTransactions,
  getTransactionProof,
} = require('../controllers/transactionController');

// ── Routing ───────────────────────────────────────────────────────────────────

/**
 * GET /api/transactions/status/:txId
 * Retrieve simple status of a specific payment.
 */
router.get('/status/:txId', asyncHandler(getTransactionStatus));

/**
 * GET /api/transactions/history/:userId
 * Retrieve full paginated/filtered transaction history for a user.
 * Supports query params: ?limit=50&offset=0&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.get('/history/:userId', asyncHandler(getUserTransactions));

/**
 * GET /api/transactions/:txId/proof
 * Retrieves the ZK proof commitment hash for audit/verification purposes.
 */
router.get('/:txId/proof', asyncHandler(getTransactionProof));

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = router;
