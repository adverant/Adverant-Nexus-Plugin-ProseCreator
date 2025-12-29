/**
 * Example Usage of NexusProseCreator Qdrant Infrastructure
 *
 * This file demonstrates how to use the Qdrant infrastructure for:
 * 1. Initialization and health checks
 * 2. Storing and retrieving prose content
 * 3. Character voice fingerprinting and matching
 * 4. Metadata search and management
 */

import {
  QdrantInitializer,
  initializeNexusProseQdrant,
  SystemHealthReport
} from './QdrantInitializer';
import {
  NexusProseQdrantClient,
  UpsertPoint,
  SearchResult,
  VoiceMatchResult
} from './QdrantClient';
import {
  ProseContentPayload,
  CharacterVoicePayload,
  ProseMetadataPayload,
  CollectionNames
} from './QdrantCollections';

// ====================================================================
// EXAMPLE 1: INITIALIZATION
// ====================================================================

async function example1_Initialization() {
  console.log('\n=== EXAMPLE 1: Initialization ===\n');

  // Simple initialization (returns client ready to use)
  const client = await initializeNexusProseQdrant({
    url: 'http://localhost:6333',  // Or from env: process.env.QDRANT_URL
    apiKey: process.env.QDRANT_API_KEY,  // Optional for local Qdrant
    timeout: 30000
  });

  console.log('✓ Qdrant client initialized and collections created');

  // Advanced initialization with options
  const initializer = new QdrantInitializer({
    url: 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY
  });

  const result = await initializer.initializeCollections({
    forceRecreate: false,      // Set true to recreate (DELETES DATA)
    skipOptimization: false,   // Set true to skip index creation
    verifyIndexing: true,      // Verify vectors are indexed
    maxWaitForIndexing: 30000, // Wait up to 30s for indexing
    logLevel: 'verbose'        // 'silent' | 'info' | 'verbose'
  });

  console.log('Initialization result:', {
    success: result.success,
    created: result.collectionsCreated,
    existing: result.collectionsExisting,
    errors: result.errors.length
  });

  // Health check
  const health = await initializer.performHealthCheck();
  console.log('\nSystem health:', {
    healthy: health.healthy,
    latency: health.connectionLatency + 'ms',
    collections: health.collections.map(c => ({
      name: c.collectionName,
      healthy: c.healthy,
      points: c.pointCount,
      indexed: c.indexingRatio.toFixed(1) + '%'
    }))
  });
}

// ====================================================================
// EXAMPLE 2: STORING PROSE CONTENT (Beat-by-Beat)
// ====================================================================

async function example2_StoringProseContent(client: NexusProseQdrantClient) {
  console.log('\n=== EXAMPLE 2: Storing Prose Content ===\n');

  const projectId = 'project-uuid-123';
  const chapterNumber = 1;

  // Simulate beat embeddings (in production, these come from your embedding model)
  const beat1Vector = new Array(1536).fill(0).map(() => Math.random());
  const beat2Vector = new Array(1536).fill(0).map(() => Math.random());

  // Prepare prose content points
  const prosePoints: UpsertPoint[] = [
    {
      id: `${projectId}-ch1-beat1`,
      vector: beat1Vector,
      payload: {
        project_id: projectId,
        chapter_number: 1,
        beat_number: 1,
        content_type: 'description',
        word_count: 250,
        characters_present: ['Kael', 'Elara'],
        plot_threads: ['betrayal-arc', 'sword-quest'],
        emotional_tone: 'tense',
        pov_character: 'Kael',
        timeline_position: 'Day 3, Morning',
        location: 'Tower of Shadows',
        consistency_score: 98.5,
        ai_detection_score: 3.2,
        genre: 'fantasy',
        format: 'novel',
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      } as ProseContentPayload
    },
    {
      id: `${projectId}-ch1-beat2`,
      vector: beat2Vector,
      payload: {
        project_id: projectId,
        chapter_number: 1,
        beat_number: 2,
        content_type: 'dialogue',
        word_count: 180,
        characters_present: ['Kael', 'Elara'],
        plot_threads: ['betrayal-arc'],
        emotional_tone: 'confrontational',
        pov_character: 'Kael',
        timeline_position: 'Day 3, Morning',
        location: 'Tower of Shadows',
        consistency_score: 97.8,
        ai_detection_score: 4.1,
        genre: 'fantasy',
        format: 'novel',
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      } as ProseContentPayload
    }
  ];

  // Batch upsert (automatically chunked into optimal batches)
  const result = await client.upsertProseContent(prosePoints);

  console.log('Upsert result:', {
    success: result.success,
    inserted: result.inserted,
    failed: result.failed
  });

  // Search for similar beats (for continuity checking)
  const queryVector = new Array(1536).fill(0).map(() => Math.random());
  const similarBeats = await client.searchSimilarBeats(queryVector, {
    limit: 5,
    scoreThreshold: 0.7,
    filters: {
      project_id: projectId,
      chapter_number: 1
    }
  });

  console.log(`\nFound ${similarBeats.length} similar beats:`);
  similarBeats.forEach(beat => {
    console.log(`- Beat ${beat.payload.beat_number}: ${beat.payload.content_type} (score: ${beat.score.toFixed(3)})`);
  });

  // Get continuity context (previous 2 beats for context injection)
  const context = await client.getContinuityContext(projectId, 1, 3, 2);
  console.log(`\nContinuity context: ${context.length} previous beats`);
  context.forEach(beat => {
    console.log(`- Beat ${beat.beat_number}: ${beat.content_type}, ${beat.word_count} words`);
  });

  // Find all beats featuring a specific character
  const kaelBeats = await client.findBeatsByCharacter(projectId, 'Kael', {
    limit: 50,
    chapterRange: [1, 5]
  });

  console.log(`\nBeats featuring Kael: ${kaelBeats.length}`);
}

