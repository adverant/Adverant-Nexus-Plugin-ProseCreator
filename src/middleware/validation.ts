import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

export class ValidationError extends Error {
  statusCode = 400;
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Middleware to validate request using Zod schema
 */
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request against schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate UUID parameter
 */
export function validateUUID(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      return next(new ValidationError(`Invalid UUID format for parameter: ${paramName}`));
    }

    next();
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(req: Request, res: Response, next: NextFunction): void {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (page < 1) {
    return next(new ValidationError('Page number must be >= 1'));
  }

  if (limit < 1 || limit > 100) {
    return next(new ValidationError('Limit must be between 1 and 100'));
  }

  // Attach validated values to request
  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
}
