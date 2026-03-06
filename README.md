# ZK-UPI: Privacy Preserving Digital Payments

ZK-UPI is a prototype that demonstrates how digital payments can be verified without revealing the user's identity using concepts inspired by Zero-Knowledge Proofs.

Instead of storing personal identity information, the system records **cryptographic commitments** that allow payments to be verified while keeping the payer anonymous.

This project was built as a hackathon prototype to illustrate how privacy-focused payment infrastructure could work.

---

## Problem

Modern digital payment systems require sharing personal identifiers such as:

- phone number
- bank account
- UPI ID
- name

This creates major concerns:

- privacy leakage
- financial tracking
- centralized surveillance

---

## Solution

ZK-UPI demonstrates a privacy-preserving payment architecture.

Instead of storing identities, the system uses:

```
User Secret → Commitment Hash → ZK Proof → Payment Verification
```

This allows:

- payment validation
- transaction tracking
- merchant settlement

while **never revealing the user's identity**.

---

## Key Features

- Anonymous wallet generation
- Cryptographic commitment identity
- Merchant payment QR flow
- Simulated Zero-Knowledge proof verification
- Transaction explorer
- Privacy architecture dashboard

---

## System Architecture

```
User Secret
      ↓
Commitment Hash (SHA256)
      ↓
Wallet Stored in Database
      ↓
Payment Request
      ↓
ZK Proof Generation (Simulation)
      ↓
Proof Verification
      ↓
Transaction Stored
      ↓
Explorer Displays Transaction
```

Important:

The explorer shows:

- transaction
- merchant
- amount
- timestamp

But **never reveals the user identity**.

---

## Project Structure

```
app/
 ├ wallet/
 ├ merchant/
 ├ pay/
 ├ explorer/
 ├ api/

models/
 ├ Wallet.ts
 └ Transaction.ts

lib/
 ├ db.ts
 └ zkProof.ts
```

---

## Tech Stack

Frontend

- Next.js
- React
- Tailwind CSS

Backend

- Next.js API Routes

Database

- MongoDB

Cryptography

- SHA256 commitments
- Simulated ZK Proof verification

---

## Demo Flow

1. Create Wallet

```
/wallet
```

A wallet generates:

- secret
- commitment hash
- initial balance

---

2. Create Merchant

```
/merchant
```

Merchant generates payment QR.

---

3. Make Payment

```
/pay
```

User pays using secret and merchant ID.

System generates and verifies a **ZK proof simulation**.

---

4. View Transaction Explorer

```
/explorer
```

Displays recent payments without revealing the payer identity.

---

## Example Transaction

| Commitment | Merchant | Amount | Time |
|------------|----------|--------|------|
| 3b7532e247d0... | coffee01 | ₹25 | 22:31 |

Note: Identity is hidden.

---

## Future Improvements

This prototype simulates zero-knowledge proofs.

A real system could extend this using:

- zkSNARK circuits
- blockchain smart contracts
- decentralized verification
- privacy preserving payment rails

---

## Use Cases

- private digital payments
- anonymous micro-transactions
- privacy focused fintech
- blockchain based payment rails

---

## Disclaimer

This project is a **concept prototype built for hackathon demonstration**.

It does not implement production-grade zero-knowledge cryptography.

---

## Author

Built as a privacy-focused fintech prototype.
