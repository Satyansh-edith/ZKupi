/**
 * Merchant Routes  (/api/merchant)
 * ---------------------------------
 * Register and look up merchants in the ZK-UPI network.
 *
 * NOTE: Uses an in-memory store (Map) for the hackathon demo.
 * In production, replace with a Prisma Merchant model and database table.
 */

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, ValidationError, NotFoundError } = require('../utils/errorHandler');

// In-memory merchant store (survives restarts via process memory only)
const merchantStore = new Map();

// ── POST /api/merchant/create ─────────────────────────────────────────────────
router.post('/create', asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    throw new ValidationError('name is required.');
  }

  const merchantId = 'merchant_' + uuidv4().split('-')[0];
  const merchant   = { merchantId, name, createdAt: new Date().toISOString() };

  merchantStore.set(merchantId, merchant);

  res.status(201).json({ success: true, merchant });
}));

// ── GET /api/merchant/:merchantId ─────────────────────────────────────────────
router.get('/:merchantId', asyncHandler(async (req, res) => {
  const { merchantId } = req.params;
  const merchant = merchantStore.get(merchantId);

  if (!merchant) throw new NotFoundError(`Merchant '${merchantId}' not found.`);

  res.json({ success: true, merchant });
}));

module.exports = router;
