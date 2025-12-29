/**
 * Request Logger Middleware for NexusProseCreator
 *
 * Features:
 * - Generates unique request ID for tracing
 * - Logs all HTTP requests with timing
 * - Attaches request-specific logger to req object
 * - Tracks request/response sizes
 * - Logs slow requests for performance monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Extend Express Request type with custom properties
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      userId?: string;
    }
  }
}

/**
 * Request logging middleware
 * Must be registered early in middleware chain
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  req.requestId = req.headers['x-request-id'] as string || uuidv4();

  // Record request start time
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length']
  });

  // Capture response on finish
  const originalSend = res.send;
  let responseBody: unknown;

  res.send = function (body: unknown): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    const logLevel = res.statusCode >= 500 ? 'error' :
                     res.statusCode >= 400 ? 'warn' :
                     duration > 1000 ? 'warn' : // Slow request warning
                     'info';

    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      userId: req.userId
    };

    logger.log(logLevel, 'Request completed', { requestId: req.requestId, ...logData });

    // Alert on slow requests
    if (duration > 5000) {
      logger.warn('SLOW REQUEST DETECTED', {
        ...logData,
        threshold: '5000ms',
        requiresInvestigation: true
      });
    }
  });

  // Handle response close/error
  res.on('close', () => {
    if (!res.writableFinished) {
      logger.warn('Request closed before response finished', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        duration: `${Date.now() - (req.startTime || Date.now())}ms`
      });
    }
  });

  next();
}

/**
 * Body size limit logger
 * Logs warnings when request bodies exceed thresholds
 */
export function bodySizeLogger(req: Request, res: Response, next: NextFunction): void {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);

  if (contentLength > 10 * 1024 * 1024) { // 10MB
    logger.warn('Large request body detected', {
      requestId: req.requestId,
      path: req.path,
      size: `${(contentLength / 1024 / 1024).toFixed(2)}MB`,
      threshold: '10MB'
    });
  }

  next();
}
