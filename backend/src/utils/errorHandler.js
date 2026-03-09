/**
 * Centralized Error Handler
 * =========================
 * Provides custom error classes, an Express error-handling middleware,
 * and an asyncHandler wrapper to eliminate try/catch boilerplate in routes.
 *
 * Usage in routes:
 *   const { asyncHandler, ValidationError, NotFoundError } = require('../utils/errorHandler');
 *
 *   router.post('/create', asyncHandler(async (req, res) => {
 *     if (!req.body.secret) throw new ValidationError('secret is required');
 *     ...
 *   }));
 *
 * Mount the middleware LAST in src/index.js:
 *   const { handleError } = require('./utils/errorHandler');
 *   app.use(handleError);
 */

const isDev = process.env.NODE_ENV !== 'production';

// ── Custom Error Classes ──────────────────────────────────────────────────────

/** Base class — all custom errors extend this */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from unexpected programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Request body / parameter validation failed */
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

/** 401 — Unauthenticated / invalid credentials */
class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** 404 — Resource not found */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** 400 — ZK proof generation or verification failed */
class ProofError extends AppError {
  constructor(message = 'ZK Proof error') {
    super(message, 400);
  }
}

// ── Status Code Map ───────────────────────────────────────────────────────────

const ERROR_STATUS_MAP = {
  ValidationError: 400,
  AuthError:       401,
  NotFoundError:   404,
  ProofError:      400,
};

// ── handleError ───────────────────────────────────────────────────────────────

/**
 * Express error-handling middleware (4 args — must be last app.use()).
 *
 * @param {Error}    error
 * @param {Request}  req
 * @param {Response} res
 * @param {Function} next
 */
function handleError(error, req, res, next) { // eslint-disable-line no-unused-vars
  // Determine status code
  const statusCode =
    ERROR_STATUS_MAP[error.name] ||  // known custom error
    error.statusCode ||               // manually set statusCode
    500;

  // Log the error
  const logPrefix = `[${error.name || 'Error'}] ${req.method} ${req.path}`;
  if (statusCode >= 500) {
    console.error(`${logPrefix} — ${error.message}`, isDev ? error.stack : '');
  } else {
    console.warn(`${logPrefix} — ${error.message}`);
  }

  // Build response payload
  const response = {
    success: false,
    error:   error.name || 'Error',
    message: statusCode >= 500 && !isDev
      ? 'An unexpected internal error occurred. Please try again later.'
      : error.message,
  };

  // Include stack trace in development only
  if (isDev && error.stack) {
    response.stack = error.stack;
  }

  // Handle Prisma-specific known errors
  if (error.code === 'P2002') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      error:   'ConflictError',
      message: `A record with this value already exists (field: ${(error.meta?.target || []).join(', ')}).`,
    });
  }

  if (error.code === 'P2025') {
    // Record not found (Prisma)
    return res.status(404).json({
      success: false,
      error:   'NotFoundError',
      message: error.meta?.cause || 'The requested record does not exist.',
    });
  }

  res.status(statusCode).json(response);
}

// ── asyncHandler ──────────────────────────────────────────────────────────────

/**
 * Wraps an async route handler to automatically forward errors to Express's
 * error-handling middleware.  Eliminates the need for try/catch in every route.
 *
 * @param {Function} fn - Async route handler (req, res, next)
 * @returns {Function}  - Express-compatible route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ProofError,
  // Middleware & helpers
  handleError,
  asyncHandler,
};
