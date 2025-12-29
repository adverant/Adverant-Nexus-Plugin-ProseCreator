import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Create Redis client for rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1 // Use DB 1 for rate limiting
});

/**
 * General API rate limit
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: '15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  })
});

/**
 * Generation rate limit (more restrictive)
 * 5 requests per minute per IP
 */
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: {
      code: 'GENERATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many generation requests. Maximum 5 per minute',
      retryAfter: '1 minute'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:gen:'
  })
});

/**
 * Blueprint generation rate limit
 * 10 requests per 5 minutes per IP
 */
export const blueprintLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    success: false,
    error: {
      code: 'BLUEPRINT_RATE_LIMIT_EXCEEDED',
      message: 'Too many blueprint requests. Maximum 10 per 5 minutes',
      retryAfter: '5 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:blueprint:'
  })
});

/**
 * Analysis rate limit
 * 20 requests per 10 minutes per IP
 */
export const analysisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: {
    success: false,
    error: {
      code: 'ANALYSIS_RATE_LIMIT_EXCEEDED',
      message: 'Too many analysis requests. Maximum 20 per 10 minutes',
      retryAfter: '10 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:analysis:'
  })
});

/**
 * Auth rate limit (login/signup)
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later',
      retryAfter: '15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  })
});
