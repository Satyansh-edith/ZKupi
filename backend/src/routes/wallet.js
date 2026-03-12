/**
 * Wallet Routes  (/api/wallet)
 * ----------------------------
 * ZK wallet creation and balance queries.
 * Secrets NEVER stored — only SHA-256 commitment hashes.
 */

'use strict';

const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { generateCommitment } = require('../lib/zkVerifier');
const { asyncHandler, ValidationError, NotFoundError } = require('../utils/errorHandler');

// ── POST /api/wallet/create ───────────────────────────────────────────────────
router.post('/create', asyncHandler(async (req, res) => {
  const { secret } = req.body;

  if (!secret || typeof secret !== 'string' || secret.length < 8) {
    throw new ValidationError('secret must be a string of at least 8 characters.');
  }

  const commitment = generateCommitment(secret);

  // Idempotent — return existing wallet if commitment already registered
  const existing = await prisma.user.findUnique({ where: { identityHash: commitment } });
  if (existing) {
    return res.status(200).json({
      success: true,
      wallet:  { id: existing.id, commitment: existing.identityHash, balance: 10000 },
    });
  }

  const user = await prisma.user.create({
    data: {
      identityHash: commitment,
      publicKey:    'pk_' + commitment.slice(0, 12),
    },
    select: { id: true, identityHash: true, createdAt: true },
  });

  res.status(201).json({
    success: true,
    wallet:  {
      id:         user.id,
      commitment: user.identityHash,
      balance:    10000,
      createdAt:  user.createdAt,
    },
  });
}));

// ── POST /api/wallet/balance ──────────────────────────────────────────────────
router.post('/balance', asyncHandler(async (req, res) => {
  const { secret } = req.body;

  if (!secret) throw new ValidationError('secret is required.');

  const commitment = generateCommitment(secret);
  const user = await prisma.user.findUnique({ where: { identityHash: commitment } });

  if (!user) throw new NotFoundError('No wallet found for this identity.');

  res.json({ success: true, balance: 10000, userId: user.id });
}));

// ── GET /api/wallet/:commitment ───────────────────────────────────────────────
router.get('/:commitment', asyncHandler(async (req, res) => {
  const { commitment } = req.params;

  if (!commitment || commitment.length !== 64) {
    throw new ValidationError('commitment must be a 64-character hex string.');
  }

  const user = await prisma.user.findUnique({
    where:  { identityHash: commitment },
    select: { id: true, identityHash: true, createdAt: true },
  });

  if (!user) throw new NotFoundError('Wallet not found.');

  res.json({
    success: true,
    wallet:  { id: user.id, commitment: user.identityHash, balance: 10000, createdAt: user.createdAt },
  });
}));

// ── POST /api/wallet/dashboard ────────────────────────────────────────────────
router.post('/dashboard', asyncHandler(async (req, res) => {
  const { secret } = req.body;

  if (!secret) throw new ValidationError('secret is required.');

  const commitment = generateCommitment(secret);
  const user = await prisma.user.findUnique({ 
    where: { identityHash: commitment },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { merchant: true }
      }
    }
  });

  if (!user) throw new NotFoundError('No wallet found for this identity.');

  const totalOutflow = user.transactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const balance = 10000 - totalOutflow;

  res.json({ 
    success: true, 
    wallet: {
      id: user.id,
      commitment: user.identityHash,
      balance,
      createdAt: user.createdAt,
      recentTransactions: user.transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        merchantName: tx.merchant ? tx.merchant.name : 'Unknown Merchant'
      }))
    }
  });
}));

module.exports = router;
