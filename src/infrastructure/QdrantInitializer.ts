/**
 * Qdrant Initializer for NexusProseCreator
 *
 * Handles:
 * - Collection creation with optimal settings
 * - Index optimization for small to large deployments
 * - Health checks and diagnostics
 * - Collection migration and version management
 * - Startup validation
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import {
  ALL_COLLECTIONS,
  QdrantCollectionConfig,
  CollectionName,
  CollectionNames
} from './QdrantCollections';
import { NexusProseQdrantClient, QdrantConfig } from './QdrantClient';

export interface InitializationOptions {
  forceRecreate?: boolean;          // WARNING: Deletes existing data
  skipOptimization?: boolean;        // Skip post-creation optimization
  verifyIndexing?: boolean;          // Verify vectors are indexed
  maxWaitForIndexing?: number;       // Max wait time in ms
  logLevel?: 'silent' | 'info' | 'verbose';
}

export interface CollectionHealthReport {
  collectionName: string;
  exists: boolean;
  healthy: boolean;
  pointCount: number;
  indexedVectors: number;
  indexingRatio: number;  // Percentage
  status: string;
  issues: string[];
  recommendations: string[];
}

export interface SystemHealthReport {
  healthy: boolean;
  timestamp: number;
  collections: CollectionHealthReport[];
  overallIssues: string[];
  qdrantVersion?: string;
  connectionLatency: number;
}

/**
 * Qdrant Initializer - Sets up and manages vector collections
 */
export class QdrantInitializer {
  private client: QdrantClient;
  private nexusClient: NexusProseQdrantClient;
  private logger: Logger;

