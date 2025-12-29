# NexusProseCreator - MageAgent Integration Layer

## Overview

The MageAgent Integration Layer is the **core orchestration system** for NexusProseCreator, enabling dynamic spawning of 50+ specialized AI agents for creative writing tasks. This system decomposes complex writing tasks into atomic subtasks and coordinates multiple agents to execute them in parallel or sequence.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WRITING TASK INPUT                          │
│  (Generate Chapter, Create Character, Refine Dialogue, etc.)   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AGENT ORCHESTRATOR                            │
│  • Receives writing task                                        │
│  • Coordinates entire workflow                                  │
│  • Manages quality gates                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TASK DECOMPOSER                              │
│  • Breaks task into subtasks                                    │
│  • Identifies dependencies                                      │
│  • Estimates duration                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT ROSTER                                 │
│  • 56 specialized agents across 10 categories                   │
│  • Selects optimal agent for each subtask                       │
│  • Provides agent definitions and capabilities                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MAGEAGENT CLIENT                               │
│  • HTTP/WebSocket communication                                 │
│  • Spawns agents dynamically                                    │
│  • Monitors progress via streaming                              │
│  • Handles retries and circuit breaking                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               PARALLEL/SEQUENTIAL EXECUTION                      │
│  • Executes independent tasks in parallel                       │
│  • Respects dependencies for sequential tasks                   │
│  • Max concurrency control (default: 10 agents)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RESULT SYNTHESIS                              │
│  • Combines multi-agent outputs                                 │
│  • Harmonizes style and voice                                   │
│  • Eliminates contradictions                                    │
│  • Produces final coherent content                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  QUALITY VALIDATION                             │
│  • Checks quality metrics (consistency, AI detection, etc.)     │
│  • Validates against thresholds                                 │
│  • Flags critical issues                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINAL OUTPUT                                 │
│  • Synthesized content                                          │
│  • Quality metrics (98%+ consistency, <5% AI detection)         │
│  • Agent contributions                                          │
│  • Metadata (tokens, cost, duration)                            │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
agents/
├── types.ts                  # TypeScript interfaces (239 lines)
├── AgentRoster.ts            # 56 specialized agents (1,344 lines)
├── MageAgentClient.ts        # HTTP/WebSocket client (535 lines)
├── TaskDecomposer.ts         # Task breakdown logic (648 lines)
├── AgentOrchestrator.ts      # Central coordinator (526 lines)
├── index.ts                  # Public exports
└── README.md                 # This file
```

**Total**: ~3,300 lines of production-ready TypeScript

## Agent Categories & Count

| Category | Agents | Purpose |
|----------|--------|---------|
| **Orchestration** | 2 | Central coordination and synthesis |
| **Story Planning** | 7 | Plot structure, pacing, tension, foreshadowing |
| **Character Development** | 6 | Psychology, dialogue, arcs, relationships |
| **World-Building** | 7 | Lore, culture, magic systems, geography |
| **Writing Style** | 7 | Prose, metaphors, sensory details, emotion |
| **Research** | 6 | Historical, technical, cultural accuracy |
| **Quality Assurance** | 7 | Continuity, plot holes, grammar, originality |
| **Anti-AI-Detection** | 6 | Humanization, vocabulary, rhythm, voice |
| **Genre-Specific** | 7 | Mystery, romance, sci-fi, fantasy, horror |
| **Format-Specific** | 5 | Screenplay, YouTube, stage play, comic books |

**Total**: **56 Specialized Agents**

## Key Features

### 1. **Unlimited Agent Spawning**
- Dynamically spawns as many agents as needed (no hard limits)
- Default concurrency: 10 agents (configurable)
- Intelligent queue management for large tasks

### 2. **Intelligent Task Decomposition**
Example: Chapter generation → 11 subtasks:
1. Chapter planning
2. Character state analysis
3. Topic research (if needed)
4. Scene 1-4 generation (parallel)
5. Dialogue enhancement
6. Sensory enrichment
7. Pacing optimization
8. Continuity validation
9. Humanization
10. AI detection scoring
11. Final synthesis

### 3. **Dependency-Aware Execution**
- Automatically resolves task dependencies
- Executes independent tasks in parallel
- Sequential execution for dependent tasks
- Critical path optimization

### 4. **Production-Grade Error Handling**
- Circuit breaker pattern (opens after 5 failures)
- Retry with exponential backoff (3 attempts)
- Graceful degradation
- Comprehensive error context

### 5. **Real-Time Progress Streaming**
- WebSocket integration for live updates
- Progress tracking (0-100%)
- Agent status notifications
- Estimated time remaining

### 6. **Quality Assurance**
- Configurable quality thresholds
- Multi-dimensional quality metrics:
  - Overall score (target: 80+)
  - Consistency score (target: 98+)
  - AI detection probability (target: <5%)
  - Voice consistency (target: 95+)
  - Plot continuity (target: 98+)
- Automatic issue flagging (low/medium/high/critical)

## Usage Examples

### Example 1: Generate a Chapter

```typescript
import { createOrchestrator, WritingTaskType, ContentFormat } from './agents';

