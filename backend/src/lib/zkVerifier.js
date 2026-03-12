/**
 * ZK Verifier Library
 * ===================
 * Handles all Zero Knowledge proof logic:
 *   - Commitment generation  (ZK identity creation)
 *   - Nullifier generation   (double-spend prevention)
 *   - Simulated proof gen/verify  (hackathon mode)
 *   - Real SnarkJS groth16 verify (production mode)
 */

'use strict';

const crypto      = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ── Optional SnarkJS ──────────────────────────────────────────────────────────
let snarkjs;
try {
  snarkjs = require('snarkjs');
} catch (_) {
  console.warn('[ZK] snarkjs not available — simulated proof mode active.');
}

// ── generateCommitment ────────────────────────────────────────────────────────

/**
 * Generates a SHA-256 ZK commitment from a user secret.
 * This is stored in DB instead of the real secret.
 *
 * @param {string} secret - The user's private secret (never stored)
 * @returns {string} 64-character hex commitment
 */
function generateCommitment(secret) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('Secret must be a non-empty string.');
  }
  return crypto.createHash('sha256').update(secret).digest('hex');
}

// ── generateNullifier ─────────────────────────────────────────────────────────

/**
 * Generates a unique nullifier to prevent double-spending.
 * Derived from secret + merchantId + amount + nonce so each payment
 * has a unique one-time token.
 *
 * @param {string} secret     - User's private secret
 * @param {string} merchantId - Target merchant identifier
 * @param {number} amount     - Payment amount (in paise)
 * @param {string} [nonce]    - UUID nonce (generated if omitted)
 * @returns {{ nullifier: string, nonce: string }}
 */
function generateNullifier(secret, merchantId, amount, nonce = uuidv4()) {
  const raw = `${secret}:${merchantId}:${amount}:${nonce}`;
  const nullifier = crypto.createHash('sha256').update(raw).digest('hex');
  return { nullifier, nonce };
}

// ── generateSimulatedProof ────────────────────────────────────────────────────

/**
 * Generates a simulated ZK proof for hackathon/demo mode.
 * In production, this would call a real Circom circuit via SnarkJS.
 *
 * @param {string} secret     - User secret
 * @param {string} merchantId - Target merchant
 * @param {number} amount     - Payment amount
 * @param {string} nullifier  - One-time nullifier
 * @returns {{ proof: string, publicSignals: object }}
 */
function generateSimulatedProof(secret, merchantId, amount, nullifier) {
  const commitment = generateCommitment(secret);
  const proofData  = `${commitment}:${merchantId}:${amount}:${nullifier}`;
  const proof      = crypto.createHash('sha256').update(proofData).digest('hex');

  const publicSignals = {
    commitment,
    merchantId,
    amount,
    nullifier,
    timestamp: Date.now(),
  };

  return { proof, publicSignals };
}

// ── verifySimulatedProof ──────────────────────────────────────────────────────

/**
 * Verifies a simulated ZK proof by recomputing the expected proof.
 *
 * @param {string} proof         - Submitted proof hash
 * @param {object} publicSignals - Public payment parameters
 * @param {string} secret        - User secret (simulation only — NOT used in real ZK)
 * @returns {boolean}
 */
function verifySimulatedProof(proof, publicSignals, secret) {
  const { commitment, merchantId, amount, nullifier } = publicSignals;

  const expectedCommitment = generateCommitment(secret);
  if (expectedCommitment !== commitment) return false;

  const proofData    = `${commitment}:${merchantId}:${amount}:${nullifier}`;
  const expectedProof = crypto.createHash('sha256').update(proofData).digest('hex');

  return expectedProof === proof;
}

// ── verifyRealZKProof ─────────────────────────────────────────────────────────

/**
 * Verifies a real SnarkJS groth16 proof.
 *
 * @param {object} proof           - SnarkJS proof object { pi_a, pi_b, pi_c, ... }
 * @param {Array}  publicSignals   - Public signals array
 * @param {object} verificationKey - vkey.json from compiled circuit
 * @returns {Promise<boolean>}
 */
async function verifyRealZKProof(proof, publicSignals, verificationKey) {
  if (!snarkjs) throw new Error('[ZK] snarkjs is not installed. Run: npm install snarkjs');
  try {
    return await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
  } catch (err) {
    console.error('[ZK] Proof verification error:', err.message);
    return false;
  }
}

// ── verifyZKProof (main export) ───────────────────────────────────────────────

/**
 * Routes to real or simulated verification based on env config.
 *
 * @param {*}      proof         - Proof (object for real, string for simulated)
 * @param {*}      publicSignals - Signals (array for real, object for simulated)
 * @param {object} [options]     - { verificationKey?, secret? }
 * @returns {Promise<boolean>}
 */
async function verifyZKProof(proof, publicSignals, options = {}) {
  const useReal = process.env.USE_REAL_ZK_PROOFS === 'true';

  if (useReal && options.verificationKey) {
    return verifyRealZKProof(proof, publicSignals, options.verificationKey);
  }
  return verifySimulatedProof(proof, publicSignals, options.secret);
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  generateCommitment,
  generateNullifier,
  generateSimulatedProof,
  verifySimulatedProof,
  verifyRealZKProof,
  verifyZKProof,
};
