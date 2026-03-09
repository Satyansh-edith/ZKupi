/**
 * Next.js API Proxy — Wallet Creation  (/api/wallet/create)
 * -----------------------------------------------------------
 * Bridges the React frontend with the Express ZK-UPI backend.
 * Sends the SHA-256 commitment hash to the identity creation endpoint
 * so the backend can register the ZK identity without ever seeing the secret.
 */

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.commitment) {
      return NextResponse.json({ error: "Missing wallet commitment" }, { status: 400 })
    }

    // Register the ZK identity on the Express backend using the commitment hash
    const backendRes = await fetch("http://localhost:4000/api/identity/create", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        identityHash: body.commitment,
        publicKey:    "pk_hackathon_" + body.commitment.slice(0, 10),
      }),
      cache: "no-store",
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status })
    }

    // Map backend's `userId` to the wallet shape the React frontend expects
    return NextResponse.json({
      success: true,
      wallet: {
        id:      data.userId,
        balance: 10000,  // mocked for hackathon; real balance is calculated from transactions
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}