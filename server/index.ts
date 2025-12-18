import { createApp } from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { initDatabase, closeDatabase } from './db/database';
import { runMigrations } from './db/migrate';

/**
 * Start the server
 */
async function start() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    initDatabase();
    
    // Run migrations
    logger.info('Running database migrations...');
    runMigrations();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        environment: config.nodeEnv,
        corsOrigin: config.corsOrigin,
      });
      logger.info(`API available at http://localhost:${config.port}/api`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        closeDatabase();
        logger.info('Database connection closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
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

// Start the application
start();
