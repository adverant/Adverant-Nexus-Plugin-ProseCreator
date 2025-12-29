/**
 * NexusProseCreator - Living Blueprint System Types
 *
 * Comprehensive TypeScript interfaces for the auto-evolving blueprint system
 * that maintains perfect narrative consistency across entire series.
 */

// ====================================================================
// CORE BLUEPRINT TYPES
// ====================================================================

export interface SeriesBlueprint {
  id: string;
  user_id: string;
  series_title: string;
  genre: string;
  premise: string;
  total_books: number;
  universe_rules: UniverseRules;
  major_characters: CharacterSummary[];
  overarching_plot: PlotArc;
  timeline: SeriesTimeline;
  themes: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ProjectBlueprint {
  id: string;
  project_id: string;
  series_id?: string;
  title: string;
  premise: string;
  genre: string;
  subgenre?: string;
  target_word_count: number;
  estimated_chapters: number;
  book_number?: number;

  // Core blueprint components
  characters: CharacterProfile[];
  plot_threads: PlotThread[];
  chapters: ChapterBlueprint[];
  world_building: WorldBuildingElements;
  themes: string[];
  foreshadowing_plan: ForeshadowingElement[];

  // Metadata
  version: number;
  created_at: Date;
  updated_at: Date;
  last_evolution: Date;
}

export interface ChapterBlueprint {
  chapter_number: number;
  title: string;
  summary: string;
  pov_character: string;
  location: string;
  timeline_position: string;
  plot_threads_active: string[];
  estimated_word_count: number;
  beats: BeatBlueprint[];
  emotional_arc: EmotionalCurve;
  tension_level: number; // 1-10
  key_developments: string[];
}

export interface BeatBlueprint {
  beat_number: number;
  beat_type: BeatType;
  narrative_function: NarrativeFunction;
  description: string;
  characters_present: string[];
  location: string;
  emotional_tone: string;
  plot_threads_referenced: string[];
  estimated_word_count: number;
  pacing_notes: string;
}

// ====================================================================
// CHARACTER BIBLE TYPES
// ====================================================================

export interface CharacterBible {
  character_name: string;
  project_id: string;
  series_id?: string;

  // Core profile
  core_profile: CharacterCoreProfile;
  background: CharacterBackground;
  voice_profile: CharacterVoiceProfile;
  relationships: CharacterRelationship[];
  character_arc: CharacterArc;

  // Evolution tracking
  appearance_tracking: CharacterAppearance[];
  evolution_log: CharacterEvolution[];

  // Metadata
  created_at: Date;
  updated_at: Date;
  consistency_score: number; // 0-100
}

export interface CharacterCoreProfile {
  age: number;
  gender: string;
  physical_description: string;
  personality_traits: string[];
  core_values: string[];
  fears: string[];
  desires: string[];
  strengths: string[];
  weaknesses: string[];
  quirks: string[];
}

export interface CharacterBackground {
  childhood: string;
  formative_experiences: string[];
  education: string;
  family: FamilyMember[];
  occupation: string;
  current_situation: string;
}

export interface CharacterVoiceProfile {
  vocabulary_level: 'simple' | 'moderate' | 'sophisticated' | 'technical';
  speech_patterns: string[];
  favorite_phrases: string[];
  accent?: string;
  tone: string;
  example_dialogue: string[];
  speech_quirks: string[];
  internal_monologue_style: string;
}

export interface CharacterRelationship {
  character_name: string;
  relationship_type: string;
  history: string;
  current_status: string;
  dynamics: string;
  tension_points: string[];
  evolution_over_time: string;
}

export interface CharacterArc {
  starting_state: string;
  key_developments: ArcDevelopment[];
  transformation: string;
  ending_state: string;
  arc_type: ArcType;
}

export interface CharacterAppearance {
  chapter_number: number;
  beat_number: number;
  description_used: string;
  context: string;
  significant_change?: string;
}

export interface CharacterEvolution {
  chapter_number: number;
  change_description: string;
  trigger_event: string;
  impact_on_relationships: string[];
  updated_at: Date;
}

// ====================================================================
// PLOT THREAD TYPES
// ====================================================================

export interface PlotThread {
  id: string;
  title: string;
  description: string;
  plot_type: PlotThreadType;
  importance: PlotImportance;

