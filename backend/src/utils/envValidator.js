/**
 * Environment Validator
 * =====================
 * Validates required environment variables at startup and provides
 * a typed config object with safe defaults. Call validateEnv() early
 * in your app entry point (e.g. src/index.js) before anything else.
 *
 * Usage:
 *   const { validateEnv, getConfig, config } = require('./utils/envValidator');
 *   validateEnv(); // throws if critical vars are missing
 *   const cfg = getConfig();
 */

// ── Variable Definitions ──────────────────────────────────────────────────────

/**
 * REQUIRED: These MUST be present in .env or process.env.
 * If any are missing, validateEnv() will throw and the server won't start.
 */
const REQUIRED_VARS = [
  { key: 'PORT',               description: 'HTTP port the Express server listens on' },
  { key: 'DATABASE_URL',       description: 'Prisma database connection string (e.g. file:./dev.db)' },
  { key: 'NODE_ENV',           description: 'Runtime environment (development | production | test)' },
];

/**
 * OPTIONAL: These have safe defaults.
 * The validator warns (but does NOT throw) if they are missing.
 */
const OPTIONAL_VARS = [
  { key: 'JWT_SECRET',          description: 'Secret key for signing JWTs',                    default: null },
  { key: 'FRONTEND_URL',        description: 'Allowed CORS origin (frontend URL)',               default: 'http://localhost:3000' },
  { key: 'PAYMENT_ENGINE_URL',  description: "Sahil's payment engine base URL",                 default: null },
  { key: 'USE_REAL_ZK_PROOFS',  description: 'Enable real SnarkJS proofs (true/false)',         default: 'false' },
  { key: 'VERIFICATION_KEY_PATH', description: 'Path to the ZK circuit verification_key.json', default: null },
];

// ── validateEnv ───────────────────────────────────────────────────────────────

/**
 * Checks that all required environment variables are present.
 * Warns about missing optional variables.
 * Throws a descriptive error if any required variable is absent.
 */
function validateEnv() {
  const missing = [];

  // Check required vars
  for (const { key, description } of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(`  - ${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[EnvValidator] Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Copy backend/.env.example to backend/.env and fill in the values.`
    );
  }

  // Warn about missing optional vars (no throw)
  for (const { key, description, default: def } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      if (def !== null) {
        console.warn(`[EnvValidator] Optional var ${key} not set — using default: "${def}"`);
      } else {
        console.warn(`[EnvValidator] Optional var ${key} not set (${description}). Some features may be disabled.`);
      }
    }
  }

  // Extra safety checks
  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(
      `[EnvValidator] NODE_ENV="${process.env.NODE_ENV}" is invalid. Must be one of: ${validNodeEnvs.join(', ')}`
    );
  }

  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`[EnvValidator] PORT="${process.env.PORT}" is not a valid port number (1–65535).`);
  }

  console.log('[EnvValidator] ✓ All environment variables validated successfully.');
}

// ── getConfig ─────────────────────────────────────────────────────────────────

/**
 * Returns a clean, validated config object derived from process.env.
 * Always call validateEnv() before this to ensure required vars exist.
 *
 * @returns {object} Application configuration
 */
function getConfig() {
  return {
    // Server
    port:            parseInt(process.env.PORT, 10),
    nodeEnv:         process.env.NODE_ENV,
    isProduction:    process.env.NODE_ENV === 'production',
    isDevelopment:   process.env.NODE_ENV === 'development',

    // Database
    databaseUrl:     process.env.DATABASE_URL,

    // CORS / Frontend
    frontendUrl:     process.env.FRONTEND_URL || 'http://localhost:3000',

    // Auth
    jwtSecret:       process.env.JWT_SECRET || null,

    // External Services
    paymentEngineUrl: process.env.PAYMENT_ENGINE_URL || null, // Sahil's service URL

    // ZK Proof settings
    useRealZkProofs:      process.env.USE_REAL_ZK_PROOFS === 'true',
    verificationKeyPath:  process.env.VERIFICATION_KEY_PATH || null,
  };
}

// ── Singleton: validated config object ────────────────────────────────────────
// Exported for convenience so routes can import `config` directly.
// NOTE: This is eagerly computed — make sure dotenv is loaded before importing
// this module (e.g. require('dotenv').config() at the very top of src/index.js).

let config = null;

/**
 * Returns the singleton config. Validates env on first call.
 * Subsequent calls return the cached config without re-validating.
 */
function getOrBuildConfig() {
  if (!config) {
    validateEnv();
    config = getConfig();
  }
  return config;
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  validateEnv,
  getConfig,
  get config() {
    return getOrBuildConfig();
  },
};