const orchestrator = createOrchestrator({
  maxParallelAgents: 15,
  qualityThreshold: 85
});

const task = {
  taskId: 'chapter-5-uuid',
  type: WritingTaskType.GENERATE_CHAPTER,
  projectId: 'project-uuid',
  context: {
    projectId: 'project-uuid',
    currentChapter: 5,
    genre: 'fantasy',
    format: ContentFormat.NOVEL,
    memory: {
      plotThreads: [
        {
          id: 'thread-1',
          name: 'The Quest for the Crystal',
          status: 'developing',
          introducedChapter: 1,
          relatedCharacters: ['Alice', 'Bob'],
          importance: 'main'
        }
      ],
      characters: [
        {
          id: 'char-1',
          name: 'Alice',
          role: 'protagonist',
          personality: ['brave', 'curious', 'stubborn'],
          motivations: ['Find her missing brother'],
          voicePatterns: {
            vocabulary: ['perhaps', 'certainly', 'indeed'],
            formality: 'formal',
            verbosity: 'concise'
          }
        }
      ],
      locations: [],
      worldRules: [],
      previousBeats: [
        'Alice discovered the ancient map',
        'Bob revealed his true identity',
        'They entered the Forbidden Forest'
      ]
    }
  },
  requirements: {
    targetWordCount: 3000,
    povCharacter: 'Alice',
    tense: 'past',
    emotionalTone: ['suspenseful', 'mysterious']
  },
  constraints: {
    aiDetectionTarget: 5,
    consistencyMinimum: 95
  }
};

const result = await orchestrator.orchestrate({
  task,
  maxAgents: 15,
  parallelExecution: true,
  streamProgress: true
});

console.log('Generated Chapter:', result.content);
console.log('Word Count:', result.wordCount);
console.log('Quality Metrics:', result.qualityMetrics);
// {
//   overallScore: 92,
//   consistencyScore: 98,
//   aiDetectionProbability: 3.2,
//   voiceConsistency: 96,
//   plotContinuity: 99
// }

console.log('Agents Used:', result.metadata.agentsUsed); // 15
console.log('Total Duration:', result.metadata.totalDuration); // 45000ms
console.log('Estimated Cost:', result.metadata.estimatedCost); // $0.23
```

### Example 2: Create a Character

```typescript
const characterTask = {
  taskId: 'create-villain-uuid',
  type: WritingTaskType.CREATE_CHARACTER,
  projectId: 'project-uuid',
  context: {
    projectId: 'project-uuid',
    genre: 'fantasy',
    format: ContentFormat.NOVEL,
    memory: {
      plotThreads: [],
      characters: [], // Existing characters
      locations: [],
      worldRules: [],
      previousBeats: []
    }
  },
  requirements: {
    // Character brief passed in context
  },
  constraints: {}
};

const characterResult = await orchestrator.orchestrate({
  task: characterTask,
  maxAgents: 5
});

// Returns comprehensive character profile:
// - Psychological profile
// - Backstory
// - Voice fingerprint
// - Character arc
// - Relationships
```

### Example 3: Humanize Content (Anti-AI-Detection)

```typescript
const humanizeTask = {
  taskId: 'humanize-chapter-uuid',
  type: WritingTaskType.HUMANIZE_CONTENT,
  projectId: 'project-uuid',
  context: {
    projectId: 'project-uuid',
    genre: 'thriller',
    format: ContentFormat.NOVEL,
    memory: {
      plotThreads: [],
      characters: [],
      locations: [],
      worldRules: [],
      previousBeats: ['The content to humanize...']
    }
  },
  requirements: {},
  constraints: {
    aiDetectionTarget: 3 // Target <3% AI detection
  }
};

const humanizedResult = await orchestrator.orchestrate({
  task: humanizeTask,
  maxAgents: 6 // Uses all 6 anti-AI-detection agents
});

console.log('AI Detection Probability:', humanizedResult.qualityMetrics.aiDetectionProbability);
// Expected: <5% (ideally <3%)
```

### Example 4: Check Continuity

```typescript
const continuityTask = {
  taskId: 'check-continuity-uuid',
  type: WritingTaskType.CHECK_CONTINUITY,
  projectId: 'project-uuid',
  context: {
    projectId: 'project-uuid',
    currentChapter: 10,
    genre: 'fantasy',
    format: ContentFormat.NOVEL,
    memory: {
      plotThreads: [...], // All active plot threads
      characters: [...],  // All characters
      locations: [...],   // All locations
      worldRules: [...],  // Magic systems, tech rules, etc.
      previousBeats: [...] // Content from chapters 1-10
    }
  },
  requirements: {},
  constraints: {
    consistencyMinimum: 98
  }
};

