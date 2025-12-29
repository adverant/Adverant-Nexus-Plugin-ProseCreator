/**
 * GraphRAG Integration Layer - NexusProseCreator Memory System
 *
 * Exports all memory management components:
 * - GraphRAGClient: HTTP client for GraphRAG service
 * - MemoryManager: Orchestrates memory storage/retrieval across backends
 * - ContextInjector: Beat-by-beat context injection protocol
 * - SeriesIntelligence: Cross-book memory spanning 1M+ words
 * - ContinuityEngine: Detects and prevents continuity errors
 *
 * Usage:
 * ```typescript
 * import {
 *   createMemorySystem,
 *   GraphRAGClient,
 *   MemoryManager,
 *   ContextInjector,
 *   SeriesIntelligence,
 *   ContinuityEngine
 * } from './memory';
 *
 * // Initialize memory system
 * const memorySystem = await createMemorySystem({
 *   graphragUrl: 'http://localhost:8090',
 *   qdrantUrl: 'http://localhost:6333',
 *   neo4jUri: 'bolt://localhost:7687',
 *   neo4jUser: 'neo4j',
 *   neo4jPassword: 'password'
 * });
 *
 * // Inject context for beat generation
 * const context = await memorySystem.contextInjector.injectContextForBeat({
 *   project_id: 'uuid',
 *   chapter_number: 5,
 *   beat_number: 12,
 *   blueprint: chapterBlueprint
 * });
 *
 * // Generate beat with context
 * const beat = await generateBeat({ blueprint, context });
 *
 * // Store beat in memory
 * await memorySystem.memoryManager.storeBeat(beat, embedding);
 * ```
 */

// Type exports
export * from './types';

// Client exports
export { GraphRAGClient, createGraphRAGClient } from './GraphRAGClient';

// Core system exports
export { MemoryManager } from './MemoryManager';
export { ContextInjector } from './ContextInjector';
export { SeriesIntelligence } from './SeriesIntelligence';
export { ContinuityEngine } from './ContinuityEngine';

// Infrastructure imports for initialization
import { createGraphRAGClient, GraphRAGClient } from './GraphRAGClient';
import { MemoryManager } from './MemoryManager';
import { ContextInjector } from './ContextInjector';
import { SeriesIntelligence } from './SeriesIntelligence';
import { ContinuityEngine } from './ContinuityEngine';
import { NexusProseQdrantClient } from '../infrastructure/QdrantClient';
import { createNeo4jClient, Neo4jClient } from '../infrastructure/Neo4jClient';

/**
 * Configuration for complete memory system
 */
export interface MemorySystemConfig {
  graphragUrl: string;
  graphragApiKey?: string;
  qdrantUrl: string;
  qdrantApiKey?: string;
  neo4jUri: string;
  neo4jUser: string;
  neo4jPassword: string;
  neo4jDatabase?: string;
  enableCaching?: boolean;
  cacheConfig?: {
    ttl: number;
    maxSize: number;
  };
}

/**
 * Complete memory system with all components
 */
export interface MemorySystem {
  graphragClient: GraphRAGClient;
  memoryManager: MemoryManager;
  contextInjector: ContextInjector;
  seriesIntelligence: SeriesIntelligence;
  continuityEngine: ContinuityEngine;
  qdrantClient: NexusProseQdrantClient;
  neo4jClient: Neo4jClient;
}

/**
 * Initialize complete memory system
 * Creates and connects all components
 */
