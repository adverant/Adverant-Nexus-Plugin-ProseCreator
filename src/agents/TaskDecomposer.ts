/**
 * Task Decomposer
 * Breaks complex writing tasks into manageable subtasks for agent assignment
 *
 * This module is critical for the multi-agent architecture. It analyzes
 * incoming writing tasks and decomposes them into atomic subtasks that
 * can be executed by specialized agents in parallel or sequence.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  WritingTask,
  WritingTaskType,
  SubTask,
  AgentRole,
  WritingContext
} from './types';
import { AgentRoster } from './AgentRoster';

/**
 * Chapter decomposition parameters
 */
export interface ChapterBrief {
  chapterNumber: number;
  title?: string;
  synopsis: string;
  targetWordCount: number;
  povCharacter?: string;
  sceneCount?: number;
  keyEvents: string[];
  emotionalArc?: string;
}

/**
 * Scene decomposition parameters
 */
export interface SceneBrief {
  sceneType: 'action' | 'dialogue' | 'description' | 'transition' | 'exposition';
  characters: string[];
  location: string;
  purpose: string;
  targetWordCount: number;
  emotionalTone: string;
}

/**
 * Character decomposition parameters
 */
export interface CharacterBrief {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  background: string;
  personality: string[];
  motivations: string[];
  arc?: string;
}

/**
 * Task Decomposer
 * Intelligent task breakdown for optimal agent assignment
 */
export class TaskDecomposer {

  /**
   * Decompose writing task into subtasks
   */
  decomposeTask(task: WritingTask): SubTask[] {
    switch (task.type) {
      case WritingTaskType.GENERATE_CHAPTER:
        return this.decomposeChapterGeneration(task);

      case WritingTaskType.GENERATE_SCENE:
        return this.decomposeSceneGeneration(task);

      case WritingTaskType.GENERATE_BEAT:
        return this.decomposeBeatGeneration(task);

      case WritingTaskType.CREATE_CHARACTER:
        return this.decomposeCharacterCreation(task);

      case WritingTaskType.EXPAND_OUTLINE:
        return this.decomposeOutlineExpansion(task);

      case WritingTaskType.REFINE_DIALOGUE:
        return this.decomposeDialogueRefinement(task);

      case WritingTaskType.ENHANCE_DESCRIPTION:
        return this.decomposeDescriptionEnhancement(task);

      case WritingTaskType.CHECK_CONTINUITY:
        return this.decomposeContinuityCheck(task);

      case WritingTaskType.RESEARCH_TOPIC:
        return this.decomposeResearchTask(task);

      case WritingTaskType.HUMANIZE_CONTENT:
        return this.decomposeHumanization(task);

      default:
        return this.decomposeGenericTask(task);
    }
  }

  /**
   * Decompose chapter generation into subtasks
   * A chapter typically involves: planning, scenes, dialogue, descriptions, continuity
   */
  decomposeChapterGeneration(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];
    const { context, requirements, constraints } = task;

