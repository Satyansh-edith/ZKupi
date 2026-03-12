/**
 * Transaction Routes  (/api/transactions)
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const {
  getTransactionStatus,
  getUserTransactions,
  getTransactionProof,
} = require('../controllers/transactionController');

router.get('/status/:txId',       asyncHandler(getTransactionStatus));
router.get('/history/:userId',    asyncHandler(getUserTransactions));
router.get('/:txId/proof',        asyncHandler(getTransactionProof));

module.exports = router;
