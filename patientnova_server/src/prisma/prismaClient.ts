import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  var __prismaDisconnected: boolean | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

process.on('beforeExit', async () => {
  // Prevent multiple disconnect attempts
  if (!global.__prismaDisconnected) {
    global.__prismaDisconnected = true;
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
});
