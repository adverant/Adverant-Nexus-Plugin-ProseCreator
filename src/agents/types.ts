/**
 * Type definitions for MageAgent Integration
 * NexusProseCreator - Creative Writing Microservice
 */

/**
 * Agent roles in the creative writing process
 */
export type AgentRole =
  // Story Planning
  | 'plot-architect'
  | 'subplot-weaver'
  | 'pacing-optimizer'
  | 'tension-builder'
  | 'foreshadowing-specialist'
  | 'theme-analyst'
  | 'story-structure-expert'

  // Character Development
  | 'character-psychologist'
  | 'dialogue-specialist'
  | 'arc-designer'
  | 'relationship-mapper'
  | 'voice-consistency-guard'
  | 'character-evolution-tracker'

  // World-Building
  | 'lore-keeper'
  | 'culture-designer'
  | 'magic-system-architect'
  | 'geography-expert'
  | 'timeline-guardian'
  | 'technology-consultant'
  | 'economy-systems-designer'

  // Writing Style
  | 'prose-stylist'
  | 'metaphor-crafter'
  | 'sensory-detail-expert'
  | 'emotion-resonance-analyzer'
  | 'show-dont-tell-enforcer'
  | 'literary-device-specialist'
  | 'pov-consistency-checker'

  // Research
  | 'historical-researcher'
  | 'technical-consultant'
  | 'cultural-sensitivity-advisor'
  | 'language-consultant'
  | 'fact-checker'
  | 'subject-matter-expert'

  // Quality Assurance
  | 'continuity-checker'
  | 'plot-hole-detector'
  | 'redundancy-eliminator'
  | 'cliche-detector'
  | 'originality-assessor'
  | 'grammar-perfectionist'
  | 'consistency-validator'

  // Anti-AI-Detection
  | 'human-imperfection-injector'
  | 'vocabulary-diversifier'
  | 'sentence-structure-variator'
  | 'rhythm-naturalizer'
  | 'voice-authenticator'
  | 'ai-detection-scorer'

  // Genre-Specific
  | 'mystery-clue-placer'
  | 'romance-tension-builder'
  | 'scifi-worldbuilding-tech'
  | 'fantasy-magic-logic'
  | 'horror-atmosphere-crafter'
  | 'thriller-suspense-builder'
  | 'literary-fiction-depth-analyzer'

  // Format-Specific
  | 'screenplay-formatter'
  | 'youtube-script-optimizer'
  | 'stage-play-director'
  | 'comic-book-panelist'
  | 'podcast-dialogue-flow'

  // Central Orchestration
  | 'director'
  | 'synthesis-agent';

/**
 * Agent definition
 */
export interface AgentDefinition {
  role: AgentRole;
  category: AgentCategory;
  description: string;
  specializations: string[];
  capabilities: string[];
  model: AIModel;
  priority: number; // 1-10, higher = more critical
  estimatedDuration: string; // e.g., "2-5 seconds"
}

/**
 * Agent categories
 */
export enum AgentCategory {
  STORY_PLANNING = 'story-planning',
  CHARACTER = 'character',
  WORLD_BUILDING = 'world-building',
  WRITING_STYLE = 'writing-style',
  RESEARCH = 'research',
  QUALITY_ASSURANCE = 'quality-assurance',
  ANTI_AI_DETECTION = 'anti-ai-detection',
  GENRE_SPECIFIC = 'genre-specific',
  FORMAT_SPECIFIC = 'format-specific',
  ORCHESTRATION = 'orchestration'
}

/**
 * AI models used by agents
 */
export enum AIModel {
  GPT4O = 'gpt-4o',
  CLAUDE_OPUS_4 = 'claude-opus-4',
  CLAUDE_SONNET_37 = 'claude-3.7-sonnet',
  GEMINI_20_FLASH = 'gemini-2.0-flash',
  MULTI_MODEL_ENSEMBLE = 'multi-model-ensemble'
}

/**
 * Writing task types
 */
export interface WritingTask {
  taskId: string;
  type: WritingTaskType;
  projectId: string;
  seriesId?: string;
  context: WritingContext;
  requirements: WritingRequirements;
  constraints: WritingConstraints;
}

