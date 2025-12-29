/**
 * Qdrant Collection Definitions for NexusProseCreator
 *
 * Defines three specialized vector collections:
 * 1. prose_content_embeddings (1536-dim) - Semantic search for prose beats and chapters
 * 2. prose_character_voices (1024-dim) - Character voice fingerprinting and matching
 * 3. prose_metadata_embeddings (768-dim) - Fast metadata and title search
 */

export interface QdrantCollectionConfig {
  name: string;
  vectorSize: number;
  distance: 'Cosine' | 'Euclid' | 'Dot';
  description: string;
  payloadSchema: PayloadSchemaDefinition;
  optimizerConfig?: OptimizerConfig;
  hnswConfig?: HnswConfig;
}

export interface PayloadSchemaDefinition {
  [key: string]: {
    type: 'keyword' | 'integer' | 'float' | 'text' | 'bool' | 'geo' | 'datetime';
    indexed?: boolean;
    required?: boolean;
    description?: string;
  };
}

export interface OptimizerConfig {
  deleted_threshold?: number;
  vacuum_min_vector_number?: number;
  default_segment_number?: number;
  indexing_threshold?: number;
  flush_interval_sec?: number;
  max_optimization_threads?: number;
}

export interface HnswConfig {
  m?: number;
  ef_construct?: number;
  full_scan_threshold?: number;
  on_disk?: boolean;
}

/**
 * Payload interfaces for type safety
 */

export interface ProseContentPayload {
  // Project identification
  project_id: string;
  series_id?: string;

  // Location in narrative
  chapter_number: number;
  beat_number: number;

  // Content metadata
  content_type: 'action' | 'dialogue' | 'description' | 'transition' | 'mixed';
  word_count: number;

  // Narrative elements
  characters_present: string[];  // Character names appearing in this beat
  plot_threads: string[];        // Active plot threads
  emotional_tone: string;        // e.g., 'tense', 'romantic', 'mysterious'
  pov_character: string;         // Point of view character

  // Context tracking
  timeline_position: string;     // e.g., "Day 3, Morning" or "Chapter 12"
  location: string;              // Where scene takes place

  // Quality metrics
  consistency_score?: number;    // 0-100
  ai_detection_score?: number;   // 0-100 (lower is better)

  // Metadata
  genre: string;
  format: 'novel' | 'screenplay' | 'youtube_script' | 'stage_play' | 'comic_book';
  created_at: number;            // Unix timestamp
  updated_at: number;
}

export interface CharacterVoicePayload {
  // Character identification
  project_id: string;
  series_id?: string;
  character_name: string;

  // Character attributes
  age_range?: string;            // e.g., "20-30", "elderly"
  gender?: string;
  background?: string;           // Brief background

  // Voice characteristics
  personality_traits: string[];  // e.g., ["sarcastic", "confident"]
  speaking_style: string;        // e.g., "formal", "casual", "technical"
  vocabulary_level: string;      // e.g., "simple", "advanced", "academic"
  sentence_structure: string;    // e.g., "short and punchy", "long and flowing"

  // Dialogue patterns
  common_phrases: string[];      // Catchphrases or common expressions
  dialect_markers?: string[];    // Regional or unique speech patterns

  // Quality tracking
  consistency_score: number;     // Voice consistency across all dialogue
  sample_count: number;          // Number of dialogue samples analyzed

  // Metadata
  first_appearance_chapter: number;
  last_updated: number;          // Unix timestamp
}

export interface ProseMetadataPayload {
  // Project identification
  project_id: string;
  series_id?: string;
  entity_type: 'project' | 'chapter' | 'character' | 'location' | 'plot_thread';
  entity_id: string;

  // Searchable text
  title: string;
  description: string;
  keywords: string[];
  categories: string[];

  // Content summary
  summary?: string;
  tags: string[];

  // Relationships
  related_entities: string[];    // IDs of related entities

  // Metadata
  genre?: string;
  format?: string;
  status?: string;               // e.g., 'draft', 'revision', 'complete'
  created_at: number;
  updated_at: number;
}

/**
 * Collection Definitions
 */

export const PROSE_CONTENT_COLLECTION: QdrantCollectionConfig = {
  name: 'nexus_prose_content',
  vectorSize: 1536,  // OpenAI ada-002 or similar high-quality embeddings
  distance: 'Cosine',
  description: 'Semantic embeddings for prose beats and chapters - enables contextual retrieval and continuity checking',
  payloadSchema: {
    project_id: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'UUID of the project (book, screenplay, etc.)'
    },
    series_id: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'UUID of the series (for multi-book projects)'
    },
    chapter_number: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Chapter number (1-indexed)'
    },
    beat_number: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Beat number within chapter (1-indexed)'
    },
    content_type: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'Type of content: action, dialogue, description, transition, mixed'
    },
    word_count: {
      type: 'integer',
      indexed: false,
      required: true,
      description: 'Word count of the beat'
    },
    characters_present: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of character names present in this beat'
    },
    plot_threads: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of active plot thread IDs'
    },
    emotional_tone: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Emotional tone of the beat'
    },
    pov_character: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Point of view character name'
    },
    timeline_position: {
      type: 'text',
      indexed: false,
      required: false,
      description: 'Position in story timeline'
    },
    location: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Scene location'
    },
    consistency_score: {
      type: 'float',
      indexed: false,
      required: false,
      description: 'Consistency score (0-100)'
    },
    ai_detection_score: {
      type: 'float',
      indexed: false,
      required: false,
      description: 'AI detection probability (0-100, lower is better)'
    },
    genre: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'Primary genre'
    },
    format: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'Format: novel, screenplay, youtube_script, stage_play, comic_book'
    },
    created_at: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Creation timestamp (Unix)'
    },
    updated_at: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Last update timestamp (Unix)'
    }
  },
  optimizerConfig: {
    deleted_threshold: 0.2,
    vacuum_min_vector_number: 1000,
    default_segment_number: 2,
    indexing_threshold: 500,      // Index after 500 vectors for reasonable performance
    flush_interval_sec: 5,
    max_optimization_threads: 4
  },
  hnswConfig: {
    m: 16,                        // Good balance of speed and accuracy
    ef_construct: 200,            // Higher for better recall
    full_scan_threshold: 10000,   // Use index for collections > 10k
    on_disk: false                // Keep in memory for fast access
  }
};

