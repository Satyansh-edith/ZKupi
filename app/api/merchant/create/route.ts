import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Pass the merchant name to the backend
    const res = await fetch("http://localhost:4000/api/merchant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: body.name })
    })

    const data = await res.json()
    
    if (!res.ok) {
        return NextResponse.json({ error: data.error || "Backend error" }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}