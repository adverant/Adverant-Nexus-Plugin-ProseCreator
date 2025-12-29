/**
 * GraphRAG HTTP Client for NexusProseCreator
 *
 * Provides robust HTTP operations for:
 * - Memory storage and retrieval
 * - Document storage with chunking
 * - Episode tracking
 * - Pattern storage
 * - Enhanced retrieval with multiple strategies
 *
 * Implements:
 * - Automatic retry with exponential backoff
 * - Connection pooling
 * - Timeout handling
 * - Comprehensive error messages
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import {
  GraphRAGConfig,
  GraphRAGError,
  MemoryId,
  DocumentId,
  EpisodeId,
  PatternId,
  MemoryResult,
  RetrievalResult,
  EnhancedResult
} from './types';

export class GraphRAGClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: GraphRAGConfig) {
    this.baseUrl = config.baseUrl;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        const url = `${config.baseURL}${config.url}`;
        console.log(`📤 GraphRAG Request: ${config.method?.toUpperCase()} ${url}`);
        return config;
      },
      (error) => {
        console.error('❌ GraphRAG Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ GraphRAG Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        return Promise.reject(this.handleAxiosError(error));
      }
    );
  }

  // ====================================================================
  // MEMORY STORAGE OPERATIONS
  // ====================================================================

  /**
   * Store a memory (quick fact, decision, insight)
   * Target latency: <50ms
   */
  async storeMemory(params: {
    content: string;
    tags: string[];
    metadata: any;
  }): Promise<MemoryId> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/memory/store', {
          content: params.content,
          tags: params.tags,
          metadata: {
            ...params.metadata,
            source: 'nexus-prosecreator',
            timestamp: new Date().toISOString()
          }
        });

        return {
          id: response.data.id || response.data.memoryId,
          timestamp: new Date(response.data.timestamp || Date.now())
        };
      } catch (error) {
        throw new GraphRAGError(
          `Failed to store memory: ${(error as Error).message}`,
          'MEMORY_STORE_FAILED',
          (error as AxiosError).response?.status,
          { content: params.content.substring(0, 100), tags: params.tags }
        );
      }
    });
  }

  /**
   * Store a document (complete content with automatic chunking)
   * Target latency: <500ms for single document
   */
  async storeDocument(params: {
    content: string;
    title: string;
    metadata: any;
  }): Promise<DocumentId> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/documents/store', {
          content: params.content,
          title: params.title,
          metadata: {
            ...params.metadata,
            source: 'nexus-prosecreator',
            timestamp: new Date().toISOString(),
            word_count: params.content.split(/\s+/).length
          }
        });

        return {
          id: response.data.id || response.data.documentId,
          chunks: response.data.chunks || response.data.chunksCreated || 1,
          timestamp: new Date(response.data.timestamp || Date.now())
        };
      } catch (error) {
        throw new GraphRAGError(
          `Failed to store document: ${(error as Error).message}`,
          'DOCUMENT_STORE_FAILED',
          (error as AxiosError).response?.status,
          { title: params.title, contentLength: params.content.length }
        );
      }
    });
  }

  /**
   * Store an episode (session event, observation, insight)
   * Target latency: <100ms
   */
  async storeEpisode(params: {
    content: string;
    type: 'system_response' | 'event' | 'observation' | 'insight';
    metadata: any;
  }): Promise<EpisodeId> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/episodes/store', {
          content: params.content,
          type: params.type,
          metadata: {
            ...params.metadata,
            source: 'nexus-prosecreator',
            timestamp: new Date().toISOString()
          }
        });

        return {
          id: response.data.id || response.data.episodeId,
          timestamp: new Date(response.data.timestamp || Date.now())
        };
      } catch (error) {
        throw new GraphRAGError(
          `Failed to store episode: ${(error as Error).message}`,
          'EPISODE_STORE_FAILED',
          (error as AxiosError).response?.status,
          { type: params.type, content: params.content.substring(0, 100) }
        );
      }
    });
  }

  /**
   * Store a pattern (successful solution, best practice)
   * Target latency: <100ms
   */
  async storePattern(params: {
    pattern: string;
    context: string;
    confidence: number;
    tags: string[];
  }): Promise<PatternId> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/patterns/store', {
          pattern: params.pattern,
          context: params.context,
          confidence: params.confidence,
          tags: params.tags,
          metadata: {
            source: 'nexus-prosecreator',
            timestamp: new Date().toISOString()
          }
        });

        return {
          id: response.data.id || response.data.patternId,
          timestamp: new Date(response.data.timestamp || Date.now())
        };
      } catch (error) {
        throw new GraphRAGError(
          `Failed to store pattern: ${(error as Error).message}`,
          'PATTERN_STORE_FAILED',
          (error as AxiosError).response?.status,
          { pattern: params.pattern.substring(0, 100) }
        );
      }
    });
  }

  // ====================================================================
  // MEMORY RETRIEVAL OPERATIONS
  // ====================================================================

  /**
   * Recall memories semantically
   * Target latency: <200ms
   */
  async recallMemory(params: {
    query: string;
    limit: number;
    score_threshold: number;
  }): Promise<MemoryResult[]> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/memory/recall', {
          query: params.query,
          limit: params.limit,
          score_threshold: params.score_threshold
        });

        const results = response.data.results || response.data.memories || [];

        return results.map((result: any) => ({
          id: result.id,
          content: result.content,
          tags: result.tags || [],
          metadata: result.metadata || {},
          score: result.score || result.relevance || 0,
          timestamp: new Date(result.timestamp || result.created_at || Date.now())
        }));
      } catch (error) {
        throw new GraphRAGError(
          `Failed to recall memory: ${(error as Error).message}`,
          'MEMORY_RECALL_FAILED',
          (error as AxiosError).response?.status,
          { query: params.query, limit: params.limit }
        );
      }
    });
  }

  /**
   * Advanced retrieval with multiple strategies
   * Target latency: <500ms
   */
  async retrieve(params: {
    query: string;
    strategy: 'semantic_chunks' | 'graph_traversal' | 'hybrid' | 'adaptive';
    limit: number;
    rerank: boolean;
  }): Promise<RetrievalResult> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/retrieval/advanced', {
          query: params.query,
          strategy: params.strategy,
          limit: params.limit,
          rerank: params.rerank
        });

        const results = response.data.results || [];

        return {
          results: results.map((result: any) => ({
            content: result.content,
            score: result.score || result.relevance || 0,
            metadata: result.metadata || {},
            source: result.source || 'document'
          })),
          totalResults: response.data.total || results.length,
          strategy: params.strategy
        };
      } catch (error) {
        throw new GraphRAGError(
          `Failed to retrieve: ${(error as Error).message}`,
          'RETRIEVAL_FAILED',
          (error as AxiosError).response?.status,
          { query: params.query, strategy: params.strategy }
        );
      }
    });
  }

  /**
   * Unified retrieval across all memory types
   * Target latency: <500ms
   */
  async enhancedRetrieve(params: {
    query: string;
    max_tokens: number;
    include_documents: boolean;
    include_episodic: boolean;
  }): Promise<EnhancedResult> {
    return this.retry(async () => {
      try {
        const response = await this.client.post('/api/retrieval/enhanced', {
          query: params.query,
          max_tokens: params.max_tokens,
          include_documents: params.include_documents,
          include_episodic: params.include_episodic
        });

        const sources = response.data.sources || [];

        return {
          context: response.data.context || '',
          tokens: response.data.tokens || response.data.tokenCount || 0,
          sources: sources.map((source: any) => ({
            type: source.type || 'document',
            content: source.content,
            relevance: source.relevance || source.score || 0
          })),
          metadata: response.data.metadata || {}
        };
      } catch (error) {
        throw new GraphRAGError(
          `Failed enhanced retrieval: ${(error as Error).message}`,
          'ENHANCED_RETRIEVAL_FAILED',
          (error as AxiosError).response?.status,
          { query: params.query, max_tokens: params.max_tokens }
        );
      }
    });
  }

  // ====================================================================
  // HEALTH CHECK
  // ====================================================================

  /**
   * Check GraphRAG service health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    version?: string;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await this.client.get('/health', {
        timeout: 5000  // Short timeout for health check
      });

      const latency = Date.now() - startTime;

      return {
        healthy: response.status === 200,
        latency,
        version: response.data.version
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  /**
   * Retry logic with exponential backoff
   */
  private async retry<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryAttempts) {
        throw error;
      }

      // Don't retry on client errors (4xx)
      if ((error as GraphRAGError).statusCode &&
          (error as GraphRAGError).statusCode! >= 400 &&
          (error as GraphRAGError).statusCode! < 500) {
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      console.log(`⚠️  GraphRAG operation failed, retrying in ${delay}ms (attempt ${attempt}/${this.retryAttempts})`);

      await this.sleep(delay);
      return this.retry(operation, attempt + 1);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle Axios errors with detailed context
   */
  private handleAxiosError(error: AxiosError): GraphRAGError {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data as any;

      let message = `GraphRAG API error (${status})`;
      if (data?.message) {
        message += `: ${data.message}`;
      } else if (data?.error) {
        message += `: ${data.error}`;
      }

      return new GraphRAGError(
        message,
        data?.code || 'API_ERROR',
        status,
        {
          url: error.config?.url,
          method: error.config?.method,
          responseData: data
        }
      );
    } else if (error.request) {
      // Request made but no response
      return new GraphRAGError(
        'GraphRAG service unavailable - no response received. Check network connectivity and service health.',
        'NO_RESPONSE',
        undefined,
        {
          url: error.config?.url,
          timeout: error.config?.timeout
        }
      );
    } else {
      // Error setting up request
      return new GraphRAGError(
        `GraphRAG request setup failed: ${error.message}`,
        'REQUEST_SETUP_ERROR',
        undefined,
        {
          message: error.message
        }
      );
    }
  }

  /**
   * Test connection to GraphRAG service
   */
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck();

      if (health.healthy) {
        console.log(`✅ GraphRAG connection successful (latency: ${health.latency}ms)`);
        return true;
      } else {
        console.error(`❌ GraphRAG unhealthy: ${health.error}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ GraphRAG connection failed:`, error);
      return false;
    }
  }

  /**
   * Get base URL for debugging
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

/**
 * Create and test GraphRAG client connection
 */
export async function createGraphRAGClient(config: GraphRAGConfig): Promise<GraphRAGClient> {
  const client = new GraphRAGClient(config);

  const connected = await client.testConnection();
  if (!connected) {
    console.warn('⚠️  GraphRAG client created but connection test failed. Operations may fail.');
  }

  return client;
}
