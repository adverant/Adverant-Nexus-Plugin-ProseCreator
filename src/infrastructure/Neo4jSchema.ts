/**
 * Neo4j Schema Type Definitions for NexusProseCreator
 *
 * Defines TypeScript types for all Neo4j nodes and relationships
 * Ensures type safety when working with the graph database
 */

// ============================================================================
// NODE TYPES
// ============================================================================

/**
 * Base node interface with common properties
 */
export interface BaseNode {
  id: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Project Node
 * Represents a creative project (novel, screenplay, etc.)
 */
export interface ProjectNode extends BaseNode {
  title: string;
  format: ProjectFormat;
  genre: string;
  subgenre?: string;
  target_word_count?: number;
  current_word_count: number;
  consistency_score: number; // 0-100
  ai_detection_score: number; // 0-100, lower is better
  status: ProjectStatus;
}

export type ProjectFormat =
  | 'novel'
  | 'screenplay'
  | 'youtube_script'
  | 'stage_play'
  | 'comic_book'
  | 'podcast_script'
  | 'poetry';

export type ProjectStatus = 'draft' | 'revision' | 'complete' | 'published';

/**
 * Series Node
 * Represents a multi-book series or collection
 */
export interface SeriesNode extends BaseNode {
  title: string;
  description?: string;
  total_word_count: number;
  book_count: number;
  universe_rules?: string; // JSON string of world rules
  timeline?: string; // JSON string of timeline events
}

/**
 * Character Node
 * Represents a character in the story
 */
export interface CharacterNode extends BaseNode {
  project_id: string;
  name: string;
  age?: number;
  role: CharacterRole;
  first_appearance: number; // Chapter number
  description?: string;
  personality_traits?: string;
  background?: string;
  voice_pattern_id?: string; // Reference to PostgreSQL voice fingerprint
  current_emotional_state?: string;
  current_location_id?: string;
  arc_status?: CharacterArcStatus;
}

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor' | 'cameo';

export type CharacterArcStatus = 'introduction' | 'development' | 'climax' | 'resolution' | 'static';

/**
 * Location Node
 * Represents a physical location in the story world
 */
export interface LocationNode extends BaseNode {
  project_id: string;
  name: string;
  type: LocationType;
  description?: string;
  parent_location_id?: string; // For hierarchical locations
  significance: LocationSignificance;
  first_mentioned: number; // Chapter number
  climate?: string;
  population?: number;
  culture_notes?: string;
}

export type LocationType =
  | 'city'
  | 'building'
  | 'region'
  | 'realm'
  | 'planet'
  | 'dimension'
  | 'room'
  | 'landmark'
  | 'natural_feature';

export type LocationSignificance = 'major' | 'minor' | 'background' | 'mentioned';

/**
 * PlotThread Node
 * Represents a plot thread or storyline
 */
export interface PlotThreadNode extends BaseNode {
  project_id: string;
  name: string;
  description?: string;
  status: PlotThreadStatus;
  introduced_chapter: number;
  resolved_chapter?: number;
  importance: PlotImportance;
  thread_type: PlotThreadType;
  foreshadowing_elements?: string; // JSON array of foreshadowing moments
}

export type PlotThreadStatus = 'introduced' | 'developing' | 'resolved' | 'abandoned';

export type PlotImportance = 'main' | 'subplot' | 'background' | 'red_herring';

export type PlotThreadType =
  | 'mystery'
  | 'romance'
  | 'conflict'
  | 'quest'
  | 'character_growth'
  | 'revenge'
  | 'redemption'
  | 'betrayal'
  | 'discovery';

/**
 * Event Node
 * Represents a significant event in the story timeline
 */
export interface EventNode extends BaseNode {
  project_id: string;
  description: string;
  timeline_position: string; // e.g., "Year 523, Spring"
  chapter_number: number;
  event_type: EventType;
  significance: EventSignificance;
  participants?: string; // JSON array of character IDs
  outcomes?: string;
}

export type EventType =
  | 'battle'
  | 'discovery'
  | 'betrayal'
  | 'death'
  | 'birth'
  | 'coronation'
  | 'wedding'
  | 'murder'
  | 'revelation'
  | 'catastrophe'
  | 'celebration';

export type EventSignificance = 'critical' | 'major' | 'minor' | 'background';

/**
 * Chapter Node
 * Represents a chapter in the manuscript
 */
export interface ChapterNode extends BaseNode {
  project_id: string;
  chapter_number: number;
  title?: string;
  synopsis?: string;
  word_count: number;
  status: ChapterStatus;
  pov_character?: string; // Character name or ID
  timeline_position?: string;
  emotional_arc?: EmotionalArc;
  pacing_notes?: string;
}

export type ChapterStatus = 'outline' | 'draft' | 'revision' | 'complete' | 'approved';

export type EmotionalArc = 'rising' | 'falling' | 'stable' | 'climax' | 'resolution';

/**
 * Beat Node (Optional, for fine-grained tracking)
 * Represents a story beat within a chapter
 */
export interface BeatNode extends BaseNode {
  chapter_id: string;
  beat_number: number;
  beat_type: BeatType;
  word_count: number;
  summary?: string;
}

export type BeatType = 'action' | 'dialogue' | 'description' | 'transition' | 'internal_monologue';

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

/**
 * Base relationship interface
 */
export interface BaseRelationship {
  [key: string]: any;
}

/**
 * BELONGS_TO: Project belongs to Series
 */
export interface BelongsToRelationship extends BaseRelationship {
  book_number: number;
}

/**
 * KNOWS: Character knows another Character
 */
export interface KnowsRelationship extends BaseRelationship {
  since: number; // Chapter number
  relationship_type: RelationshipType;
  strength: number; // 0-1
  status: RelationshipStatus;
  notes?: string;
}

export type RelationshipType =
  | 'friend'
  | 'enemy'
  | 'ally'
  | 'family'
  | 'romantic'
  | 'mentor'
  | 'rival'
  | 'subordinate'
  | 'superior'
  | 'acquaintance';

export type RelationshipStatus = 'active' | 'strained' | 'broken' | 'healing' | 'evolving';

/**
 * APPEARS_IN: Character appears in Chapter
 */
export interface AppearsInRelationship extends BaseRelationship {
  chapter: number;
  significance: CharacterAppearanceSignificance;
  dialogue_lines?: number;
  emotional_state?: string;
}

export type CharacterAppearanceSignificance = 'major' | 'minor' | 'mentioned' | 'cameo';

/**
 * INVOLVES: PlotThread involves Character
 */
export interface InvolvesRelationship extends BaseRelationship {
  role: PlotRole;
  impact: Impact;
}

export type PlotRole =
  | 'protagonist'
  | 'antagonist'
  | 'catalyst'
  | 'victim'
  | 'witness'
  | 'helper'
  | 'obstacle';

export type Impact = 'high' | 'medium' | 'low' | 'negligible';

/**
 * OCCURS_IN: PlotThread/Event occurs in Location
 */
export interface OccursInRelationship extends BaseRelationship {
  chapter: number;
  duration?: string; // e.g., "one scene", "three days"
}

/**
 * LOCATED_AT: Character is located at Location
 */
export interface LocatedAtRelationship extends BaseRelationship {
  chapter: number; // Current chapter
  arrival_chapter?: number;
  status: LocationStatus;
}

export type LocationStatus = 'permanent' | 'temporary' | 'passing_through' | 'departed';

/**
 * FOLLOWS: Sequential relationship (Chapter to Chapter)
 */
export interface FollowsRelationship extends BaseRelationship {
  // No additional properties - purely structural
}

/**
 * EVOLVES_FROM: Character evolves from previous version (series-wide)
 */
export interface EvolvesFromRelationship extends BaseRelationship {
  book: number; // Which book in series
  changes: string; // Description of changes
}

/**
 * DEVELOPS: PlotThread develops from another PlotThread
 */
export interface DevelopsRelationship extends BaseRelationship {
  trigger_chapter: number;
}

/**
 * CONTAINS: Location contains another Location (hierarchical)
 */
export interface ContainsRelationship extends BaseRelationship {
  // No additional properties - purely structural
}

/**
 * PART_OF: Chapter is part of Project
 */
export interface PartOfRelationship extends BaseRelationship {
  // No additional properties - purely structural
}

/**
 * PARTICIPATES_IN: Character participates in Event
 */
export interface ParticipatesInRelationship extends BaseRelationship {
  role: EventRole;
  outcome?: string;
}

export type EventRole =
  | 'attacker'
  | 'defender'
  | 'witness'
  | 'victim'
  | 'mediator'
  | 'organizer'
  | 'bystander';

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

/**
 * Result from Neo4j query
 */
export interface Neo4jQueryResult<T = any> {
  records: T[];
  summary: {
    counters: {
      nodesCreated: number;
      nodesDeleted: number;
      relationshipsCreated: number;
      relationshipsDeleted: number;
      propertiesSet: number;
    };
  };
}

/**
 * Character with relationships
 */
export interface CharacterWithRelationships {
  character: CharacterNode;
  relationships: {
    knows: Array<{ target: CharacterNode; relationship: KnowsRelationship }>;
    locatedAt?: { location: LocationNode; relationship: LocatedAtRelationship };
    plotThreads: Array<{ plotThread: PlotThreadNode; relationship: InvolvesRelationship }>;
  };
}

/**
 * Chapter with full context
 */
export interface ChapterWithContext {
  chapter: ChapterNode;
  characters: Array<{ character: CharacterNode; relationship: AppearsInRelationship }>;
  events: EventNode[];
  plotThreads: PlotThreadNode[];
  location?: LocationNode;
}

/**
 * Plot thread with dependencies
 */
export interface PlotThreadWithDependencies {
  plotThread: PlotThreadNode;
  characters: Array<{ character: CharacterNode; relationship: InvolvesRelationship }>;
  locations: Array<{ location: LocationNode; relationship: OccursInRelationship }>;
  developments?: PlotThreadNode[]; // PlotThreads that developed from this one
}

/**
 * Location hierarchy
 */
export interface LocationHierarchy {
  location: LocationNode;
  parent?: LocationNode;
  children: LocationNode[];
  characters: CharacterNode[];
  events: EventNode[];
}

/**
 * Series timeline
 */
export interface SeriesTimeline {
  series: SeriesNode;
  books: Array<{
    project: ProjectNode;
    book_number: number;
  }>;
  characters: Array<{
    character: CharacterNode;
    evolutions: Array<{ from: CharacterNode; relationship: EvolvesFromRelationship }>;
  }>;
}

// ============================================================================
// CREATE/UPDATE INPUT TYPES
// ============================================================================

/**
 * Input for creating nodes (omits generated fields)
 */
export type CreateProjectInput = Omit<ProjectNode, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CreateSeriesInput = Omit<SeriesNode, 'id' | 'created_at'> & {
  id?: string;
};

export type CreateCharacterInput = Omit<CharacterNode, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CreateLocationInput = Omit<LocationNode, 'id' | 'created_at'> & {
  id?: string;
};

export type CreatePlotThreadInput = Omit<PlotThreadNode, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CreateEventInput = Omit<EventNode, 'id' | 'created_at'> & {
  id?: string;
};

export type CreateChapterInput = Omit<ChapterNode, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CreateBeatInput = Omit<BeatNode, 'id' | 'created_at'> & {
  id?: string;
};

/**
 * Input for creating relationships
 */
export interface CreateRelationshipInput<T extends BaseRelationship> {
  sourceId: string;
  targetId: string;
  properties?: Partial<T>;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valid node labels
 */
export const NODE_LABELS = [
  'Project',
  'Series',
  'Character',
  'Location',
  'PlotThread',
  'Event',
  'Chapter',
  'Beat',
] as const;

export type NodeLabel = (typeof NODE_LABELS)[number];

/**
 * Valid relationship types
 */
export const RELATIONSHIP_TYPES = [
  'BELONGS_TO',
  'KNOWS',
  'APPEARS_IN',
  'INVOLVES',
  'OCCURS_IN',
  'LOCATED_AT',
  'FOLLOWS',
  'EVOLVES_FROM',
  'DEVELOPS',
  'CONTAINS',
  'PART_OF',
  'PARTICIPATES_IN',
] as const;

export type RelationshipLabel = (typeof RELATIONSHIP_TYPES)[number];

/**
 * Relationship mapping (which nodes can connect via which relationships)
 */
export interface RelationshipMapping {
  source: NodeLabel;
  relationship: RelationshipLabel;
  target: NodeLabel;
}

export const VALID_RELATIONSHIPS: RelationshipMapping[] = [
  { source: 'Project', relationship: 'BELONGS_TO', target: 'Series' },
  { source: 'Character', relationship: 'KNOWS', target: 'Character' },
  { source: 'Character', relationship: 'APPEARS_IN', target: 'Chapter' },
  { source: 'PlotThread', relationship: 'INVOLVES', target: 'Character' },
  { source: 'PlotThread', relationship: 'OCCURS_IN', target: 'Location' },
  { source: 'Event', relationship: 'OCCURS_IN', target: 'Location' },
  { source: 'Character', relationship: 'LOCATED_AT', target: 'Location' },
  { source: 'Chapter', relationship: 'FOLLOWS', target: 'Chapter' },
  { source: 'Character', relationship: 'EVOLVES_FROM', target: 'Character' },
  { source: 'PlotThread', relationship: 'DEVELOPS', target: 'PlotThread' },
  { source: 'Location', relationship: 'CONTAINS', target: 'Location' },
  { source: 'Chapter', relationship: 'PART_OF', target: 'Project' },
  { source: 'Character', relationship: 'PARTICIPATES_IN', target: 'Event' },
];

/**
 * Validate if a relationship is valid
 */
export function isValidRelationship(
  source: NodeLabel,
  relationship: RelationshipLabel,
  target: NodeLabel
): boolean {
  return VALID_RELATIONSHIPS.some(
    (r) => r.source === source && r.relationship === relationship && r.target === target
  );
}

/**
 * Type guard for node labels
 */
export function isNodeLabel(label: string): label is NodeLabel {
  return NODE_LABELS.includes(label as NodeLabel);
}

/**
 * Type guard for relationship types
 */
export function isRelationshipType(type: string): type is RelationshipLabel {
  return RELATIONSHIP_TYPES.includes(type as RelationshipLabel);
}
