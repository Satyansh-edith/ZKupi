/**
 * Proof Verifier Utility
 * ======================
 * SnarkJS groth16 verification wrapper with mock-mode fallback.
 * Supports caching of the verification key to avoid repeated disk reads.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Optional SnarkJS ──────────────────────────────────────────────────────────
let snarkjs;
try {
  snarkjs = require('snarkjs');
} catch (_) {
  console.warn('[ProofVerifier] snarkjs not found — mock verification mode enabled.');
}

// ── Verification Key Cache ────────────────────────────────────────────────────

let _cachedVerificationKey = null;

const VKEY_PATH = process.env.VERIFICATION_KEY_PATH
  ? path.resolve(process.env.VERIFICATION_KEY_PATH)
  : path.resolve(__dirname, '../../circuits/verification_key.json');

// ── loadVerificationKey ───────────────────────────────────────────────────────

async function loadVerificationKey() {
  if (_cachedVerificationKey) return _cachedVerificationKey;

  if (!fs.existsSync(VKEY_PATH)) {
    throw new Error(
      `[ProofVerifier] Verification key not found at: ${VKEY_PATH}\n` +
      `Compile the Circom circuit to generate verification_key.json, ` +
      `or set VERIFICATION_KEY_PATH in your .env file.`
    );
  }

  try {
    const raw = fs.readFileSync(VKEY_PATH, 'utf8');
    _cachedVerificationKey = JSON.parse(raw);
    console.log('[ProofVerifier] Verification key loaded and cached.');
    return _cachedVerificationKey;
  } catch (err) {
    throw new Error(`[ProofVerifier] Failed to parse verification_key.json: ${err.message}`);
  }
}

// ── extractPublicSignals ──────────────────────────────────────────────────────

/**
 * Validates and extracts the public signals from a submitted proof payload.
 * Expected format: [amount, nullifier, commitment]
 *
 * @param {object} proofData         - Full payload { publicSignals: Array }
 * @returns {{ amount, nullifier, commitment, raw }}
 */
function extractPublicSignals(proofData) {
  if (!proofData || typeof proofData !== 'object') {
    throw new Error('[ProofVerifier] proofData must be an object.');
  }

  const { publicSignals } = proofData;

  if (!Array.isArray(publicSignals) || publicSignals.length < 3) {
    throw new Error(
      '[ProofVerifier] publicSignals must be an array with at least 3 elements: [amount, nullifier, commitment].'
    );
  }

  const [amount, nullifier, commitment] = publicSignals;

  if (!amount || !nullifier || !commitment) {
    throw new Error(
      `[ProofVerifier] One or more required public signals are empty: ` +
      `amount="${amount}", nullifier="${nullifier}", commitment="${commitment}".`
    );
  }

  return { amount, nullifier, commitment, raw: publicSignals };
}

// ── verifyZKProof ─────────────────────────────────────────────────────────────

/**
 * Verifies a groth16 ZK proof. In mock mode, accepts any structurally valid proof.
 * In real mode, delegates to snarkjs.groth16.verify using the loaded vkey.
 *
 * @param {object} proof         - Groth16 proof object (or simulated string)
 * @param {Array}  publicSignals - Array of public signal strings
 * @returns {Promise<boolean>}
 */
async function verifyZKProof(proof, publicSignals) {
  const useRealZK = process.env.USE_REAL_ZK_PROOFS === 'true';

  if (!useRealZK) {
    // Mock mode: sanity check only
    console.info('[ProofVerifier] Mock mode — proof accepted. Set USE_REAL_ZK_PROOFS=true for real verification.');
    return !!(proof && Array.isArray(publicSignals) && publicSignals.length >= 3);
  }

  // ── Real SnarkJS verification ─────────────────────────────────────────────
  if (!snarkjs) {
    throw new Error('[ProofVerifier] snarkjs is not installed. Run: npm install snarkjs');
  }

  let vkey;
  try {
    vkey = await loadVerificationKey();
  } catch (err) {
    console.error('[ProofVerifier] Could not load verification key:', err.message);
    return false;
  }

  try {
    const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    console.info(`[ProofVerifier] Groth16 verification → ${isValid ? '✓ VALID' : '✗ INVALID'}`);
    return isValid;
  } catch (err) {
    console.error('[ProofVerifier] snarkjs.groth16.verify threw an error:', err.message);
    return false;
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  verifyZKProof,
  loadVerificationKey,
  extractPublicSignals,
};