  // Lifecycle
  start_chapter: number;
  resolution_chapter?: number;
  status: PlotThreadStatus;

  // Structure
  key_beats: PlotBeat[];
  foreshadowing_elements: ForeshadowingElement[];
  related_characters: string[];
  related_threads: string[];

  // Tracking
  last_mention_chapter?: number;
  progress: number; // 0-100
  estimated_beats: number;
}

export interface PlotBeat {
  chapter_number: number;
  beat_number: number;
  description: string;
  significance: 'setup' | 'development' | 'complication' | 'climax' | 'resolution';
  is_key_development: boolean;
  emotional_impact: number; // 1-10
}

export interface ForeshadowingElement {
  id: string;
  thread_id: string;
  planted_chapter: number;
  planted_beat: number;
  planted_content: string;
  payoff_chapter?: number;
  payoff_description: string;
  subtlety_level: 'obvious' | 'moderate' | 'subtle' | 'hidden';
  status: 'planned' | 'planted' | 'paid_off';
}

export interface PlotThreadStatus {
  thread_id: string;
  title: string;
  status: 'planned' | 'active' | 'resolved' | 'abandoned';
  progress: number; // 0-100
  last_mention_chapter: number;
  foreshadowing_instances: number;
  key_developments: PlotBeat[];
  resolution_complete: boolean;
  continuity_issues: string[];
}

// ====================================================================
// WORLD BUILDING TYPES
// ====================================================================

export interface WorldBuildingElements {
  magic_system?: MagicSystem;
  technology_level?: TechnologyLevel;
  locations: WorldLocation[];
  cultures: Culture[];
  historical_events: HistoricalEvent[];
  rules_and_laws: WorldRule[];
  economics?: EconomicSystem;
  politics?: PoliticalSystem;
}

export interface MagicSystem {
  name: string;
  description: string;
  rules: string[];
  limitations: string[];
  power_sources: string[];
  known_practitioners: string[];
  consistency_rules: string[];
}

export interface TechnologyLevel {
  era: string;
  key_technologies: string[];
  restrictions: string[];
  unique_innovations: string[];
}

export interface WorldLocation {
  name: string;
  type: string;
  description: string;
  significance: string;
  first_appearance: number;
  physical_details: string;
  atmosphere: string;
  inhabitants: string[];
  related_events: string[];
}

export interface Culture {
  name: string;
  values: string[];
  traditions: string[];
  language_notes: string;
  social_structure: string;
  notable_customs: string[];
}

export interface HistoricalEvent {
  name: string;
  date: string;
  description: string;
  impact: string;
  affected_characters: string[];
}

export interface WorldRule {
  rule: string;
  explanation: string;
  exceptions: string[];
  first_established_chapter: number;
  violations_would_break_consistency: boolean;
}

// ====================================================================
// RESEARCH BRIEF TYPES
// ====================================================================

export interface ResearchBrief {
  id: string;
  project_id: string;
  topic: string;
  research_type: ResearchType;
  context: string;

  // Research content
  key_facts: KeyFact[];
  references: Reference[];
  expert_insights: string[];
  authenticity_tips: string[];

