/**
 * Prisma Client Singleton
 * =======================
 * Prevents multiple Prisma connections in development (hot-reload creates
 * new instances on every file save — this pattern reuses the same instance).
 */

const { PrismaClient } = require("@prisma/client");

// In development, attach to global to survive hot-reloads
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
