import app from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { prisma } from "./prismaClient.js";

async function start() {
  await prisma.$connect();
  logger.info('Database connected');

  app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
    logger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});