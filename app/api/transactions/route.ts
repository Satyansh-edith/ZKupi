import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Transaction from "@/models/Transaction"

export async function GET() {

  await connectDB()

  const transactions = await Transaction
    .find()
    .sort({ timestamp: -1 })
    .limit(50)

  return NextResponse.json({
    transactions
  })
}