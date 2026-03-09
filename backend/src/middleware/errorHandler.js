/**
 * Global Error Handler Middleware
 * =================================
 * Catches all errors thrown in route handlers via next(err).
 * Must be registered LAST in Express app (after all routes).
 */

const errorHandler = (err, req, res, next) => {
  // Log the error server-side with stack trace
  console.error(`[Error] ${req.method} ${req.path}`);
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // ── Prisma-specific errors ───────────────────────────────────────────────────
  if (err.code === "P2002") {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      error:   "Conflict",
      message: "A record with this value already exists.",
      field:   err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    // Record not found
    return res.status(404).json({
      success: false,
      error:   "Not Found",
      message: "The requested record does not exist.",
    });
  }

  if (err.code?.startsWith("P2")) {
    // Other Prisma errors
    return res.status(400).json({
      success: false,
      error:   "Database Error",
      message: process.env.NODE_ENV === "development"
        ? err.message
        : "A database error occurred.",
    });
  }

  // ── Validation errors ────────────────────────────────────────────────────────
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error:   "Validation Error",
      message: err.message,
    });
  }

  // ── JSON parse errors ────────────────────────────────────────────────────────
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error:   "Bad Request",
      message: "Invalid JSON in request body.",
    });
  }

  // ── Generic / unexpected errors ──────────────────────────────────────────────
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error:   status === 500 ? "Internal Server Error" : err.name || "Error",
    message: status === 500 && process.env.NODE_ENV === "production"
      ? "An unexpected error occurred."
      : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
