/**
 * Prisma Client Singleton
 *
 * This module ensures only one instance of PrismaClient is created
 * during development to prevent connection pool exhaustion from hot reloading.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Declare a global variable for Prisma in development
const globalForPrisma = globalThis;

let prismaInstance;

const initPrisma = () => {
  if (prismaInstance) {
    return prismaInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: databaseUrl
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pgPool = pool;
  }

  prismaInstance = new PrismaClient({
    adapter: new PrismaPg(pool)
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
};

const prismaProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = globalForPrisma.prisma ?? initPrisma();
      return client[prop];
    }
  }
);

export default prismaProxy;
