/**
 * Qdrant Client Wrapper for NexusProseCreator
 *
 * Provides type-safe, high-performance operations for:
 * - Batch upserts with automatic chunking
 * - Similarity search with complex filters
 * - Character voice matching
 * - Continuity checking via semantic search
 * - Health monitoring and diagnostics
 */

import { QdrantClient as QdrantJS } from '@qdrant/js-client-rest';
import {
  CollectionName,
  CollectionNames,
  ProseContentPayload,
  CharacterVoicePayload,
  ProseMetadataPayload
} from './QdrantCollections';

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  timeout?: number;
}

export interface UpsertPoint {
  id: string;
  vector: number[];
  payload: ProseContentPayload | CharacterVoicePayload | ProseMetadataPayload;
}

export interface SearchOptions {
  limit?: number;
  scoreThreshold?: number;
  filters?: Record<string, any>;
  withVector?: boolean;
  withPayload?: boolean;
}

export interface SearchResult<T = any> {
  id: string;
  score: number;
  payload: T;
  vector?: number[];
}

export interface BatchUpsertResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors: Error[];
}

export interface VoiceMatchResult {
  character_name: string;
  consistency_score: number;
  similarity_score: number;
  sample_count: number;
  speaking_style: string;
  personality_traits: string[];
}

/**
 * Type-safe Qdrant client for NexusProseCreator
 */
export class NexusProseQdrantClient {
  private client: QdrantJS;
  private batchSize: number = 100;  // Optimal batch size for Qdrant

  constructor(config: QdrantConfig) {
    this.client = new QdrantJS({
      url: config.url,
      apiKey: config.apiKey,
      timeout: config.timeout || 30000
    });
  }

  /**
   * Get the underlying Qdrant client for advanced operations
   */
  getClient(): QdrantJS {
    return this.client;
  }

  // ====================================================================
  // PROSE CONTENT OPERATIONS
  // ====================================================================

  /**
   * Upsert prose content beats with automatic batching
   */
  async upsertProseContent(
    points: UpsertPoint[],
    options: { batchSize?: number } = {}
  ): Promise<BatchUpsertResult> {
    return this.batchUpsert(
      CollectionNames.PROSE_CONTENT,
      points,
      options.batchSize || this.batchSize
    );
  }

