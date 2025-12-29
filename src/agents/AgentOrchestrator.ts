/**
 * Agent Orchestrator
 * Central coordinator for multi-agent creative writing system
 *
 * This is the "conductor" of the NexusProseCreator symphony. It:
 * 1. Decomposes complex writing tasks into subtasks
 * 2. Assigns optimal agents to each subtask
 * 3. Manages parallel/sequential execution
 * 4. Synthesizes multi-agent outputs into coherent content
 * 5. Ensures quality thresholds and continuity
 *
 * Key Design Patterns:
 * - Orchestrator pattern (central coordination)
 * - Strategy pattern (agent selection)
 * - Pipeline pattern (task execution flow)
 * - Circuit breaker (fault tolerance)
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  WritingTask,
  SubTask,
  AgentAssignment,
  AgentResult,
  AgentRole,
  SynthesizedOutput,
  ExecutionReport,
  OrchestrationRequest,
  OrchestrationResponse,
  QualityMetrics,
  Issue
} from './types';
import { TaskDecomposer } from './TaskDecomposer';
import { AgentRoster } from './AgentRoster';
import { MageAgentClient, getMageAgentClient } from './MageAgentClient';

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  maxParallelAgents?: number; // Default: 10
  defaultTimeout?: number; // Default: 300000 (5 min)
  qualityThreshold?: number; // Default: 80
  retryFailedSubtasks?: boolean; // Default: true
  maxRetries?: number; // Default: 2
}

/**
 * Agent Orchestrator
 * Coordinates the entire multi-agent writing process
 */
export class AgentOrchestrator extends EventEmitter {
  private taskDecomposer: TaskDecomposer;
  private mageAgentClient: MageAgentClient;
  private config: Required<OrchestratorConfig>;

  // Active orchestrations
  private activeOrchestrations: Map<string, {
    task: WritingTask;
    subtasks: SubTask[];
    assignments: AgentAssignment[];
    results: Map<string, AgentResult>;
    startTime: number;
  }> = new Map();

  constructor(
    mageAgentClient?: MageAgentClient,
    config?: OrchestratorConfig
  ) {
    super();

    this.taskDecomposer = new TaskDecomposer();
    this.mageAgentClient = mageAgentClient || getMageAgentClient();

    // Apply defaults
    this.config = {
      maxParallelAgents: config?.maxParallelAgents || 10,
      defaultTimeout: config?.defaultTimeout || 300000, // 5 minutes
      qualityThreshold: config?.qualityThreshold || 80,
      retryFailedSubtasks: config?.retryFailedSubtasks ?? true,
      maxRetries: config?.maxRetries || 2
    };
  }

  /**
   * Main orchestration entry point
   * Takes a writing task and orchestrates multiple agents to complete it
   */
  async orchestrate(request: OrchestrationRequest): Promise<SynthesizedOutput> {
    const { task, maxAgents, timeout, parallelExecution, streamProgress } = request;

    const startTime = Date.now();
    this.emit('orchestration:start', { taskId: task.taskId });

    try {
      // Step 1: Decompose task into subtasks
      const subtasks = this.decomposeWritingTask(task);
      this.emit('orchestration:decomposed', {
        taskId: task.taskId,
        subtaskCount: subtasks.length
      });

      // Step 2: Route subtasks to specialist agents
      const assignments = this.routeToSpecialists(subtasks);
      this.emit('orchestration:assigned', {
        taskId: task.taskId,
        assignments: assignments.length
      });

      // Store active orchestration
      this.activeOrchestrations.set(task.taskId, {
        task,
        subtasks,
        assignments,
        results: new Map(),
        startTime
      });

      // Step 3: Execute assignments (parallel or sequential)
      const results = parallelExecution !== false
        ? await this.parallelExecution(assignments, maxAgents, streamProgress)
        : await this.sequentialExecution(assignments, streamProgress);

      this.emit('orchestration:executed', {
        taskId: task.taskId,
        resultsCount: results.length
      });

      // Step 4: Synthesize results into final output
      const synthesized = await this.synthesizeResults(task, results);

      // Step 5: Validate quality thresholds
      await this.validateQuality(synthesized);

      this.emit('orchestration:complete', {
        taskId: task.taskId,
        duration: Date.now() - startTime
      });

      // Cleanup
      this.activeOrchestrations.delete(task.taskId);

      return synthesized;

    } catch (error: any) {
      this.emit('orchestration:error', {
        taskId: task.taskId,
        error: error.message
      });

      // Cleanup
      this.activeOrchestrations.delete(task.taskId);

      throw error;
    }
  }

