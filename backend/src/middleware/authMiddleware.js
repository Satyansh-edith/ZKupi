/**
 * Authentication Middleware
 * =========================
 * Custom authentication for ZK-UPI that expects a cryptographic signature
 * rather than a standard Bearer JWT.
 * 
 * Flow:
 * 1. Client sends x-user-id and x-signature in headers
 * 2. Middleware fetches the public key for the given userId from the DB
 * 3. Middleware verifies the signature against the request payload/timestamp
 * 4. If valid, req.userId is set and the request proceeds
 */

const prisma = require('../lib/prisma');
const { AuthError } = require('../utils/errorHandler');

/**
 * Helper: Verify Cryptographic Signature
 * (Placeholder implementation)
 * 
 * In a real production system, the client would sign a deterministic string
 * (e.g., `timestamp + path + bodyHash`) using their private key. We verify
 * it here using their registered public key.
 * 
 * @param {string} message   - The raw message that was signed
 * @param {string} signature - The signature provided by the client
 * @param {string} publicKey - The user's public key from the database
 * @returns {boolean}        - True if valid, false otherwise
 */
const verifySignature = (message, signature, publicKey) => {
  // TODO: Replace with real ed25519 or secp256k1 verification logic
  // e.g., using 'crypto' or 'tweetnacl'
  // 
  // For the hackathon/placeholder, we assume it's valid if all three exist
  // and the signature isn't explicitly "invalid".
  if (!signature || !publicKey) return false;
  if (signature === 'invalid') return false;

  console.log(`[Auth] Simulated signature verification for key ${publicKey.substring(0, 16)}...`);
  return true;
};

/**
 * 1. Strict Authentication Middleware
 * Enforces that a valid signature and userId are present.
 * Use this for endpoints that require proof of account ownership (e.g., submitting payments).
 */
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const signature = req.headers['x-signature'];
    // The timestamp prevents replay attacks
    const timestamp = req.headers['x-timestamp'];

    // ── 1. Check for missing headers ──────────────────────────────────────────
    if (!userId || !signature || !timestamp) {
      throw new AuthError('Missing authentication headers (x-user-id, x-signature, x-timestamp)');
    }

    // Optional: Check if the timestamp is too old (e.g., > 5 minutes)
    const requestTime = parseInt(timestamp, 10);
    const timeDiffMs = Date.now() - requestTime;
    if (timeDiffMs > 5 * 60 * 1000) {
      throw new AuthError('Request signature expired (timestamp too old)');
    }

    // ── 2. Fetch User's Public Key ─────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { publicKey: true }
    });

    if (!user) {
      throw new AuthError('User not found or unregistered identity');
    }

    // ── 3. Verify Signature ───────────────────────────────────────────────────
    // The 'message' is usually the path + timestamp + stringified body
    const messageToVerify = `${req.originalUrl}:${timestamp}:${JSON.stringify(req.body || {})}`;
    
    const isValid = verifySignature(messageToVerify, signature, user.publicKey);

    if (!isValid) {
      throw new AuthError('Invalid cryptographic signature');
    }

    // ── 4. Attach & Proceed ───────────────────────────────────────────────────
    req.userId = userId;
    next();
  } catch (error) {
    // If it's an AuthError, let the global handler catch it cleanly
    if (error instanceof AuthError) {
      next(error);
    } else {
      next(new AuthError(`Authentication failed: ${error.message}`));
    }
  }
};

/**
 * 2. Optional Authentication Middleware
 * Tries to authenticate the user if headers are provided.
 * If authentication fails or headers are missing, it simply moves on without setting req.userId.
 * Useful for public endpoints that might return different data if the user is logged in.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    // If headers are missing, just proceed blisfully unaware
    if (!userId || !signature || !timestamp) {
      return next();
    }

    // Try to fetch public key
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { publicKey: true }
    });

    if (user) {
      // Try to verify signature
      const messageToVerify = `${req.originalUrl}:${timestamp}:${JSON.stringify(req.body || {})}`;
      const isValid = verifySignature(messageToVerify, signature, user.publicKey);
      
      if (isValid) {
        req.userId = userId;
      }
    }
    
    // Proceed regardless of success or failure
    next();
  } catch (error) {
    // Suppress errors and proceed as unauthenticated
    console.warn('[OptionalAuth] Soft failure:', error.message);
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
  verifySignature
};