  /**
   * Search for similar prose beats (for continuity checking)
   */
  async searchSimilarBeats(
    vector: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult<ProseContentPayload>[]> {
    const {
      limit = 10,
      scoreThreshold = 0.7,
      filters = {},
      withVector = false,
      withPayload = true
    } = options;

    try {
      const searchResult = await this.client.search(CollectionNames.PROSE_CONTENT, {
        vector,
        limit,
        score_threshold: scoreThreshold,
        filter: this.buildFilter(filters),
        with_vector: withVector,
        with_payload: withPayload
      });

      return searchResult.map(result => ({
        id: result.id as string,
        score: result.score,
        payload: result.payload as unknown as ProseContentPayload,
        vector: result.vector as number[] | undefined
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to search prose content: ${error.message}. ` +
        `Ensure collection exists and vector dimensions match (expected: 1536)`
      );
    }
  }

  /**
   * Find beats by character (for character arc analysis)
   */
  async findBeatsByCharacter(
    projectId: string,
    characterName: string,
    options: { limit?: number; chapterRange?: [number, number] } = {}
  ): Promise<SearchResult<ProseContentPayload>[]> {
    const { limit = 50, chapterRange } = options;

    const filters: any = {
      must: [
        { key: 'project_id', match: { value: projectId } },
        { key: 'characters_present', match: { any: [characterName] } }
      ]
    };

    if (chapterRange) {
      filters.must.push({
        key: 'chapter_number',
        range: { gte: chapterRange[0], lte: chapterRange[1] }
      });
    }

    try {
      const scrollResult = await this.client.scroll(CollectionNames.PROSE_CONTENT, {
        filter: filters,
        limit,
        with_payload: true,
        with_vector: false
      });

      return scrollResult.points.map(point => ({
        id: point.id as string,
        score: 1.0,  // Scroll doesn't return scores
        payload: point.payload as unknown as ProseContentPayload
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to find beats by character: ${error.message}. ` +
        `Check that project_id and character name are correct.`
      );
    }
  }

  /**
   * Get continuity context (previous N beats for context injection)
   */
  async getContinuityContext(
    projectId: string,
    chapterNumber: number,
    beatNumber: number,
    contextSize: number = 2
  ): Promise<ProseContentPayload[]> {
    const filters = {
      must: [
        { key: 'project_id', match: { value: projectId } },
        { key: 'chapter_number', match: { value: chapterNumber } },
        { key: 'beat_number', range: { lt: beatNumber } }
      ]
    };

    try {
      const scrollResult = await this.client.scroll(CollectionNames.PROSE_CONTENT, {
        filter: filters,
        limit: contextSize,
        with_payload: true,
        with_vector: false,
        order_by: [{ key: 'beat_number', direction: 'desc' }] as any
      });

      return scrollResult.points
        .map(point => point.payload as unknown as ProseContentPayload)
        .reverse();  // Return in chronological order
    } catch (error: any) {
      throw new Error(
        `Failed to get continuity context: ${error.message}. ` +
        `Context retrieval is critical for maintaining narrative consistency.`
      );
    }
  }

  // ====================================================================
  // CHARACTER VOICE OPERATIONS
  // ====================================================================

  /**
   * Upsert character voice fingerprints
   */
  async upsertCharacterVoices(
    points: UpsertPoint[],
    options: { batchSize?: number } = {}
  ): Promise<BatchUpsertResult> {
    return this.batchUpsert(
      CollectionNames.CHARACTER_VOICE,
      points,
      options.batchSize || this.batchSize
    );
  }

  /**
   * Match dialogue to character voice (98%+ accuracy target)
   */
  async matchCharacterVoice(
    dialogueVector: number[],
    projectId: string,
    options: { minConsistencyScore?: number } = {}
  ): Promise<VoiceMatchResult | null> {
    const { minConsistencyScore = 85.0 } = options;

    const filters = {
      must: [
        { key: 'project_id', match: { value: projectId } },
        { key: 'consistency_score', range: { gte: minConsistencyScore } }
      ]
    };

    try {
      const searchResult = await this.client.search(CollectionNames.CHARACTER_VOICE, {
        vector: dialogueVector,
        limit: 1,
        filter: filters,
        with_payload: true,
        with_vector: false
      });

      if (searchResult.length === 0) {
        return null;
      }

      const match = searchResult[0];
      const payload = match.payload as unknown as CharacterVoicePayload;

      return {
        character_name: payload.character_name,
        consistency_score: payload.consistency_score,
        similarity_score: match.score * 100,  // Convert to percentage
        sample_count: payload.sample_count,
        speaking_style: payload.speaking_style,
        personality_traits: payload.personality_traits
      };
    } catch (error: any) {
      throw new Error(
        `Failed to match character voice: ${error.message}. ` +
        `Voice matching requires character fingerprints to be generated first.`
      );
    }
  }

  /**
   * Get character voice profile
   */
  async getCharacterVoice(
    projectId: string,
    characterName: string
  ): Promise<CharacterVoicePayload | null> {
    const filters = {
      must: [
        { key: 'project_id', match: { value: projectId } },
        { key: 'character_name', match: { value: characterName } }
      ]
    };

    try {
      const scrollResult = await this.client.scroll(CollectionNames.CHARACTER_VOICE, {
        filter: filters,
        limit: 1,
        with_payload: true,
        with_vector: false
      });

      if (scrollResult.points.length === 0) {
        return null;
      }

      return scrollResult.points[0].payload as unknown as CharacterVoicePayload;
    } catch (error: any) {
      throw new Error(
        `Failed to get character voice: ${error.message}. ` +
        `Character may not exist in the voice collection.`
      );
    }
  }

  /**
   * Update character voice consistency score
   */
  async updateVoiceConsistency(
    projectId: string,
    characterName: string,
    newScore: number,
    sampleCount: number
  ): Promise<void> {
    const voice = await this.getCharacterVoice(projectId, characterName);

    if (!voice) {
      throw new Error(
        `Character voice not found: ${characterName}. ` +
        `Create the character voice profile before updating consistency.`
      );
    }

    // Find the point ID
    const filters = {
      must: [
        { key: 'project_id', match: { value: projectId } },
        { key: 'character_name', match: { value: characterName } }
      ]
    };

    const scrollResult = await this.client.scroll(CollectionNames.CHARACTER_VOICE, {
      filter: filters,
      limit: 1,
      with_payload: false,
      with_vector: false
    });

    if (scrollResult.points.length === 0) {
      throw new Error(`Point ID not found for character: ${characterName}`);
    }

    const pointId = scrollResult.points[0].id;

    try {
      await this.client.setPayload(CollectionNames.CHARACTER_VOICE, {
        points: [pointId],
        payload: {
          consistency_score: newScore,
          sample_count: sampleCount,
          last_updated: Math.floor(Date.now() / 1000)
        }
      });
    } catch (error: any) {
      throw new Error(
        `Failed to update voice consistency: ${error.message}. ` +
        `Payload update failed - check Qdrant connection.`
      );
    }
  }

  // ====================================================================
  // METADATA OPERATIONS
  // ====================================================================

  /**
   * Upsert metadata entries
   */
  async upsertMetadata(
    points: UpsertPoint[],
    options: { batchSize?: number } = {}
  ): Promise<BatchUpsertResult> {
    return this.batchUpsert(
      CollectionNames.METADATA,
      points,
      options.batchSize || this.batchSize
    );
  }

  /**
   * Search metadata (fast semantic search for titles, descriptions, keywords)
   */
  async searchMetadata(
    vector: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult<ProseMetadataPayload>[]> {
    const {
      limit = 20,
      scoreThreshold = 0.6,
      filters = {},
      withVector = false,
      withPayload = true
    } = options;

    try {
      const searchResult = await this.client.search(CollectionNames.METADATA, {
        vector,
        limit,
        score_threshold: scoreThreshold,
        filter: this.buildFilter(filters),
        with_vector: withVector,
        with_payload: withPayload
      });

      return searchResult.map(result => ({
        id: result.id as string,
        score: result.score,
        payload: result.payload as unknown as ProseMetadataPayload,
        vector: result.vector as number[] | undefined
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to search metadata: ${error.message}. ` +
        `Ensure vector dimensions match (expected: 768)`
      );
    }
  }

  /**
   * Find related entities (characters, locations, plot threads)
   */
  async findRelatedEntities(
    projectId: string,
    entityType: string,
    options: { limit?: number } = {}
  ): Promise<ProseMetadataPayload[]> {
    const { limit = 50 } = options;

    const filters = {
      must: [
        { key: 'project_id', match: { value: projectId } },
        { key: 'entity_type', match: { value: entityType } }
      ]
    };

    try {
      const scrollResult = await this.client.scroll(CollectionNames.METADATA, {
        filter: filters,
        limit,
        with_payload: true,
        with_vector: false
      });

      return scrollResult.points.map(point => point.payload as unknown as ProseMetadataPayload);
    } catch (error: any) {
      throw new Error(
        `Failed to find related entities: ${error.message}. ` +
        `Entity type may not exist or filters are incorrect.`
      );
    }
  }

  // ====================================================================
  // BATCH OPERATIONS
  // ====================================================================

  /**
   * Generic batch upsert with automatic chunking and error handling
   */
  private async batchUpsert(
    collectionName: CollectionName,
    points: UpsertPoint[],
    batchSize: number
  ): Promise<BatchUpsertResult> {
    const result: BatchUpsertResult = {
      success: true,
      inserted: 0,
      failed: 0,
      errors: []
    };

    // Split into batches
    const batches: UpsertPoint[][] = [];
    for (let i = 0; i < points.length; i += batchSize) {
      batches.push(points.slice(i, i + batchSize));
    }

    // Process batches sequentially for reliability
    for (const batch of batches) {
      try {
        await this.client.upsert(collectionName, {
          wait: true,
          points: batch.map(point => ({
            id: point.id,
            vector: point.vector,
            payload: point.payload as any
          }))
        });

        result.inserted += batch.length;
      } catch (error: any) {
        result.failed += batch.length;
        result.success = false;
        result.errors.push(
          new Error(
            `Batch upsert failed for collection ${collectionName}: ${error.message}. ` +
            `Batch size: ${batch.length}. Check vector dimensions and payload schema.`
          )
        );
      }
    }

    return result;
  }

  /**
   * Delete points by project ID (for project cleanup)
   */
  async deleteByProject(
    collectionName: CollectionName,
    projectId: string
  ): Promise<{ deleted: number }> {
    const filter = {
      must: [{ key: 'project_id', match: { value: projectId } }]
    };

    try {
      // Count before deletion
      const countResult = await this.client.count(collectionName, {
        filter,
        exact: false
      });

      const count = countResult.count || 0;

      // Delete all points matching filter
      await this.client.delete(collectionName, {
        filter,
        wait: true
      });

      return { deleted: count };
    } catch (error: any) {
      throw new Error(
        `Failed to delete points for project ${projectId}: ${error.message}. ` +
        `Deletion is a critical operation - verify project ID is correct.`
      );
    }
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  /**
   * Build Qdrant filter from simple key-value pairs
   */
  private buildFilter(filters: Record<string, any>): any {
    if (Object.keys(filters).length === 0) {
      return undefined;
    }

    const must: any[] = [];

    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        must.push({ key, match: { any: value } });
      } else if (typeof value === 'object' && value !== null) {
        // Range or complex filter
        must.push({ key, ...value });
      } else {
        must.push({ key, match: { value } });
      }
    }

    return { must };
  }

  /**
   * Health check for a specific collection
   */
  async checkCollectionHealth(collectionName: CollectionName): Promise<{
    exists: boolean;
    pointCount: number;
    indexedVectors: number;
    status: string;
  }> {
    try {
      const info = await this.client.getCollection(collectionName);

      return {
        exists: true,
        pointCount: info.points_count || 0,
        indexedVectors: info.indexed_vectors_count || 0,
        status: info.status || 'unknown'
      };
    } catch (error: any) {
      if (error.message.includes('Not found')) {
        return {
          exists: false,
          pointCount: 0,
          indexedVectors: 0,
          status: 'not_found'
        };
      }

      throw new Error(
        `Failed to check collection health: ${error.message}. ` +
        `Qdrant connection may be down or collection name is incorrect.`
      );
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName: CollectionName): Promise<{
    pointCount: number;
    segmentCount: number;
    vectorDimensions: number;
    indexingProgress: number;  // Percentage
  }> {
    try {
      const info = await this.client.getCollection(collectionName);

      const pointCount = info.points_count || 0;
      const indexedVectors = info.indexed_vectors_count || 0;
      const indexingProgress = pointCount > 0 ? (indexedVectors / pointCount) * 100 : 100;

      // Handle both number and object types for vector config
      const vectorConfig = info.config?.params?.vectors;
      const vectorSize = typeof vectorConfig === 'number' ? vectorConfig : (vectorConfig as any)?.size || 0;

      return {
        pointCount,
        segmentCount: info.segments_count || 0,
        vectorDimensions: vectorSize,
        indexingProgress: Math.round(indexingProgress * 100) / 100
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get collection stats: ${error.message}. ` +
        `Collection may not exist or Qdrant is unavailable.`
      );
    }
  }
}
