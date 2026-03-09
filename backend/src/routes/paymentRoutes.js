/**
 * Payment Routes  (/api/payment)
 * --------------------------------
 * Submit a ZK payment, check its status, or view a user's payment history.
 */

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { submitPayment, getPaymentStatus, getUserHistory } = require('../controllers/paymentController');

// Validates the gross shape of the payment payload before hitting the controller
const validatePayload = (req, res, next) => {
  const { proof, publicSignals, amount, toAddress } = req.body;
  if (!proof || !publicSignals || !amount || !toAddress) {
    return res.status(400).json({
      success: false,
      error:   'ValidationError',
      message: 'Required: proof, publicSignals, amount, toAddress.',
    });
  }
  next();
};

// POST /api/payment/submit  — main ZK payment execution
router.post('/submit',        validatePayload, asyncHandler(submitPayment));

// GET  /api/payment/status/:txId  — check a single transaction
router.get('/status/:txId',   asyncHandler(getPaymentStatus));

// GET  /api/payment/history/:userId  — full payment history for a user
router.get('/history/:userId', asyncHandler(getUserHistory));

module.exports = router;
