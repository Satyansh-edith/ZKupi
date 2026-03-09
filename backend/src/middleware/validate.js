/**
 * Request Validation Middleware
 * ==============================
 * Lightweight validation helpers for route handlers.
 */

/**
 * Validates POST /api/wallet/create request body
 */
const validateWalletCreate = (req, res, next) => {
  const { secret } = req.body;

  if (!secret) {
    return res.status(400).json({
      success: false,
      error:   "Missing required field: secret",
    });
  }
  if (typeof secret !== "string" || secret.trim().length < 8) {
    return res.status(400).json({
      success: false,
      error:   "secret must be a string with at least 8 characters",
    });
  }
  if (secret.length > 256) {
    return res.status(400).json({
      success: false,
      error:   "secret must not exceed 256 characters",
    });
  }

  next();
};

/**
 * Validates POST /api/wallet/balance request body
 */
const validateWalletBalance = (req, res, next) => {
  const { secret } = req.body;

  if (!secret || typeof secret !== "string") {
    return res.status(400).json({
      success: false,
      error: "Missing required field: secret",
    });
  }

  next();
};

/**
 * Validates POST /api/transactions/submit request body
 */
const validateTransactionSubmit = (req, res, next) => {
  const { secret, merchantId, amount, proof, nullifier } = req.body;
  const missing = [];

  if (!secret)     missing.push("secret");
  if (!merchantId) missing.push("merchantId");
  if (!amount)     missing.push("amount");
  if (!proof)      missing.push("proof");
  if (!nullifier)  missing.push("nullifier");

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error:   `Missing required fields: ${missing.join(", ")}`,
    });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      error:   "amount must be a positive number",
    });
  }

  next();
};

module.exports = {
  validateWalletCreate,
  validateWalletBalance,
  validateTransactionSubmit,
};