const continuityResult = await orchestrator.orchestrate({
  task: continuityTask,
  maxAgents: 7 // Uses all continuity/QA agents
});

console.log('Continuity Issues:', continuityResult.issues);
// [
//   {
//     issueId: 'issue-1',
//     type: 'continuity',
//     severity: 'high',
//     description: 'Character eye color changed (Ch3: blue → Ch10: green)',
//     location: { chapter: 10, beat: 5 },
//     suggestedFix: 'Correct Chapter 10 to use blue eyes',
//     detectedBy: 'continuity-checker'
//   }
// ]
```

### Example 5: Real-Time Progress Monitoring

```typescript
// Enable streaming for long operations
const orchestrator = createOrchestrator();

orchestrator.on('orchestration:start', (data) => {
  console.log(`Starting orchestration for task ${data.taskId}`);
});

orchestrator.on('orchestration:decomposed', (data) => {
  console.log(`Task decomposed into ${data.subtaskCount} subtasks`);
});

orchestrator.on('agent:start', (data) => {
  console.log(`Agent ${data.agentRole} started (${data.assignmentId})`);
});

orchestrator.on('agent:completed', (data) => {
  console.log(`Agent ${data.agentRole} completed`);
});

orchestrator.on('synthesis:start', (data) => {
  console.log(`Synthesizing results for task ${data.taskId}`);
});

orchestrator.on('orchestration:complete', (data) => {
  console.log(`Orchestration complete in ${data.duration}ms`);
});