  // Technical details
  learning_agent_job_id?: string;
  confidence_score: number; // 0-100
  generated_at: Date;
  expires_at?: Date;
}

export interface KeyFact {
  fact: string;
  source: string;
  confidence: number; // 0-100
  relevance: number; // 0-100
  verification_status: 'verified' | 'needs_verification' | 'disputed';
}

export interface Reference {
  type: 'url' | 'book' | 'article' | 'expert_interview' | 'database';
  title: string;
  url?: string;
  author?: string;
  publication_date?: Date;
  credibility_score: number; // 0-100
}

// ====================================================================
// BLUEPRINT EVOLUTION TYPES
// ====================================================================

export interface BlueprintUpdate {
  project_id: string;
  chapter_number: number;
  timestamp: Date;
  changes: BlueprintChange[];
  significance: number; // 0-1, how much the story diverged from plan
  triggered_regeneration: boolean;
}

export interface BlueprintChange {
  type: ChangeType;
  category: 'character' | 'plot' | 'world' | 'timeline' | 'theme' | 'foreshadowing';
  description: string;
  old_value?: any;
  new_value: any;
  affected_chapters: number[];
  requires_user_approval: boolean;
}

export interface Divergence {
  chapter_number: number;
  beat_number: number;
  planned: string;
  actual: string;
  significance: number; // 0-1
  impact_on_future_chapters: string[];
}

// ====================================================================
// TIMELINE TYPES
// ====================================================================

export interface SeriesTimeline {
  events: TimelineEvent[];
  chronology_type: 'linear' | 'non-linear' | 'multi-thread';
  time_scale: string; // e.g., "3 months", "10 years", "centuries"
}

export interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  date: string; // In-universe date
  chapter_reference: number;
  beat_reference?: number;
  characters_involved: string[];
  significance: 'minor' | 'moderate' | 'major' | 'critical';
  chronological_order: number;
}

// ====================================================================
// BEAT TYPES (from writing)
// ====================================================================

export interface Beat {
  id: string;
  chapter_id: string;
  beat_number: number;
  beat_type: BeatType;
  content: string;
  word_count: number;

  // Context
  characters_present: string[];
  location: string;
  timeline_position: string;
  emotional_tone: string;

  // Analysis
  is_foreshadowing: boolean;
  is_key_development: boolean;
  plot_threads_referenced: string[];

  // Metadata
  created_at: Date;
  qdrant_vector_id?: string;
}

// ====================================================================
// CONTINUITY TYPES
// ====================================================================

export interface ContinuityIssue {
  id: string;
  project_id: string;
  issue_type: ContinuityIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  chapter_reference: number;
  beat_reference?: number;
  suggested_fix: string;
  resolved: boolean;
  resolved_at?: Date;
  resolution_notes?: string;
}

export interface ContinuityCheck {
  overall_score: number; // 0-100
  category_scores: {
    character: number;
    plot: number;
    world: number;
    timeline: number;
    voice: number;
  };
  issues: ContinuityIssue[];
  checked_at: Date;
}

// ====================================================================
// ENUMS AND LITERAL TYPES
// ====================================================================

export type BeatType =
  | 'action'
  | 'dialogue'
  | 'description'
  | 'transition'
  | 'internal_monologue'
  | 'flashback'
  | 'exposition';

export type NarrativeFunction =
  | 'setup'
  | 'conflict_introduction'
  | 'character_development'
  | 'plot_advancement'
  | 'world_building'
  | 'tension_building'
  | 'climax'
  | 'resolution'
  | 'denouement';

export type PlotThreadType =
  | 'main_plot'
  | 'subplot'
  | 'character_arc'
  | 'romantic_arc'
  | 'mystery_thread'
  | 'thematic_thread';

export type PlotImportance =
  | 'critical'
  | 'major'
  | 'moderate'
  | 'minor';

export type ArcType =
  | 'positive_change'
  | 'negative_change'
  | 'flat_arc'
  | 'transformation'
  | 'fall'
  | 'redemption';

export type ChangeType =
  | 'character_evolution'
  | 'plot_thread_update'
  | 'world_rule_addition'
  | 'timeline_adjustment'
  | 'relationship_change'
  | 'foreshadowing_update'
  | 'theme_development';

export type ContinuityIssueType =
  | 'character_inconsistency'
  | 'plot_hole'
  | 'world_rule_violation'
  | 'timeline_error'
  | 'voice_drift'
  | 'relationship_inconsistency'
  | 'forgotten_thread';

export type ResearchType =
  | 'character'
  | 'location'
  | 'historical'
  | 'technical'
  | 'cultural'
  | 'scientific';

// ====================================================================
// SUPPORTING TYPES
// ====================================================================