  constructor(
    config: QdrantConfig,
    logger?: Logger
  ) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
      timeout: config.timeout || 30000
    });

    this.nexusClient = new NexusProseQdrantClient(config);
    this.logger = logger || new ConsoleLogger();
  }

  /**
   * Initialize all collections for NexusProseCreator
   * Safe to call on every startup - idempotent operation
   */
  async initializeCollections(
    options: InitializationOptions = {}
  ): Promise<{
    success: boolean;
    collectionsCreated: string[];
    collectionsExisting: string[];
    errors: Error[];
  }> {
    const {
      forceRecreate = false,
      skipOptimization = false,
      verifyIndexing = true,
      maxWaitForIndexing = 30000,
      logLevel = 'info'
    } = options;

    this.logger.setLevel(logLevel);
    this.logger.info('Starting Qdrant collection initialization for NexusProseCreator...');

    const result = {
      success: true,
      collectionsCreated: [] as string[],
      collectionsExisting: [] as string[],
      errors: [] as Error[]
    };

    // Test connection first
    try {
      await this.testConnection();
      this.logger.info('Qdrant connection established successfully');
    } catch (error: any) {
      result.success = false;
      result.errors.push(
        new Error(
          `Failed to connect to Qdrant: ${error.message}. ` +
          `Check that Qdrant is running and the URL is correct.`
        )
      );
      return result;
    }

    // Initialize each collection
    for (const collectionConfig of ALL_COLLECTIONS) {
      try {
        const created = await this.ensureCollection(collectionConfig, forceRecreate);

        if (created) {
          result.collectionsCreated.push(collectionConfig.name);
          this.logger.info(`✓ Created collection: ${collectionConfig.name}`);
        } else {
          result.collectionsExisting.push(collectionConfig.name);
          this.logger.info(`✓ Collection already exists: ${collectionConfig.name}`);
        }

        // Optimize collection settings
        if (!skipOptimization) {
          await this.optimizeCollection(collectionConfig);
          this.logger.verbose(`Optimized collection: ${collectionConfig.name}`);
        }

        // Verify indexing if requested
        if (verifyIndexing) {
          await this.verifyCollectionIndexing(
            collectionConfig.name as CollectionName,
            maxWaitForIndexing
          );
        }

      } catch (error: any) {
        result.success = false;
        result.errors.push(
          new Error(
            `Failed to initialize collection ${collectionConfig.name}: ${error.message}`
          )
        );
        this.logger.error(`✗ Failed: ${collectionConfig.name} - ${error.message}`);
      }
    }

    if (result.success) {
      this.logger.info('All collections initialized successfully');
      this.logger.info(`Created: ${result.collectionsCreated.length}, Existing: ${result.collectionsExisting.length}`);
    } else {
      this.logger.error(`Initialization completed with ${result.errors.length} errors`);
    }

    return result;
  }

  /**
   * Ensure a collection exists with the correct configuration
   */
  private async ensureCollection(
    config: QdrantCollectionConfig,
    forceRecreate: boolean = false
  ): Promise<boolean> {
    const exists = await this.collectionExists(config.name);

    if (exists && forceRecreate) {
      this.logger.warn(`Force recreating collection: ${config.name} - DATA WILL BE LOST`);
      await this.client.deleteCollection(config.name);
      await this.createCollection(config);
      return true;
    }

    if (exists) {
      // Verify configuration matches
      await this.verifyCollectionConfig(config);
      return false;
    }

    // Create new collection
    await this.createCollection(config);
    return true;
  }

  /**
   * Create a collection with optimal settings
   */
  private async createCollection(config: QdrantCollectionConfig): Promise<void> {
    this.logger.verbose(`Creating collection: ${config.name}`);
    this.logger.verbose(`- Vector size: ${config.vectorSize}`);
    this.logger.verbose(`- Distance: ${config.distance}`);

    try {
      await this.client.createCollection(config.name, {
        vectors: {
          size: config.vectorSize,
          distance: config.distance
        },
        optimizers_config: config.optimizerConfig || {
          deleted_threshold: 0.2,
          vacuum_min_vector_number: 1000,
          default_segment_number: 2,
          indexing_threshold: 500,
          flush_interval_sec: 5,
          max_optimization_threads: 4
        },
        hnsw_config: config.hnswConfig || {
          m: 16,
          ef_construct: 200,
          full_scan_threshold: 10000,
          on_disk: false
        },
        // Payload indexing for fast filtering
        on_disk_payload: false,
        // Replication for high availability (if Qdrant cluster is used)
        replication_factor: 2,
        write_consistency_factor: 1
      });

      this.logger.verbose(`Collection created: ${config.name}`);
    } catch (error: any) {
      throw new Error(
        `Failed to create collection ${config.name}: ${error.message}. ` +
        `Check Qdrant permissions and available disk space.`
      );
    }
  }

  /**
   * Optimize collection for better performance
   */
  private async optimizeCollection(config: QdrantCollectionConfig): Promise<void> {
    this.logger.verbose(`Optimizing collection: ${config.name}`);

    try {
      // Create payload indexes for frequently filtered fields
      const indexedFields = Object.entries(config.payloadSchema)
        .filter(([_, schema]) => schema.indexed)
        .map(([key, _]) => key);

      for (const field of indexedFields) {
        try {
          const fieldSchema = config.payloadSchema[field];
          const fieldType = this.mapPayloadTypeToQdrant(fieldSchema.type);

          await this.client.createPayloadIndex(config.name, {
            field_name: field,
            field_schema: fieldType as any
          });

          this.logger.verbose(`Created payload index: ${field} (${fieldType})`);
        } catch (error: any) {
          // Index might already exist - log warning but continue
          if (!error.message.includes('already exists')) {
            this.logger.warn(`Failed to create index for ${field}: ${error.message}`);
          }
        }
      }

      this.logger.verbose(`Optimization complete: ${config.name}`);
    } catch (error: any) {
      this.logger.warn(`Optimization failed for ${config.name}: ${error.message}`);
      // Don't throw - optimization is not critical for functionality
    }
  }

  /**
   * Map payload schema type to Qdrant field type
   */
  private mapPayloadTypeToQdrant(type: string): string {
    const typeMap: Record<string, string> = {
      'keyword': 'keyword',
      'integer': 'integer',
      'float': 'float',
      'text': 'text',
      'bool': 'bool',
      'geo': 'geo',
      'datetime': 'datetime'
    };

    return typeMap[type] || 'keyword';
  }

  /**
   * Verify collection configuration matches expected schema
   */
  private async verifyCollectionConfig(config: QdrantCollectionConfig): Promise<void> {
    try {
      const info = await this.client.getCollection(config.name);
      const vectorConfig = info.config?.params?.vectors;
      const actualSize = typeof vectorConfig === 'number' ? vectorConfig : (vectorConfig as any)?.size;
      const actualDistance = typeof vectorConfig === 'object' && vectorConfig !== null ? (vectorConfig as any)?.distance : undefined;

      if (actualSize !== config.vectorSize) {
        throw new Error(
          `Vector size mismatch for ${config.name}: ` +
          `Expected ${config.vectorSize}, got ${actualSize}. ` +
          `Collection must be recreated with correct dimensions.`
        );
      }

      if (actualDistance && typeof actualDistance === 'string' && actualDistance.toLowerCase() !== config.distance.toLowerCase()) {
        this.logger.warn(
          `Distance metric mismatch for ${config.name}: ` +
          `Expected ${config.distance}, got ${actualDistance}. ` +
          `This may affect search results.`
        );
      }
    } catch (error: any) {
      throw new Error(
        `Failed to verify collection config: ${error.message}. ` +
        `Collection may be corrupted or inaccessible.`
      );
    }
  }

  /**
   * Verify that vectors are being indexed properly
   */
  private async verifyCollectionIndexing(
    collectionName: CollectionName,
    maxWaitMs: number = 30000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const health = await this.nexusClient.checkCollectionHealth(collectionName);

      if (!health.exists) {
        throw new Error(`Collection ${collectionName} does not exist`);
      }

      // If collection is empty or fully indexed, we're good
      if (health.pointCount === 0 || health.indexedVectors === health.pointCount) {
        this.logger.verbose(
          `Collection ${collectionName} indexing verified: ` +
          `${health.indexedVectors}/${health.pointCount} vectors`
        );
        return;
      }

      // Wait and retry
      this.logger.verbose(
        `Waiting for indexing: ${health.indexedVectors}/${health.pointCount} indexed`
      );
      await this.sleep(1000);
    }

    throw new Error(
      `Collection ${collectionName} indexing timeout after ${maxWaitMs}ms. ` +
      `Indexing may be slow - check Qdrant performance and settings.`
    );
  }

  /**
   * Check if collection exists
   */
  private async collectionExists(collectionName: string): Promise<boolean> {
    try {
      await this.client.getCollection(collectionName);
      return true;
    } catch (error: any) {
      if (error.message.includes('Not found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Test connection to Qdrant
   */
  private async testConnection(): Promise<void> {
    try {
      await this.client.getCollections();
    } catch (error: any) {
      throw new Error(
        `Qdrant connection test failed: ${error.message}. ` +
        `Verify Qdrant is running and accessible at the configured URL.`
      );
    }
  }

  /**
   * Comprehensive health check of all collections
   */
  async performHealthCheck(): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const report: SystemHealthReport = {
      healthy: true,
      timestamp: Date.now(),
      collections: [],
      overallIssues: [],
      connectionLatency: 0
    };

    try {
      // Test connection and measure latency
      const connStartTime = Date.now();
      await this.testConnection();
      report.connectionLatency = Date.now() - connStartTime;

      // Get Qdrant version (optional - skip for now due to API signature)
      report.qdrantVersion = 'unknown';

      // Check each collection
      for (const collectionConfig of ALL_COLLECTIONS) {
        const collectionReport = await this.checkCollectionHealth(
          collectionConfig.name as CollectionName,
          collectionConfig
        );

        report.collections.push(collectionReport);

        if (!collectionReport.healthy) {
          report.healthy = false;
        }
      }

      // Add overall issues
      const unhealthyCollections = report.collections.filter(c => !c.healthy);
      if (unhealthyCollections.length > 0) {
        report.overallIssues.push(
          `${unhealthyCollections.length} collection(s) are unhealthy: ` +
          unhealthyCollections.map(c => c.collectionName).join(', ')
        );
      }

      const emptyCollections = report.collections.filter(c => c.pointCount === 0);
      if (emptyCollections.length === report.collections.length) {
        report.overallIssues.push(
          'All collections are empty - system may not be initialized or used yet'
        );
      }

    } catch (error: any) {
      report.healthy = false;
      report.overallIssues.push(`Health check failed: ${error.message}`);
    }

    return report;
  }

  /**
   * Check health of a specific collection
   */
  private async checkCollectionHealth(
    collectionName: CollectionName,
    config: QdrantCollectionConfig
  ): Promise<CollectionHealthReport> {
    const report: CollectionHealthReport = {
      collectionName,
      exists: false,
      healthy: true,
      pointCount: 0,
      indexedVectors: 0,
      indexingRatio: 100,
      status: 'unknown',
      issues: [],
      recommendations: []
    };

    try {
      const health = await this.nexusClient.checkCollectionHealth(collectionName);
      report.exists = health.exists;
      report.pointCount = health.pointCount;
      report.indexedVectors = health.indexedVectors;
      report.status = health.status;

      if (!health.exists) {
        report.healthy = false;
        report.issues.push('Collection does not exist');
        report.recommendations.push('Run collection initialization');
        return report;
      }

      // Calculate indexing ratio
      if (health.pointCount > 0) {
        report.indexingRatio = (health.indexedVectors / health.pointCount) * 100;

        if (report.indexingRatio < 100) {
          report.healthy = false;
          report.issues.push(
            `Only ${report.indexingRatio.toFixed(1)}% of vectors are indexed`
          );
          report.recommendations.push('Wait for indexing to complete or trigger optimization');
        }
      }

      // Check status
      if (health.status !== 'green') {
        report.healthy = false;
        report.issues.push(`Collection status is ${health.status}, expected green`);
        report.recommendations.push('Check Qdrant logs for errors');
      }

      // Performance recommendations
      if (health.pointCount > 100000 && config.hnswConfig?.on_disk === false) {
        report.recommendations.push(
          'Consider enabling on_disk storage for large collections (>100k points)'
        );
      }

    } catch (error: any) {
      report.healthy = false;
      report.issues.push(`Health check failed: ${error.message}`);
    }

    return report;
  }

  /**
   * Get NexusProseQdrantClient instance
   */
  getClient(): NexusProseQdrantClient {
    return this.nexusClient;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Logger interface
 */
interface Logger {
  setLevel(level: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  verbose(message: string): void;
}

/**
 * Console logger implementation
 */
class ConsoleLogger implements Logger {
  private level: 'silent' | 'info' | 'verbose' = 'info';

  setLevel(level: string): void {
    this.level = level as any;
  }

  info(message: string): void {
    if (this.level !== 'silent') {
      console.log(`[INFO] ${message}`);
    }
  }

  warn(message: string): void {
    if (this.level !== 'silent') {
      console.warn(`[WARN] ${message}`);
    }
  }

  error(message: string): void {
    if (this.level !== 'silent') {
      console.error(`[ERROR] ${message}`);
    }
  }

  verbose(message: string): void {
    if (this.level === 'verbose') {
      console.log(`[VERBOSE] ${message}`);
    }
  }
}

/**
 * Quick initialization function for convenience
 */
export async function initializeNexusProseQdrant(
  config: QdrantConfig,
  options?: InitializationOptions
): Promise<NexusProseQdrantClient> {
  const initializer = new QdrantInitializer(config);
  const result = await initializer.initializeCollections(options);

  if (!result.success) {
    throw new Error(
      `Failed to initialize Qdrant collections: ` +
      result.errors.map(e => e.message).join('; ')
    );
  }

  return initializer.getClient();
}
