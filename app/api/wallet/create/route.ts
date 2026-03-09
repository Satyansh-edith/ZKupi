import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    if (!body.commitment) {
       return NextResponse.json({ error: "Missing commitment hash" }, { status: 400 })
    }

    // The new ZK-UPI Express backend registers identities by their commitment hash
    const backendPayload = {
      identityHash: body.commitment,
      publicKey: "mock_public_key_" + body.commitment.substring(0, 10)
    }

    const res = await fetch("http://localhost:4000/api/identity/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
      cache: "no-store"
    })

    const data = await res.json()
    
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status })
    }

    // Map the new backend's Identity response shape to what the legacy React frontend expects
    return NextResponse.json({
       success: true,
       wallet: {
         id: data.userId,
         balance: 10000 // In ZK-UPI, balance is technically unrecorded! We mock 10,000 for the hackathon UI
       }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}