/**
 * Environment Validator
 * =====================
 * Validates required env vars at startup and provides a typed config object.
 */

'use strict';

const REQUIRED_VARS = [
  { key: 'PORT',         description: 'HTTP port the Express server listens on' },
  { key: 'DATABASE_URL', description: 'Prisma DB connection string (e.g. file:./dev.db)' },
  { key: 'NODE_ENV',     description: 'Runtime environment (development | production | test)' },
];

const OPTIONAL_VARS = [
  { key: 'JWT_SECRET',             description: 'Secret key for signing JWTs',                   default: null },
  { key: 'FRONTEND_URL',           description: 'Allowed CORS origin',                            default: 'http://localhost:3000' },
  { key: 'PAYMENT_ENGINE_URL',     description: 'External payment engine base URL',               default: null },
  { key: 'USE_REAL_ZK_PROOFS',     description: 'Enable real SnarkJS proofs (true/false)',        default: 'false' },
  { key: 'VERIFICATION_KEY_PATH',  description: 'Path to ZK circuit verification_key.json',      default: null },
];

// ── validateEnv ───────────────────────────────────────────────────────────────

function validateEnv() {
  const missing = [];

  for (const { key, description } of REQUIRED_VARS) {
    if (!process.env[key]) missing.push(`  - ${key}: ${description}`);
  }

  if (missing.length > 0) {
    throw new Error(
      `[EnvValidator] Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Copy backend/.env.example to backend/.env and fill in the values.`
    );
  }

  for (const { key, description, default: def } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      if (def !== null) {
        console.warn(`[EnvValidator] Optional ${key} not set — using default: "${def}"`);
      } else {
        console.warn(`[EnvValidator] Optional ${key} not set (${description}). Some features disabled.`);
      }
    }
  }

  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(`[EnvValidator] NODE_ENV="${process.env.NODE_ENV}" invalid. Use: ${validNodeEnvs.join(', ')}`);
  }

  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`[EnvValidator] PORT="${process.env.PORT}" is not a valid port number.`);
  }

  console.log('[EnvValidator] ✓ All environment variables validated successfully.');
}

// ── getConfig ─────────────────────────────────────────────────────────────────

function getConfig() {
  return {
    port:                parseInt(process.env.PORT, 10),
    nodeEnv:             process.env.NODE_ENV,
    isProduction:        process.env.NODE_ENV === 'production',
    isDevelopment:       process.env.NODE_ENV === 'development',
    databaseUrl:         process.env.DATABASE_URL,
    frontendUrl:         process.env.FRONTEND_URL || 'http://localhost:3000',
    jwtSecret:           process.env.JWT_SECRET || null,
    paymentEngineUrl:    process.env.PAYMENT_ENGINE_URL || null,
    useRealZkProofs:     process.env.USE_REAL_ZK_PROOFS === 'true',
    verificationKeyPath: process.env.VERIFICATION_KEY_PATH || null,
  };
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _config = null;

module.exports = {
  validateEnv,
  getConfig,
  get config() {
    if (!_config) {
      validateEnv();
      _config = getConfig();
    }
    return _config;
  },
};
