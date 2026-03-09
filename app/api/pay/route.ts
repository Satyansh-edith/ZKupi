import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // The frontend pay pages send { secret, merchantId, amount, proof, nullifier, publicSignals }
    // Proxy the entire request to the Express backend
    const res = await fetch("http://localhost:4000/api/transactions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}