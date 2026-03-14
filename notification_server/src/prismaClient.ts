import { logger } from './logger.js';
import { PrismaClient } from '@prisma/client';

// ─── Singleton pattern ────────────────────────────────────────────────────────
// Prevents exhausting DB connections during hot-reload in development.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
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

// Forward Prisma log events to pino
prisma.$on('error', (e: { message: any; target: any; }) => logger.error({ msg: e.message, target: e.target }, 'Prisma error'));
prisma.$on('warn',  (e: { message: any; target: any; }) => logger.warn({ msg: e.message, target: e.target },  'Prisma warning'));

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
});
