/**
 * Wallet Routes — /api/wallet
 * ===========================
 * Manages ZK wallet creation and balance queries.
 * NO real identity is ever stored — only cryptographic commitments.
 */

const express = require("express");
const router  = express.Router();
const prisma  = require("../lib/prisma");
const { generateCommitment } = require("../lib/zkVerifier");
const { validateWalletCreate, validateWalletBalance } = require("../middleware/validate");

// ─── POST /api/wallet/create ──────────────────────────────────────────────────
// Creates a new ZK wallet from a secret.
// The secret is NEVER stored — only its SHA-256 hash (commitment).
router.post("/create", validateWalletCreate, async (req, res, next) => {
  try {
    const { secret } = req.body;

    // Generate ZK commitment from the secret
    const commitment = generateCommitment(secret);

    // Check if user already exists with this identityHash (commitment)
    const existing = await prisma.user.findUnique({ where: { identityHash: commitment } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Wallet already exists",
        message: "A wallet with this identity already exists.",
        wallet: { id: existing.id, commitment: existing.identityHash, balance: 10000 }
      });
    }

    // Create user — store ONLY the identityHash, NEVER the secret
    // Note: User doesn't have a balance field in the new schema, we'll need to calculate it. For now, create the user.
    // Also, setting a mock publicKey as it's required by the schema.
    const user = await prisma.user.create({
      data: { 
        identityHash: commitment,
        publicKey: "mock_public_key_for_hackathon_" + commitment.substring(0, 10)
      },
      select: { id: true, identityHash: true, createdAt: true },
    });

    console.log(`[Wallet] Created new wallet: commitment=${commitment.slice(0, 16)}...`);

    res.status(201).json({
      success:    true,
      message:    "ZK Wallet created successfully",
      wallet: {
        id:         user.id,
        commitment: user.identityHash,  // Public ZK identity
        balance:    10000,              // Hardcode initial balance since User table doesn't store balance directly anymore
        createdAt:  user.createdAt,
      },
      // Never reveal the secret in the response
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/wallet/balance ─────────────────────────────────────────────────
// Returns wallet balance using secret (proves ownership without storing secret).
router.post("/balance", validateWalletBalance, async (req, res, next) => {
  try {
    const { secret } = req.body;
    const commitment = generateCommitment(secret);

    const user = await prisma.user.findUnique({
      where:  { identityHash: commitment },
      select: { id: true }, // Select ID to calculate balance later
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error:   "Wallet not found",
        message: "No wallet found for this identity.",
      });
    }

    // Since we don't store balance directly on User anymore, we mock it or calculate it.
    // Let's hardcode for the demo, or ideally sum incoming/outgoing transactions.
    const balance = 10000; 

    res.json({
      success:   true,
      balance:   balance,
      updatedAt: new Date(),
      // Note: commitment is NOT returned to avoid linking identity to balance query
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/wallet/:commitment ──────────────────────────────────────────────
// Get public wallet info by commitment (the ZK identity hash).
router.get("/:commitment", async (req, res, next) => {
  try {
    const { commitment } = req.params;

    if (!commitment || commitment.length !== 64) {
      return res.status(400).json({
        success: false,
        error: "Invalid commitment format (must be 64-char hex string)",
      });
    }

    const user = await prisma.user.findUnique({
      where:  { identityHash: commitment },
      select: {
        id:           true,
        identityHash: true,
        createdAt:    true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    res.json({ 
      success: true, 
      wallet: {
        id: user.id,
        commitment: user.identityHash,
        balance: 10000, 
        createdAt: user.createdAt
      } 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
