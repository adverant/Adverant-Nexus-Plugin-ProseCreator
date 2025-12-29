/**
 * NexusProseCreator - Content Generation Pipeline Types
 *
 * Complete TypeScript interfaces for the generation system
 */

// ====================================================================
// GENERATION CORE TYPES
// ====================================================================

export interface BeatBlueprint {
  beat_number: number;
  beat_type: BeatType;
  description: string;
  characters_present: string[];
  location: string;
  pov_character?: string;
  target_word_count: number;
  plot_threads_active: string[];
  emotional_tone: string;
  scene_goal: string;
  conflict?: string;
  resolution?: string;
}

export interface ChapterBlueprint {
  chapter_number: number;
  title?: string;
  synopsis: string;
  beats: BeatBlueprint[];
  target_word_count: number;
  pov_character?: string;
  timeline_position: string;
  plot_threads: string[];
  character_arcs: Array<{
    character: string;
    arc_status: string;
    development: string;
  }>;
}

export type BeatType = 'action' | 'dialogue' | 'description' | 'transition' | 'internal_monologue' | 'flashback';

export interface GeneratedBeat {
  content: string;
  word_count: number;
  ai_detection_score: number;
  continuity_score: number;
  generation_metadata: GenerationMetadata;
}

export interface GeneratedChapter {
  chapter_number: number;
  beats: GeneratedBeat[];
  total_word_count: number;
  average_ai_detection_score: number;
  average_continuity_score: number;
}

export interface GenerationMetadata {
  agents_used: string[];
  retries: number;
  timestamp: Date;
  model_used: string;
  latency_ms: number;
  cost_estimate?: number;
}

// ====================================================================
// CONTEXT INJECTION TYPES
// ====================================================================

export interface InjectedContext {
  // Memory context
  memory: {
    plotThreads: PlotThread[];
    characters: Character[];
    worldRules: WorldRule[];
    previousBeats: string[];
    locations: Location[];
    timeline: TimelineEvent[];
  };

  // Character context
  characterProfiles: Record<string, CharacterProfile>;
  characterVoices: Record<string, VoiceProfile>;

  // World context
  worldState: WorldState;

  // Plot context
  activePlotThreads: PlotThread[];
  pendingForeshadowing: string[];

  // Writing style context
  styleProfile: StyleProfile;

  // Previous content for continuity
  previous_beats: Array<{
    chapter: number;
    beat: number;
    content: string;
  }>;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  age?: number;
  background: string;
  personality_traits: string[];
  motivations: string[];
  relationships: Array<{
    character_name: string;
    relationship_type: string;
    status: string;
  }>;
  current_state: CharacterState;
  voice_profile_id?: string;
}

export interface CharacterState {
  emotional_state: string;
  physical_state: string;
  location: string;
  knowledge: string[];
  goals: string[];
  conflicts: string[];
}

export interface CharacterProfile {
  name: string;
  education_level: string;
  speech_patterns: string[];
  vocabulary_level: 'simple' | 'moderate' | 'advanced' | 'sophisticated';
  typical_sentence_length: 'short' | 'medium' | 'long' | 'varied';
  uses_contractions: boolean;
  formality_level: 'very_informal' | 'informal' | 'neutral' | 'formal' | 'very_formal';
  catchphrases: string[];
  speaking_quirks: string[];
  current_emotional_state: string;
}

export interface PlotThread {
  id: string;
  name: string;
  description: string;
  status: 'introduced' | 'developing' | 'climax' | 'resolved' | 'abandoned';
  introduced_chapter: number;
  involved_characters: string[];
  key_events: string[];
  foreshadowing: string[];
  resolution?: string;
  importance: 'major' | 'subplot' | 'minor';
}

export interface WorldRule {
  id: string;
  category: 'magic' | 'technology' | 'physics' | 'social' | 'political' | 'economic';
  rule: string;
  limitations: string[];
  exceptions?: string[];
  established_chapter?: number;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  atmosphere: string;
  notable_features: string[];
  connections: string[];
  first_appearance?: number;
}

export interface TimelineEvent {
  id: string;
  chapter: number;
  beat?: number;
  description: string;
  timestamp: string;
  characters_involved: string[];
  significance: 'critical' | 'major' | 'moderate' | 'minor';
}

export interface WorldState {
  current_date?: string;
  season?: string;
  time_of_day?: string;
  weather?: string;
  political_situation?: string;
  recent_events: string[];
}

// ====================================================================
// VOICE & STYLE TYPES
// ====================================================================

export interface VoiceProfile {
  character_name: string;
  avg_sentence_length: number;
  sentence_length_variance: number;
  vocabulary_complexity: number;
  common_words: string[];
  rare_words: string[];
  speech_patterns: string[];
  dialogue_samples: string[];
  consistency_score: number;
}

export interface StyleProfile {
  avgSentenceLength: number;
  avgWordLength: number;
  sentenceLengthVariance: number;
  vocabularyLevel: 'elementary' | 'intermediate' | 'advanced' | 'literary';
  literaryDevices: string[];
  tone: string;
  pov: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient';
  tense: 'past' | 'present' | 'future';
  dialogueRatio: number;
  descriptionDensity: number;
  paragraphLengthPattern: 'short' | 'medium' | 'long' | 'varied';
  sentenceStartVariety: number;
  transitionStyle: 'abrupt' | 'smooth' | 'varied';
}

// ====================================================================
// CONTINUITY VALIDATION TYPES
// ====================================================================

export interface ContinuityValidation {
  is_valid: boolean;
  score: number;
  issues: ContinuityIssue[];
  warnings: ContinuityWarning[];
}

