import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '9099'),
    wsPort: parseInt(process.env.WS_PORT || '9100'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'nexus-prosecreator-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Database configuration
  databases: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE || process.env.POSTGRES_DB || 'nexus_prosecreator',
      user: process.env.POSTGRES_USER || 'unified_nexus',
      password: process.env.POSTGRES_PASSWORD || 'nexus_secure_password',
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0
    },
    neo4j: {
      uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
      username: process.env.NEO4J_USER || 'neo4j',
      password: process.env.NEO4J_PASSWORD || 'neo4j',
      maxConnectionPoolSize: 100,
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      connectionAcquisitionTimeout: 60 * 1000 // 60 seconds
    },
    qdrant: {
      url: process.env.QDRANT_URL || `http://${process.env.QDRANT_HOST || 'localhost'}:${process.env.QDRANT_PORT || '6333'}`,
      apiKey: process.env.QDRANT_API_KEY,
      timeout: 30000
    }
  },

  // Service endpoints
  services: {
    graphrag: process.env.GRAPHRAG_ENDPOINT || 'http://localhost:8090',
    mageagent: process.env.MAGEAGENT_ENDPOINT || 'http://localhost:8080',
    learningagent: process.env.LEARNINGAGENT_ENDPOINT || 'http://localhost:8095',
    fileprocess: process.env.FILEPROCESS_ENDPOINT || 'http://localhost:8085'
  },

  // Generation configuration
  generation: {
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
    defaultTimeout: parseInt(process.env.GENERATION_TIMEOUT || '300000'), // 5 minutes
    beatTargetWords: parseInt(process.env.BEAT_TARGET_WORDS || '500'),
    chapterTargetWords: parseInt(process.env.CHAPTER_TARGET_WORDS || '3000')
  },

  // AI model configuration
  models: {
    primary: process.env.PRIMARY_MODEL || 'gpt-4o',
    fallback: process.env.FALLBACK_MODEL || 'claude-3-5-sonnet-20241022',
    temperature: parseFloat(process.env.MODEL_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MODEL_MAX_TOKENS || '4000')
  },

  // Feature flags
  features: {
    enableWebSocket: process.env.ENABLE_WEBSOCKET !== 'false',
    enableAutoBlueprintEvolution: process.env.ENABLE_AUTO_BLUEPRINT !== 'false',
    enableProactiveResearch: process.env.ENABLE_PROACTIVE_RESEARCH !== 'false',
    enableAIDetectionChecks: process.env.ENABLE_AI_DETECTION !== 'false'
  },

  // Tier limits
  tierLimits: {
    starter: {
      maxProjects: 1,
      monthlyWordLimit: 50000,
      maxSeriesBooks: 1,
      maxConcurrentGenerations: 1
    },
    professional: {
      maxProjects: 5,
      monthlyWordLimit: 200000,
      maxSeriesBooks: 3,
      maxConcurrentGenerations: 2
    },
    enterprise: {
      maxProjects: -1, // Unlimited
      monthlyWordLimit: 1000000,
      maxSeriesBooks: -1, // Unlimited
      maxConcurrentGenerations: 5
    },
    studio: {
      maxProjects: -1, // Unlimited
      monthlyWordLimit: -1, // Unlimited
      maxSeriesBooks: -1, // Unlimited
      maxConcurrentGenerations: 10
    }
  }
};

export default config;
