/**
 * Payment Routes  (/api/payment)
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { submitPayment, getPaymentStatus, getUserHistory } = require('../controllers/paymentController');

router.post('/submit',           asyncHandler(submitPayment));
router.get('/status/:txId',      asyncHandler(getPaymentStatus));
router.get('/history/:userId',   asyncHandler(getUserHistory));

module.exports = router;