// ====================================================================
// EXAMPLE 3: CHARACTER VOICE FINGERPRINTING
// ====================================================================

async function example3_CharacterVoices(client: NexusProseQdrantClient) {
  console.log('\n=== EXAMPLE 3: Character Voice Fingerprinting ===\n');

  const projectId = 'project-uuid-123';

  // Create character voice fingerprints (vectors from dialogue samples)
  const kaelVoiceVector = new Array(1024).fill(0).map(() => Math.random());
  const elaraVoiceVector = new Array(1024).fill(0).map(() => Math.random());

  const voicePoints: UpsertPoint[] = [
    {
      id: `${projectId}-voice-kael`,
      vector: kaelVoiceVector,
      payload: {
        project_id: projectId,
        character_name: 'Kael',
        age_range: 'young_adult',
        gender: 'male',
        background: 'Former knight turned mercenary',
        personality_traits: ['cynical', 'brave', 'sarcastic'],
        speaking_style: 'casual',
        vocabulary_level: 'simple',
        sentence_structure: 'short and punchy',
        common_phrases: ['Fair enough', 'Not my problem'],
        dialect_markers: ['drops g in -ing words'],
        consistency_score: 97.5,
        sample_count: 45,
        first_appearance_chapter: 1,
        last_updated: Math.floor(Date.now() / 1000)
      } as CharacterVoicePayload
    },
    {
      id: `${projectId}-voice-elara`,
      vector: elaraVoiceVector,
      payload: {
        project_id: projectId,
        character_name: 'Elara',
        age_range: 'adult',
        gender: 'female',
        background: 'Royal mage',
        personality_traits: ['intelligent', 'cautious', 'formal'],
        speaking_style: 'formal',
        vocabulary_level: 'advanced',
        sentence_structure: 'long and flowing',
        common_phrases: ['I must emphasize', 'One must consider'],
        dialect_markers: ['uses archaic words occasionally'],
        consistency_score: 98.9,
        sample_count: 52,
        first_appearance_chapter: 1,
        last_updated: Math.floor(Date.now() / 1000)
      } as CharacterVoicePayload
    }
  ];

  // Store voice fingerprints
  const result = await client.upsertCharacterVoices(voicePoints);
  console.log('Voice fingerprints stored:', {
    inserted: result.inserted,
    success: result.success
  });

  // Match new dialogue to character voice
  const newDialogueVector = new Array(1024).fill(0).map(() => Math.random());
  const voiceMatch = await client.matchCharacterVoice(newDialogueVector, projectId, {
    minConsistencyScore: 85.0
  });

  if (voiceMatch) {
    console.log('\nDialogue matched to character:', {
      character: voiceMatch.character_name,
      similarity: voiceMatch.similarity_score.toFixed(1) + '%',
      consistency: voiceMatch.consistency_score.toFixed(1) + '%',
      style: voiceMatch.speaking_style,
      samples: voiceMatch.sample_count
    });
  } else {
    console.log('\nNo matching character voice found');
  }

  // Get character voice profile
  const kaelVoice = await client.getCharacterVoice(projectId, 'Kael');
  if (kaelVoice) {
    console.log('\nKael voice profile:', {
      name: kaelVoice.character_name,
      style: kaelVoice.speaking_style,
      traits: kaelVoice.personality_traits.join(', '),
      consistency: kaelVoice.consistency_score.toFixed(1) + '%'
    });
  }

  // Update voice consistency score (after analyzing new dialogue)
  await client.updateVoiceConsistency(projectId, 'Kael', 98.2, 50);
  console.log('\n✓ Updated Kael voice consistency to 98.2% (50 samples)');
}

// ====================================================================
// EXAMPLE 4: METADATA SEARCH
// ====================================================================

