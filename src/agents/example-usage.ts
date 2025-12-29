/**
 * Example Usage - MageAgent Integration Layer
 * Demonstrates how to use the orchestrator for various writing tasks
 */

import {
  createOrchestrator,
  WritingTask,
  WritingTaskType,
  ContentFormat,
  AgentRoster
} from './index';

/**
 * Example 1: Generate a complete chapter with full orchestration
 */
async function exampleGenerateChapter() {
  console.log('=== Example 1: Generate Chapter ===\n');

  const orchestrator = createOrchestrator({
    maxParallelAgents: 15,
    qualityThreshold: 85
  });

  // Set up event listeners for progress tracking
  orchestrator.on('orchestration:start', ({ taskId }) => {
    console.log(`[START] Orchestration started: ${taskId}`);
  });

  orchestrator.on('orchestration:decomposed', ({ taskId, subtaskCount }) => {
    console.log(`[DECOMPOSE] Task decomposed into ${subtaskCount} subtasks`);
  });

  orchestrator.on('agent:start', ({ agentRole, assignmentId }) => {
    console.log(`[AGENT START] ${agentRole} (${assignmentId.substring(0, 8)})`);
  });

  orchestrator.on('agent:completed', ({ agentRole }) => {
    console.log(`[AGENT DONE] ${agentRole} completed`);
  });

  orchestrator.on('synthesis:start', () => {
    console.log(`[SYNTHESIS] Combining agent outputs...`);
  });

  orchestrator.on('orchestration:complete', ({ duration }) => {
    console.log(`[COMPLETE] Orchestration finished in ${duration}ms\n`);
  });

  // Create writing task
  const task: WritingTask = {
    taskId: 'chapter-5-uuid',
    type: WritingTaskType.GENERATE_CHAPTER,
    projectId: 'project-uuid',
    context: {
      projectId: 'project-uuid',
      currentChapter: 5,
      genre: 'fantasy',
      subgenre: 'epic fantasy',
      format: ContentFormat.NOVEL,
      memory: {
        plotThreads: [
          {
            id: 'thread-1',
            name: 'The Quest for the Crystal',
            description: 'Searching for the legendary Moonstone Crystal',
            status: 'developing',
            introducedChapter: 1,
            resolvedChapter: undefined,
            relatedCharacters: ['Alice', 'Bob'],
            relatedLocations: ['Forbidden Forest', 'Crystal Cavern'],
            importance: 'main'
          },
          {
            id: 'thread-2',
            name: 'The Betrayal',
            description: 'Bob\'s hidden agenda is slowly being revealed',
            status: 'developing',
            introducedChapter: 3,
            relatedCharacters: ['Bob', 'Alice'],
            relatedLocations: [],
            importance: 'subplot'
          }
        ],
        characters: [
          {
            id: 'char-1',
            name: 'Alice',
            role: 'protagonist',
            age: 24,
            background: 'Former scholar seeking her missing brother',
            personality: ['brave', 'curious', 'stubborn', 'intelligent'],
            motivations: ['Find her brother', 'Protect the realm'],
            arc: 'From sheltered academic to confident leader',
            voicePatterns: {
              vocabulary: ['perhaps', 'certainly', 'theoretically', 'fascinating'],
              sentenceStructure: 'Moderate complexity with academic terminology',
              speechPatterns: ['Uses precise language', 'Asks questions', 'References books'],
              formality: 'formal',
              verbosity: 'moderate'
            },
            currentState: {
              location: 'Forbidden Forest',
              emotionalState: 'Anxious but determined',
              knowledge: ['Crystal location', 'Bob is hiding something']
            }
          },
          {
            id: 'char-2',
            name: 'Bob',
            role: 'supporting',
            age: 28,
            background: 'Mysterious warrior with unclear loyalties',
            personality: ['secretive', 'skilled', 'conflicted', 'protective'],
            motivations: ['Unknown primary goal', 'Protect Alice (despite conflict)'],
            arc: 'From mysterious ally to revealed double agent',
            voicePatterns: {
              vocabulary: ['trust me', 'careful', 'not now'],
              sentenceStructure: 'Short, clipped sentences',
              speechPatterns: ['Deflects questions', 'Changes subject', 'Uses action over words'],
              formality: 'informal',
              verbosity: 'terse'
            },
            currentState: {
              location: 'Forbidden Forest',
              emotionalState: 'Guilt-ridden, torn',
              knowledge: ['Crystal true purpose', 'His orders', 'Alice\'s brother\'s fate']
            }
          }
        ],
        locations: [
          {
            id: 'loc-1',
            name: 'Forbidden Forest',
            type: 'wilderness',
            description: 'Ancient, dark forest where magic runs wild',
            geography: 'Dense canopy, twisted trees, perpetual twilight',
            significance: 'Path to the Crystal Cavern',
            associatedCharacters: ['Alice', 'Bob'],
            associatedEvents: ['First meeting', 'Discovery of the map']
          }
        ],
        worldRules: [
          {
            id: 'rule-1',
            category: 'magic',
            name: 'Crystal Magic System',
            description: 'Crystals amplify innate magical abilities',
            constraints: [
              'Must be attuned to user',
              'Power drains user energy',
              'Cannot create matter from nothing'
            ],
            examples: [
              'Healing crystal accelerates natural recovery',
              'Combat crystal enhances physical strength'
            ],
            consistency: 95
          }
        ],
        previousBeats: [
          'Alice and Bob entered the Forbidden Forest at dawn',
          'Strange sounds echoed through the twisted trees',
          'Bob suddenly stopped, hand on his sword',
          'A massive shadow moved between the trees ahead'
        ]
      }
    },
    requirements: {
      targetWordCount: 3000,
      tone: 'suspenseful and mysterious',
      povCharacter: 'Alice',
      tense: 'past',
      style: 'vivid',
      emotionalTone: ['suspense', 'fear', 'determination'],
      sceneType: 'action'
    },
    constraints: {
      mustInclude: ['Encounter with forest guardian', 'Bob\'s suspicious behavior revealed'],
      mustAvoid: ['Deus ex machina', 'Info-dumping'],
      maxDuration: 180000, // 3 minutes
      aiDetectionTarget: 5,
      consistencyMinimum: 95
    }
  };

  // Execute orchestration
  const result = await orchestrator.orchestrate({
    task,
    maxAgents: 15,
    parallelExecution: true,
    streamProgress: true
  });

  // Display results
  console.log('\n=== RESULTS ===\n');
  console.log('Content Preview:');
  console.log(result.content.substring(0, 500) + '...\n');

  console.log('Quality Metrics:');
  console.log(`  Overall Score: ${result.qualityMetrics.overallScore}/100`);
  console.log(`  Consistency: ${result.qualityMetrics.consistencyScore}%`);
  console.log(`  AI Detection: ${result.qualityMetrics.aiDetectionProbability}%`);
  console.log(`  Voice Consistency: ${result.qualityMetrics.voiceConsistency}%`);
  console.log(`  Plot Continuity: ${result.qualityMetrics.plotContinuity}%\n`);

  console.log('Metadata:');
  console.log(`  Word Count: ${result.wordCount}`);
  console.log(`  Agents Used: ${result.metadata.agentsUsed}`);
  console.log(`  Duration: ${result.metadata.totalDuration}ms`);
  console.log(`  Tokens: ${result.metadata.totalTokens}`);
  console.log(`  Estimated Cost: $${result.metadata.estimatedCost.toFixed(2)}\n`);

  console.log('Agent Contributions:');
  result.agentContributions.forEach(contrib => {
    console.log(`  - ${contrib.agentRole}: ${(contrib.weight * 100).toFixed(1)}% (confidence: ${contrib.confidence})`);
  });

  if (result.issues.length > 0) {
    console.log('\nIssues Detected:');
    result.issues.forEach(issue => {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue.description}`);
    });
  }

  console.log('\n');
}

/**
 * Example 2: Create a character
 */
async function exampleCreateCharacter() {
  console.log('=== Example 2: Create Character ===\n');

  const orchestrator = createOrchestrator();

  const task: WritingTask = {
    taskId: 'create-villain-uuid',
    type: WritingTaskType.CREATE_CHARACTER,
    projectId: 'project-uuid',
    context: {
      projectId: 'project-uuid',
      genre: 'fantasy',
      format: ContentFormat.NOVEL,
      memory: {
        plotThreads: [],
        characters: [], // Existing characters would go here
        locations: [],
        worldRules: [],
        previousBeats: []
      }
    },
    requirements: {
      // Character brief would be in context
    },
    constraints: {}
  };

  const result = await orchestrator.orchestrate({
    task,
    maxAgents: 5
  });

  console.log('Character Created:', result.content.substring(0, 300) + '...\n');
}

/**
 * Example 3: Humanize content (Anti-AI-Detection)
 */
async function exampleHumanizeContent() {
  console.log('=== Example 3: Humanize Content ===\n');

  const orchestrator = createOrchestrator();

  const contentToHumanize = `
    The protagonist walked through the forest. She felt scared. The trees were dark.
    She heard a sound. It was her companion. He told her to be careful.
  `;

  const task: WritingTask = {
    taskId: 'humanize-uuid',
    type: WritingTaskType.HUMANIZE_CONTENT,
    projectId: 'project-uuid',
    context: {
      projectId: 'project-uuid',
      genre: 'fantasy',
      format: ContentFormat.NOVEL,
      memory: {
        plotThreads: [],
        characters: [],
        locations: [],
        worldRules: [],
        previousBeats: [contentToHumanize]
      }
    },
    requirements: {},
    constraints: {
      aiDetectionTarget: 3 // Target <3% AI detection
    }
  };

  const result = await orchestrator.orchestrate({
    task,
    maxAgents: 6
  });

  console.log('Humanized Content:', result.content);
  console.log(`\nAI Detection Score: ${result.qualityMetrics.aiDetectionProbability}% (target: <5%)\n`);
}

/**
 * Example 4: Agent Roster exploration
 */
function exampleAgentRoster() {
  console.log('=== Example 4: Agent Roster ===\n');

  console.log(`Total Agents: ${AgentRoster.getAgentCount()}\n`);

  const countByCategory = AgentRoster.getAgentCountByCategory();
  console.log('Agents by Category:');
  Object.entries(countByCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} agents`);
  });

  console.log('\nTop Priority Agents:');
  const topAgents = AgentRoster.getAgentsByPriority().slice(0, 10);
  topAgents.forEach(agent => {
    console.log(`  - ${agent.role} (priority: ${agent.priority}, ${agent.estimatedDuration})`);
  });

  console.log('\nRecommended Agents for Chapter Generation:');
  const recommended = AgentRoster.getRecommendedAgentsForTask('generate-chapter', 'fantasy');
  recommended.forEach(agent => {
    console.log(`  - ${agent.role} (${agent.category})`);
  });

  console.log('\n');
}

/**
 * Run all examples
 */
async function main() {
  try {
    // Example 4: Agent Roster (synchronous)
    exampleAgentRoster();

    // Example 1: Generate Chapter (main demo)
    // Uncomment to run (requires MageAgent service):
    // await exampleGenerateChapter();

    // Example 2: Create Character
    // await exampleCreateCharacter();

    // Example 3: Humanize Content
    // await exampleHumanizeContent();

    console.log('Examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use in tests or other modules
export {
  exampleGenerateChapter,
  exampleCreateCharacter,
  exampleHumanizeContent,
  exampleAgentRoster
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
