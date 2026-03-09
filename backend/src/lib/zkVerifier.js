/**
 * ZK Verifier Library
 * ===================
 * Handles all Zero Knowledge proof logic:
 * - Commitment generation (ZK identity creation)
 * - Nullifier generation (double-spend prevention)
 * - Proof generation (simulated for hackathon, real SnarkJS when circuits ready)
 * - Proof verification (SnarkJS groth16 verification)
 */

const crypto  = require("crypto");
const { v4: uuidv4 } = require("uuid");

// Conditionally load snarkjs (not needed for simulated proofs)
let snarkjs;
try {
  snarkjs = require("snarkjs");
} catch (e) {
  console.warn("[ZK] snarkjs not available — using simulated proofs only.");
}

// ─── Core Crypto Helpers ─────────────────────────────────────────────────────

/**
 * Generates a ZK commitment from a secret.
 * This is the "ZK identity" — stored on chain/DB instead of the real secret.
 * @param {string} secret - The user's private secret (never stored)
 * @returns {string} SHA-256 hex commitment
 */
function generateCommitment(secret) {
  if (!secret || typeof secret !== "string") {
    throw new Error("Secret must be a non-empty string");
  }
  return crypto
    .createHash("sha256")
    .update(secret)
    .digest("hex");
}

/**
 * Generates a unique nullifier to prevent double-spending.
 * The nullifier is derived from the secret + payment details + a nonce,
 * so each payment has a unique nullifier that can be "spent" only once.
 *
 * @param {string} secret     - User's private secret
 * @param {string} merchantId - Merchant ID
 * @param {number} amount     - Payment amount
 * @param {string} nonce      - Unique nonce (UUID) to ensure uniqueness
 * @returns {string} SHA-256 nullifier hash
 */
function generateNullifier(secret, merchantId, amount, nonce = uuidv4()) {
  const raw = `${secret}:${merchantId}:${amount}:${nonce}`;
  const nullifier = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");
  return { nullifier, nonce };
}

/**
 * Generates a simulated ZK proof (for hackathon demo).
 * In production, this would call a real Circom circuit via SnarkJS.
 *
 * The "proof" here is a cryptographic hash that commits to:
 * - The user's identity (via commitment)
 * - The payment parameters (merchant + amount)
 * - The nullifier (for double-spend prevention)
 *
 * A verifier can re-compute this hash and confirm it matches,
 * without ever learning the user's secret.
 *
 * @param {string} secret     - User's private secret
 * @param {string} merchantId - Target merchant
 * @param {number} amount     - Payment amount
 * @param {string} nullifier  - Nullifier for this payment
 * @returns {{ proof: string, publicSignals: object }}
 */
function generateSimulatedProof(secret, merchantId, amount, nullifier) {
  const commitment = generateCommitment(secret);

  // The "proof" commits to all public and private inputs
  const proofData  = `${commitment}:${merchantId}:${amount}:${nullifier}`;
  const proof = crypto
    .createHash("sha256")
    .update(proofData)
    .digest("hex");

  // Public signals are what a verifier sees (no secret)
  const publicSignals = {
    commitment,
    merchantId,
    amount,
    nullifier,
    timestamp: Date.now(),
  };

  return { proof, publicSignals };
}

/**
 * Verifies a simulated ZK proof.
 * Recomputes the expected proof from the public signals and checks it matches.
 *
 * @param {string} proof         - The submitted proof
 * @param {object} publicSignals - The public payment parameters
 * @param {string} secret        - The secret (for simulation only; NOT used in real ZK)
 * @returns {boolean} Whether the proof is valid
 */
function verifySimulatedProof(proof, publicSignals, secret) {
  const { commitment, merchantId, amount, nullifier } = publicSignals;

  // Verify the commitment matches the secret
  const expectedCommitment = generateCommitment(secret);
  if (expectedCommitment !== commitment) return false;

  // Recompute the proof and check it matches
  const proofData = `${commitment}:${merchantId}:${amount}:${nullifier}`;
  const expectedProof = crypto
    .createHash("sha256")
    .update(proofData)
    .digest("hex");

  return expectedProof === proof;
}

/**
 * Verifies a REAL SnarkJS ZK proof (groth16).
 * Use this when you have compiled Circom circuits + verification key.
 *
 * @param {object} proof          - SnarkJS proof object
 * @param {Array}  publicSignals  - Public signals array  
 * @param {object} verificationKey - The circuit's verification key (vkey.json)
 * @returns {Promise<boolean>}
 */
async function verifyRealZKProof(proof, publicSignals, verificationKey) {
  if (!snarkjs) {
    throw new Error("snarkjs is not installed. Run: npm install snarkjs");
  }
  try {
    const isValid = await snarkjs.groth16.verify(
      verificationKey,
      publicSignals,
      proof
    );
    return isValid;
  } catch (err) {
    console.error("[ZK] Proof verification error:", err.message);
    return false;
  }
}

/**
 * Main verification function — routes to real or simulated based on env config.
 */
async function verifyZKProof(proof, publicSignals, options = {}) {
  const useReal = process.env.USE_REAL_ZK_PROOFS === "true";

  if (useReal && options.verificationKey) {
    return verifyRealZKProof(proof, publicSignals, options.verificationKey);
  } else {
    // Simulated: verify using the secret the client also submitted
    return verifySimulatedProof(proof, publicSignals, options.secret);
  }
}

module.exports = {
  generateCommitment,
  generateNullifier,
  generateSimulatedProof,
  verifySimulatedProof,
  verifyRealZKProof,
  verifyZKProof,
};
