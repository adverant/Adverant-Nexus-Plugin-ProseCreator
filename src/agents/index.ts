/**
 * MageAgent Integration Layer - Entry Point
 * NexusProseCreator - AI-Powered Creative Writing Microservice
 *
 * This module provides the complete multi-agent orchestration system
 * for creative writing tasks, supporting 50+ specialized AI agents.
 */

// Types
export * from './types';

// Agent Roster (50+ specialized agents)
export { AgentRoster } from './AgentRoster';

// MageAgent HTTP Client
export {
  MageAgentClient,
  getMageAgentClient,
  resetMageAgentClient
} from './MageAgentClient';

// Task Decomposer
export { TaskDecomposer } from './TaskDecomposer';

// Agent Orchestrator (main coordinator)
export {
  AgentOrchestrator,
  createOrchestrator
} from './AgentOrchestrator';

/**
 * Quick start example:
 *
 * ```typescript
 * import { createOrchestrator, WritingTask, WritingTaskType } from './agents';
 *
 * const orchestrator = createOrchestrator({
 *   maxParallelAgents: 10,
 *   qualityThreshold: 85
 * });
 *
 * const task: WritingTask = {
 *   taskId: 'chapter-5',
 *   type: WritingTaskType.GENERATE_CHAPTER,
 *   projectId: 'project-uuid',
 *   context: {
 *     projectId: 'project-uuid',
 *     currentChapter: 5,
 *     genre: 'fantasy',
 *     format: ContentFormat.NOVEL,
 *     memory: {
 *       plotThreads: [...],
 *       characters: [...],
 *       locations: [...],
 *       worldRules: [...],
 *       previousBeats: [...]
 *     }
 *   },
 *   requirements: {
 *     targetWordCount: 3000,
 *     povCharacter: 'Alice',
 *     tense: 'past'
 *   },
 *   constraints: {
 *     aiDetectionTarget: 5,
 *     consistencyMinimum: 95
 *   }
 * };
 *
 * const result = await orchestrator.orchestrate({
 *   task,
 *   maxAgents: 15,
 *   parallelExecution: true,
 *   streamProgress: true
 * });
 *
 * console.log('Generated content:', result.content);
 * console.log('Quality metrics:', result.qualityMetrics);
 * console.log('Agents used:', result.metadata.agentsUsed);
 * ```
 */
