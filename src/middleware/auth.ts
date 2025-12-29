import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Middleware to authenticate user from JWT token
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'nexus-prosecreator-secret-key';
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name?: string;
      tier: User['tier'];
    };

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      tier: decoded.tier,
      created_at: new Date(),
      updated_at: new Date()
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid authentication token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Authentication token has expired'));
    } else {
      next(error);
    }
  }
}

/**
 * Middleware to check if user has required tier
 */
export function requireTier(...allowedTiers: User['tier'][]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedTiers.includes(req.user.tier)) {
      return next(new ForbiddenError(`This feature requires ${allowedTiers.join(' or ')} tier`));
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token present
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const secret = process.env.JWT_SECRET || 'nexus-prosecreator-secret-key';
      const decoded = jwt.verify(token, secret) as {
        id: string;
        email: string;
        name?: string;
        tier: User['tier'];
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        tier: decoded.tier,
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Middleware to validate API key for programmatic access
 */
export async function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key required');
    }

    // TODO: Validate API key against database
    // For now, accept any key that starts with 'npk_'
    if (!apiKey.startsWith('npk_')) {
      throw new UnauthorizedError('Invalid API key format');
    }

    // Mock user from API key
    req.user = {
      id: 'api-key-user',
      email: 'api@prosecreator.com',
      tier: 'enterprise',
      created_at: new Date(),
      updated_at: new Date()
    };

    next();
  } catch (error) {
    next(error);
  }
}
