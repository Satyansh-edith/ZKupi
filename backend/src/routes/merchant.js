/**
 * Merchant Routes — /api/merchant
 * ================================
 * Register and query merchants in the ZK-UPI network.
 * Note: The Merchant table was removed from the schema, so we mock it.
 */

const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

// Memory store for hackathon demo
const merchants = new Map();

// ─── POST /api/merchant/create ────────────────────────────────────────────────
router.post("/create", async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Required fields: name",
      });
    }

    const merchantId = "store_" + uuidv4().split("-")[0];

    const merchant = {
      id: uuidv4(),
      name,
      merchantId,
      balance: 0,
      isActive: true,
      createdAt: new Date(),
    };

    merchants.set(merchantId, merchant);

    console.log(`[Merchant] Registered: ${merchantId} (${name})`);

    res.status(201).json({
      success: true,
      message: "Merchant registered successfully",
      merchant,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/merchant/:merchantId ───────────────────────────────────────────
router.get("/:merchantId", async (req, res, next) => {
  try {
    const { merchantId } = req.params;

    const merchant = merchants.get(merchantId);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error:   `Merchant '${merchantId}' not found (mock store)`,
      });
    }

    res.json({ success: true, merchant });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
