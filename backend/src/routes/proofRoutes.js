/**
 * Proof Routes  (/api/verify)
 * ---------------------------
 * Endpoints for generating and verifying ZK proofs.
 * The generate endpoint is a convenience helper for demo/hackathon use.
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { asyncHandler, ValidationError } = require('../utils/errorHandler');
const { generateCommitment, generateNullifier, generateSimulatedProof } = require('../lib/zkVerifier');
const { verifyZKProof, extractPublicSignals } = require('../utils/proofVerifier');

// ── POST /api/verify/generate ─────────────────────────────────────────────────
// Generates a simulated ZK proof for demo purposes
router.post('/generate', asyncHandler(async (req, res) => {
  const { secret, merchantId, amount } = req.body;

  if (!secret || !merchantId || amount === undefined) {
    throw new ValidationError('secret, merchantId, and amount are required.');
  }
  if (typeof amount !== 'number' || amount <= 0) {
    throw new ValidationError('amount must be a positive number.');
  }

  const commitment          = generateCommitment(secret);
  const { nullifier, nonce } = generateNullifier(secret, merchantId, amount);
  const { proof, publicSignals } = generateSimulatedProof(secret, merchantId, amount, nullifier);

  res.json({
    success: true,
    proof,
    publicSignals,
    nullifier,
    commitment,
    nonce,
    note: 'Simulated proof — for demo/hackathon use only.',
  });
}));

// ── POST /api/verify/verify ───────────────────────────────────────────────────
// Verifies a submitted ZK proof
router.post('/verify', asyncHandler(async (req, res) => {
  const { proof, publicSignals } = req.body;

  if (!proof || !publicSignals) {
    throw new ValidationError('proof and publicSignals are required.');
  }

  const signals = Array.isArray(publicSignals)
    ? publicSignals
    : Object.values(publicSignals);

  const isValid = await verifyZKProof(proof, signals);

  res.json({
    success:  true,
    valid:    isValid,
    message:  isValid ? '✓ Proof is valid.' : '✗ Proof is invalid.',
  });
}));

module.exports = router;
