/**
 * API Integration Tests
 * =====================
 * Tests for ZK-UPI backend endpoints using Jest and Supertest.
 * We mock Prisma and Axios to run these tests without needing a live 
 * Database or Payment Engine.
 */

const request = require('supertest');
const app = require('../src/index');

// ── Mock Dependencies ────────────────────────────────────────────────────────
jest.mock('../src/lib/prisma', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  nullifier: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock('axios');

const prisma = require('../src/lib/prisma');
const axios = require('axios');

// Mock SnarkJS fallback verifyZKProof to always pass in these tests
// unless we specifically want it to fail
jest.mock('../src/utils/proofVerifier', () => ({
  verifyZKProof: jest.fn(),
  loadVerificationKey: jest.fn(),
}));
const { verifyZKProof } = require('../src/utils/proofVerifier');

// ── Test Setup ───────────────────────────────────────────────────────────────

describe('ZK-UPI API Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Identity Endpoints
  // ───────────────────────────────────────────────────────────────────────────
  describe('POST /api/identity/create', () => {
    it('should successfully create a new identity', async () => {
      // Mock DB resolving
      prisma.user.create.mockResolvedValue({ id: 'mock-user-id' });

      const res = await request(app)
        .post('/api/identity/create')
        .send({
          identityHash: '0x123abc',
          publicKey: 'mock-public-key',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBe('mock-user-id');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should fail if missing required parameters', async () => {
      const res = await request(app)
        .post('/api/identity/create')
        .send({ identityHash: 'only-hash' });

      expect(res.status).toBe(400); // Handled by global error handler
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('identityHash and publicKey are required');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Payment Submission & Double Spend
  // ───────────────────────────────────────────────────────────────────────────
  describe('POST /api/payment/submit', () => {
    
    const validPaymentPayload = {
      fromUserId: 'mock-user-id',
      toAddress: 'merchant-id',
      amount: 500,
      proof: { mockProof: true },
      publicSignals: ['500', 'mock-nullifier', '0x123abc']
    };

    it('should successfully submit a payment', async () => {
      // Mock User exists
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id', identityHash: '0x123abc' });
      // Mock Nullifier does NOT exist
      prisma.nullifier.findUnique.mockResolvedValue(null);
      // Mock Valid ZK Proof
      verifyZKProof.mockResolvedValue(true);
      
      // Mock Prisma transaction (executing inner callback)
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          nullifier: { create: jest.fn() },
          transaction: { create: jest.fn().mockResolvedValue({ id: 'tx-123' }) }
        };
        await callback(tx);
        return { id: 'tx-123' };
      });

      // Mock External Payment Engine success
      axios.post.mockResolvedValue({ data: { success: true } });

      const res = await request(app)
        .post('/api/payment/submit')
        .send(validPaymentPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(verifyZKProof).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
    });

    it('should reject a payment with an invalid proof', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id', identityHash: '0x123abc' });
      prisma.nullifier.findUnique.mockResolvedValue(null);
      // Mock INVALID proof
      verifyZKProof.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/payment/submit')
        .send(validPaymentPayload);

      expect(res.status).toBe(400); // Or 401 depending on your proofError map
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid proof');
      expect(prisma.$transaction).not.toHaveBeenCalled(); // No money moved
    });

    it('should reject a double-spend attempt (nullifier exists)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id', identityHash: '0x123abc' });
      
      // Mock Nullifier ALREADY exists
      prisma.nullifier.findUnique.mockResolvedValue({ id: 'existing-nullifier' });

      const res = await request(app)
        .post('/api/payment/submit')
        .send(validPaymentPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Payment already processed');
      expect(verifyZKProof).not.toHaveBeenCalled(); // Fast fail
    });

    it('should handle missing parameters', async () => {
      const res = await request(app)
        .post('/api/payment/submit')
        .send({ amount: 100 }); // Missing proof, fromUserId, toAddress, etc.

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Transaction History
  // ───────────────────────────────────────────────────────────────────────────
  describe('GET /api/transactions/history/:userId', () => {
    
    it('should return paginated history with no identity leak', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'mock-user-id' });
      
      const mockTx = [
        { id: '1', amount: 500, merchantId: 'm1', status: 'completed', createdAt: new Date() },
        { id: '2', amount: 300, merchantId: 'm2', status: 'pending', createdAt: new Date() }
      ];

      prisma.transaction.findMany.mockResolvedValue(mockTx);
      prisma.transaction.count.mockResolvedValue(2);

      const res = await request(app).get('/api/transactions/history/mock-user-id');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.limit).toBe(50);
      expect(res.body.transactions).toHaveLength(2);
      
      // Verify privacy: raw identities like fromUserId or proofHash are NOT returned
      expect(res.body.transactions[0]).not.toHaveProperty('fromUserId');
      expect(res.body.transactions[0]).not.toHaveProperty('proofHash');
      
      // Correct fields check
      expect(res.body.transactions[0]).toHaveProperty('id');
      expect(res.body.transactions[0]).toHaveProperty('amount');
      expect(res.body.transactions[0]).toHaveProperty('merchantId');
    });

  });

});
