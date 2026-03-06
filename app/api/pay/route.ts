import { NextResponse } from "next/server"
import crypto from "crypto"
import { connectDB } from "../../../lib/db"
import Wallet from "../../../models/Wallet"

export async function POST(req: Request) {

  await connectDB()

  const { secret, amount } = await req.json()

  if (!secret) {
    return NextResponse.json({
      success: false,
      message: "Secret missing"
    })
  }

  // create commitment from secret
  const commitment = crypto
    .createHash("sha256")
    .update(secret)
    .digest("hex")

  // find wallet
  const wallet = await Wallet.findOne({ commitment })

  if (!wallet) {
    return NextResponse.json({
      success: false,
      message: "Wallet not found"
    })
  }

  if (wallet.balance < amount) {
    return NextResponse.json({
      success: false,
      message: "Insufficient balance"
    })
  }

  // deduct balance
  wallet.balance -= amount
  await wallet.save()

  return NextResponse.json({
    success: true,
    message: "Payment successful",
    remainingBalance: wallet.balance
  })
}