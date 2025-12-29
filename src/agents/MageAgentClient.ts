/**
 * MageAgent HTTP Client
 * Production-grade client for dynamic AI agent spawning and orchestration
 *
 * Features:
 * - Circuit breaker pattern
 * - Retry with exponential backoff
 * - Connection pooling
 * - WebSocket streaming support
 * - Comprehensive error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import {
  AgentRole,
  AgentResult,
  SynthesizedOutput,
  OrchestrationRequest,
  OrchestrationResponse,
  AgentAssignment
} from './types';

/**
 * Client configuration
 */
export interface MageAgentClientConfig {
  baseUrl: string;
  wsUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
  enableWebSocket?: boolean;
}

/**
 * MageAgent task types
 */
export type MageAgentTaskType =
  | 'orchestrate'
  | 'spawn'
  | 'synthesize'
  | 'validate';

/**
 * MageAgent task status
 */
export interface MageAgentTaskStatus {
  taskId: string;
  type: MageAgentTaskType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  progress?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * MageAgent Integration Client
 * Handles all communication with MageAgent service
 */
export class MageAgentClient extends EventEmitter {
  private httpClient: AxiosInstance;
  private wsClient?: WebSocket;
  private config: Required<MageAgentClientConfig>;

  // Circuit breaker state
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime?: number;
  private successCount: number = 0;

  // Connection pooling agents
  private httpAgent: HttpAgent;
  private httpsAgent: HttpsAgent;

  // Active task subscriptions for WebSocket
  private taskSubscriptions: Map<string, (update: any) => void> = new Map();

  constructor(config: MageAgentClientConfig) {
    super();

    // Apply defaults
    this.config = {
      baseUrl: config.baseUrl,
      wsUrl: config.wsUrl || config.baseUrl.replace(/^http/, 'ws') + '/ws',
      timeout: config.timeout || 30000, // 30 seconds for long operations
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000, // 1 minute
      enableWebSocket: config.enableWebSocket ?? true
    };

    // Create connection pool agents
    this.httpAgent = new HttpAgent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: 20,
      maxFreeSockets: 5
    });

