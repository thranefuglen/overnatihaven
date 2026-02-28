import { createApp } from './app';
import { config } from './config/env';
import { logger } from './config/logger';

/**
 * Start the server
 */
async function start() {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        environment: config.nodeEnv,
        corsOrigin: config.corsOrigin,
      });
      logger.info(`API available at http://localhost:${config.port}/api`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

start();
