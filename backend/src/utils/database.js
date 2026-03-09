/**
 * Database Utility
 * ================
 * Provides connection management, health checks, and a singleton Prisma client.
 */

const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma Client to reuse across the app
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Standard connection pooling settings are generally configured via DATABASE_URL 
    // (e.g. ?connection_limit=10&pool_timeout=0), but can also be tuned here.
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Test database connection with retry logic
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 */
const connectDB = async (retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Test the connection by running a simple query
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[Database] Successfully connected to the database (Attempt ${attempt}).`);
      return true;
    } catch (error) {
      console.error(`[Database] Connection failed on attempt ${attempt}:`, error.message);
      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('[Database] All connection attempts failed.');
        throw error; // Throwing error so the caller can decide whether to exit
      }
    }
  }
  return false;
};

/**
 * Graceful shutdown - close all Prisma connections
 */
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('[Database] Disconnected successfully.');
  } catch (error) {
    console.error('[Database] Error during disconnection:', error.message);
  }
};

/**
 * Health check query
 * @returns {boolean} true if DB is responsive, false otherwise
 */
const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Database] Health check failed:', error.message);
    return false;
  }
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  healthCheck,
};