    // 1. Chapter Structure Planning (if not provided)
    if (!context.memory?.plotThreads || context.memory.plotThreads.length === 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'chapter-planning',
        description: 'Plan chapter structure and key beats',
        assignedAgent: 'plot-architect',
        priority: 10,
        estimatedDuration: 8000,
        context: {
          chapterNumber: context.currentChapter,
          genre: context.genre,
          previousBeats: context.memory?.previousBeats || []
        }
      });
    }

    // 2. Character State Analysis
    if (context.memory?.characters && context.memory.characters.length > 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'character-state-analysis',
        description: 'Analyze character states and prepare for chapter',
        assignedAgent: 'character-psychologist',
        priority: 9,
        dependencies: subtasks.length > 0 ? [subtasks[0].subtaskId] : undefined,
        estimatedDuration: 10000,
        context: {
          characters: context.memory.characters,
          chapterNumber: context.currentChapter
        }
      });
    }

    // 3. Research Required Topics
    if (constraints.mustInclude && constraints.mustInclude.length > 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'topic-research',
        description: 'Research required topics for accuracy',
        assignedAgent: 'technical-consultant',
        priority: 8,
        estimatedDuration: 15000, // LearningAgent delegation
        context: {
          topics: constraints.mustInclude,
          genre: context.genre
        }
      });
    }

    // 4. Scene-by-Scene Generation
    const sceneCount = (task.context.currentChapter || 1) <= 3 ? 3 : 4; // More scenes in later chapters
    for (let i = 1; i <= sceneCount; i++) {
      const sceneDeps = subtasks.slice(0, 3).map(st => st.subtaskId); // Depends on planning, characters, research

      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: `scene-${i}-generation`,
        description: `Generate scene ${i} of ${sceneCount}`,
        assignedAgent: 'prose-stylist',
        priority: 7,
        dependencies: sceneDeps.length > 0 ? sceneDeps : undefined,
        estimatedDuration: 12000,
        context: {
          sceneNumber: i,
          totalScenes: sceneCount,
          chapterNumber: context.currentChapter,
          targetWordCount: Math.floor((requirements.targetWordCount || 3000) / sceneCount)
        }
      });
    }

    // 5. Dialogue Enhancement
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'dialogue-enhancement',
      description: 'Enhance dialogue for character consistency',
      assignedAgent: 'dialogue-specialist',
      priority: 8,
      dependencies: subtasks.filter(st => st.type.startsWith('scene-')).map(st => st.subtaskId),
      estimatedDuration: 8000,
      context: {
        characters: context.memory?.characters || [],
        genre: context.genre
      }
    });

    // 6. Sensory Details Addition
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'sensory-enrichment',
      description: 'Add rich sensory details to scenes',
      assignedAgent: 'sensory-detail-expert',
      priority: 7,
      dependencies: subtasks.filter(st => st.type.startsWith('scene-')).map(st => st.subtaskId),
      estimatedDuration: 9000,
      context: {
        genre: context.genre,
        locations: context.memory?.locations || []
      }
    });

    // 7. Pacing Optimization
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'pacing-optimization',
      description: 'Optimize chapter pacing and tension',
      assignedAgent: 'pacing-optimizer',
      priority: 8,
      dependencies: subtasks.filter(st =>
        st.type.startsWith('scene-') || st.type === 'dialogue-enhancement'
      ).map(st => st.subtaskId),
      estimatedDuration: 7000,
      context: {
        chapterNumber: context.currentChapter,
        targetTension: requirements.emotionalTone || []
      }
    });

    // 8. Continuity Validation
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'continuity-check',
      description: 'Validate continuity with previous chapters',
      assignedAgent: 'continuity-checker',
      priority: 9,
      dependencies: [subtasks[subtasks.length - 1].subtaskId], // Depends on pacing
      estimatedDuration: 10000,
      context: {
        chapterNumber: context.currentChapter,
        previousBeats: context.memory?.previousBeats || [],
        characters: context.memory?.characters || [],
        plotThreads: context.memory?.plotThreads || []
      }
    });

    // 9. Humanization (Anti-AI-Detection)
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'humanization',
      description: 'Apply humanization techniques to reduce AI detection',
      assignedAgent: 'human-imperfection-injector',
      priority: 9,
      dependencies: [subtasks[subtasks.length - 1].subtaskId], // Depends on continuity check
      estimatedDuration: 9000,
      context: {
        targetDetection: constraints.aiDetectionTarget || 5,
        genre: context.genre
      }
    });

    // 10. AI Detection Scoring
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'ai-detection-scoring',
      description: 'Score content against AI detection algorithms',
      assignedAgent: 'ai-detection-scorer',
      priority: 10,
      dependencies: [subtasks[subtasks.length - 1].subtaskId], // Depends on humanization
      estimatedDuration: 12000,
      context: {
        targetScore: constraints.aiDetectionTarget || 5,
        genre: context.genre
      }
    });

    // 11. Final Synthesis
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'final-synthesis',
      description: 'Synthesize all agent outputs into coherent chapter',
      assignedAgent: 'synthesis-agent',
      priority: 10,
      dependencies: [subtasks[subtasks.length - 1].subtaskId], // Depends on AI scoring
      estimatedDuration: 6000,
      context: {
        chapterNumber: context.currentChapter,
        targetWordCount: requirements.targetWordCount || 3000
      }
    });

    return subtasks;
  }

  /**
   * Decompose scene generation
   */
  decomposeSceneGeneration(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Scene Structure
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'scene-structure',
      description: 'Plan scene structure and beats',
      assignedAgent: 'plot-architect',
      priority: 9,
      estimatedDuration: 5000,
      context: task.context
    });

    // 2. Prose Generation
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'prose-generation',
      description: 'Generate scene prose',
      assignedAgent: 'prose-stylist',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 8000,
      context: task.context
    });

    // 3. Dialogue (if characters present)
    if (task.context.memory?.characters && task.context.memory.characters.length > 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'dialogue-generation',
        description: 'Generate character dialogue',
        assignedAgent: 'dialogue-specialist',
        priority: 8,
        dependencies: [subtasks[1].subtaskId],
        estimatedDuration: 6000,
        context: {
          ...task.context,
          characters: task.context.memory.characters
        }
      });
    }

    // 4. Sensory Details
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'sensory-details',
      description: 'Add sensory details',
      assignedAgent: 'sensory-detail-expert',
      priority: 7,
      dependencies: [subtasks[subtasks.length - 1].subtaskId],
      estimatedDuration: 7000,
      context: task.context
    });

    // 5. Voice Consistency
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'voice-consistency',
      description: 'Ensure POV voice consistency',
      assignedAgent: 'pov-consistency-checker',
      priority: 8,
      dependencies: [subtasks[subtasks.length - 1].subtaskId],
      estimatedDuration: 4000,
      context: task.context
    });

    // 6. Humanization
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'humanization',
      description: 'Apply humanization techniques',
      assignedAgent: 'vocabulary-diversifier',
      priority: 8,
      dependencies: [subtasks[subtasks.length - 1].subtaskId],
      estimatedDuration: 5000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose beat generation (smallest unit)
   */
  decomposeBeatGeneration(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Beat Content Generation
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'beat-content',
      description: 'Generate beat content',
      assignedAgent: 'prose-stylist',
      priority: 9,
      estimatedDuration: 4000,
      context: task.context
    });

    // 2. Continuity Check
    if (task.context.memory?.previousBeats && task.context.memory.previousBeats.length > 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'beat-continuity',
        description: 'Validate beat continuity',
        assignedAgent: 'continuity-checker',
        priority: 8,
        dependencies: [subtasks[0].subtaskId],
        estimatedDuration: 3000,
        context: {
          ...task.context,
          previousBeats: task.context.memory.previousBeats
        }
      });
    }

    // 3. Quick Humanization
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'beat-humanization',
      description: 'Apply quick humanization',
      assignedAgent: 'rhythm-naturalizer',
      priority: 7,
      dependencies: [subtasks[subtasks.length - 1].subtaskId],
      estimatedDuration: 3000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose character creation
   */
  decomposeCharacterCreation(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Psychological Profile
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'character-psychology',
      description: 'Develop character psychological profile',
      assignedAgent: 'character-psychologist',
      priority: 10,
      estimatedDuration: 12000,
      context: task.context
    });

    // 2. Backstory Development
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'character-backstory',
      description: 'Create character backstory',
      assignedAgent: 'character-psychologist',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 10000,
      context: task.context
    });

    // 3. Voice Pattern Creation
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'character-voice',
      description: 'Create character voice fingerprint',
      assignedAgent: 'dialogue-specialist',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 8000,
      context: task.context
    });

    // 4. Arc Design
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'character-arc',
      description: 'Design character development arc',
      assignedAgent: 'arc-designer',
      priority: 8,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 10000,
      context: task.context
    });

    // 5. Relationship Mapping
    if (task.context.memory?.characters && task.context.memory.characters.length > 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'character-relationships',
        description: 'Map character relationships',
        assignedAgent: 'relationship-mapper',
        priority: 7,
        dependencies: [subtasks[0].subtaskId],
        estimatedDuration: 8000,
        context: {
          ...task.context,
          existingCharacters: task.context.memory.characters
        }
      });
    }

    return subtasks;
  }

  /**
   * Decompose outline expansion
   */
  decomposeOutlineExpansion(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Structure Analysis
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'outline-analysis',
      description: 'Analyze outline structure',
      assignedAgent: 'story-structure-expert',
      priority: 9,
      estimatedDuration: 6000,
      context: task.context
    });

    // 2. Prose Expansion
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'outline-expansion',
      description: 'Expand outline to prose',
      assignedAgent: 'prose-stylist',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 10000,
      context: task.context
    });

    // 3. Detail Enhancement
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'detail-enhancement',
      description: 'Add vivid details',
      assignedAgent: 'sensory-detail-expert',
      priority: 8,
      dependencies: [subtasks[1].subtaskId],
      estimatedDuration: 8000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose dialogue refinement
   */
  decomposeDialogueRefinement(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Voice Consistency
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'dialogue-voice-check',
      description: 'Check voice consistency',
      assignedAgent: 'voice-consistency-guard',
      priority: 9,
      estimatedDuration: 5000,
      context: task.context
    });

    // 2. Dialogue Enhancement
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'dialogue-enhancement',
      description: 'Enhance dialogue quality',
      assignedAgent: 'dialogue-specialist',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 7000,
      context: task.context
    });

    // 3. Subtext Addition
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'dialogue-subtext',
      description: 'Add dialogue subtext',
      assignedAgent: 'dialogue-specialist',
      priority: 7,
      dependencies: [subtasks[1].subtaskId],
      estimatedDuration: 6000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose description enhancement
   */
  decomposeDescriptionEnhancement(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Sensory Analysis
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'sensory-analysis',
      description: 'Analyze sensory balance',
      assignedAgent: 'sensory-detail-expert',
      priority: 8,
      estimatedDuration: 5000,
      context: task.context
    });

    // 2. Detail Addition
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'detail-addition',
      description: 'Add rich descriptive details',
      assignedAgent: 'sensory-detail-expert',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 8000,
      context: task.context
    });

    // 3. Show Don't Tell
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'show-dont-tell',
      description: 'Convert telling to showing',
      assignedAgent: 'show-dont-tell-enforcer',
      priority: 8,
      dependencies: [subtasks[1].subtaskId],
      estimatedDuration: 7000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose continuity check
   */
  decomposeContinuityCheck(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Character Continuity
    if (task.context.memory?.characters) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'character-continuity',
        description: 'Check character continuity',
        assignedAgent: 'continuity-checker',
        priority: 9,
        estimatedDuration: 7000,
        context: task.context
      });
    }

    // 2. Plot Continuity
    if (task.context.memory?.plotThreads) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'plot-continuity',
        description: 'Check plot thread continuity',
        assignedAgent: 'continuity-checker',
        priority: 9,
        estimatedDuration: 8000,
        context: task.context
      });
    }

    // 3. World Continuity
    if (task.context.memory?.worldRules) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'world-continuity',
        description: 'Check world consistency',
        assignedAgent: 'continuity-checker',
        priority: 8,
        estimatedDuration: 7000,
        context: task.context
      });
    }

    // 4. Timeline Continuity
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'timeline-continuity',
      description: 'Check chronological consistency',
      assignedAgent: 'timeline-guardian',
      priority: 9,
      estimatedDuration: 6000,
      context: task.context
    });

    // 5. Plot Hole Detection
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'plot-hole-detection',
      description: 'Detect logical inconsistencies',
      assignedAgent: 'plot-hole-detector',
      priority: 9,
      dependencies: subtasks.map(st => st.subtaskId),
      estimatedDuration: 10000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose research task
   */
  decomposeResearchTask(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];
    const researchTopics = task.context.memory?.previousBeats || [];

    // Create research subtasks for each topic
    researchTopics.forEach((topic, index) => {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: `research-topic-${index + 1}`,
        description: `Research: ${topic}`,
        assignedAgent: 'technical-consultant',
        priority: 8,
        estimatedDuration: 15000, // LearningAgent delegation
        context: {
          ...task.context,
          topic
        }
      });
    });

    // Synthesis of research findings
    if (subtasks.length > 0) {
      subtasks.push({
        subtaskId: uuidv4(),
        parentTaskId: task.taskId,
        type: 'research-synthesis',
        description: 'Synthesize research findings',
        assignedAgent: 'synthesis-agent',
        priority: 8,
        dependencies: subtasks.map(st => st.subtaskId),
        estimatedDuration: 6000,
        context: task.context
      });
    }

    return subtasks;
  }

  /**
   * Decompose humanization task
   */
  decomposeHumanization(task: WritingTask): SubTask[] {
    const subtasks: SubTask[] = [];

    // 1. Vocabulary Diversification
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'vocabulary-diversification',
      description: 'Diversify vocabulary patterns',
      assignedAgent: 'vocabulary-diversifier',
      priority: 9,
      estimatedDuration: 6000,
      context: task.context
    });

    // 2. Sentence Structure Variation
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'structure-variation',
      description: 'Vary sentence structures',
      assignedAgent: 'sentence-structure-variator',
      priority: 9,
      dependencies: [subtasks[0].subtaskId],
      estimatedDuration: 7000,
      context: task.context
    });

    // 3. Rhythm Naturalization
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'rhythm-naturalization',
      description: 'Naturalize reading rhythm',
      assignedAgent: 'rhythm-naturalizer',
      priority: 8,
      dependencies: [subtasks[1].subtaskId],
      estimatedDuration: 6000,
      context: task.context
    });

    // 4. Imperfection Injection
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'imperfection-injection',
      description: 'Add human imperfections',
      assignedAgent: 'human-imperfection-injector',
      priority: 8,
      dependencies: [subtasks[2].subtaskId],
      estimatedDuration: 7000,
      context: task.context
    });

    // 5. Voice Authentication
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'voice-authentication',
      description: 'Validate authentic voice',
      assignedAgent: 'voice-authenticator',
      priority: 9,
      dependencies: [subtasks[3].subtaskId],
      estimatedDuration: 8000,
      context: task.context
    });

    // 6. AI Detection Scoring
    subtasks.push({
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'ai-detection-scoring',
      description: 'Score AI detection probability',
      assignedAgent: 'ai-detection-scorer',
      priority: 10,
      dependencies: [subtasks[4].subtaskId],
      estimatedDuration: 10000,
      context: task.context
    });

    return subtasks;
  }

  /**
   * Decompose generic task (fallback)
   */
  decomposeGenericTask(task: WritingTask): SubTask[] {
    // For unknown task types, create a single subtask
    return [{
      subtaskId: uuidv4(),
      parentTaskId: task.taskId,
      type: 'generic-task',
      description: `Execute ${task.type}`,
      assignedAgent: 'prose-stylist', // Default agent
      priority: 5,
      estimatedDuration: 10000,
      context: task.context
    }];
  }

  /**
   * Calculate total estimated duration for subtasks
   */
  calculateTotalDuration(subtasks: SubTask[]): number {
    // Account for parallel execution of independent tasks
    const dependencyMap = new Map<string, string[]>();

    subtasks.forEach(st => {
      if (st.dependencies) {
        dependencyMap.set(st.subtaskId, st.dependencies);
      }
    });

    // Simple estimation: sum of longest path (critical path)
    // In reality, independent tasks run in parallel
    let maxDuration = 0;

    subtasks.forEach(st => {
      const pathDuration = this.calculatePathDuration(st, subtasks, dependencyMap);
      maxDuration = Math.max(maxDuration, pathDuration);
    });

    return maxDuration;
  }

  /**
   * Calculate duration of longest path to a subtask
   */
  private calculatePathDuration(
    subtask: SubTask,
    allSubtasks: SubTask[],
    dependencyMap: Map<string, string[]>
  ): number {
    const deps = dependencyMap.get(subtask.subtaskId);

    if (!deps || deps.length === 0) {
      return subtask.estimatedDuration;
    }

    const depDurations = deps.map(depId => {
      const depSubtask = allSubtasks.find(st => st.subtaskId === depId);
      if (!depSubtask) return 0;
      return this.calculatePathDuration(depSubtask, allSubtasks, dependencyMap);
    });

    const maxDepDuration = Math.max(...depDurations, 0);
    return maxDepDuration + subtask.estimatedDuration;
  }

  /**
   * Get subtasks that can execute in parallel
   */
  getParallelExecutableSubtasks(subtasks: SubTask[], completed: Set<string>): SubTask[] {
    return subtasks.filter(st => {
      // Already completed
      if (completed.has(st.subtaskId)) {
        return false;
      }

      // No dependencies - can execute
      if (!st.dependencies || st.dependencies.length === 0) {
        return true;
      }

      // All dependencies completed - can execute
      return st.dependencies.every(depId => completed.has(depId));
    });
  }
}
