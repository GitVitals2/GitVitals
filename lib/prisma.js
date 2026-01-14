/**
 * Prisma Client Singleton
 * 
 * This module ensures only one instance of PrismaClient is created
 * during development to prevent connection pool exhaustion from hot reloading.
 * 
 * In production, a new client is created for each request, which is fine
 * because the app is not constantly reloading.
 */

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Declare a global variable for Prisma in development
const globalForPrisma = globalThis;

// Use existing client in development or create new one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, save the client to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
