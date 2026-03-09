-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitment" TEXT NOT NULL,
    "nullifierHash" TEXT,
    "balance" REAL NOT NULL DEFAULT 10000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderCommitment" TEXT NOT NULL,
    "receiverCommitment" TEXT,
    "merchantId" TEXT,
    "amount" REAL NOT NULL,
    "zkProof" TEXT NOT NULL,
    "nullifier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_senderCommitment_fkey" FOREIGN KEY ("senderCommitment") REFERENCES "wallets" ("commitment") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_receiverCommitment_fkey" FOREIGN KEY ("receiverCommitment") REFERENCES "wallets" ("commitment") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nullifiers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txId" TEXT
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_commitment_key" ON "wallets"("commitment");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_nullifier_key" ON "transactions"("nullifier");

-- CreateIndex
CREATE UNIQUE INDEX "nullifiers_hash_key" ON "nullifiers"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_merchantId_key" ON "merchants"("merchantId");