async function example4_MetadataSearch(client: NexusProseQdrantClient) {
  console.log('\n=== EXAMPLE 4: Metadata Search ===\n');

  const projectId = 'project-uuid-123';

  // Store metadata for quick search
  const metadataVector = new Array(768).fill(0).map(() => Math.random());

  const metadataPoints: UpsertPoint[] = [
    {
      id: `${projectId}-meta-char-kael`,
      vector: metadataVector,
      payload: {
        project_id: projectId,
        entity_type: 'character',
        entity_id: 'char-kael',
        title: 'Kael Thornheart',
        description: 'A cynical former knight who becomes embroiled in a conspiracy',
        keywords: ['protagonist', 'warrior', 'mercenary', 'betrayed'],
        categories: ['main character', 'POV character'],
        summary: 'Former knight seeking redemption while uncovering dark secrets',
        tags: ['fantasy', 'dark past', 'sword fighter'],
        related_entities: ['char-elara', 'location-tower'],
        genre: 'fantasy',
        format: 'novel',
        status: 'active',
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      } as ProseMetadataPayload
    }
  ];

  const result = await client.upsertMetadata(metadataPoints);
  console.log('Metadata stored:', { inserted: result.inserted });

  // Semantic search for metadata
  const searchVector = new Array(768).fill(0).map(() => Math.random());
  const searchResults = await client.searchMetadata(searchVector, {
    limit: 10,
    scoreThreshold: 0.6,
    filters: {
      project_id: projectId,
      entity_type: 'character'
    }
  });

  console.log(`\nFound ${searchResults.length} matching entities:`);
  searchResults.forEach(result => {
    console.log(`- ${result.payload.title}: ${result.payload.entity_type} (score: ${result.score.toFixed(3)})`);
  });

  // Find related entities by type
  const characters = await client.findRelatedEntities(projectId, 'character', {
    limit: 50
  });

  console.log(`\nAll characters in project: ${characters.length}`);
  characters.forEach(char => {
    console.log(`- ${char.title}: ${char.description}`);
  });
}

// ====================================================================
// EXAMPLE 5: COLLECTION MANAGEMENT
// ====================================================================

async function example5_CollectionManagement(client: NexusProseQdrantClient) {
  console.log('\n=== EXAMPLE 5: Collection Management ===\n');

  // Check health of each collection
  for (const collectionName of Object.values(CollectionNames)) {
    const health = await client.checkCollectionHealth(collectionName as any);
    console.log(`Collection: ${collectionName}`);
    console.log(`- Exists: ${health.exists}`);
    console.log(`- Points: ${health.pointCount}`);
    console.log(`- Indexed: ${health.indexedVectors}/${health.pointCount}`);
    console.log(`- Status: ${health.status}\n`);
  }

  // Get collection statistics
  const stats = await client.getCollectionStats(CollectionNames.PROSE_CONTENT as any);
  console.log('Prose Content Collection Stats:');
  console.log(`- Total points: ${stats.pointCount}`);
  console.log(`- Segments: ${stats.segmentCount}`);
  console.log(`- Vector dimensions: ${stats.vectorDimensions}`);
  console.log(`- Indexing progress: ${stats.indexingProgress.toFixed(1)}%`);

  // Delete all data for a project (cleanup)
  const projectId = 'old-project-uuid';
  const deleteResult = await client.deleteByProject(
    CollectionNames.PROSE_CONTENT as any,
    projectId
  );
  console.log(`\nDeleted ${deleteResult.deleted} points for project ${projectId}`);
}

// ====================================================================
// EXAMPLE 6: PRODUCTION INTEGRATION
// ====================================================================

async function example6_ProductionIntegration() {
  console.log('\n=== EXAMPLE 6: Production Integration ===\n');

  // Environment-based configuration
  const config = {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
    timeout: parseInt(process.env.QDRANT_TIMEOUT || '30000', 10)
  };

  // Initialize with error handling
  let client: NexusProseQdrantClient;

  try {
    client = await initializeNexusProseQdrant(config, {
      forceRecreate: false,
      verifyIndexing: true,
      logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'verbose'
    });

    console.log('✓ Qdrant initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Qdrant:', error);
    throw error;
  }

  // Health monitoring (run periodically)
  const initializer = new QdrantInitializer(config);
  const healthReport = await initializer.performHealthCheck();

  if (!healthReport.healthy) {
    console.error('❌ Qdrant health check failed!');
    console.error('Issues:', healthReport.overallIssues);

    // Alert monitoring system
    // await alerting.send('qdrant-unhealthy', healthReport);
  } else {
    console.log('✓ All Qdrant collections healthy');
  }

  // Use client in your application
  return client;
}

// ====================================================================
// RUN ALL EXAMPLES
// ====================================================================

async function runAllExamples() {
  try {
    await example1_Initialization();

    const client = await initializeNexusProseQdrant({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY
    });

    await example2_StoringProseContent(client);
    await example3_CharacterVoices(client);
    await example4_MetadataSearch(client);
    await example5_CollectionManagement(client);
    await example6_ProductionIntegration();

    console.log('\n✓ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
    throw error;
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export {
  example1_Initialization,
  example2_StoringProseContent,
  example3_CharacterVoices,
  example4_MetadataSearch,
  example5_CollectionManagement,
  example6_ProductionIntegration,
  runAllExamples
};
