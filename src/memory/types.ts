/**
 * Type definitions for GraphRAG Integration Layer
 * NexusProseCreator Memory System
 */

// ====================================================================
// GRAPHRAG CLIENT TYPES
// ====================================================================

export interface MemoryId {
  id: string;
  timestamp: Date;
}

export interface DocumentId {
  id: string;
  chunks: number;
  timestamp: Date;
}

export interface EpisodeId {
  id: string;
  timestamp: Date;
}

export interface PatternId {
  id: string;
  timestamp: Date;
}

export interface MemoryResult {
  id: string;
  content: string;
  tags: string[];
  metadata: any;
  score: number;
  timestamp: Date;
}

export interface RetrievalResult {
  results: Array<{
    content: string;
    score: number;
    metadata: any;
    source: 'memory' | 'document' | 'episode';
  }>;
  totalResults: number;
  strategy: string;
}

export interface EnhancedResult {
  context: string;
  tokens: number;
  sources: Array<{
    type: 'document' | 'memory' | 'episode';
    content: string;
    relevance: number;
  }>;
  metadata: any;
}

// ====================================================================
// MEMORY MANAGER TYPES
// ====================================================================

export interface Beat {
  id: string;
  project_id: string;
  chapter_id: string;
  chapter_number: number;
  beat_number: number;
  beat_type: 'action' | 'dialogue' | 'description' | 'transition';
  content: string;
  word_count: number;
  characters_present: string[];
  plot_threads: string[];
  emotional_tone: string;
  narrative_function: string;
  location?: string;
  pov_character?: string;
  qdrant_vector_id?: string;
  created_at: Date;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  age?: number;
  age_range?: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  first_appearance_chapter: number;
  background: string;
  personality_traits: string[];
  speaking_style: string;
  voice_patterns?: any;
  current_arc?: string;
  relationships?: Array<{
    character_name: string;
    relationship_type: string;
    status: string;
  }>;
  last_appearance_chapter?: number;
  created_at: Date;
  updated_at: Date;
}

export interface PlotThread {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'introduced' | 'active' | 'resolved' | 'abandoned';
  introduced_chapter: number;
  resolved_chapter?: number;
  characters_involved: string[];
  locations_involved: string[];
  importance: 'primary' | 'secondary' | 'tertiary';
  created_at: Date;
  updated_at: Date;
}

export interface ResearchBrief {
  id: string;
  project_id: string;
  topic: string;
  research_type: 'character' | 'location' | 'historical' | 'technical' | 'world_building';
  content: string;
  sources: Array<{
    url?: string;
    title: string;
    type: string;
  }>;
  confidence_score: number;
  learning_agent_job_id?: string;
  created_at: Date;
}

// ====================================================================
// CONTEXT INJECTOR TYPES
// ====================================================================

export interface ChapterBlueprint {
  chapter_number: number;
  title?: string;
  synopsis: string;
  target_word_count: number;
  pov_character: string;
  characters_present: string[];
  plot_threads: string[];
  location: string;
  timeline_position: string;
  narrative_function: string;
  emotional_arc: string;
  beats: Array<{
    beat_number: number;
    beat_type: 'action' | 'dialogue' | 'description' | 'transition';
    description: string;
    characters: string[];
  }>;
}

export interface InjectedContext {
  recentBeats: Beat[];
  characters: CharacterContext[];
  plotThreads: PlotThreadContext[];
  location: LocationContext | null;
  similarBeats: Beat[];
  continuityWarnings: ContinuityWarning[];
  injectionTimestamp: Date;
  contextTokenCount: number;
}

export interface CharacterContext {
  profile: Character;
  relationships: Array<{
    source: string;
    target: string;
    relationship_type: string;
    status: string;
    metadata?: any;
  }>;
  recentMentions: Array<{
    chapter_number: number;
    beat_number: number;
    context: string;
  }>;
  currentArc: string;
  emotionalState: string;
}

export interface PlotThreadContext {
  thread: PlotThread;
  recentDevelopments: Array<{
    chapter_number: number;
    description: string;
  }>;
  dependencies: string[];  // Other plot thread IDs
  nextExpectedDevelopment?: string;
}

export interface LocationContext {
  id: string;
  name: string;
  type: string;
  description: string;
  established_chapter: number;
  characters_present: string[];
  recent_events: Array<{
    chapter_number: number;
    description: string;
  }>;
  world_rules: string[];
}

export interface ContinuityWarning {
  type: 'character' | 'plot' | 'world' | 'timeline' | 'location' | 'voice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  chapter_reference?: number;
  beat_reference?: number;
  suggested_fix: string;
  auto_fixable: boolean;
}

// ====================================================================
// SERIES INTELLIGENCE TYPES
// ====================================================================

