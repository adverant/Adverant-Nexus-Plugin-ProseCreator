/**
 * Neo4j Client for NexusProseCreator
 *
 * Provides a robust wrapper around neo4j-driver with:
 * - Connection pooling and management
 * - Automatic retry logic
 * - Transaction support
 * - Error handling
 * - Health checks
 */

import neo4j, { Driver, Session, Transaction, ManagedTransaction, Result } from 'neo4j-driver';
import { NodeLabel, RelationshipLabel } from './Neo4jSchema';

/**
 * Configuration for Neo4j connection
 */
export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
  maxConnectionLifetime?: number; // milliseconds
  maxConnectionPoolSize?: number;
  connectionAcquisitionTimeout?: number; // milliseconds
  encrypted?: boolean;
}

/**
 * Query parameters type
 */
export type QueryParams = Record<string, any>;

/**
 * Transaction callback type
 */
export type TransactionWork<T> = (tx: ManagedTransaction) => Promise<T>;

/**
 * Neo4j Client
 */
export class Neo4jClient {
  private driver: Driver | null = null;
  private config: Neo4jConfig;
  private readonly defaultDatabase: string;

  constructor(config: Neo4jConfig) {
    this.config = config;
    this.defaultDatabase = config.database || 'neo4j';
  }

  /**
   * Initialize the Neo4j driver
   */
  async connect(): Promise<void> {
    if (this.driver) {
      console.warn('Neo4j driver already initialized');
      return;
    }

    try {
      this.driver = neo4j.driver(
        this.config.uri,
        neo4j.auth.basic(this.config.username, this.config.password),
        {
          maxConnectionLifetime: this.config.maxConnectionLifetime || 3 * 60 * 60 * 1000, // 3 hours
          maxConnectionPoolSize: this.config.maxConnectionPoolSize || 50,
          connectionAcquisitionTimeout: this.config.connectionAcquisitionTimeout || 60 * 1000, // 60 seconds
          encrypted: this.config.encrypted !== undefined ? this.config.encrypted : false,
        }
      );

      // Verify connectivity
      await this.verifyConnectivity();

      console.log('✅ Neo4j client connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Neo4j:', error);
      throw new Error(`Neo4j connection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify connectivity to Neo4j
   */
  async verifyConnectivity(): Promise<void> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }

    const session = this.driver.session({ database: this.defaultDatabase });

    try {
      await session.run('RETURN 1');
    } catch (error) {
      throw new Error(`Neo4j connectivity check failed: ${(error as Error).message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * Close the Neo4j driver
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      console.log('✅ Neo4j client closed');
    }
  }

  /**
   * Get a new session
   */
  getSession(database?: string): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }

    return this.driver.session({
      database: database || this.defaultDatabase,
    });
  }

  /**
   * Get the underlying driver (for advanced use cases)
   */
  getDriver(): Driver {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }

