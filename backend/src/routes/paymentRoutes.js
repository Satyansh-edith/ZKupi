/**
 * Payment Routes — /api/payment
 * =============================
 * Payment execution and history endpoints.
 */

const express = require('express');
const router  = express.Router();

const { asyncHandler } = require('../utils/errorHandler');
const {
  submitPayment,
  getPaymentStatus,
  getUserHistory
} = require('../controllers/paymentController');

// ── Middleware ───────────────────────────────────────────────────────────────

/**
 * Placeholder for future authentication middleware (e.g., JWT).
 * Currently disabled for hackathon / ZK anonymous mode testing.
 */
const requireAuth = (req, res, next) => {
  // const token = req.headers.authorization;
  // if (!token) throw new AuthError('Missing authorization token');
  next();
};

/**
 * Basic Input Validation Middleware for Submit
 * Ensures the gross payload structure is present before hitting the controller.
 */
const validatePaymentPayload = (req, res, next) => {
  const { proof, publicSignals, amount, toAddress } = req.body;
  if (!proof || !publicSignals || !amount || !toAddress) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Missing essential payment payload fields (proof, signals, amount, toAddress).'
    });
  }
  next();
};

// ── Routing ───────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/submit
 * Main execution endpoint. Verifies proof and transfers funds.
 */
router.post('/submit', requireAuth, validatePaymentPayload, asyncHandler(submitPayment));

/**
 * GET /api/payment/status/:txId
 * Check the status of a specific transaction.
 */
router.get('/status/:txId', requireAuth, asyncHandler(getPaymentStatus));

/**
 * GET /api/payment/history/:userId
 * Get payment history for a specific anonymous user ID.
 */
router.get('/history/:userId', requireAuth, asyncHandler(getUserHistory));

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = router;