const result = await orchestrator.orchestrate({
  task: myTask,
  streamProgress: true
});
```

## Agent Roster Reference

### Orchestration Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `director` | 10 | 1-3s | GPT-4o |
| `synthesis-agent` | 9 | 2-5s | Claude Opus 4 |

### Story Planning Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `plot-architect` | 9 | 5-10s | GPT-4o |
| `subplot-weaver` | 7 | 4-8s | Claude Sonnet 3.7 |
| `pacing-optimizer` | 8 | 3-6s | Claude Sonnet 3.7 |
| `tension-builder` | 8 | 3-7s | GPT-4o |
| `foreshadowing-specialist` | 7 | 4-8s | Claude Opus 4 |
| `theme-analyst` | 6 | 5-10s | Claude Opus 4 |
| `story-structure-expert` | 7 | 4-9s | GPT-4o |

### Character Development Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `character-psychologist` | 9 | 6-12s | Claude Opus 4 |
| `dialogue-specialist` | 9 | 3-6s | Gemini 2.0 Flash |
| `arc-designer` | 8 | 5-10s | Claude Opus 4 |
| `relationship-mapper` | 7 | 4-8s | GPT-4o |
| `voice-consistency-guard` | 9 | 2-5s | Claude Opus 4 |
| `character-evolution-tracker` | 8 | 3-6s | GPT-4o |

### World-Building Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `lore-keeper` | 7 | 6-12s | Claude Opus 4 |
| `culture-designer` | 7 | 7-14s | GPT-4o |
| `magic-system-architect` | 8 | 8-15s | Claude Opus 4 |
| `geography-expert` | 6 | 5-10s | GPT-4o |
| `timeline-guardian` | 8 | 4-8s | GPT-4o |
| `technology-consultant` | 6 | 5-10s | GPT-4o |
| `economy-systems-designer` | 5 | 6-12s | GPT-4o |

### Writing Style Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `prose-stylist` | 9 | 4-9s | Claude Opus 4 |
| `metaphor-crafter` | 7 | 3-7s | Claude Opus 4 |
| `sensory-detail-expert` | 8 | 4-8s | Claude Opus 4 |
| `emotion-resonance-analyzer` | 8 | 5-10s | Claude Opus 4 |
| `show-dont-tell-enforcer` | 8 | 3-7s | Claude Sonnet 3.7 |
| `literary-device-specialist` | 6 | 4-8s | Claude Opus 4 |
| `pov-consistency-checker` | 8 | 2-5s | GPT-4o |

### Research Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `historical-researcher` | 7 | 10-20s | GPT-4o + LearningAgent |
| `technical-consultant` | 7 | 10-20s | GPT-4o + LearningAgent |
| `cultural-sensitivity-advisor` | 8 | 8-15s | Claude Opus 4 |
| `language-consultant` | 6 | 5-10s | GPT-4o |
| `fact-checker` | 7 | 8-15s | GPT-4o + LearningAgent |
| `subject-matter-expert` | 6 | 10-20s | GPT-4o + LearningAgent |

### Quality Assurance Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `continuity-checker` | 9 | 5-10s | GPT-4o |
| `plot-hole-detector` | 9 | 6-12s | Claude Opus 4 |
| `redundancy-eliminator` | 7 | 3-6s | GPT-4o |
| `cliche-detector` | 7 | 4-8s | Claude Opus 4 |
| `originality-assessor` | 7 | 6-12s | Claude Opus 4 |
| `grammar-perfectionist` | 8 | 2-5s | GPT-4o |
| `consistency-validator` | 9 | 5-10s | GPT-4o |

### Anti-AI-Detection Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `human-imperfection-injector` | 9 | 4-8s | Multi-Model Ensemble |
| `vocabulary-diversifier` | 9 | 3-6s | Multi-Model Ensemble |
| `sentence-structure-variator` | 9 | 3-7s | Multi-Model Ensemble |
| `rhythm-naturalizer` | 8 | 4-8s | Multi-Model Ensemble |
| `voice-authenticator` | 9 | 5-10s | Claude Opus 4 |
| `ai-detection-scorer` | 10 | 6-12s | Multi-Model Ensemble |

### Genre-Specific Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `mystery-clue-placer` | 8 | 5-10s | GPT-4o |
| `romance-tension-builder` | 8 | 5-10s | Claude Opus 4 |
| `scifi-worldbuilding-tech` | 8 | 7-14s | GPT-4o |
| `fantasy-magic-logic` | 8 | 7-14s | Claude Opus 4 |
| `horror-atmosphere-crafter` | 8 | 5-10s | Claude Opus 4 |
| `thriller-suspense-builder` | 8 | 5-10s | GPT-4o |
| `literary-fiction-depth-analyzer` | 7 | 8-15s | Claude Opus 4 |

### Format-Specific Agents

| Agent | Priority | Duration | Model |
|-------|----------|----------|-------|
| `screenplay-formatter` | 9 | 4-8s | GPT-4o |
| `youtube-script-optimizer` | 8 | 3-6s | Gemini 2.0 Flash |
| `stage-play-director` | 7 | 4-8s | GPT-4o |
| `comic-book-panelist` | 7 | 4-8s | Gemini 2.0 Flash |
| `podcast-dialogue-flow` | 7 | 3-6s | Gemini 2.0 Flash |

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Chapter Generation** | 2-3 minutes | 3,000 words, 15 agents |
| **Scene Generation** | 30-60 seconds | 500-800 words, 5-7 agents |
| **Beat Generation** | 5-10 seconds | 100-200 words, 3-4 agents |
| **Character Creation** | 1-2 minutes | Complete profile, 5 agents |
| **Continuity Check** | 30-60 seconds | Full manuscript, 7 agents |
| **Humanization** | 30-45 seconds | 3,000 words, 6 agents |
| **Consistency Score** | 98%+ | Across entire series |
| **AI Detection** | <5% | Across all major detectors |
| **Voice Consistency** | 95%+ | Character dialogue |

## Integration Points

### GraphRAG Integration
The orchestrator retrieves context from GraphRAG:
- Plot threads
- Character states
- Location details
- World rules
- Previous beats

### LearningAgent Integration
Research agents delegate to LearningAgent for:
- Historical research
- Technical accuracy
- Fact-checking
- Subject matter expertise

### Qdrant Integration
Vector search for:
- Similar scenes/chapters
- Style matching
- Voice fingerprint comparison

### Neo4j Integration
Knowledge graph queries for:
- Character relationships
- Plot thread connections
- Location associations
- Series-wide timeline

## Error Handling

### Circuit Breaker
- Opens after 5 consecutive failures
- Prevents cascading failures
- Auto-recovery after 60 seconds
- Half-open state for testing

### Retry Logic
- 3 attempts per subtask
- Exponential backoff (1s, 2s, 4s)
- Configurable retry strategy
- Fallback to degraded mode

### Graceful Degradation
- Continues with successful subtasks
- Marks failed subtasks clearly
- Provides partial results
- Detailed error context

## Testing

See `AgentOrchestrator.test.ts` for comprehensive integration tests.

## Future Enhancements

1. **Agent Learning**: Agents learn from past successes/failures
2. **Custom Agent Creation**: Users can define custom specialist agents
3. **Agent Marketplace**: Community-contributed agents
4. **Cost Optimization**: Dynamic model selection based on task complexity
5. **Multi-Language Support**: Agents for non-English content

## License

Proprietary - Adverant Nexus

## Support

For issues or questions, contact the NexusProseCreator team.
