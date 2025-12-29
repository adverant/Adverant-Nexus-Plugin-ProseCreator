/**
 * NexusProseCreator Infrastructure Exports
 *
 * Centralized export for all infrastructure modules:
 * - Neo4j (Knowledge Graph)
 * - Qdrant (Vector Database)
 */

// Client
export { Neo4jClient, createNeo4jClient } from './Neo4jClient';
export type { Neo4jConfig, QueryParams, TransactionWork } from './Neo4jClient';

// Schema Types
export {
  // Node types
  type BaseNode,
  type ProjectNode,
  type SeriesNode,
  type CharacterNode,
  type LocationNode,
  type PlotThreadNode,
  type EventNode,
  type ChapterNode,
  type BeatNode,

  // Enums
  type ProjectFormat,
  type ProjectStatus,
  type CharacterRole,
  type CharacterArcStatus,
  type LocationType,
  type LocationSignificance,
  type PlotThreadStatus,
  type PlotImportance,
  type PlotThreadType,
  type EventType,
  type EventSignificance,
  type ChapterStatus,
  type EmotionalArc,
  type BeatType,

  // Relationship types
  type BaseRelationship,
  type BelongsToRelationship,
  type KnowsRelationship,
  type AppearsInRelationship,
  type InvolvesRelationship,
  type OccursInRelationship,
  type LocatedAtRelationship,
  type FollowsRelationship,
  type EvolvesFromRelationship,
  type DevelopsRelationship,
  type ContainsRelationship,
  type PartOfRelationship,
  type ParticipatesInRelationship,

  // Relationship enums
  type RelationshipType,
  type RelationshipStatus,
  type CharacterAppearanceSignificance,
  type PlotRole,
  type Impact,
  type LocationStatus,
  type EventRole,

  // Query result types
  type Neo4jQueryResult,
  type CharacterWithRelationships,
  type ChapterWithContext,
  type PlotThreadWithDependencies,
  type LocationHierarchy,
  type SeriesTimeline,

  // Input types
  type CreateProjectInput,
  type CreateSeriesInput,
  type CreateCharacterInput,
  type CreateLocationInput,
  type CreatePlotThreadInput,
  type CreateEventInput,
  type CreateChapterInput,
  type CreateBeatInput,
  type CreateRelationshipInput,

  // Labels
  NODE_LABELS,
  type NodeLabel,
  RELATIONSHIP_TYPES,
  type RelationshipLabel,
  type RelationshipMapping,
  VALID_RELATIONSHIPS,

  // Validators
  isValidRelationship,
  isNodeLabel,
  isRelationshipType,
} from './Neo4jSchema';

// Queries
export { Neo4jQueries } from './Neo4jQueries';

// ====================================================================
// QDRANT VECTOR DATABASE
// ====================================================================

// Collection definitions and types
export {
  // Collection configurations
  PROSE_CONTENT_COLLECTION,
  CHARACTER_VOICE_COLLECTION,
  METADATA_COLLECTION,
  ALL_COLLECTIONS,
  CollectionNames,

  // Type definitions
  type QdrantCollectionConfig,
  type PayloadSchemaDefinition,
  type OptimizerConfig,
  type HnswConfig,
  type CollectionName,

  // Payload interfaces
  type ProseContentPayload,
  type CharacterVoicePayload,
  type ProseMetadataPayload
} from './QdrantCollections';

// Client wrapper
export {
  NexusProseQdrantClient,

  // Client types
  type QdrantConfig,
  type UpsertPoint,
  type SearchOptions,
  type SearchResult,
  type BatchUpsertResult,
  type VoiceMatchResult
} from './QdrantClient';

// Initializer
export {
  QdrantInitializer,
  initializeNexusProseQdrant,

  // Initializer types
  type InitializationOptions,
  type CollectionHealthReport,
  type SystemHealthReport
} from './QdrantInitializer';
