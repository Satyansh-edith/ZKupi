/**
 * API Integration Tests
 * =====================
 * Comprehensive Jest + Supertest tests for all ZK-UPI backend endpoints.
 * Prisma and Axios are mocked — no live database or external services needed.
 *
 * Coverage:
 *   - GET  /health
 *   - POST /api/wallet/create          (new wallet, duplicate idempotency)
 *   - POST /api/wallet/balance         (known secret, unknown secret)
 *   - GET  /api/wallet/:commitment
 *   - POST /api/identity/create        (success, missing fields, duplicate)
 *   - GET  /api/identity/:userId
 *   - POST /api/payment/submit         (success, invalid proof, double-spend, missing fields)
 *   - GET  /api/transactions/history/:userId  (pagination, privacy check)
 *   - GET  /api/transactions/status/:txId
 *   - GET  /api/transactions/:txId/proof
 *   - POST /api/merchant/create
 *   - GET  /api/merchant/:merchantId
 *   - POST /api/verify/generate
 *   - POST /api/verify/verify
 */

'use strict';

const request = require('supertest');
const app     = require('../src/index');

// ── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('../src/lib/prisma', () => ({
  user: {
    create:     jest.fn(),
    findUnique: jest.fn(),
    delete:     jest.fn(),
  },
  nullifier: {
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  transaction: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    count:      jest.fn(),
    create:     jest.fn(),
  },
  merchant: {
    create:     jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock('axios');

const prisma = require('../src/lib/prisma');
const axios  = require('axios');

// Mock proof verifier so tests don't need the verification_key.json
jest.mock('../src/utils/proofVerifier', () => ({
  verifyZKProof:        jest.fn(),
  loadVerificationKey:  jest.fn(),
  extractPublicSignals: jest.fn(),
}));

const { verifyZKProof } = require('../src/utils/proofVerifier');

// ── Shared Fixtures ───────────────────────────────────────────────────────────

const VALID_PAYMENT = {
  fromUserId:    'mock-user-id',
  toAddress:     'merchant_abc123',
  amount:        500,
  proof:         { mockProof: true },
  publicSignals: ['500', 'mock-nullifier', '0xabc123commitment'],
};

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('ZK-UPI API Integration Tests', () => {

  beforeEach(() => jest.clearAllMocks());

  // ── Health ────────────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('zk-upi-backend');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  // ── Wallet ────────────────────────────────────────────────────────────────

  describe('POST /api/wallet/create', () => {
    it('should create a new wallet and return commitment + balance', async () => {
      prisma.user.findUnique.mockResolvedValue(null); // no existing wallet
      prisma.user.create.mockResolvedValue({
        id: 'user-1', identityHash: 'abc123', createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/wallet/create')
        .send({ secret: 'mysupersecret' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.wallet).toHaveProperty('id');
      expect(res.body.wallet).toHaveProperty('commitment');
      expect(res.body.wallet.balance).toBe(10000);
    });

    it('should return existing wallet if commitment already registered (idempotent)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user', identityHash: 'abc123' });

      const res = await request(app)
        .post('/api/wallet/create')
        .send({ secret: 'mysupersecret' });

      expect(res.status).toBe(200);
      expect(res.body.wallet.id).toBe('existing-user');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject secrets shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/wallet/create')
        .send({ secret: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing secret field', async () => {
      const res = await request(app).post('/api/wallet/create').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/wallet/balance', () => {
    it('should return balance 10000 for a known wallet', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', identityHash: 'hash' });

      const res = await request(app)
        .post('/api/wallet/balance')
        .send({ secret: 'mysupersecret' });

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(10000);
    });

    it('should return 404 for an unknown wallet', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/wallet/balance')
        .send({ secret: 'nosuchsecret' });

      expect(res.status).toBe(404);
    });
  });

  // ── Identity ──────────────────────────────────────────────────────────────

  describe('POST /api/identity/create', () => {
    it('should create a new identity and return userId', async () => {
      prisma.user.create.mockResolvedValue({ id: 'new-user-id' });

      const res = await request(app)
        .post('/api/identity/create')
        .send({ identityHash: '0xabc123', publicKey: 'pk_test' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBe('new-user-id');
    });

    it('should return 400 if identityHash is missing', async () => {
      const res = await request(app)
        .post('/api/identity/create')
        .send({ publicKey: 'pk_test' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('identityHash and publicKey are required');
    });

    it('should return 400 if publicKey is missing', async () => {
      const res = await request(app)
        .post('/api/identity/create')
        .send({ identityHash: '0xabc' });

      expect(res.status).toBe(400);
    });

    it('should handle Prisma P2002 duplicate identity → 409', async () => {
      prisma.user.create.mockRejectedValue({ code: 'P2002', meta: { target: ['identityHash'] } });

      const res = await request(app)
        .post('/api/identity/create')
        .send({ identityHash: '0xduplicate', publicKey: 'pk_test' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('ConflictError');
    });
  });

  describe('GET /api/identity/:userId', () => {
    it('should return publicKey for a known user', async () => {
      prisma.user.findUnique.mockResolvedValue({ publicKey: 'pk_abc' });

      const res = await request(app).get('/api/identity/user-1');

      expect(res.status).toBe(200);
      expect(res.body.publicKey).toBe('pk_abc');
      // identityHash must NOT be returned
      expect(res.body).not.toHaveProperty('identityHash');
    });

    it('should return 404 for unknown userId', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/identity/nobody');
      expect(res.status).toBe(404);
    });
  });

  // ── Payment ───────────────────────────────────────────────────────────────

  describe('POST /api/payment/submit', () => {
    it('should successfully submit a valid payment', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id', identityHash: '0xabc123commitment' });
      prisma.nullifier.findUnique.mockResolvedValue(null); // not spent
      verifyZKProof.mockResolvedValue(true);

      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          nullifier:   { create: jest.fn() },
          transaction: { create: jest.fn().mockResolvedValue({ id: 'txn-001' }) },
        };
        await callback(tx);
        return { id: 'txn-001' };
      });

      axios.post.mockResolvedValue({ data: { success: true } });

      const res = await request(app)
        .post('/api/payment/submit')
        .send(VALID_PAYMENT);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('transactionId');
      expect(verifyZKProof).toHaveBeenCalledTimes(1);
    });

    it('should reject payment with an invalid ZK proof', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id', identityHash: '0xabc123commitment' });
      prisma.nullifier.findUnique.mockResolvedValue(null);
      verifyZKProof.mockResolvedValue(false); // proof fails

      const res = await request(app)
        .post('/api/payment/submit')
        .send(VALID_PAYMENT);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid proof');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should reject double-spend (nullifier already used)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id', identityHash: '0xabc123commitment' });
      prisma.nullifier.findUnique.mockResolvedValue({ id: 'already-used' }); // spent!

      const res = await request(app)
        .post('/api/payment/submit')
        .send(VALID_PAYMENT);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Payment already processed');
      expect(verifyZKProof).not.toHaveBeenCalled(); // fast-fail before proof check
    });

    it('should reject if sender is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/payment/submit')
        .send(VALID_PAYMENT);

      expect(res.status).toBe(404);
    });

    it('should reject mismatched commitment', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'mock-user-id',
        identityHash: 'DIFFERENT_HASH',  // does not match publicSignals[2]
      });

      const res = await request(app)
        .post('/api/payment/submit')
        .send(VALID_PAYMENT);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('commitment does not match');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/payment/submit')
        .send({ amount: 100 }); // missing proof, fromUserId, toAddress, publicSignals

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for non-positive amount', async () => {
      const res = await request(app)
        .post('/api/payment/submit')
        .send({ ...VALID_PAYMENT, amount: -50 });

      expect(res.status).toBe(400);
    });
  });

  // ── Transaction History ───────────────────────────────────────────────────

  describe('GET /api/transactions/history/:userId', () => {
    const mockTx = [
      { id: 'tx-1', amount: 500, merchantId: 'm1', status: 'completed', createdAt: new Date() },
      { id: 'tx-2', amount: 300, merchantId: 'm2', status: 'pending',   createdAt: new Date() },
    ];

    it('should return paginated transaction history without identity leaks', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id' });
      prisma.transaction.findMany.mockResolvedValue(mockTx);
      prisma.transaction.count.mockResolvedValue(2);

      const res = await request(app).get('/api/transactions/history/mock-user-id');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(2);
      expect(res.body.transactions).toHaveLength(2);

      // Privacy: fromUserId and proofHash must NOT appear
      expect(res.body.transactions[0]).not.toHaveProperty('fromUserId');
      expect(res.body.transactions[0]).not.toHaveProperty('proofHash');

      // Correct public fields must be present
      expect(res.body.transactions[0]).toHaveProperty('id');
      expect(res.body.transactions[0]).toHaveProperty('amount');
      expect(res.body.transactions[0]).toHaveProperty('merchantId');
      expect(res.body.transactions[0]).toHaveProperty('status');
      expect(res.body.transactions[0]).toHaveProperty('date');
    });

    it('should return 404 for unknown userId', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/transactions/history/nobody');
      expect(res.status).toBe(404);
    });

    it('should respect limit query parameter', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      const res = await request(app).get('/api/transactions/history/u1?limit=10&offset=20');
      expect(res.status).toBe(200);
      expect(res.body.limit).toBe(10);
      expect(res.body.offset).toBe(20);
    });
  });

  describe('GET /api/transactions/status/:txId', () => {
    it('should return status for known transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        status: 'completed', amount: 500, createdAt: new Date(),
      });

      const res = await request(app).get('/api/transactions/status/tx-1');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('should return 404 for unknown txId', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/transactions/status/no-tx');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/transactions/:txId/proof', () => {
    it('should return proofHash for known transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        proofHash: '0xproofhash', createdAt: new Date(),
      });

      const res = await request(app).get('/api/transactions/tx-1/proof');
      expect(res.status).toBe(200);
      expect(res.body.proofHash).toBe('0xproofhash');
    });

    it('should return 404 for unknown txId', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/transactions/no-tx/proof');
      expect(res.status).toBe(404);
    });
  });

  // ── Merchant ──────────────────────────────────────────────────────────────

  describe('POST /api/merchant/create', () => {
    it('should create a new merchant and return merchantId', async () => {
      prisma.merchant.create.mockResolvedValue({
        id: 'merchant_123',
        name: 'Coffee Shop',
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/merchant/create')
        .send({ name: 'Coffee Shop' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.merchant.name).toBe('Coffee Shop');
      expect(res.body.merchant.merchantId).toBe('merchant_123');
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app).post('/api/merchant/create').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/merchant/:merchantId', () => {
    it('should return 404 for non-existent merchant', async () => {
      prisma.merchant.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/merchant/merchant_nonexistent');
      expect(res.status).toBe(404);
    });

    it('should return created merchant', async () => {
      prisma.merchant.findUnique.mockResolvedValue({
        id: 'merchant_123',
        name: 'Test Store',
        createdAt: new Date(),
      });

      const res = await request(app).get(`/api/merchant/merchant_123`);
      expect(res.status).toBe(200);
      expect(res.body.merchant.name).toBe('Test Store');
      expect(res.body.merchant.id).toBe('merchant_123');
    });
  });

  // ── Proof Generation & Verification ──────────────────────────────────────

  describe('POST /api/verify/generate', () => {
    it('should generate a simulated proof with all required fields', async () => {
      const res = await request(app)
        .post('/api/verify/generate')
        .send({ secret: 'mysupersecret', merchantId: 'merchant_abc', amount: 300 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('proof');
      expect(res.body).toHaveProperty('publicSignals');
      expect(res.body).toHaveProperty('nullifier');
      expect(res.body).toHaveProperty('commitment');
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/verify/generate')
        .send({ secret: 'mysupersecret' }); // missing merchantId and amount

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/verify/verify', () => {
    it('should return valid=true for accepted proof', async () => {
      verifyZKProof.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/verify/verify')
        .send({ proof: 'abc', publicSignals: ['500', 'nullifier', 'commitment'] });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    it('should return valid=false for rejected proof', async () => {
      verifyZKProof.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/verify/verify')
        .send({ proof: 'bad', publicSignals: ['500', 'nul', 'com'] });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(false);
    });

    it('should return 400 if proof or publicSignals are missing', async () => {
      const res = await request(app).post('/api/verify/verify').send({ proof: 'only-proof' });
      expect(res.status).toBe(400);
    });
  });

  // ── 404 Route ─────────────────────────────────────────────────────────────

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

});
