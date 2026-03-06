import crypto from "crypto"

export function generateProof(secret: string, merchantId: string, amount: number) {

  const proof = crypto
    .createHash("sha256")
    .update(secret + merchantId + amount)
    .digest("hex")

  return proof
}

export function verifyProof(
  secret: string,
  merchantId: string,
  amount: number,
  proof: string
) {

  const check = crypto
    .createHash("sha256")
    .update(secret + merchantId + amount)
    .digest("hex")

  return check === proof
}