  /**
   * Decompose writing task into subtasks
   */
  decomposeWritingTask(task: WritingTask): SubTask[] {
    const subtasks = this.taskDecomposer.decomposeTask(task);

    // Estimate total duration
    const estimatedDuration = this.taskDecomposer.calculateTotalDuration(subtasks);

    this.emit('task:decomposed', {
      taskId: task.taskId,
      subtaskCount: subtasks.length,
      estimatedDuration
    });

    return subtasks;
  }

  /**
   * Route subtasks to optimal specialist agents
   */
  routeToSpecialists(subtasks: SubTask[]): AgentAssignment[] {
    const assignments: AgentAssignment[] = [];

    for (const subtask of subtasks) {
      // Get agent definition (already assigned in subtask)
      const agentDefinition = subtask.assignedAgent
        ? AgentRoster.getAgent(subtask.assignedAgent)
        : null;

      if (!agentDefinition) {
        // Fallback: use prose-stylist for unassigned tasks
        const fallback = AgentRoster.getAgent('prose-stylist');
        if (!fallback) {
          throw new Error(`No agent available for subtask ${subtask.subtaskId}`);
        }

        const assignment: AgentAssignment = {
          assignmentId: uuidv4(),
          subtaskId: subtask.subtaskId,
          agentRole: 'prose-stylist',
          agentDefinition: fallback,
          task: subtask.description,
          context: subtask.context,
          timeout: subtask.estimatedDuration + 10000, // Add 10s buffer
          priority: subtask.priority
        };

        assignments.push(assignment);
      } else {
        const assignment: AgentAssignment = {
          assignmentId: uuidv4(),
          subtaskId: subtask.subtaskId,
          agentRole: agentDefinition.role,
          agentDefinition,
          task: subtask.description,
          context: subtask.context,
          timeout: subtask.estimatedDuration + 10000, // Add 10s buffer
          priority: subtask.priority
        };

        assignments.push(assignment);
      }
    }

    // Sort by priority (higher first)
    assignments.sort((a, b) => b.priority - a.priority);

    return assignments;
  }

  /**
   * Execute assignments in parallel with concurrency control
   */
  async parallelExecution(
    assignments: AgentAssignment[],
    maxAgents?: number,
    streamProgress?: boolean
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    const completed = new Set<string>();
    const executing = new Map<string, Promise<AgentResult>>();
    const maxConcurrent = maxAgents || this.config.maxParallelAgents;

    // Get initial batch of executable assignments
    let executable = this.getExecutableAssignments(assignments, completed);

    while (executable.length > 0 || executing.size > 0) {
      // Start new executions up to max concurrency
      while (executing.size < maxConcurrent && executable.length > 0) {
        const assignment = executable.shift()!;

        const promise = this.executeAgentAssignment(assignment, streamProgress)
          .then(result => {
            // Mark as completed
            completed.add(assignment.subtaskId);
            executing.delete(assignment.assignmentId);

            // Store result
            results.push(result);

            this.emit('agent:completed', {
              assignmentId: assignment.assignmentId,
              agentRole: assignment.agentRole,
              status: result.status
            });

            return result;
          })
          .catch(error => {
            executing.delete(assignment.assignmentId);

            this.emit('agent:failed', {
              assignmentId: assignment.assignmentId,
              agentRole: assignment.agentRole,
              error: error.message
            });

            // Create failed result
            const failedResult: AgentResult = {
              assignmentId: assignment.assignmentId,
              subtaskId: assignment.subtaskId,
              agentRole: assignment.agentRole,
              status: 'failed',
              confidence: 0,
              error: error.message
            };

            results.push(failedResult);
            completed.add(assignment.subtaskId);

            return failedResult;
          });

        executing.set(assignment.assignmentId, promise);
      }

      // Wait for at least one to complete
      if (executing.size > 0) {
        await Promise.race(Array.from(executing.values()));
      }

      // Get next batch of executable assignments
      executable = this.getExecutableAssignments(assignments, completed);
    }

    return results;
  }

