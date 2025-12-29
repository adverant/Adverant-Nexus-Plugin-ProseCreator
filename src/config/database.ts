/**
 * Database Configuration for NexusProseCreator
 *
 * Manages connection configurations for:
 * - PostgreSQL (relational data)
 * - Qdrant (vector embeddings)
 * - Neo4j (knowledge graph)
 */

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number; // Connection pool size
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl: boolean;
}

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  timeout: number;
}

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  maxConnectionPoolSize: number;
  connectionTimeout: number;
  maxTransactionRetryTime: number;
}

export interface DatabaseConfig {
  postgres: PostgresConfig;
  qdrant: QdrantConfig;
  neo4j: Neo4jConfig;
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    postgres: {
      host: process.env.POSTGRES_HOST || 'nexus-postgres',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'nexus_prosecreator',
      user: process.env.POSTGRES_USER || 'nexus',
      password: process.env.POSTGRES_PASSWORD || 'nexus_password',
      max: parseInt(process.env.POSTGRES_POOL_SIZE || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.POSTGRES_SSL === 'true'
    },
    qdrant: {
      url: process.env.QDRANT_URL || 'http://nexus-qdrant:6333',
      apiKey: process.env.QDRANT_API_KEY,
      timeout: parseInt(process.env.QDRANT_TIMEOUT || '30000', 10)
    },
    neo4j: {
      uri: process.env.NEO4J_URI || 'bolt://nexus-neo4j:7687',
      username: process.env.NEO4J_USERNAME || 'neo4j',
      password: process.env.NEO4J_PASSWORD || 'nexus_password',
      maxConnectionPoolSize: parseInt(process.env.NEO4J_POOL_SIZE || '50', 10),
      connectionTimeout: 30000,
      maxTransactionRetryTime: 30000
    }
  };
}

/**
 * Validate database configuration
 * Throws error if required values are missing
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  const errors: string[] = [];

  // Validate PostgreSQL
  if (!config.postgres.host) errors.push('POSTGRES_HOST is required');
  if (!config.postgres.database) errors.push('POSTGRES_DB is required');
  if (!config.postgres.user) errors.push('POSTGRES_USER is required');
  if (!config.postgres.password) errors.push('POSTGRES_PASSWORD is required');

  // Validate Qdrant
  if (!config.qdrant.url) errors.push('QDRANT_URL is required');

  // Validate Neo4j
  if (!config.neo4j.uri) errors.push('NEO4J_URI is required');
  if (!config.neo4j.username) errors.push('NEO4J_USERNAME is required');
  if (!config.neo4j.password) errors.push('NEO4J_PASSWORD is required');

  if (errors.length > 0) {
    throw new Error(`Database configuration validation failed:\n${errors.join('\n')}`);
  }
}
