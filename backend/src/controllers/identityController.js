/**
 * Identity Controller
 * ===================
 * Manages ZK-UPI user identities.
 * An identity is an anonymous (identityHash, publicKey) pair — no real-world info.
 */

'use strict';

const prisma = require('../lib/prisma');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

// ── createIdentity ────────────────────────────────────────────────────────────
// POST /api/identity/create
const createIdentity = async (req, res) => {
  const { identityHash, publicKey } = req.body;

  if (!identityHash || !publicKey) {
    throw new ValidationError('Both identityHash and publicKey are required to create an identity.');
  }

  // P2002 (unique constraint) is handled by the global error handler → 409 Conflict
  const user = await prisma.user.create({
    data: { identityHash, publicKey },
    select: { id: true },
  });

  console.log(`[Identity] Created user: ${user.id}`);

  res.status(201).json({
    success: true,
    message: 'Identity created successfully.',
    userId:  user.id,
  });
};

// ── getIdentity ───────────────────────────────────────────────────────────────
// GET /api/identity/:userId
const getIdentity = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { publicKey: true },  // identityHash excluded to preserve privacy
  });

  if (!user) throw new NotFoundError(`No identity found with ID: ${userId}`);

  res.json({ success: true, publicKey: user.publicKey });
};

// ── deleteIdentity ────────────────────────────────────────────────────────────
// DELETE /api/identity/:userId
const deleteIdentity = async (req, res) => {
  const { userId } = req.params;

  const userExists = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true },
  });

  if (!userExists) throw new NotFoundError(`No identity found with ID: ${userId}`);

  // Cascade-deletes Nullifiers; errors if Transactions exist (Restrict)
  await prisma.user.delete({ where: { id: userId } });

  console.log(`[Identity] Deleted user: ${userId}`);

  res.json({ success: true, message: `Identity ${userId} deleted successfully.` });
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = { createIdentity, getIdentity, deleteIdentity };
