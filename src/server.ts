/**
 * Server Entry Point for NexusProseCreator
 *
 * Responsibilities:
 * - Initialize database connections (PostgreSQL, Qdrant, Neo4j)
 * - Start HTTP server
 * - Start WebSocket server
 * - Health check validation
 * - Graceful shutdown handling
 */

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Pool } from 'pg';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { registerProcessErrorHandlers } from './middleware/errorHandler';
import { Neo4jClient, createNeo4jClient } from './infrastructure/Neo4jClient';
import { NexusProseQdrantClient } from './infrastructure/QdrantClient';
import { initializeNexusProseQdrant } from './infrastructure/QdrantInitializer';

/**
 * Database connection instances
 */
export interface DatabaseConnections {
  postgres: Pool;
  neo4j: Neo4jClient;
  qdrant: NexusProseQdrantClient;
}

let dbConnections: DatabaseConnections | null = null;

/**
 * Initialize all database connections
 */
async function initializeDatabases(): Promise<DatabaseConnections> {
  logger.info('Initializing database connections...');

  // PostgreSQL connection pool
  const postgres = new Pool({
    host: config.databases.postgres.host,
    port: config.databases.postgres.port,
    database: config.databases.postgres.database,
    user: config.databases.postgres.user,
    password: config.databases.postgres.password,
    max: config.databases.postgres.max,
    idleTimeoutMillis: config.databases.postgres.idleTimeoutMillis,
    connectionTimeoutMillis: config.databases.postgres.connectionTimeoutMillis
  });

  // Test PostgreSQL connection
  try {
    const client = await postgres.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('✓ PostgreSQL connection established');
  } catch (error) {
    logger.error('✗ PostgreSQL connection failed', { error });
    throw error;
  }

  // Neo4j connection
  const neo4j = await createNeo4jClient({
    uri: config.databases.neo4j.uri,
    username: config.databases.neo4j.username,
    password: config.databases.neo4j.password,
    maxConnectionPoolSize: config.databases.neo4j.maxConnectionPoolSize
  });

  // Connection verification happens inside createNeo4jClient
  logger.info('✓ Neo4j connection established');

  // Qdrant connection
  const qdrant = new NexusProseQdrantClient({
    url: config.databases.qdrant.url,
    apiKey: config.databases.qdrant.apiKey,
    timeout: config.databases.qdrant.timeout
  });

  // Initialize Qdrant collections
  try {
    await initializeNexusProseQdrant(config.databases.qdrant, {
      forceRecreate: false,
      verifyIndexing: true,
      logLevel: 'info'
    });
    logger.info('✓ Qdrant connection established and collections verified');
  } catch (error) {
    logger.error('✗ Qdrant initialization failed', { error });
    throw error;
  }

  return { postgres, neo4j, qdrant };
}

/**
 * Validate system health before starting
 */
async function validateSystemHealth(connections: DatabaseConnections): Promise<void> {
  logger.info('Running system health validations...');

  const validations = [
    {
      name: 'PostgreSQL - Test Query',
      fn: async () => {
        const result = await connections.postgres.query('SELECT NOW()');
        if (!result.rows.length) throw new Error('No result from test query');
      }
    },
    {
      name: 'PostgreSQL - Schema Check',
      fn: async () => {
        const result = await connections.postgres.query(`
          SELECT schema_name FROM information_schema.schemata
          WHERE schema_name = 'nexus_prosecreator'
        `);
        if (result.rows.length === 0) {
          logger.warn('Schema nexus_prosecreator not found. Run migrations first.');
        }
      }
    },
    {
      name: 'Neo4j - Connectivity',
      fn: async () => {
        await connections.neo4j.verifyConnectivity();
      }
    },
    {
      name: 'Neo4j - Constraints Check',
      fn: async () => {
        const result = await connections.neo4j.executeRead<{ count: number }>(
          'SHOW CONSTRAINTS YIELD name RETURN count(*) as count'
        );
        const count = result.records[0]?.get('count') || 0;
        if (count === 0) {
          logger.warn('No Neo4j constraints found. Run Cypher schema setup.');
        } else {
          logger.info(`✓ Neo4j constraints found: ${count}`);
        }
      }
    },
    {
      name: 'Qdrant - Collections Check',
      fn: async () => {
        // Import CollectionNames for checking
        const { CollectionNames } = await import('./infrastructure/QdrantCollections');
        const collections = Object.values(CollectionNames);

        for (const collection of collections) {
          const health = await connections.qdrant.checkCollectionHealth(collection);
          if (!health.exists) {
            logger.warn(`Qdrant collection ${collection} does not exist`);
          }
        }
        logger.info(`✓ Qdrant collections checked: ${collections.join(', ')}`);
      }
    }
  ];

  let failedValidations = 0;

  for (const validation of validations) {
    try {
      await validation.fn();
      logger.info(`✓ ${validation.name} - OK`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`✗ ${validation.name} - FAILED`, { error: errorMessage });
      failedValidations++;

      // Fail fast on critical validations
      if (validation.name.includes('PostgreSQL - Test Query')) {
        throw new Error(`Critical validation failed: ${validation.name}`);
      }
    }
  }

  if (failedValidations > 0) {
    logger.warn(`${failedValidations} non-critical validations failed, but continuing startup`);
  }

  logger.info('All critical system health validations passed');
}

/**
 * Start HTTP and WebSocket servers
 */
async function startServers(app: Express.Application): Promise<void> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ port: config.server.wsPort });

  wss.on('connection', (ws) => {
    logger.info('WebSocket client connected');

    ws.on('message', (message) => {
      logger.debug('WebSocket message received', { message: message.toString() });
      // TODO: Handle WebSocket messages
    });

    ws.on('close', () => {
      logger.info('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error', { error });
    });
  });

  // Start HTTP server
  return new Promise((resolve) => {
    httpServer.listen(config.server.port, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 NexusProseCreator HTTP Server started`);
      logger.info(`   Environment: ${config.server.nodeEnv}`);
      logger.info(`   HTTP Port: ${config.server.port}`);
      logger.info(`   WebSocket Port: ${config.server.wsPort}`);
      logger.info(`   Health: http://localhost:${config.server.port}/prosecreator/health`);
      logger.info('='.repeat(60));
      resolve();
    });
  });
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} signal received. Starting graceful shutdown...`);

  try {
    if (dbConnections) {
      // Close PostgreSQL
      await dbConnections.postgres.end();
      logger.info('✓ PostgreSQL pool closed');

      // Close Neo4j
      await dbConnections.neo4j.close();
      logger.info('✓ Neo4j driver closed');

      // Qdrant doesn't need explicit cleanup
      logger.info('✓ Qdrant client cleanup complete');
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

/**
 * Main startup function
 */
async function main(): Promise<void> {
  try {
    // Register process error handlers
    registerProcessErrorHandlers();

    // Initialize databases
    dbConnections = await initializeDatabases();

    // Validate system health
    await validateSystemHealth(dbConnections);

    // Create Express app
    const app = createApp();

    // Start servers
    await startServers(app);

    // Register shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
main();
