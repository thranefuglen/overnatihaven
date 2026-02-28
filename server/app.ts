import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration - allow both default and alternative Vite ports
  const allowedOrigins = [
    config.corsOrigin,
    'http://localhost:5173',
    'http://localhost:5174',
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting - more lenient in development
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.nodeEnv === 'development' ? 1000 : config.rateLimit.maxRequests, // 1000 requests in dev, 10 in production
    message: {
      success: false,
      message: 'For mange forespørgsler. Prøv venligst igen senere.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', limiter);

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
    });
    next();
  });

  // API routes
  app.use('/api', routes);

  // Local dev fallback: serve /tmp/uploads/ under /tmp-uploads/ when blob storage is not configured
  if (!config.blob.readWriteToken) {
    app.use('/tmp-uploads', express.static('/tmp/uploads'));
  }

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