export enum WritingTaskType {
  GENERATE_BEAT = 'generate-beat',
  GENERATE_SCENE = 'generate-scene',
  GENERATE_CHAPTER = 'generate-chapter',
  CREATE_CHARACTER = 'create-character',
  EXPAND_OUTLINE = 'expand-outline',
  REFINE_DIALOGUE = 'refine-dialogue',
  ENHANCE_DESCRIPTION = 'enhance-description',
  CHECK_CONTINUITY = 'check-continuity',
  RESEARCH_TOPIC = 'research-topic',
  HUMANIZE_CONTENT = 'humanize-content'
}

/**
 * Writing context from GraphRAG and project data
 */
export interface WritingContext {
  projectId: string;
  seriesId?: string;
  currentChapter?: number;
  currentBeat?: number;
  genre: string;
  subgenre?: string;
  format: ContentFormat;

  // Memory from GraphRAG
  memory: {
    plotThreads: PlotThread[];
    characters: Character[];
    locations: Location[];
    worldRules: WorldRule[];
    previousBeats: string[];
    seriesHistory?: SeriesEvent[];
  };

  // Living blueprints
  blueprints?: {
    plotSummary?: string;
    characterBible?: string;
    worldBible?: string;
  };
}

export enum ContentFormat {
  NOVEL = 'novel',
  SCREENPLAY = 'screenplay',
  YOUTUBE_SCRIPT = 'youtube_script',
  STAGE_PLAY = 'stage_play',
  COMIC_BOOK = 'comic_book',
  PODCAST_SCRIPT = 'podcast_script',
  POETRY = 'poetry'
}

/**
 * Writing requirements
 */
export interface WritingRequirements {
  targetWordCount?: number;
  tone?: string;
  povCharacter?: string;
  tense?: 'past' | 'present' | 'future';
  style?: 'detailed' | 'concise' | 'vivid' | 'minimalist';
  emotionalTone?: string[];
  sceneType?: 'action' | 'dialogue' | 'description' | 'transition' | 'exposition';
  qualityThreshold?: number; // 0-1, minimum quality score
}

/**
 * Writing constraints
 */
export interface WritingConstraints {
  mustInclude?: string[]; // Elements that must appear
  mustAvoid?: string[]; // Elements to avoid
  maxDuration?: number; // Max generation time in ms
  aiDetectionTarget?: number; // Target AI detection score (lower better)
  consistencyMinimum?: number; // Minimum consistency score (0-100)
  genreRules?: Record<string, any>;
  formatRules?: Record<string, any>;
}

/**
 * Plot thread
 */
export interface PlotThread {
  id: string;
  name: string;
  description: string;
  status: 'introduced' | 'developing' | 'climax' | 'resolved';
  introducedChapter: number;
  resolvedChapter?: number;
  relatedCharacters: string[];
  relatedLocations: string[];
  importance: 'main' | 'subplot' | 'minor';
}

/**
 * Character
 */
export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  background: string;
  personality: string[];
  motivations: string[];
  arc?: string;
  voicePatterns?: VoicePattern;
  relationships?: Relationship[];
  currentState?: {
    location?: string;
    emotionalState?: string;
    knowledge?: string[];
  };
}

/**
 * Voice pattern for dialogue consistency
 */
export interface VoicePattern {
  vocabulary: string[];
  sentenceStructure: string;
  speechPatterns: string[];
  catchphrases?: string[];
  dialectFeatures?: string[];
  formality: 'very-formal' | 'formal' | 'neutral' | 'informal' | 'very-informal';
  verbosity: 'terse' | 'concise' | 'moderate' | 'verbose' | 'rambling';
}

/**
 * Character relationship
 */
export interface Relationship {
  characterId: string;
  type: string; // friend, enemy, family, romantic, mentor, etc.
  strength: number; // -10 to 10
  history: string;
  currentStatus: string;
}

/**
 * Location
 */
export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  geography?: string;
  significance?: string;
  associatedCharacters?: string[];
  associatedEvents?: string[];
}

/**
 * World rule (magic systems, tech, physics, etc.)
 */
