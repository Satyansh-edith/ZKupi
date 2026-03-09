import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://localhost:4000/api/transactions", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
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