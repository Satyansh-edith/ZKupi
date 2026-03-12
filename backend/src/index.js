/**
 * ZK-UPI Backend — Main Server Entry Point
 * =========================================
 * Express server with ZK proof verification, Prisma ORM, and SQLite.
 * Runs on PORT 4000 (separate from the Next.js frontend on port 3000).
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
require('dotenv').config();

// ── Import Routes ─────────────────────────────────────────────────────────────
const walletRoutes      = require('./routes/wallet');
const transactionRoutes = require('./routes/transactionRoutes');
const proofRoutes       = require('./routes/proofRoutes');
const merchantRoutes    = require('./routes/merchant');
const identityRoutes    = require('./routes/identityRoutes');
const paymentRoutes     = require('./routes/paymentRoutes');
const { handleError }   = require('./utils/errorHandler');

// ── App Setup ─────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // relaxed for hackathon

// ── CORS — Allow Next.js frontend ────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'zk-upi-backend',
    version:   '2.0.0',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime().toFixed(2) + 's',
    env:       process.env.NODE_ENV,
    zkMode:    process.env.USE_REAL_ZK_PROOFS === 'true' ? 'real' : 'simulated',
  });
});

// ── API Info ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name:        'ZK-UPI Backend API',
    version:     '2.0.0',
    description: 'Zero Knowledge UPI Payment System — Backend API',
    endpoints: {
      health:       'GET  /health',
      wallet:       'POST /api/wallet/create, POST /api/wallet/balance, GET /api/wallet/:commitment',
      transactions: 'GET  /api/transactions/history/:userId, GET /api/transactions/status/:txId, GET /api/transactions/:txId/proof',
      proof:        'POST /api/verify/generate, POST /api/verify/verify',
      merchant:     'POST /api/merchant/create, GET /api/merchant/:merchantId, GET /api/merchant',
      identity:     'POST /api/identity/create, GET /api/identity/:userId, DELETE /api/identity/:userId',
      payment:      'POST /api/payment/submit, GET /api/payment/status/:txId, GET /api/payment/history/:userId',
    },
  });
});

// ── Mount Routes ──────────────────────────────────────────────────────────────
app.use('/api/wallet',       walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/verify',       proofRoutes);
app.use('/api/merchant',     merchantRoutes);
app.use('/api/identity',     identityRoutes);
app.use('/api/payment',      paymentRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   'NotFound',
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(handleError);

// ── Start Server ──────────────────────────────────────────────────────────────
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   🔐 ZK-UPI Backend Server Started        ║');
    console.log(`║   Port    : http://localhost:${PORT}         ║`);
    console.log(`║   Env     : ${(process.env.NODE_ENV || 'development').padEnd(30)}║`);
    console.log(`║   ZK Mode : ${(process.env.USE_REAL_ZK_PROOFS === 'true' ? 'Real SnarkJS circuits' : 'Simulated (hackathon)').padEnd(30)}║`);
    console.log('╚═══════════════════════════════════════════╝\n');
  });
}

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => { console.error('[Server] Forced shutdown after timeout.'); process.exit(1); }, 10_000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
