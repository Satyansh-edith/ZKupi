/**
 * Identity Controller
 * ===================
 * Manages ZK-UPI user identities (wallet commitments).
 * The 'User' table simply links an anonymous identityHash to a public key
 * for verification purposes.
 */

const prisma = require('../lib/prisma');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

/**
 * 1. Create a new ZK-UPI Identity
 * POST /api/identity/create
 *
 * @param {Request} req  - Expected body: { identityHash, publicKey }
 * @param {Response} res - Returns newly created user ID
 */
const createIdentity = async (req, res) => {
  const { identityHash, publicKey } = req.body;

  // ── Input Validation ───────────────────────────────────────────────────────
  if (!identityHash || !publicKey) {
    throw new ValidationError('Both identityHash and publicKey are required to create an identity.');
  }

  // ── Database Operation ─────────────────────────────────────────────────────
  // The global errorHandler will handle the P2002 Unique Constraint violation
  // if an identityHash already exists, returning a 409 Conflict automatically.
  const user = await prisma.user.create({
    data: {
      identityHash,
      publicKey,
    },
    select: {
      id: true, // Only return the UUID
    },
  });

  console.log(`[Identity] Created new user: ${user.id}`);

  // ── Success Response ───────────────────────────────────────────────────────
  res.status(201).json({
    success: true,
    message: 'Identity created successfully.',
    userId: user.id,
  });
};

/**
 * 2. Get an Identity's Public Key
 * GET /api/identity/:userId
 *
 * @param {Request} req  - Expected param: /:userId
 * @param {Response} res - Returns the publicKey only (identityHash remains hidden)
 */
const getIdentity = async (req, res) => {
  const { userId } = req.params;

  // ── Database Operation ─────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      publicKey: true, // Exclude identityHash to preserve maximum privacy
    },
  });

  // ── Error Handling ─────────────────────────────────────────────────────────
  if (!user) {
    throw new NotFoundError(`No identity found with ID: ${userId}`);
  }

  // ── Success Response ───────────────────────────────────────────────────────
  res.json({
    success: true,
    publicKey: user.publicKey,
  });
};

/**
 * 3. Delete an Identity
 * DELETE /api/identity/:userId
 *
 * Performs a hard delete. Note: the Prisma schema specifies 'Restrict' on the
 * Transaction relation. Therefore, if a user has associated transactions,
 * this operation will throw a Prisma constraint error which the global
 * error handler will intercept.
 *
 * @param {Request} req  - Expected param: /:userId
 * @param {Response} res - Returns a success message
 */
const deleteIdentity = async (req, res) => {
  const { userId } = req.params;

  // ── Verify Existence First ─────────────────────────────────────────────────
  // We check if it exists so we can throw a clean 404 rather than a 500
  // if Prisma tries to delete a non-existent record.
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new NotFoundError(`No identity found with ID: ${userId}`);
  }

  // ── Database Operation ─────────────────────────────────────────────────────
  // This cascade-deletes Nullifiers (onDelete: Cascade) but will error out
  // if Transactions exist (onDelete: Restrict), ensuring historical payment
  // integrity is preserved.
  await prisma.user.delete({
    where: { id: userId },
  });

  console.log(`[Identity] Deleted user: ${userId}`);

  // ── Success Response ───────────────────────────────────────────────────────
  res.json({
    success: true,
    message: `Identity ${userId} deleted successfully.`,
  });
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  createIdentity,
  getIdentity,
  deleteIdentity,
};
