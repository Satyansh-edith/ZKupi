import { NextResponse } from "next/server"
import { connectDB } from "../../../../lib/db"
import Wallet from "../../../../models/Wallet"

export async function POST(req: Request) {

  await connectDB()

  const { commitment } = await req.json()

  const wallet = await Wallet.create({
    commitment
  })

  return NextResponse.json({
    success: true,
    wallet
  })
}