export interface SeriesContext {
  seriesId: string;
  title: string;
  totalBooks: number;
  totalWords: number;
  characterArcs: Array<{
    character_name: string;
    arc_description: string;
    books_spanned: number[];
    current_status: string;
  }>;
  plotThreads: Array<{
    thread_name: string;
    introduced_book: number;
    resolved_book?: number;
    status: string;
  }>;
  lore: Array<{
    topic: string;
    content: string;
    established_book: number;
    relevance_score: number;
  }>;
  timeline: Array<{
    event: string;
    book_number: number;
    chapter_number?: number;
    timestamp: string;
  }>;
  universeRules: Array<{
    rule_type: 'magic' | 'tech' | 'physics' | 'social' | 'other';
    description: string;
    established_book: number;
  }>;
}

export interface ContinuityIssue {
  issue_id: string;
  issue_type: 'character_inconsistency' | 'plot_contradiction' | 'timeline_error' |
               'world_rule_violation' | 'character_resurrection' | 'location_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  book_reference: number;
  chapter_reference?: number;
  conflicting_references: Array<{
    book: number;
    chapter?: number;
    content: string;
  }>;
  suggested_resolution: string;
  auto_fixable: boolean;
  created_at: Date;
}

// ====================================================================
// CONTINUITY ENGINE TYPES
// ====================================================================

export interface PlotHole {
  id: string;
  type: 'unresolved_thread' | 'disappeared_character' | 'undefined_location' |
        'unfulfilled_foreshadowing' | 'unexplained_event';
  description: string;
  introduced_chapter: number;
  expected_resolution_chapter?: number;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  impact_on_story: string;
  suggested_fix: string;
  created_at: Date;
}

export interface VoiceConsistencyReport {
  character_name: string;
  overall_score: number;  // 0-100
  samples_analyzed: number;
  inconsistencies: Array<{
    chapter_number: number;
    beat_number: number;
    issue: string;
    score: number;
  }>;
  voice_fingerprint: {
    vocabulary_level: string;
    average_sentence_length: number;
    common_phrases: string[];
    speech_patterns: string[];
    formality_level: number;  // 0-10
  };
}

// ====================================================================
// STORAGE PAYLOAD TYPES
// ====================================================================

export interface BeatStoragePayload {
  content: string;
  title: string;
  metadata: {
    type: 'prose_beat';
    project_id: string;
    series_id?: string;
    chapter_number: number;
    beat_number: number;
    beat_type: string;
    characters_present: string[];
    plot_threads: string[];
    emotional_tone: string;
    narrative_function: string;
    location?: string;
    pov_character?: string;
    word_count: number;
  };
}

export interface CharacterStoragePayload {
  content: string;
  title: string;
  metadata: {
    type: 'character_profile';
    project_id: string;
    series_id?: string;
    character_name: string;
    role: string;
    age_range?: string;
    personality_traits: string[];
    speaking_style: string;
  };
}

export interface PlotThreadStoragePayload {
  content: string;
  title: string;
  metadata: {
    type: 'plot_thread';
    project_id: string;
    series_id?: string;
    thread_name: string;
    status: string;
    importance: string;
    characters_involved: string[];
  };
}

export interface ResearchBriefStoragePayload {
  content: string;
  title: string;
  metadata: {
    type: 'research_brief';
    project_id: string;
    topic: string;
    research_type: string;
    confidence_score: number;
  };
}

// ====================================================================
// CONFIGURATION TYPES
// ====================================================================

export interface GraphRAGConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface MemoryManagerConfig {
  graphragClient: any;  // GraphRAGClient instance
  qdrantClient: any;    // QdrantClient instance
  neo4jClient: any;     // Neo4jClient instance
  enableCaching?: boolean;
  cacheConfig?: {
    ttl: number;  // milliseconds
    maxSize: number;
  };
}

export interface ContextInjectorConfig {
  memoryManager: any;  // MemoryManager instance
  continuityEngine: any;  // ContinuityEngine instance
  contextSize?: number;  // Number of previous beats to include
  maxTokens?: number;    // Maximum context size in tokens
  enableSmartTruncation?: boolean;
}

export interface ContinuityEngineConfig {
  neo4jClient: any;
  qdrantClient: any;
  strictMode?: boolean;  // Fail on critical issues vs warn
  autoFix?: boolean;     // Attempt automatic fixes
}

// ====================================================================
// ERROR TYPES
// ====================================================================

export class GraphRAGError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public context?: any
  ) {
    super(message);
    this.name = 'GraphRAGError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MemoryStorageError extends Error {
  constructor(
    message: string,
    public operation: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MemoryStorageError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ContinuityError extends Error {
  constructor(
    message: string,
    public issues: ContinuityWarning[],
    public severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(message);
    this.name = 'ContinuityError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ====================================================================
// UTILITY TYPES
// ====================================================================

export type MemorySource = 'graphrag' | 'qdrant' | 'neo4j' | 'cache';

export interface MemoryRetrievalOptions {
  sources?: MemorySource[];
  limit?: number;
  scoreThreshold?: number;
  includeMetadata?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContextAssemblyMetrics {
  totalRetrievalTime: number;  // milliseconds
  sourcesQueried: MemorySource[];
  resultsReturned: number;
  cacheHitRate: number;  // 0-1
  tokenCount: number;
}