export const CHARACTER_VOICE_COLLECTION: QdrantCollectionConfig = {
  name: 'nexus_prose_character_voices',
  vectorSize: 1024,  // Voyage-3 or similar for voice fingerprinting
  distance: 'Cosine',
  description: 'Character voice fingerprints - enables 98%+ dialogue consistency across series',
  payloadSchema: {
    project_id: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'UUID of the project'
    },
    series_id: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'UUID of the series'
    },
    character_name: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'Character name (unique within project)'
    },
    age_range: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Age range: child, teen, young_adult, adult, elderly'
    },
    gender: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Character gender'
    },
    background: {
      type: 'text',
      indexed: false,
      required: false,
      description: 'Brief character background'
    },
    personality_traits: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of personality traits'
    },
    speaking_style: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Speaking style: formal, casual, technical, poetic, etc.'
    },
    vocabulary_level: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Vocabulary complexity level'
    },
    sentence_structure: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Typical sentence structure pattern'
    },
    common_phrases: {
      type: 'keyword',
      indexed: false,
      required: false,
      description: 'Array of catchphrases or common expressions'
    },
    dialect_markers: {
      type: 'keyword',
      indexed: false,
      required: false,
      description: 'Regional or unique speech patterns'
    },
    consistency_score: {
      type: 'float',
      indexed: true,
      required: true,
      description: 'Voice consistency score (0-100)'
    },
    sample_count: {
      type: 'integer',
      indexed: false,
      required: true,
      description: 'Number of dialogue samples analyzed'
    },
    first_appearance_chapter: {
      type: 'integer',
      indexed: true,
      required: false,
      description: 'First chapter appearance'
    },
    last_updated: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Last update timestamp (Unix)'
    }
  },
  optimizerConfig: {
    deleted_threshold: 0.2,
    vacuum_min_vector_number: 100,
    default_segment_number: 1,   // Smaller collection
    indexing_threshold: 50,      // Index quickly for character lookup
    flush_interval_sec: 2,
    max_optimization_threads: 2
  },
  hnswConfig: {
    m: 16,
    ef_construct: 100,
    full_scan_threshold: 1000,
    on_disk: false
  }
};

export const METADATA_COLLECTION: QdrantCollectionConfig = {
  name: 'nexus_prose_metadata',
  vectorSize: 768,  // Smaller embeddings for fast metadata search
  distance: 'Cosine',
  description: 'Fast metadata search for projects, characters, locations, and plot threads',
  payloadSchema: {
    project_id: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'UUID of the project'
    },
    series_id: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'UUID of the series'
    },
    entity_type: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'Entity type: project, chapter, character, location, plot_thread'
    },
    entity_id: {
      type: 'keyword',
      indexed: true,
      required: true,
      description: 'Unique entity ID'
    },
    title: {
      type: 'text',
      indexed: true,
      required: true,
      description: 'Entity title or name'
    },
    description: {
      type: 'text',
      indexed: true,
      required: true,
      description: 'Entity description'
    },
    keywords: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of keywords'
    },
    categories: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of categories'
    },
    summary: {
      type: 'text',
      indexed: false,
      required: false,
      description: 'Brief summary'
    },
    tags: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of tags'
    },
    related_entities: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Array of related entity IDs'
    },
    genre: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Genre'
    },
    format: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Format'
    },
    status: {
      type: 'keyword',
      indexed: true,
      required: false,
      description: 'Status: draft, revision, complete'
    },
    created_at: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Creation timestamp (Unix)'
    },
    updated_at: {
      type: 'integer',
      indexed: true,
      required: true,
      description: 'Last update timestamp (Unix)'
    }
  },
  optimizerConfig: {
    deleted_threshold: 0.2,
    vacuum_min_vector_number: 500,
    default_segment_number: 1,
    indexing_threshold: 100,
    flush_interval_sec: 3,
    max_optimization_threads: 2
  },
  hnswConfig: {
    m: 12,                       // Slightly smaller for faster metadata search
    ef_construct: 100,
    full_scan_threshold: 5000,
    on_disk: false
  }
};

/**
 * All collection definitions
 */
export const ALL_COLLECTIONS: QdrantCollectionConfig[] = [
  PROSE_CONTENT_COLLECTION,
  CHARACTER_VOICE_COLLECTION,
  METADATA_COLLECTION
];

/**
 * Collection name constants for type safety
 */
export const CollectionNames = {
  PROSE_CONTENT: PROSE_CONTENT_COLLECTION.name,
  CHARACTER_VOICE: CHARACTER_VOICE_COLLECTION.name,
  METADATA: METADATA_COLLECTION.name
} as const;

export type CollectionName = typeof CollectionNames[keyof typeof CollectionNames];