export interface WorldRule {
  id: string;
  category: 'magic' | 'technology' | 'physics' | 'social' | 'economic' | 'other';
  name: string;
  description: string;
  constraints: string[];
  examples: string[];
  consistency: number; // 0-100
}

/**
 * Series event for multi-book continuity
 */
export interface SeriesEvent {
  bookNumber: number;
  chapterNumber: number;
  event: string;
  characters: string[];
  location?: string;
  timestamp?: string;
  importance: 'critical' | 'major' | 'minor';
}

/**
 * Subtask created by TaskDecomposer
 */
export interface SubTask {
  subtaskId: string;
  parentTaskId: string;
  type: string;
  description: string;
  assignedAgent?: AgentRole;
  priority: number; // 1-10
  dependencies?: string[]; // IDs of subtasks that must complete first
  estimatedDuration: number; // milliseconds
  context: Record<string, any>;
}

/**
 * Agent assignment
 */
export interface AgentAssignment {
  assignmentId: string;
  subtaskId: string;
  agentRole: AgentRole;
  agentDefinition: AgentDefinition;
  task: string;
  context: Record<string, any>;
  timeout: number;
  priority: number;
}

/**
 * Agent result
 */
export interface AgentResult {
  assignmentId: string;
  subtaskId: string;
  agentRole: AgentRole;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  output?: string;
  confidence: number; // 0-1
  suggestions?: string[];
  flaggedIssues?: Issue[];
  memoryUpdates?: MemoryUpdate[];
  metadata?: {
    tokensUsed?: number;
    duration?: number;
    model?: string;
    qualityScore?: number;
  };
  error?: string;
}

/**
 * Issue flagged by QA agents
 */
export interface Issue {
  issueId: string;
  type: 'continuity' | 'character' | 'plot' | 'world' | 'grammar' | 'style' | 'ai-detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: {
    chapter?: number;
    beat?: number;
    line?: number;
  };
  suggestedFix?: string;
  detectedBy: AgentRole;
}

/**
 * Memory update for GraphRAG
 */
export interface MemoryUpdate {
  type: 'character' | 'plot' | 'location' | 'world-rule' | 'event';
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  confidence: number;
}

/**
 * Synthesized output from orchestration
 */
export interface SynthesizedOutput {
  taskId: string;
  content: string;
  wordCount: number;
  qualityMetrics: QualityMetrics;
  agentContributions: AgentContribution[];
  issues: Issue[];
  memoryUpdates: MemoryUpdate[];
  metadata: {
    totalDuration: number;
    agentsUsed: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

/**
 * Quality metrics
 */
export interface QualityMetrics {
  overallScore: number; // 0-100
  consistencyScore: number; // 0-100
  aiDetectionProbability: number; // 0-100, lower is better
  voiceConsistency?: number; // 0-100
  plotContinuity?: number; // 0-100
  characterConsistency?: number; // 0-100
  worldConsistency?: number; // 0-100
  grammarScore?: number; // 0-100
  originalityScore?: number; // 0-100
  emotionalResonance?: number; // 0-100
}

/**
 * Agent contribution to synthesis
 */
export interface AgentContribution {
  agentRole: AgentRole;
  contribution: string;
  weight: number; // 0-1, how much this agent contributed
  confidence: number;
}

/**
 * Execution report
 */
export interface ExecutionReport {
  taskId: string;
  status: 'completed' | 'partial' | 'failed';
  totalSubtasks: number;
  completedSubtasks: number;
  failedSubtasks: number;
  results: AgentResult[];
  duration: number;
  issues: Issue[];
  recommendations: string[];
}

/**
 * Orchestration request
 */
export interface OrchestrationRequest {
  task: WritingTask;
  maxAgents?: number; // Default: unlimited
  timeout?: number; // Default: 300000 (5 minutes)
  parallelExecution?: boolean; // Default: true
  streamProgress?: boolean; // Default: false
}

/**
 * Orchestration response
 */
export interface OrchestrationResponse {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: SynthesizedOutput;
  error?: string;
  streamUrl?: string; // WebSocket URL if streaming enabled
}
