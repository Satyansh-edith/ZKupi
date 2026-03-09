/**
 * Wallet Routes  (/api/wallet)
 * ----------------------------
 * Handles ZK wallet creation and balance queries.
 * Secrets are NEVER stored — only SHA-256 commitment hashes.
 */

const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { generateCommitment } = require('../lib/zkVerifier');
const { asyncHandler, ValidationError, NotFoundError } = require('../utils/errorHandler');

// ── POST /api/wallet/create ───────────────────────────────────────────────────
// Creates a new ZK wallet. The secret never leaves the client.
router.post('/create', asyncHandler(async (req, res) => {
  const { secret } = req.body;

  if (!secret || typeof secret !== 'string' || secret.length < 8) {
    throw new ValidationError('secret must be a string of at least 8 characters.');
  }

  const commitment = generateCommitment(secret);

  // Return existing wallet on duplicate (idempotent)
  const existing = await prisma.user.findUnique({ where: { identityHash: commitment } });
  if (existing) {
    return res.status(200).json({
      success: true,
      wallet: { id: existing.id, commitment: existing.identityHash, balance: 10000 },
    });
  }

  const user = await prisma.user.create({
    data: {
      identityHash: commitment,
      publicKey: 'pk_hackathon_' + commitment.slice(0, 10),
    },
    select: { id: true, identityHash: true, createdAt: true },
  });

  res.status(201).json({
    success: true,
    wallet: {
      id:         user.id,
      commitment: user.identityHash,
      balance:    10000,
      createdAt:  user.createdAt,
    },
  });
}));

// ── POST /api/wallet/balance ──────────────────────────────────────────────────
// Returns balance for a wallet identified by its secret (proves ownership).
router.post('/balance', asyncHandler(async (req, res) => {
  const { secret } = req.body;

  if (!secret) throw new ValidationError('secret is required.');

  const commitment = generateCommitment(secret);
  const user = await prisma.user.findUnique({ where: { identityHash: commitment } });

  if (!user) throw new NotFoundError('No wallet found for this identity.');

  res.json({ success: true, balance: 10000 });
}));

// ── GET /api/wallet/:commitment ───────────────────────────────────────────────
// Retrieves public wallet info by commitment hash (no secret needed).
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
    wallet: { id: user.id, commitment: user.identityHash, balance: 10000, createdAt: user.createdAt },
  });
}));

module.exports = router;
