import { NextResponse } from "next/server"
import { connectDB } from "../../../../lib/db"
import Merchant from "../../../../models/Merchant"
import crypto from "crypto"

export async function POST(req: Request) {

  await connectDB()

  const { name } = await req.json()

  const merchantId = crypto.randomUUID()

  const merchant = await Merchant.create({
    name,
    merchantId,
    balance: 0
  })

  return NextResponse.json({
    success: true,
    merchant
  })
}