    return this.driver;
  }

  /**
   * Execute a read query
   */
  async executeRead<T = any>(
    query: string,
    params: QueryParams = {},
    database?: string
  ): Promise<Result> {
    const session = this.getSession(database);

    try {
      return await session.run(query, params);
    } catch (error) {
      this.handleError(error, query, params);
      throw error; // Re-throw after handling
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a write query
   */
  async executeWrite<T = any>(
    query: string,
    params: QueryParams = {},
    database?: string
  ): Promise<Result> {
    const session = this.getSession(database);

    try {
      return await session.run(query, params);
    } catch (error) {
      this.handleError(error, query, params);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction<T>(
    work: TransactionWork<T>,
    database?: string
  ): Promise<T> {
    const session = this.getSession(database);

    try {
      return await session.executeWrite(work);
    } catch (error) {
      this.handleError(error, 'Transaction', {});
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Execute multiple read queries in a transaction
   */
  async executeReadTransaction<T>(
    work: TransactionWork<T>,
    database?: string
  ): Promise<T> {
    const session = this.getSession(database);

    try {
      return await session.executeRead(work);
    } catch (error) {
      this.handleError(error, 'Read Transaction', {});
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Create a node
   */
  async createNode<T = any>(
    label: NodeLabel,
    properties: Record<string, any>,
    database?: string
  ): Promise<T> {
    // Generate ID if not provided
    if (!properties.id) {
      properties.id = this.generateId();
    }

    // Add timestamps
    properties.created_at = new Date().toISOString();
    if (!properties.updated_at) {
      properties.updated_at = properties.created_at;
    }

    const query = `
      CREATE (n:${label} $properties)
      RETURN n
    `;

    const result = await this.executeWrite(query, { properties }, database);

    if (result.records.length === 0) {
      throw new Error(`Failed to create ${label} node`);
    }

    return result.records[0].get('n').properties as T;
  }

  /**
   * Update a node
   */
  async updateNode<T = any>(
    label: NodeLabel,
    id: string,
    properties: Record<string, any>,
    database?: string
  ): Promise<T> {
    // Add updated_at timestamp
    properties.updated_at = new Date().toISOString();

    // Build SET clause dynamically
    const setClause = Object.keys(properties)
      .map((key) => `n.${key} = $properties.${key}`)
      .join(', ');

    const query = `
      MATCH (n:${label} {id: $id})
      SET ${setClause}
      RETURN n
    `;

    const result = await this.executeWrite(query, { id, properties }, database);

    if (result.records.length === 0) {
      throw new Error(`${label} node with id ${id} not found`);
    }

    return result.records[0].get('n').properties as T;
  }

  /**
   * Delete a node
   */
  async deleteNode(
    label: NodeLabel,
    id: string,
    detach: boolean = true,
    database?: string
  ): Promise<void> {
    const detachClause = detach ? 'DETACH ' : '';

    const query = `
      MATCH (n:${label} {id: $id})
      ${detachClause}DELETE n
    `;

    await this.executeWrite(query, { id }, database);
  }

  /**
   * Get a node by ID
   */
  async getNodeById<T = any>(
    label: NodeLabel,
    id: string,
    database?: string
  ): Promise<T | null> {
    const query = `
      MATCH (n:${label} {id: $id})
      RETURN n
    `;

    const result = await this.executeRead(query, { id }, database);

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('n').properties as T;
  }

  /**
   * Query nodes with filters
   */
  async queryNodes<T = any>(
    label: NodeLabel,
    filters: Record<string, any> = {},
    limit?: number,
    orderBy?: string,
    database?: string
  ): Promise<T[]> {
    // Build WHERE clause
    const whereConditions = Object.keys(filters).map(
      (key) => `n.${key} = $filters.${key}`
    );
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const orderClause = orderBy ? `ORDER BY n.${orderBy}` : '';

    // Build LIMIT clause
    const limitClause = limit ? `LIMIT ${limit}` : '';

    const query = `
      MATCH (n:${label})
      ${whereClause}
      RETURN n
      ${orderClause}
      ${limitClause}
    `;

    const result = await this.executeRead(query, { filters }, database);

    return result.records.map((record) => record.get('n').properties as T);
  }

  /**
   * Create a relationship
   */
  async createRelationship(
    sourceLabel: NodeLabel,
    sourceId: string,
    targetLabel: NodeLabel,
    targetId: string,
    relationshipType: RelationshipLabel,
    properties: Record<string, any> = {},
    database?: string
  ): Promise<void> {
    const query = `
      MATCH (source:${sourceLabel} {id: $sourceId})
      MATCH (target:${targetLabel} {id: $targetId})
      CREATE (source)-[r:${relationshipType} $properties]->(target)
      RETURN r
    `;

    const result = await this.executeWrite(
      query,
      { sourceId, targetId, properties },
      database
    );

    if (result.records.length === 0) {
      throw new Error(
        `Failed to create relationship ${relationshipType} between ${sourceId} and ${targetId}`
      );
    }
  }

  /**
   * Delete a relationship
   */
  async deleteRelationship(
    sourceLabel: NodeLabel,
    sourceId: string,
    targetLabel: NodeLabel,
    targetId: string,
    relationshipType: RelationshipLabel,
    database?: string
  ): Promise<void> {
    const query = `
      MATCH (source:${sourceLabel} {id: $sourceId})-[r:${relationshipType}]->(target:${targetLabel} {id: $targetId})
      DELETE r
    `;

    await this.executeWrite(query, { sourceId, targetId }, database);
  }

  /**
   * Get relationships for a node
   */
  async getRelationships<T = any>(
    label: NodeLabel,
    id: string,
    relationshipType?: RelationshipLabel,
    direction: 'outgoing' | 'incoming' | 'both' = 'both',
    database?: string
  ): Promise<Array<{ node: T; relationship: any; direction: 'outgoing' | 'incoming' }>> {
    const relTypeClause = relationshipType ? `:${relationshipType}` : '';
    let matchClause: string;

    if (direction === 'outgoing') {
      matchClause = `MATCH (n:${label} {id: $id})-[r${relTypeClause}]->(target)`;
    } else if (direction === 'incoming') {
      matchClause = `MATCH (n:${label} {id: $id})<-[r${relTypeClause}]-(target)`;
    } else {
      matchClause = `MATCH (n:${label} {id: $id})-[r${relTypeClause}]-(target)`;
    }

    const query = `
      ${matchClause}
      RETURN target, r, type(r) as relType,
             CASE
               WHEN startNode(r) = n THEN 'outgoing'
               ELSE 'incoming'
             END as direction
    `;

    const result = await this.executeRead(query, { id }, database);

    return result.records.map((record) => ({
      node: record.get('target').properties as T,
      relationship: {
        type: record.get('relType'),
        properties: record.get('r').properties,
      },
      direction: record.get('direction'),
    }));
  }

  /**
   * Check database health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    version?: string;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      if (!this.driver) {
        return {
          healthy: false,
          latency: 0,
          error: 'Driver not initialized',
        };
      }

      const session = this.driver.session({ database: this.defaultDatabase });

      try {
        const result = await session.run('CALL dbms.components()');
        const latency = Date.now() - startTime;

        const version = result.records[0]?.get('versions')[0] || 'unknown';

        return {
          healthy: true,
          latency,
          version,
        };
      } finally {
        await session.close();
      }
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Clear all data (DANGEROUS - use only for testing)
   */
  async clearDatabase(database?: string): Promise<void> {
    const session = this.getSession(database);

    try {
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('⚠️  Database cleared');
    } finally {
      await session.close();
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Handle errors with detailed logging
   */
  private handleError(error: any, query: string, params: QueryParams): void {
    console.error('❌ Neo4j Query Error:', {
      error: error.message,
      code: error.code,
      query: query.substring(0, 200), // Truncate long queries
      params,
    });

    // Provide actionable error messages
    if (error.code === 'Neo.ClientError.Statement.SyntaxError') {
      console.error('💡 Syntax error in Cypher query. Check your query syntax.');
    } else if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      console.error('💡 Authentication failed. Check your Neo4j credentials.');
    } else if (error.code === 'Neo.TransientError.Transaction.DeadlockDetected') {
      console.error('💡 Deadlock detected. Retry the transaction.');
    } else if (error.message.includes('Unable to acquire connection')) {
      console.error('💡 Connection pool exhausted. Increase maxConnectionPoolSize or check for connection leaks.');
    }
  }
}

/**
 * Create and initialize a Neo4j client
 */
export async function createNeo4jClient(config: Neo4jConfig): Promise<Neo4jClient> {
  const client = new Neo4jClient(config);
  await client.connect();
  return client;
}