export interface ContinuityIssue {
  type: ContinuityIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: {
    chapter?: number;
    beat?: number;
    line?: number;
  };
  suggestion?: string;
}

export type ContinuityIssueType =
  | 'unexpected_character'
  | 'missing_character'
  | 'location_inconsistency'
  | 'timeline_error'
  | 'character_state_conflict'
  | 'plot_thread_violation'
  | 'world_rule_violation'
  | 'character_knowledge_error'
  | 'voice_inconsistency'
  | 'tone_mismatch';

export interface ContinuityWarning {
  type: string;
  message: string;
  suggestion?: string;
}

export interface VoiceConsistencyReport {
  is_consistent: boolean;
  similarity_score: number;
  issues: VoiceIssue[];
  suggestions: string[];
}

export interface VoiceIssue {
  type: 'vocabulary' | 'sentence_structure' | 'formality' | 'emotional_tone' | 'speech_pattern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  example?: string;
  suggestion?: string;
}

export interface CharacterContext {
  profile: CharacterProfile;
  previous_dialogue: string[];
  current_emotional_state: string;
  current_goals: string[];
}

// ====================================================================
// ANTI-AI-DETECTION TYPES
// ====================================================================

export interface HumanizationMetrics {
  vocabulary_diversity: number; // Type-Token Ratio
  sentence_structure_entropy: number;
  perplexity: number;
  burstiness: number;
  overall_score: number; // 0-100, lower is better (target <5)
}

export interface HumanizationTechniques {
  diversifyVocabulary: boolean;
  varySentenceStructure: boolean;
  naturalizeRhythm: boolean;
  injectImperfections: boolean;
  increasePerplexity: boolean;
  enhanceBurstiness: boolean;
  varyTransitions: boolean;
  freshenMetaphors: boolean;
  naturalizeDialogue: boolean;
  authenticateEmotions: boolean;
  diversifyDialogueTags: boolean;
  optimizeShowVsTell: boolean;
  applyGenreMarkers: boolean;
  preserveVoice: boolean;
  ensureLinguisticAccuracy: boolean;
}

export interface AIDetectionAssessment {
  score: number; // 0-100, lower is better
  breakdown: {
    vocabulary_diversity: number;
    sentence_structure_entropy: number;
    perplexity: number;
    burstiness: number;
    ai_pattern_detection: number;
  };
  confidence: number;
  likely_detected: boolean;
}

// ====================================================================
// PROMPT BUILDING TYPES
// ====================================================================

export interface PromptComponents {
  systemPrompt: string;
  contextPrompt: string;
  taskPrompt: string;
  stylePrompt: string;
  constraintsPrompt: string;
  examplesPrompt?: string;
}

export interface PromptBuildOptions {
  includeCharacterVoices: boolean;
  includePlotContext: boolean;
  includeWorldRules: boolean;
  includePreviousBeats: number; // How many previous beats to include
  includeStyleExamples: boolean;
  maxContextTokens: number;
}

// ====================================================================
// GENERATION PARAMETERS
// ====================================================================

export interface GenerationParams {
  project_id: string;
  chapter_number: number;
  beat_number: number;
  blueprint: BeatBlueprint;
  options?: GenerationOptions;
}

export interface GenerationOptions {
  temperature?: number; // 0.0-1.0, default 0.7
  max_tokens?: number;
  model?: string;
  stream?: boolean;
  retry_on_failure?: boolean;
  max_retries?: number;
  validate_continuity?: boolean;
  apply_humanization?: boolean;
  match_style?: boolean;
}

// ====================================================================
// AGENT ORCHESTRATION TYPES
// ====================================================================

export interface AgentTask {
  task: string;
  context: Record<string, any>;
  maxAgents?: number;
  timeout?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentResponse {
  agent_id: string;
  agent_type: string;
  content: string;
  confidence: number;
  suggestions: string[];
  flagged_issues: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  metadata: Record<string, any>;
}

export interface MultiAgentResult {
  content: string;
  agents: string[];
  synthesis: {
    method: string;
    confidence: number;
  };
  issues: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

// ====================================================================
// STYLE ANALYSIS TYPES
// ====================================================================

export interface TextStatistics {
  total_words: number;
  unique_words: number;
  total_sentences: number;
  total_paragraphs: number;
  avg_sentence_length: number;
  avg_word_length: number;
  sentence_length_variance: number;
  type_token_ratio: number; // Vocabulary diversity
  lexical_density: number;
  readability_score: number;
}

export interface LiteraryDevice {
  type: string;
  count: number;
  examples: string[];
}

export interface DialogueAnalysis {
  dialogue_ratio: number; // % of content that's dialogue
  avg_exchange_length: number;
  dialogue_tag_variety: number;
  subtext_present: boolean;
}

// ====================================================================
// ERROR & RETRY TYPES
// ====================================================================

export interface GenerationError {
  code: string;
  message: string;
  retry_possible: boolean;
  context?: Record<string, any>;
}

export interface RetryStrategy {
  max_attempts: number;
  backoff_ms: number;
  backoff_multiplier: number;
  on_retry?: (attempt: number, error: GenerationError) => void;
  on_failure?: (error: GenerationError) => void;
}

// ====================================================================
// PERFORMANCE METRICS
// ====================================================================

export interface PerformanceMetrics {
  generation_time_ms: number;
  context_retrieval_ms: number;
  validation_time_ms: number;
  humanization_time_ms: number;
  total_time_ms: number;
  tokens_used: number;
  cost_estimate: number;
}
