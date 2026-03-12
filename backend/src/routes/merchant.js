/**
 * Merchant Routes  (/api/merchant)
 * ---------------------------------
 * Register and look up merchants in the ZK-UPI network.
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { createMerchant, getMerchant, listMerchants, getMerchantDashboard } = require('../controllers/merchantController');

router.post('/create', asyncHandler(createMerchant));
router.get('/', asyncHandler(listMerchants));
router.get('/:merchantId', asyncHandler(getMerchant));
router.get('/:merchantId/dashboard', asyncHandler(getMerchantDashboard));

module.exports = router;