export interface UniverseRules {
  magic_system?: MagicSystem;
  technology_rules?: string[];
  physical_laws?: string[];
  societal_structures?: string[];
  consistency_requirements: string[];
}

export interface CharacterSummary {
  name: string;
  role: string;
  importance: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  first_appearance_book: number;
  status: 'active' | 'deceased' | 'absent';
}

export interface PlotArc {
  description: string;
  key_turning_points: TurningPoint[];
  resolution_plan: string;
}

export interface TurningPoint {
  book_number: number;
  chapter_estimate: number;
  description: string;
  impact: string;
}

export interface ArcDevelopment {
  chapter_number: number;
  development: string;
  catalyst: string;
  emotional_state_after: string;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  status: 'alive' | 'deceased' | 'unknown';
  significance: string;
}

export interface EmotionalCurve {
  start_emotion: string;
  peak_emotion: string;
  end_emotion: string;
  tension_points: number[]; // Array of tension levels for each beat
}

export interface EconomicSystem {
  currency?: string;
  trade_systems: string[];
  wealth_distribution: string;
  key_resources: string[];
}

export interface PoliticalSystem {
  government_type: string;
  power_structure: string;
  key_factions: Faction[];
  current_conflicts: string[];
}

export interface Faction {
  name: string;
  goals: string[];
  leader?: string;
  members: string[];
  allies: string[];
  enemies: string[];
}

// ====================================================================
// API INPUT TYPES
// ====================================================================

export interface CreateSeriesBlueprintParams {
  user_id: string;
  series_title: string;
  total_books: number;
  genre: string;
  premise: string;
}

export interface CreateProjectBlueprintParams {
  series_id?: string;
  project_title: string;
  book_number?: number;
  target_word_count: number;
  premise: string;
  genre: string;
  subgenre?: string;
}

export interface EvolveBlueprint Params {
  project_id: string;
  chapter_number: number;
  completed_beats: Beat[];
}

export interface GenerateCharacterBibleParams {
  project_id: string;
  character_name: string;
  series_context?: any;
}

export interface GenerateResearchBriefParams {
  project_id: string;
  topic: string;
  context: string;
  research_type: ResearchType;
  priority: 'immediate' | 'high' | 'medium' | 'low';
}

// ====================================================================
// SERVICE RESPONSE TYPES
// ====================================================================

export interface BlueprintManagerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    execution_time_ms: number;
    agents_used?: string[];
    cost?: number;
  };
}

export interface EvolutionAnalysis {
  divergences: Divergence[];
  significance: number;
  recommendations: string[];
  auto_applied_changes: BlueprintChange[];
  user_approval_required: BlueprintChange[];
}

export interface VoiceConsistencyReport {
  character_name: string;
  consistency_score: number; // 0-100
  dialogue_samples_analyzed: number;
  deviations: VoiceDeviation[];
  recommendations: string[];
}

export interface VoiceDeviation {
  chapter_number: number;
  beat_number: number;
  deviation_type: 'vocabulary' | 'tone' | 'pattern' | 'quirk';
  expected: string;
  actual: string;
  severity: 'minor' | 'moderate' | 'major';
}

// ====================================================================
// ERROR TYPES
// ====================================================================

export class BlueprintError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'BlueprintError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CharacterBibleError extends BlueprintError {
  constructor(message: string, context?: any) {
    super(message, 'CHARACTER_BIBLE_ERROR', context);
    this.name = 'CharacterBibleError';
  }
}

export class PlotThreadError extends BlueprintError {
  constructor(message: string, context?: any) {
    super(message, 'PLOT_THREAD_ERROR', context);
    this.name = 'PlotThreadError';
  }
}

export class TimelineError extends BlueprintError {
  constructor(message: string, context?: any) {
    super(message, 'TIMELINE_ERROR', context);
    this.name = 'TimelineError';
  }
}

export class EvolutionError extends BlueprintError {
  constructor(message: string, context?: any) {
    super(message, 'EVOLUTION_ERROR', context);
    this.name = 'EvolutionError';
  }
}