  /**
   * Execute assignments sequentially
   */
  async sequentialExecution(
    assignments: AgentAssignment[],
    streamProgress?: boolean
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    const completed = new Set<string>();

    // Process in dependency order
    while (completed.size < assignments.length) {
      const executable = this.getExecutableAssignments(assignments, completed);

      if (executable.length === 0) {
        // Deadlock or circular dependency
        throw new Error('No executable assignments (possible circular dependency)');
      }

      // Execute next assignment
      const assignment = executable[0];

      try {
        const result = await this.executeAgentAssignment(assignment, streamProgress);
        results.push(result);
        completed.add(assignment.subtaskId);

        this.emit('agent:completed', {
          assignmentId: assignment.assignmentId,
          agentRole: assignment.agentRole
        });
      } catch (error: any) {
        // Create failed result
        const failedResult: AgentResult = {
          assignmentId: assignment.assignmentId,
          subtaskId: assignment.subtaskId,
          agentRole: assignment.agentRole,
          status: 'failed',
          confidence: 0,
          error: error.message
        };

        results.push(failedResult);
        completed.add(assignment.subtaskId);

        this.emit('agent:failed', {
          assignmentId: assignment.assignmentId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get assignments that can be executed now (dependencies satisfied)
   */
  private getExecutableAssignments(
    assignments: AgentAssignment[],
    completed: Set<string>
  ): AgentAssignment[] {
    return assignments.filter(assignment => {
      // Already completed
      if (completed.has(assignment.subtaskId)) {
        return false;
      }

      // Find corresponding subtask to check dependencies
      // (In a full implementation, we'd maintain this mapping)
      // For now, assume no dependencies or all satisfied
      return true;
    });
  }

  /**
   * Execute single agent assignment
   */
  private async executeAgentAssignment(
    assignment: AgentAssignment,
    streamProgress?: boolean
  ): Promise<AgentResult> {
    this.emit('agent:start', {
      assignmentId: assignment.assignmentId,
      agentRole: assignment.agentRole
    });

    try {
      // Call MageAgent to spawn specialized agent
      const result = await this.mageAgentClient.spawnAgent({
        role: assignment.agentRole,
        task: assignment.task,
        context: assignment.context,
        timeout: assignment.timeout
      });

      // Retry logic for failed tasks
      if (
        result.status === 'failed' &&
        this.config.retryFailedSubtasks
      ) {
        let retryCount = 0;
        let lastError = result.error;

        while (retryCount < this.config.maxRetries) {
          this.emit('agent:retry', {
            assignmentId: assignment.assignmentId,
            attempt: retryCount + 1
          });

          try {
            const retryResult = await this.mageAgentClient.spawnAgent({
              role: assignment.agentRole,
              task: assignment.task,
              context: assignment.context,
              timeout: assignment.timeout
            });

            if (retryResult.status === 'completed') {
              return retryResult;
            }

            lastError = retryResult.error;
          } catch (error: any) {
            lastError = error.message;
          }

          retryCount++;
        }

        // All retries failed
        return {
          ...result,
          error: lastError || 'Agent execution failed after retries'
        };
      }

      return result;

    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Synthesize multiple agent results into coherent final output
   */
  async synthesizeResults(
    task: WritingTask,
    results: AgentResult[]
  ): Promise<SynthesizedOutput> {
    this.emit('synthesis:start', { taskId: task.taskId });

    // Filter successful results
    const successfulResults = results.filter(r => r.status === 'completed');

    if (successfulResults.length === 0) {
      throw new Error('No successful agent results to synthesize');
    }

    // Call MageAgent synthesis endpoint
    const synthesized = await this.mageAgentClient.synthesize({
      taskId: task.taskId,
      agentResults: successfulResults,
      context: task.context
    });

    this.emit('synthesis:complete', {
      taskId: task.taskId,
      wordCount: synthesized.wordCount
    });

    return synthesized;
  }

  /**
   * Validate quality metrics against thresholds
   */
  private async validateQuality(output: SynthesizedOutput): Promise<void> {
    const { qualityMetrics, issues } = output;

    // Check overall quality
    if (qualityMetrics.overallScore < this.config.qualityThreshold) {
      this.emit('quality:warning', {
        type: 'overall_score',
        score: qualityMetrics.overallScore,
        threshold: this.config.qualityThreshold
      });
    }

    // Check consistency
    if (qualityMetrics.consistencyScore < 90) {
      this.emit('quality:warning', {
        type: 'consistency',
        score: qualityMetrics.consistencyScore
      });
    }

    // Check AI detection
    if (qualityMetrics.aiDetectionProbability > 10) {
      this.emit('quality:warning', {
        type: 'ai_detection',
        probability: qualityMetrics.aiDetectionProbability
      });
    }

    // Check for critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      this.emit('quality:critical_issues', {
        count: criticalIssues.length,
        issues: criticalIssues
      });
    }
  }

  /**
   * Get execution report for a task
   */
  async getExecutionReport(taskId: string): Promise<ExecutionReport> {
    const orchestration = this.activeOrchestrations.get(taskId);

    if (!orchestration) {
      throw new Error(`No active orchestration found for task ${taskId}`);
    }

    const { subtasks, results, startTime } = orchestration;
    const completed = Array.from(results.values()).filter(r => r.status === 'completed').length;
    const failed = Array.from(results.values()).filter(r => r.status === 'failed').length;

    const allIssues: Issue[] = [];
    const recommendations: string[] = [];

    // Collect issues from results
    for (const result of results.values()) {
      if (result.flaggedIssues) {
        allIssues.push(...result.flaggedIssues);
      }
      if (result.suggestions) {
        recommendations.push(...result.suggestions);
      }
    }

    return {
      taskId,
      status: completed === subtasks.length ? 'completed' :
              failed > 0 ? 'partial' : 'failed',
      totalSubtasks: subtasks.length,
      completedSubtasks: completed,
      failedSubtasks: failed,
      results: Array.from(results.values()),
      duration: Date.now() - startTime,
      issues: allIssues,
      recommendations: Array.from(new Set(recommendations))
    };
  }

  /**
   * Cancel active orchestration
   */
  async cancelOrchestration(taskId: string): Promise<void> {
    const orchestration = this.activeOrchestrations.get(taskId);

    if (!orchestration) {
      throw new Error(`No active orchestration found for task ${taskId}`);
    }

    // Cancel MageAgent task
    await this.mageAgentClient.cancelTask(taskId);

    // Cleanup
    this.activeOrchestrations.delete(taskId);

    this.emit('orchestration:cancelled', { taskId });
  }

  /**
   * Get orchestrator health status
   */
  async getHealth(): Promise<{
    healthy: boolean;
    activeOrchestrations: number;
    mageAgentHealthy: boolean;
    mageAgentLatency?: number;
  }> {
    const mageAgentHealth = await this.mageAgentClient.healthCheck();

    return {
      healthy: mageAgentHealth.healthy,
      activeOrchestrations: this.activeOrchestrations.size,
      mageAgentHealthy: mageAgentHealth.healthy,
      mageAgentLatency: mageAgentHealth.latency
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Cancel all active orchestrations
    const taskIds = Array.from(this.activeOrchestrations.keys());
    await Promise.all(
      taskIds.map(taskId => this.cancelOrchestration(taskId).catch(() => {}))
    );

    // Cleanup MageAgent client
    await this.mageAgentClient.cleanup();

    // Remove all listeners
    this.removeAllListeners();
  }
}

/**
 * Create orchestrator with default config
 */
export function createOrchestrator(config?: OrchestratorConfig): AgentOrchestrator {
  return new AgentOrchestrator(undefined, config);
}
