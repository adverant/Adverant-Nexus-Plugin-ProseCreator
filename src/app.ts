/**
 * Express Application Configuration for NexusProseCreator
 *
 * Configures:
 * - CORS and security headers
 * - Body parsing
 * - Request logging
 * - Route mounting
 * - Error handling
 * - Health check endpoint
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { logger } from './utils/logger';
import { requestLogger, bodySizeLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Trust proxy (for rate limiting, IP detection behind reverse proxy)
  // Enable in production when behind nginx/load balancer
  if (config.server.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      const allowedOrigins = config.server.corsOrigins;

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS: Origin not allowed', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);
  app.use(bodySizeLogger);

  // Health check endpoint (before routes)
  app.get('/prosecreator/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'nexus-prosecreator',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv
    });
  });

  // API routes (to be added)
  // Mount routes under /prosecreator/api/*
  // TODO: Mount API routes here when created
  // app.use('/prosecreator/api', apiRouter);

  // 404 handler (after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
