/**
 * Custom Error Classes for NexusProseCreator
 *
 * Provides a hierarchy of errors with consistent structure:
 * - statusCode: HTTP status code
 * - code: Machine-readable error code
 * - message: Human-readable error message
 * - isOperational: Distinguishes operational vs programming errors
 * - context: Additional error context for debugging
 */

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Base Application Error
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;
  public readonly timestamp: Date;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    isOperational = true,
    context?: ErrorContext
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      ...(this.context && { context: this.context })
    };
  }
}

/**
 * Validation Error (400)
 * For invalid input, malformed requests, validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(400, 'VALIDATION_ERROR', message, true, context);
  }
}

/**
 * Authentication Error (401)
 * For missing or invalid authentication credentials
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(401, 'AUTHENTICATION_ERROR', message, true, context);
  }
}

/**
 * Authorization Error (403)
 * For insufficient permissions to access resource
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: ErrorContext) {
    super(403, 'AUTHORIZATION_ERROR', message, true, context);
  }
}

/**
 * Not Found Error (404)
 * For resources that don't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number, context?: ErrorContext) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(404, 'NOT_FOUND', message, true, {
      resource,
      identifier,
      ...context
    });
  }
}

/**
 * Conflict Error (409)
 * For resource conflicts (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(409, 'CONFLICT', message, true, context);
  }
}

/**
 * Rate Limit Error (429)
 * For exceeding API rate limits
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number, context?: ErrorContext) {
    super(429, 'RATE_LIMIT_EXCEEDED', message, true, {
      retryAfter,
      ...context
    });
  }
}

/**
 * Database Error (500)
 * For database connection/query failures
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(500, 'DATABASE_ERROR', message, true, {
      originalError: originalError?.message,
      ...context
    });
  }
}

/**
 * External Service Error (502/503)
 * For failures communicating with external services
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    statusCode: number = 503,
    context?: ErrorContext
  ) {
    super(statusCode, 'EXTERNAL_SERVICE_ERROR', message, true, {
      service,
      ...context
    });
  }
}

/**
 * AI Model Error (500)
 * For AI model generation/processing failures
 */
export class AIModelError extends AppError {
  constructor(model: string, message: string, context?: ErrorContext) {
    super(500, 'AI_MODEL_ERROR', message, true, {
      model,
      ...context
    });
  }
}

/**
 * Vector Database Error (500)
 * For Qdrant-specific failures
 */
export class VectorDatabaseError extends AppError {
  constructor(operation: string, message: string, context?: ErrorContext) {
    super(500, 'VECTOR_DATABASE_ERROR', message, true, {
      operation,
      ...context
    });
  }
}

/**
 * Graph Database Error (500)
 * For Neo4j-specific failures
 */
export class GraphDatabaseError extends AppError {
  constructor(operation: string, message: string, context?: ErrorContext) {
    super(500, 'GRAPH_DATABASE_ERROR', message, true, {
      operation,
      ...context
    });
  }
}

/**
 * Timeout Error (504)
 * For operations that exceed timeout limits
 */
export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number, context?: ErrorContext) {
    super(504, 'TIMEOUT_ERROR', `Operation '${operation}' timed out after ${timeoutMs}ms`, true, {
      operation,
      timeoutMs,
      ...context
    });
  }
}

/**
 * Internal Server Error (500)
 * For unexpected server errors (programming errors)
 */
export class InternalServerError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(500, 'INTERNAL_SERVER_ERROR', message, false, {
      originalError: originalError?.message,
      stack: originalError?.stack,
      ...context
    });
  }
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Error factory for creating errors from unknown types
 */
export function createErrorFromUnknown(error: unknown, defaultMessage: string = 'An unexpected error occurred'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message, error);
  }

  if (typeof error === 'string') {
    return new InternalServerError(error);
  }

  return new InternalServerError(defaultMessage, undefined, { originalError: error });
}
