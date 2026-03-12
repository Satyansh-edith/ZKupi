/**
 * Prisma Client Singleton
 * =======================
 * Ensures a single PrismaClient instance to avoid connection pool exhaustion
 * in development with hot-reloading (nodemon).
 */

'use strict';

const { PrismaClient } = require('@prisma/client');

const globalWithPrisma = global;

const prisma =
  globalWithPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalWithPrisma.__prisma = prisma;
}

module.exports = prisma;
