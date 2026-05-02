import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client'; // adjust path to your output
import { logger } from '../utils/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  var __prismaDisconnected: boolean | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Match v6 default behavior — pg has no timeout by default
    connectionTimeoutMillis: 5000,
    max: 10, // pg default is also 10, but explicit is better
  });

  return new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

process.on('beforeExit', async () => {
  if (!global.__prismaDisconnected) {
    global.__prismaDisconnected = true;
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
});