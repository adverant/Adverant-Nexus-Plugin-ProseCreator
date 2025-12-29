/**
 * Global Error Handler Middleware for NexusProseCreator
 *
 * Features:
 * - Catches all errors in Express pipeline
 * - Distinguishes operational vs programming errors
 * - Logs errors with full context
 * - Returns consistent JSON error responses
 * - Handles async errors properly
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Error response structure
 */
interface ErrorResponse {
  status: 'error';
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
  stack?: string;
  context?: Record<string, unknown>;
}

/**
 * Global error handler middleware
 * Must be registered LAST in middleware chain
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const operational = isOperationalError(err);
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const context = err instanceof AppError ? err.context : undefined;

  const logContext = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode,
    code,
    operational,
    userId: req.userId,
    ...(context && { errorContext: context })
  };

  if (operational) {
    if (statusCode >= 500) {
      logger.error(`Operational error: ${err.message}`, { ...logContext, stack: err.stack });
    } else {
      logger.warn(`Operational error: ${err.message}`, logContext);
    }
  } else {
    logger.error(`Programming error: ${err.message}`, { ...logContext, stack: err.stack, error: err });
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode,
    code,
    message: err.message,
    requestId: req.requestId || 'unknown',
    timestamp: new Date().toISOString()
  };

  if (config.server.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
  }

  if (operational && context) {
    errorResponse.context = context;
  }

  if (!operational && config.server.nodeEnv === 'production') {
    errorResponse.message = 'An unexpected error occurred. Please contact support.';
  }

  res.status(statusCode).json(errorResponse);

  if (!operational && config.server.nodeEnv === 'production') {
    logger.error('CRITICAL: Non-operational error in production', { ...logContext, requiresInvestigation: true });
  }
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.path} not found`, true, {
    method: req.method,
    path: req.path
  });
  next(error);
}

/**
 * Async handler wrapper
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Process-level error handlers
 */
export function registerProcessErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.error('FATAL: Uncaught Exception', { error: error.message, stack: error.stack, fatal: true });
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('FATAL: Unhandled Promise Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise.toString(),
      fatal: true
    });
    setTimeout(() => process.exit(1), 1000);
  });
}
