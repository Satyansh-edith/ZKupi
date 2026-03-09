/**
 * Transaction Routes  (/api/transactions)
 * -----------------------------------------
 * Query transaction status, history, and associated ZK proof hashes.
 * Privacy-first: no raw identities are returned in responses.
 */

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { getTransactionStatus, getUserTransactions, getTransactionProof } = require('../controllers/transactionController');

// GET /api/transactions/status/:txId          — simple status of one payment
router.get('/status/:txId',         asyncHandler(getTransactionStatus));

// GET /api/transactions/history/:userId       — paginated payment history
// Query params: ?limit=50&offset=0&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/history/:userId',      asyncHandler(getUserTransactions));

// GET /api/transactions/:txId/proof           — ZK proof hash for auditing
router.get('/:txId/proof',          asyncHandler(getTransactionProof));

module.exports = router;
