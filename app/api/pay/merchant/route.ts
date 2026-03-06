import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

import { connectDB } from "@/lib/db"
import Wallet from "../../../../models/Wallet"
import Transaction from "../../../../models/Transaction"

import { generateProof, verifyProof } from "../../../../lib/zkProof"

export async function POST(req: NextRequest) {

  try {

    // Connect to database
    await connectDB()

    // Read request body
    const { secret, merchantId, amount } = await req.json()

    if (!secret || !merchantId || !amount) {
      return NextResponse.json(
        { error: "Missing payment parameters" },
        { status: 400 }
      )
    }

    // STEP 1 — Create commitment from secret
    const commitment = crypto
      .createHash("sha256")
      .update(secret)
      .digest("hex")

    // STEP 2 — Find wallet
    const wallet = await Wallet.findOne({ commitment })

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      )
    }

    // STEP 3 — Check balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // STEP 4 — Generate simulated ZK proof
    const proof = generateProof(secret, merchantId, amount)

    // STEP 5 — Verify proof
    const valid = verifyProof(secret, merchantId, amount, proof)

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid proof" },
        { status: 400 }
      )
    }

    // STEP 6 — Deduct wallet balance
    wallet.balance -= amount
    await wallet.save()

    // STEP 7 — Save transaction
    await Transaction.create({
      commitment: wallet.commitment,
      merchantId,
      amount
    })

    // STEP 8 — Return success response
    return NextResponse.json({
      success: true,
      message: "Payment successful",
      proof
    })

  } catch (error) {

    console.error("Payment Error:", error)

    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }
}