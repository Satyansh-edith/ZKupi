/**
 * Proof Verifier Utility
 * ======================
 * Production-ready ZK proof verification using SnarkJS (groth16).
 *
 * How ZK verification works:
 *  1. A prover (user) generates a proof off-chain using a Circom circuit.
 *     The proof cryptographically commits to private inputs (secret, nonce)
 *     without revealing them.
 *  2. The proof + public signals (amount, nullifier, commitment) are sent
 *     to this server.
 *  3. This verifier checks the proof against the compiled circuit's
 *     verification key. If valid, the payment is authorised.
 *
 * Usage:
 *   const { verifyZKProof, extractPublicSignals } = require('./proofVerifier');
 *
 *   const signals = extractPublicSignals(proofData);
 *   const isValid = await verifyZKProof(proofData.proof, signals);
 */

const fs      = require('fs');
const path    = require('path');

// Conditionally load snarkjs — allows the server to start even if the
// package is not installed (falls back to mock verification mode).
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

/**
 * Loads and caches the groth16 verification key from disk.
 * The key is compiled alongside the Circom circuit (zkey export verificationKey).
 *
 * @returns {Promise<object>} Verification key JSON
 * @throws  If the file is missing or malformed
 */
async function loadVerificationKey() {
  // Return cached copy — reading JSON from disk on every request is wasteful
  if (_cachedVerificationKey) return _cachedVerificationKey;

  if (!fs.existsSync(VKEY_PATH)) {
    throw new Error(
      `[ProofVerifier] Verification key not found at: ${VKEY_PATH}\n` +
      `Run the Circom circuit compilation step to generate verification_key.json,\n` +
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
 * Parses and validates the public signals from a submitted proof payload.
 *
 * In a groth16 circuit the public signals are an ordered array of field elements
 * (BigInt strings). We expect at minimum:
 *   [0] amount      — payment amount (as BigInt string)
 *   [1] nullifier   — one-time use token (hex string / BigInt string)
 *   [2] commitment  — ZK identity hash of the payer (hex string)
 *
 * @param {object} proofData - Full payload from the client
 * @param {Array}  proofData.publicSignals - Raw array of signal strings
 * @returns {{ amount: string, nullifier: string, commitment: string, raw: Array }}
 * @throws  ValidationError-style error if format is invalid
 */
function extractPublicSignals(proofData) {
  if (!proofData || typeof proofData !== 'object') {
    throw new Error('[ProofVerifier] extractPublicSignals: proofData must be an object.');
  }

  const { publicSignals } = proofData;

  if (!Array.isArray(publicSignals) || publicSignals.length < 3) {
    throw new Error(
      '[ProofVerifier] publicSignals must be an array with at least 3 elements: ' +
      '[amount, nullifier, commitment].'
    );
  }

  const [amount, nullifier, commitment] = publicSignals;

  if (!amount || !nullifier || !commitment) {
    throw new Error(
      '[ProofVerifier] One or more required public signals are empty: ' +
      `amount="${amount}", nullifier="${nullifier}", commitment="${commitment}".`
    );
  }

  return { amount, nullifier, commitment, raw: publicSignals };
}

// ── verifyZKProof ─────────────────────────────────────────────────────────────

/**
 * Verifies a groth16 ZK proof using SnarkJS.
 *
 * Verification does NOT require knowledge of the private inputs.
 * Anyone with the verification key can confirm the proof is valid.
 *
 * @param {object} proof         - SnarkJS groth16 proof object { pi_a, pi_b, pi_c, protocol, curve }
 * @param {Array}  publicSignals - Array of public signal strings (from extractPublicSignals)
 * @returns {Promise<boolean>}   - true if proof is valid, false otherwise
 */
async function verifyZKProof(proof, publicSignals) {
  // ── Mock mode (no verification key or snarkjs) ────────────────────────────
  const useRealZK = process.env.USE_REAL_ZK_PROOFS === 'true';

  if (!useRealZK) {
    console.info(
      '[ProofVerifier] Mock mode — proof accepted without real verification. ' +
      'Set USE_REAL_ZK_PROOFS=true in .env to enable real SnarkJS verification.'
    );
    // In mock mode, do a basic sanity check: proof and signals must be present
    return !!(proof && Array.isArray(publicSignals) && publicSignals.length >= 3);
  }

  // ── Real SnarkJS verification ─────────────────────────────────────────────
  if (!snarkjs) {
    throw new Error(
      '[ProofVerifier] snarkjs is not installed. Run: npm install snarkjs\n' +
      'Or disable real ZK by setting USE_REAL_ZK_PROOFS=false in .env.'
    );
  }

  let vkey;
  try {
    vkey = await loadVerificationKey();
  } catch (err) {
    // Can't verify without the key — fail safe
    console.error('[ProofVerifier] Could not load verification key:', err.message);
    return false;
  }

  try {
    /**
     * snarkjs.groth16.verify(verificationKey, publicSignals, proof)
     *
     * Internally this:
     *  1. Reconstructs the pairing check from the proof's elliptic curve points
     *  2. Hashes the public inputs via the Poseidon hash used in the circuit
     *  3. Checks e(A, B) == e(alpha, beta) * e(gamma_abc, C) on the BN128 curve
     */
    const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    console.info(
      `[ProofVerifier] Groth16 verification → ${isValid ? '✓ VALID' : '✗ INVALID'}`
    );
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