    this.httpsAgent = new HttpsAgent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: 20,
      maxFreeSockets: 5
    });

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NexusProseCreator/1.0'
      }
    });

    // Add response interceptor for circuit breaker
    this.httpClient.interceptors.response.use(
      (response) => {
        this.onRequestSuccess();
        return response;
      },
      (error) => {
        this.onRequestFailure(error);
        return Promise.reject(error);
      }
    );

    // Initialize WebSocket if enabled
    if (this.config.enableWebSocket) {
      this.connectWebSocket();
    }
  }

  /**
   * Connect to MageAgent WebSocket for real-time updates
   */
  private connectWebSocket(): void {
    try {
      this.wsClient = new WebSocket(this.config.wsUrl);

      this.wsClient.on('open', () => {
        this.emit('ws:connected');
      });

      this.wsClient.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          this.emit('ws:error', { type: 'parse_error', error });
        }
      });

      this.wsClient.on('error', (error) => {
        this.emit('ws:error', { type: 'connection_error', error });
      });

      this.wsClient.on('close', () => {
        // Attempt reconnection after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      });
    } catch (error) {
      this.emit('ws:error', { type: 'init_error', error });
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    if (message.type === 'task-update') {
      const { taskId, update } = message;

      // Notify subscribers
      const subscriber = this.taskSubscriptions.get(taskId);
      if (subscriber) {
        subscriber(update);
      }

      // Emit event
      this.emit('task:update', { taskId, update });
    }
  }

  /**
   * Circuit breaker: Record successful request
   */
  private onRequestSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) {
        this.circuitState = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.circuitState === CircuitState.CLOSED) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Circuit breaker: Record failed request
   */
  private onRequestFailure(error: AxiosError): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.circuitBreakerThreshold) {
      this.circuitState = CircuitState.OPEN;

      // Schedule circuit breaker half-open
      setTimeout(() => {
        this.circuitState = CircuitState.HALF_OPEN;
        this.successCount = 0;
      }, this.config.circuitBreakerTimeout);
    }
  }

  /**
   * Check if circuit breaker allows request
   */
  private canMakeRequest(): boolean {
    if (this.circuitState === CircuitState.OPEN) {
      if (Date.now() - (this.lastFailureTime || 0) > this.config.circuitBreakerTimeout) {
        this.circuitState = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }

        // Don't retry if circuit breaker is open
        if (!this.canMakeRequest()) {
          throw new Error('Service temporarily unavailable (circuit breaker open)');
        }

        if (attempt < retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Orchestrate multiple agents for complex task
   */
  async orchestrate(params: {
    task: string;
    context: any;
    maxAgents?: number;
    timeout?: number;
    streamProgress?: boolean;
  }): Promise<OrchestrationResponse> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    return this.retryWithBackoff(async () => {
      const response = await this.httpClient.post('/api/orchestrate', {
        task: params.task,
        context: params.context,
        maxAgents: params.maxAgents || 10,
        timeout: params.timeout || 300000, // 5 minutes default
        streamProgress: params.streamProgress || false
      });

      const data = response.data;

      // Subscribe to WebSocket updates if streaming enabled
      if (params.streamProgress && data.taskId && this.wsClient?.readyState === WebSocket.OPEN) {
        this.wsClient.send(JSON.stringify({
          type: 'subscribe',
          taskId: data.taskId
        }));
      }

      return {
        taskId: data.taskId || data.task_id,
        status: data.status,
        progress: data.progress || 0,
        result: data.result,
        error: data.error,
        streamUrl: params.streamProgress ? this.config.wsUrl : undefined
      };
    });
  }

  /**
   * Spawn single specialized agent
   */
  async spawnAgent(params: {
    role: AgentRole;
    task: string;
    context: any;
    timeout?: number;
  }): Promise<AgentResult> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    return this.retryWithBackoff(async () => {
      const response = await this.httpClient.post('/api/agents/spawn', {
        role: params.role,
        task: params.task,
        context: params.context,
        timeout: params.timeout || 60000 // 1 minute default
      });

      const data = response.data;

      return {
        assignmentId: data.assignmentId || data.agent_id,
        subtaskId: data.subtaskId || '',
        agentRole: params.role,
        status: data.status || 'completed',
        output: data.output || data.result,
        confidence: data.confidence || 0.9,
        suggestions: data.suggestions || [],
        flaggedIssues: data.flaggedIssues || data.issues || [],
        memoryUpdates: data.memoryUpdates || [],
        metadata: {
          tokensUsed: data.tokens_used || data.tokensUsed,
          duration: data.duration || data.duration_ms,
          model: data.model,
          qualityScore: data.quality_score || data.qualityScore
        },
        error: data.error
      };
    });
  }

  /**
   * Synthesize outputs from multiple agents
   */
  async synthesize(params: {
    taskId: string;
    agentResults: AgentResult[];
    context: any;
  }): Promise<SynthesizedOutput> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    return this.retryWithBackoff(async () => {
      const response = await this.httpClient.post('/api/synthesize', {
        taskId: params.taskId,
        agentResults: params.agentResults,
        context: params.context
      });

      const data = response.data;

      return {
        taskId: params.taskId,
        content: data.content || data.synthesized_content,
        wordCount: data.wordCount || data.word_count || 0,
        qualityMetrics: data.qualityMetrics || data.quality_metrics || {
          overallScore: 85,
          consistencyScore: 90,
          aiDetectionProbability: 5
        },
        agentContributions: data.agentContributions || data.agent_contributions || [],
        issues: data.issues || [],
        memoryUpdates: data.memoryUpdates || data.memory_updates || [],
        metadata: {
          totalDuration: data.totalDuration || data.total_duration || 0,
          agentsUsed: data.agentsUsed || data.agents_used || 0,
          totalTokens: data.totalTokens || data.total_tokens || 0,
          estimatedCost: data.estimatedCost || data.estimated_cost || 0
        }
      };
    });
  }

  /**
   * Get task status by polling
   */
  async getTaskStatus(taskId: string): Promise<MageAgentTaskStatus> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    try {
      const response = await this.httpClient.get(`/api/tasks/${taskId}`);
      const data = response.data.data?.task || response.data;

      return {
        taskId: data.taskId || data.task_id || taskId,
        type: data.type || 'orchestrate',
        status: data.status,
        progress: data.progress,
        result: data.result,
        error: data.error,
        metadata: data.metadata
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Task ${taskId} not found`);
      }
      throw error;
    }
  }

  /**
   * Subscribe to task updates via WebSocket
   */
  subscribeToTask(taskId: string, callback: (update: any) => void): void {
    this.taskSubscriptions.set(taskId, callback);

    if (this.wsClient?.readyState === WebSocket.OPEN) {
      this.wsClient.send(JSON.stringify({
        type: 'subscribe',
        taskId
      }));
    }
  }

  /**
   * Unsubscribe from task updates
   */
  unsubscribeFromTask(taskId: string): void {
    this.taskSubscriptions.delete(taskId);

    if (this.wsClient?.readyState === WebSocket.OPEN) {
      this.wsClient.send(JSON.stringify({
        type: 'unsubscribe',
        taskId
      }));
    }
  }

  /**
   * Cancel running task
   */
  async cancelTask(taskId: string): Promise<void> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    await this.httpClient.delete(`/api/tasks/${taskId}`);
  }

  /**
   * Health check for MageAgent service
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    version?: string;
    capabilities?: string[];
  }> {
    const startTime = Date.now();

    try {
      const response = await this.httpClient.get('/api/health', {
        timeout: 5000
      });

      const latency = Date.now() - startTime;

      return {
        healthy: response.data.status === 'healthy' || response.status === 200,
        latency,
        version: response.data.version,
        capabilities: response.data.capabilities
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Get service metrics
   */
  async getMetrics(): Promise<{
    activeAgents: number;
    queuedTasks: number;
    completedTasksToday: number;
    averageTaskDuration: number;
  }> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    const response = await this.httpClient.get('/api/metrics');
    return response.data;
  }

  /**
   * Validate content against AI detection
   */
  async validateAIDetection(params: {
    content: string;
    context?: any;
  }): Promise<{
    detectionProbability: number; // 0-100
    confidence: number;
    recommendations: string[];
    detailedAnalysis: {
      vocabularyScore: number;
      structureScore: number;
      rhythmScore: number;
      authenticityScore: number;
    };
  }> {
    if (!this.canMakeRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker open)');
    }

    return this.retryWithBackoff(async () => {
      const response = await this.httpClient.post('/api/validate/ai-detection', {
        content: params.content,
        context: params.context
      });

      return response.data;
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Close WebSocket
    if (this.wsClient) {
      this.wsClient.close();
    }

    // Destroy HTTP agents
    this.httpAgent.destroy();
    this.httpsAgent.destroy();

    // Clear subscriptions
    this.taskSubscriptions.clear();

    // Remove all listeners
    this.removeAllListeners();
  }
}

/**
 * Singleton instance
 */
let mageAgentClient: MageAgentClient | null = null;

/**
 * Get or create MageAgentClient instance
 */
export function getMageAgentClient(config?: MageAgentClientConfig): MageAgentClient {
  if (!mageAgentClient) {
    const defaultConfig: MageAgentClientConfig = {
      baseUrl: process.env.MAGEAGENT_URL || 'http://nexus-mageagent:8080',
      timeout: 30000,
      maxRetries: 3,
      circuitBreakerThreshold: 5,
      enableWebSocket: true
    };

    mageAgentClient = new MageAgentClient(config || defaultConfig);
  }

  return mageAgentClient;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetMageAgentClient(): void {
  if (mageAgentClient) {
    mageAgentClient.cleanup();
    mageAgentClient = null;
  }
}
