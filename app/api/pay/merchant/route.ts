/**
 * Next.js API Proxy — Merchant Payment  (/api/pay/merchant)
 * -----------------------------------------------------------
 * Bridges the React frontend with the Express ZK-UPI backend.
 *
 * Flow:
 *   1. Receive secret, userId, merchantId, amount from the client
 *   2. Derive the ZK commitment and nullifier from the secret
 *   3. Forward as a properly structured proof payload to /api/payment/submit
 *   4. Return the success/failure to the React component
 */

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { secret, userId, merchantId, amount } = await req.json()

    // Validate all required fields are present
    if (!secret || !userId || !merchantId || !amount) {
      return NextResponse.json({ error: "Missing: secret, userId, merchantId, amount" }, { status: 400 })
    }

    // Derive ZK cryptographic values from the secret
    const commitment = crypto.createHash("sha256").update(secret).digest("hex")
    const nullifier  = "0x" + crypto.createHash("sha256")
      .update(secret + merchantId + Date.now())
      .digest("hex")
      .slice(0, 60)

    // Build the ZK payment payload for the Express backend
    const payload = {
      proof:         { mock: true },
      publicSignals: [String(amount), nullifier, commitment],
      fromUserId:    userId,
      toAddress:     merchantId,
      amount:        Number(amount),
    }

    const backendRes = await fetch("http://localhost:4000/api/payment/submit", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id":    userId,
        "x-timestamp":  Date.now().toString(),
        "x-signature":  "mock_sig_" + userId,  // placeholder — real ECDSA signing goes here
      },
      body:  JSON.stringify(payload),
      cache: "no-store",
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Payment failed" },
        { status: backendRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful",
      txId:    data.transactionId,
      amount,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}