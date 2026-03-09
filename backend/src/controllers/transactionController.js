/**
 * Transaction History Controller
 * ==============================
 * Handles querying transaction history, checking statuses, and retrieving
 * stored ZK proofs for verification. Preserves privacy by never returning
 * raw identities.
 */

const prisma = require('../lib/prisma');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

/**
 * 1. Get Transaction Status
 * GET /api/transactions/status/:txId
 *
 * @param {Request} req  - Expected param: /:txId
 * @param {Response} res - Returns simple status of the payment
 */
const getTransactionStatus = async (req, res) => {
  const { txId } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { id: txId },
    select: {
      status: true,
      amount: true,
      createdAt: true,
    },
  });

  if (!transaction) {
    throw new NotFoundError(`Transaction not found with ID: ${txId}`);
  }

  res.json({
    success: true,
    status: transaction.status,
    amount: transaction.amount,
    date: transaction.createdAt,
  });
};

/**
 * 2. Get User Transactions (History)
 * GET /api/transactions/history/:userId
 *
 * Supports pagination via ?limit=50&offset=0 and
 * date filtering via ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * @param {Request} req  - Expected param: /:userId
 * @param {Response} res - Returns history without exposing sensitive identity data
 */
const getUserTransactions = async (req, res) => {
  const { userId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  // ── Date Filtering ──────────────────────────────────────────────────────────
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

  const whereClause = {
    fromUserId: userId,
  };
  
  if (Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter;
  }

  // ── Database Verification & Query ───────────────────────────────────────────
  // First, verify the user actually exists so we can throw a proper 404
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError(`User wallet not found with ID: ${userId}`);
  }

  // Fetch paginated transaction history
  const [history, total] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        merchantId: true, // Usually public or hashed, safe to display
      },
    }),
    prisma.transaction.count({ where: whereClause }),
  ]);

  // Optionally mask/hash merchantId here if extremely strict privacy is needed,
  // but typically users want to see who they paid.
  // Note: fromUserId and proofHash are EXCLUDED entirely from this response.

  res.json({
    success: true,
    total,
    limit,
    offset,
    transactions: history.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt,
      merchantId: tx.merchantId,
    })),
  });
};

/**
 * 3. Get Transaction Proof
 * GET /api/transactions/:txId/proof
 *
 * Allows a verifier or user to retrieve the cryptographic proof commitment 
 * that authorised this transaction.
 *
 * @param {Request} req  - Expected param: /:txId
 * @param {Response} res - Returns the associated proof hash
 */
const getTransactionProof = async (req, res) => {
  const { txId } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { id: txId },
    select: {
      proofHash: true,
      createdAt: true,
    },
  });

  if (!transaction) {
    throw new NotFoundError(`Transaction not found with ID: ${txId}`);
  }

  res.json({
    success: true,
    transactionId: txId,
    proofHash: transaction.proofHash,
    date: transaction.createdAt,
    message: 'Proof hash can be used by the verifier to audit the ledger mathematically.',
  });
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  getTransactionStatus,
  getUserTransactions,
  getTransactionProof,
};