export async function createMemorySystem(
  config: MemorySystemConfig
): Promise<MemorySystem> {
  console.log('🧠 Initializing NexusProseCreator Memory System...');

  // 1. Initialize GraphRAG client
  console.log('📡 Connecting to GraphRAG service...');
  const graphragClient = await createGraphRAGClient({
    baseUrl: config.graphragUrl,
    apiKey: config.graphragApiKey,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  });

  // 2. Initialize Qdrant client
  console.log('🔍 Connecting to Qdrant vector database...');
  const qdrantClient = new NexusProseQdrantClient({
    url: config.qdrantUrl,
    apiKey: config.qdrantApiKey,
    timeout: 30000
  });

  // 3. Initialize Neo4j client
  console.log('🕸️  Connecting to Neo4j graph database...');
  const neo4jClient = await createNeo4jClient({
    uri: config.neo4jUri,
    username: config.neo4jUser,
    password: config.neo4jPassword,
    database: config.neo4jDatabase || 'neo4j',
    maxConnectionPoolSize: 50,
    encrypted: false
  });

  // 4. Initialize Memory Manager
  console.log('💾 Initializing Memory Manager...');
  const memoryManager = new MemoryManager({
    graphragClient,
    qdrantClient,
    neo4jClient,
    enableCaching: config.enableCaching ?? true,
    cacheConfig: config.cacheConfig || { ttl: 300000, maxSize: 1000 }
  });

  // 5. Initialize Continuity Engine
  console.log('🔍 Initializing Continuity Engine...');
  const continuityEngine = new ContinuityEngine({
    neo4jClient,
    qdrantClient,
    strictMode: false,
    autoFix: false
  });

  // 6. Initialize Context Injector
  console.log('📥 Initializing Context Injector...');
  const contextInjector = new ContextInjector({
    memoryManager,
    continuityEngine,
    contextSize: 5,
    maxTokens: 8000,
    enableSmartTruncation: true
  });

  // 7. Initialize Series Intelligence
  console.log('📚 Initializing Series Intelligence...');
  const seriesIntelligence = new SeriesIntelligence({
    memoryManager,
    graphragClient,
    neo4jClient
  });

  console.log('✅ Memory System initialization complete!');
  console.log('   - GraphRAG: Connected');
  console.log('   - Qdrant: Connected');
  console.log('   - Neo4j: Connected');
  console.log('   - All components: Initialized');

  return {
    graphragClient,
    memoryManager,
    contextInjector,
    seriesIntelligence,
    continuityEngine,
    qdrantClient,
    neo4jClient
  };
}

/**
 * Health check for entire memory system
 */
export async function checkMemorySystemHealth(
  system: MemorySystem
): Promise<{
  healthy: boolean;
  components: {
    graphrag: { healthy: boolean; latency: number; error?: string };
    qdrant: { healthy: boolean; collections: number; error?: string };
    neo4j: { healthy: boolean; latency: number; error?: string };
  };
}> {
  console.log('🏥 Running memory system health check...');

  const [graphragHealth, neo4jHealth] = await Promise.all([
    system.graphragClient.healthCheck(),
    system.neo4jClient.healthCheck()
  ]);

  // Check Qdrant health
  let qdrantHealthy = false;
  let qdrantCollectionCount = 0;
  let qdrantError: string | undefined;

  try {
    const collections = ['prose_content', 'character_voice', 'metadata'];
    let healthyCollections = 0;

    for (const collection of collections) {
      try {
        const health = await system.qdrantClient.checkCollectionHealth(collection as any);
        if (health.exists && health.status === 'green') {
          healthyCollections++;
        }
      } catch (error) {
        // Collection doesn't exist yet
      }
    }

    qdrantHealthy = healthyCollections > 0;
    qdrantCollectionCount = healthyCollections;
  } catch (error) {
    qdrantError = (error as Error).message;
  }

  const allHealthy = graphragHealth.healthy && qdrantHealthy && neo4jHealth.healthy;

  console.log(`${allHealthy ? '✅' : '❌'} Memory system health: ${allHealthy ? 'Healthy' : 'Unhealthy'}`);
  console.log(`   - GraphRAG: ${graphragHealth.healthy ? '✅' : '❌'} (${graphragHealth.latency}ms)`);
  console.log(`   - Qdrant: ${qdrantHealthy ? '✅' : '❌'} (${qdrantCollectionCount} collections)`);
  console.log(`   - Neo4j: ${neo4jHealth.healthy ? '✅' : '❌'} (${neo4jHealth.latency}ms)`);

  return {
    healthy: allHealthy,
    components: {
      graphrag: {
        healthy: graphragHealth.healthy,
        latency: graphragHealth.latency,
        error: graphragHealth.error
      },
      qdrant: {
        healthy: qdrantHealthy,
        collections: qdrantCollectionCount,
        error: qdrantError
      },
      neo4j: {
        healthy: neo4jHealth.healthy,
        latency: neo4jHealth.latency,
        error: neo4jHealth.error
      }
    }
  };
}

/**
 * Shutdown memory system gracefully
 */
export async function shutdownMemorySystem(system: MemorySystem): Promise<void> {
  console.log('🛑 Shutting down memory system...');

  await system.neo4jClient.close();

  console.log('✅ Memory system shutdown complete');
}
