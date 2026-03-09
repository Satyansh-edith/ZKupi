# ZK-UPI Backend API Documentation

Welcome to the ZK-UPI Backend API documentation. This API powers the Zero-Knowledge UPI system, allowing users to securely manage their identities and process payments without revealing their transaction footprints publicly.

## Base URL

In development, the backend server runs on port 4000:
`http://localhost:4000`

## Authentication

ZK-UPI uses cryptographic signature-based authentication instead of standard JWT Bearer tokens for sensitive endpoints (like submitting payments).

When calling an authenticated endpoint, include the following headers:
- `x-user-id`: The UUID of the registered user (from the `User` table).
- `x-timestamp`: The timestamp (in milliseconds) the request was created.
- `x-signature`: The cryptographic signature of the request (e.g., `timestamp + path + JSON.stringify(body)`) signed by the user's private key.

*Note: For the hackathon, the verification logic accepts any signature that is not explicitly `"invalid"`.*

## Error Codes & Handling

All endpoints follow a unified error response structure. Error responses will have an HTTP status code appropriately mapped to the error type.

**Standard Error Response Format:**
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human readable error description." // In dev mode, a `stack` trace may also be included
}
```

**Common Error Types:**
- `ValidationError` (HTTP 400): Missing or invalid request parameters or body.
- `ProofError` (HTTP 400): ZK Proof verification failed, or a double-spend attempt (used nullifier) was detected.
- `AuthError` (HTTP 401): Missing or invalid authentication headers/signature.
- `NotFoundError` (HTTP 404): The requested resource (User, Transaction, etc.) does not exist.
- `ConflictError` (HTTP 409): Unique constraint violation (e.g., identity Hash already exists).

## Rate Limits

To prevent CPU exhaustion from heavy SNARK verification computations, the `/api/verify` endpoints are configured with rate limiters.
- `POST /api/verify/proof`: 20 requests per minute per IP.
- `POST /api/verify/batch`: 20 requests per minute per IP. Max 50 proofs per batch.

---

## 1. Identity APIs

Manage ZK-UPI user identities (wallet commitments). Public keys are registered here to allow signature verification.

### Create Identity
**POST** `/api/identity/create`

Creates a new anonymous identity linking an `identityHash` to a `publicKey`.

**Request Body:**
```json
{
  "identityHash": "0xabc123... (The commitment hash)",
  "publicKey": "base64_or_hex_public_key"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "userId": "uuid-string-of-created-user",
  "message": "Identity created successfully."
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:4000/api/identity/create \
  -H "Content-Type: application/json" \
  -d '{"identityHash":"0xabc123","publicKey":"my_pub_key"}'
```

---

## 2. Payment APIs

Core endpoints for processing ZK-verified transfers and querying payment status.

### Submit Payment
**POST** `/api/payment/submit`

Submits a payment with a Zero-Knowledge proof. 

**Authentication Required:** Yes (`x-user-id`, `x-timestamp`, `x-signature`)

**Request Body:**
```json
{
  "proof": { /* SnarkJS Proof Object */ },
  "publicSignals": ["500", "0xnullifier123", "0xcommitabc"], // [amount, nullifier, commitment]
  "fromUserId": "uuid-of-sender",
  "toAddress": "merchant-id-or-address",
  "amount": 500
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "transactionId": "uuid-of-transaction",
  "message": "Payment verified and processed successfully."
}
```

**Common Errors:**
- `400 ProofError`: "Payment already processed (Double-spend detected)."
- `400 ProofError`: "Invalid proof. Mathematical verification failed."

---

## 3. Transaction APIs

Query payment histories and exact transaction statuses without exposing raw identity commitments.

### Get User Transaction History
**GET** `/api/transactions/history/:userId`

Returns the past transactions involving the specified user ID. Crucially, raw identity commitments (`fromUserId`, `proofHash`) are **omitted** from the response to preserve privacy.

**Query Parameters (Optional):**
- `limit` (number): Number of results to return (default: 50, max: 100).
- `offset` (number): Pagination offset (default: 0).
- `startDate` (YYYY-MM-DD): Filter transactions after this date.
- `endDate` (YYYY-MM-DD): Filter transactions before this date.

**Response (200 OK):**
```json
{
  "success": true,
  "total": 150,
  "limit": 50,
  "offset": 0,
  "transactions": [
    {
      "id": "uuid-of-tx",
      "amount": 500,
      "status": "completed",
      "date": "2023-10-27T14:32:00.000Z",
      "merchantId": "merchant-apple-store"
    }
  ]
}
```

---

## 4. Verification APIs

Standalone APIs strictly for mathematical ZK proof verification and auditing, disconnected from actual fund movement. Use these if building an independent verifier node or node monitoring tool.

### Verify Single Proof
**POST** `/api/verify/proof`

Asserts whether a generated ZK proof is mathematically valid given its public signals.

**Request Body:**
```json
{
  "proof": { /* SnarkJS Proof Object */ },
  "publicSignals": ["500", "0xnullifier", "0xcommitment"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "message": "ZK Proof mathematically verified successfully."
}
```

*(Note: If `valid: false`, it still returns HTTP 200, as the verification request itself was technically successful, but the underlying math failed).*
