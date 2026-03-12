/**
 * Transaction Controller
 * ======================
 * Query transaction history, status, and proof hashes.
 * Privacy is preserved — sender IDs and raw proof hashes are excluded
 * from history responses.
 */

'use strict';

const prisma = require('../lib/prisma');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

// ── getTransactionStatus ──────────────────────────────────────────────────────
// GET /api/transactions/status/:txId
const getTransactionStatus = async (req, res) => {
  const { txId } = req.params;

  const tx = await prisma.transaction.findUnique({
    where:  { id: txId },
    select: { status: true, amount: true, createdAt: true },
  });

  if (!tx) throw new NotFoundError(`Transaction not found with ID: ${txId}`);

  res.json({ success: true, status: tx.status, amount: tx.amount, date: tx.createdAt });
};

// ── getUserTransactions ───────────────────────────────────────────────────────
// GET /api/transactions/history/:userId
// Supports ?limit=50&offset=0&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
const getUserTransactions = async (req, res) => {
  const { userId } = req.params;
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0,  0);

  // Date range filter
  const { startDate, endDate } = req.query;
  const dateFilter = {};

  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) dateFilter.gte = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) dateFilter.lte = end;
  }

  const whereClause = { fromUserId: userId };
  if (Object.keys(dateFilter).length > 0) whereClause.createdAt = dateFilter;

  // Verify user exists before querying transactions
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new NotFoundError(`User wallet not found with ID: ${userId}`);

  const [history, total] = await Promise.all([
    prisma.transaction.findMany({
      where:   whereClause,
      orderBy: { createdAt: 'desc' },
      take:    limit,
      skip:    offset,
      // fromUserId and proofHash intentionally excluded (privacy)
      select:  { id: true, amount: true, status: true, createdAt: true, merchantId: true },
    }),
    prisma.transaction.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    total,
    limit,
    offset,
    transactions: history.map((tx) => ({
      id:         tx.id,
      amount:     tx.amount,
      status:     tx.status,
      date:       tx.createdAt,
      merchantId: tx.merchantId,
    })),
  });
};

// ── getTransactionProof ───────────────────────────────────────────────────────
// GET /api/transactions/:txId/proof
const getTransactionProof = async (req, res) => {
  const { txId } = req.params;

  const tx = await prisma.transaction.findUnique({
    where:  { id: txId },
    select: { proofHash: true, createdAt: true },
  });

  if (!tx) throw new NotFoundError(`Transaction not found with ID: ${txId}`);

  res.json({
    success:       true,
    transactionId: txId,
    proofHash:     tx.proofHash,
    date:          tx.createdAt,
    message:       'Proof hash can be used to audit this transaction mathematically.',
  });
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = { getTransactionStatus, getUserTransactions, getTransactionProof };
