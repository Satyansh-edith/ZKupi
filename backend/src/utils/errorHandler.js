/**
 * Centralized Error Handler
 * =========================
 * Custom error classes, Express error middleware, and asyncHandler wrapper.
 */

'use strict';

const isDev = process.env.NODE_ENV !== 'production';

// ── Custom Error Classes ──────────────────────────────────────────────────────

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') { super(message, 400); }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') { super(message, 404); }
}

class ProofError extends AppError {
  constructor(message = 'ZK Proof error') { super(message, 400); }
}

// ── Status Code Map ───────────────────────────────────────────────────────────

const ERROR_STATUS_MAP = {
  ValidationError: 400,
  AuthError:       401,
  NotFoundError:   404,
  ProofError:      400,
};

// ── handleError ───────────────────────────────────────────────────────────────

function handleError(error, req, res, next) { // eslint-disable-line no-unused-vars
  // Handle Prisma unique-constraint violation
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error:   'ConflictError',
      message: `A record with this value already exists (field: ${(error.meta?.target || []).join(', ')}).`,
    });
  }

  // Handle Prisma record-not-found
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error:   'NotFoundError',
      message: error.meta?.cause || 'The requested record does not exist.',
    });
  }

  const statusCode = ERROR_STATUS_MAP[error.name] || error.statusCode || 500;

  const logPrefix = `[${error.name || 'Error'}] ${req.method} ${req.path}`;
  if (statusCode >= 500) {
    console.error(`${logPrefix} — ${error.message}`, isDev ? error.stack : '');
  } else {
    console.warn(`${logPrefix} — ${error.message}`);
  }

  const response = {
    success: false,
    error:   error.name || 'Error',
    message: statusCode >= 500 && !isDev
      ? 'An unexpected internal error occurred. Please try again later.'
      : error.message,
  };

  if (isDev && error.stack) response.stack = error.stack;

  res.status(statusCode).json(response);
}

// ── asyncHandler ──────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ProofError,
  handleError,
  asyncHandler,
};
