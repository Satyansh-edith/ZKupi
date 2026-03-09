/**
 * Payment Controller
 * ------------------
 * Core ZK-UPI payment execution flow.
 *
 * Flow:
 *   1. Validate request inputs
 *   2. Look up the sender user in the database
 *   3. Cross-check the ZK commitment against the registered identity hash
 *   4. Check the nullifier to prevent double-spend
 *   5. Verify the ZK proof (mock in hackathon mode)
 *   6. Record nullifier + transaction atomically in a DB transaction
 *   7. Return the transaction ID
 */

const axios  = require('axios');
const prisma = require('../lib/prisma');
const { config } = require('../utils/envValidator');
const { verifyZKProof } = require('../utils/proofVerifier');
const { ValidationError, ProofError, NotFoundError } = require('../utils/errorHandler');

// ── submitPayment ─────────────────────────────────────────────────────────────
// POST /api/payment/submit
const submitPayment = async (req, res) => {
  const { proof, publicSignals, fromUserId, toAddress, amount } = req.body;

  // Step 1 — Validate inputs
  if (!proof || !publicSignals || !fromUserId || !toAddress || amount === undefined) {
    throw new ValidationError('Missing fields: proof, publicSignals, fromUserId, toAddress, amount');
  }
  if (typeof amount !== 'number' || amount <= 0) {
    throw new ValidationError('amount must be a positive number.');
  }

  // Step 2 — Normalise publicSignals
  const signals = Array.isArray(publicSignals)
    ? publicSignals
    : [String(amount), publicSignals.nullifier, publicSignals.commitment];

  if (signals.length < 3) {
    throw new ValidationError('publicSignals must be [amount, nullifier, commitment].');
  }

  const nullifier  = signals[1];
  const commitment = signals[2];

  // Step 3 — Verify sender exists and commitment matches their registered identity
  const sender = await prisma.user.findUnique({
    where:  { id: fromUserId },
    select: { id: true, identityHash: true },
  });

  if (!sender) throw new NotFoundError(`Sender not found: ${fromUserId}`);
  if (sender.identityHash !== commitment) {
    throw new ProofError("Proof commitment does not match the sender's registered identity.");
  }

  // Step 4 — Double-spend check
  const usedNullifier = await prisma.nullifier.findUnique({ where: { nullifier } });
  if (usedNullifier) {
    throw new ProofError('Payment already processed (double-spend detected).');
  }

  // Step 5 — Verify ZK proof (uses mock mode unless USE_REAL_ZK_PROOFS=true)
  const isValid = await verifyZKProof(proof, signals);
  if (!isValid) throw new ProofError('Invalid proof — mathematical verification failed.');

  // Step 6 — Atomically record the nullifier and create the transaction
  let transactionId;

  try {
    await prisma.$transaction(async (tx) => {
      // Lock nullifier first to prevent race conditions
      await tx.nullifier.create({ data: { nullifier, userId: fromUserId } });

      // Optionally ping the external payment engine (graceful fallback if offline)
      const engineUrl = config.paymentEngineUrl || 'http://localhost:3003/process-payment';
      try {
        const response = await axios.post(engineUrl, { fromUserId, toAddress, amount }, { timeout: 3000 });
        if (!response.data.success) throw new Error(response.data.error);
      } catch {
        // External engine unavailable — continue with DB record only (hackathon fallback)
        console.warn('[Payment] External engine unreachable — mock success applied.');
      }

      // Record transaction
      const dbTx = await tx.transaction.create({
        data: { fromUserId, amount, proofHash: commitment, merchantId: toAddress, status: 'completed' },
      });
      transactionId = dbTx.id;
    });
  } catch (err) {
    throw new Error(err.message);
  }

  res.status(200).json({ success: true, transactionId, message: 'Payment processed successfully.' });
};

// ── getPaymentStatus ──────────────────────────────────────────────────────────
// GET /api/payment/status/:txId
const getPaymentStatus = async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where:  { id: req.params.txId },
    select: { id: true, status: true, amount: true, createdAt: true, merchantId: true },
  });

  if (!tx) throw new NotFoundError('Transaction not found.');

  res.json({ success: true, transaction: tx });
};

// ── getUserHistory ────────────────────────────────────────────────────────────
// GET /api/payment/history/:userId
const getUserHistory = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found.');

  const history = await prisma.transaction.findMany({
    where:   { fromUserId: userId },
    orderBy: { createdAt: 'desc' },
    select:  { id: true, amount: true, merchantId: true, status: true, createdAt: true },
  });

  res.json({ success: true, count: history.length, transactions: history });
};

module.exports = { submitPayment, getPaymentStatus, getUserHistory };
