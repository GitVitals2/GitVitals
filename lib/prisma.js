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

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: new PrismaPg(pool)
  });
};

// Use existing client in development or create new one
/**
 * @type {PrismaClient}
 */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, save the client to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
