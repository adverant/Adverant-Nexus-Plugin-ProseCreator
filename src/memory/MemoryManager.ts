/**
 * Memory Manager for NexusProseCreator
 *
 * Orchestrates memory operations across multiple storage backends:
 * - GraphRAG: Long-term semantic memory and retrieval
 * - Qdrant: Vector similarity search for beats, characters, metadata
 * - Neo4j: Knowledge graph for characters, plots, relationships
 *
 * Responsibilities:
 * - Store beats with full context across all backends
 * - Store characters with voice fingerprints
 * - Store plot threads with dependencies
 * - Store research briefs from LearningAgent
 * - Coordinate memory retrieval for context injection
 */

import { GraphRAGClient } from './GraphRAGClient';
import { NexusProseQdrantClient } from '../infrastructure/QdrantClient';
import { Neo4jClient } from '../infrastructure/Neo4jClient';
import { NodeLabel, RelationshipLabel } from '../infrastructure/Neo4jSchema';
import {
  MemoryManagerConfig,
  MemoryStorageError,
  Beat,
  Character,
  PlotThread,
  ResearchBrief,
  BeatStoragePayload,
  CharacterStoragePayload,
  PlotThreadStoragePayload,
  ResearchBriefStoragePayload
} from './types';

export class MemoryManager {
  private graphragClient: GraphRAGClient;
  private qdrantClient: NexusProseQdrantClient;
  private neo4jClient: Neo4jClient;
  private enableCaching: boolean;
  private cache: Map<string, { data: any; expiry: number }>;
  private cacheConfig: { ttl: number; maxSize: number };

  constructor(config: MemoryManagerConfig) {
    this.graphragClient = config.graphragClient;
    this.qdrantClient = config.qdrantClient;
    this.neo4jClient = config.neo4jClient;
    this.enableCaching = config.enableCaching ?? true;
    this.cacheConfig = config.cacheConfig || { ttl: 300000, maxSize: 1000 };  // 5 min TTL, 1000 items max
    this.cache = new Map();

    // Periodic cache cleanup
    if (this.enableCaching) {
      setInterval(() => this.cleanupCache(), 60000);  // Every minute
    }
  }

  // ====================================================================
  // BEAT STORAGE
  // ====================================================================

  /**
   * Store beat after generation
   * Stores in:
   * 1. Qdrant for similarity search
   * 2. GraphRAG for long-term memory
   * 3. Neo4j for graph relationships (if needed)
   */
  async storeBeat(beat: Beat, embedding?: number[]): Promise<void> {
    try {
      // 1. Store in Qdrant for similarity search
      if (embedding) {
        await this.qdrantClient.upsertProseContent([{
          id: beat.id,
          vector: embedding,
          payload: {
            project_id: beat.project_id,
            chapter_number: beat.chapter_number,
            beat_number: beat.beat_number,
            content_type: beat.beat_type,
            characters_present: beat.characters_present,
            plot_threads: beat.plot_threads,
            emotional_tone: beat.emotional_tone,
            narrative_function: beat.narrative_function,
            timeline_position: beat.created_at.toISOString(),
            pov_character: beat.pov_character || '',
            genre: '',  // To be filled from project context
            format: 'novel'  // To be filled from project context
          }
        }]);

        console.log(`✅ Beat ${beat.chapter_number}.${beat.beat_number} stored in Qdrant`);
      }

      // 2. Store in GraphRAG for long-term memory
      const payload: BeatStoragePayload = {
        content: beat.content,
        title: `Beat ${beat.chapter_number}.${beat.beat_number}`,
        metadata: {
          type: 'prose_beat',
          project_id: beat.project_id,
          chapter_number: beat.chapter_number,
          beat_number: beat.beat_number,
          beat_type: beat.beat_type,
          characters_present: beat.characters_present,
          plot_threads: beat.plot_threads,
          emotional_tone: beat.emotional_tone,
          narrative_function: beat.narrative_function,
          location: beat.location,
          pov_character: beat.pov_character,
          word_count: beat.word_count
        }
      };

      await this.graphragClient.storeDocument(payload);

      console.log(`✅ Beat ${beat.chapter_number}.${beat.beat_number} stored in GraphRAG`);

      // Invalidate cache for this project
      this.invalidateCache(`beats:${beat.project_id}`);
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to store beat ${beat.chapter_number}.${beat.beat_number}`,
        'storeBeat',
        { beatId: beat.id, error: (error as Error).message }
      );
    }
  }

  // ====================================================================
  // CHARACTER STORAGE
  // ====================================================================

  /**
   * Store character profile
   * Stores in:
   * 1. Neo4j graph for relationships
   * 2. GraphRAG for semantic retrieval
   * 3. Qdrant for voice fingerprinting (if voice patterns exist)
   */
  async storeCharacter(character: Character, voiceEmbedding?: number[]): Promise<void> {
    try {
      // 1. Store in Neo4j graph
      await this.neo4jClient.createNode(NodeLabel.CHARACTER, {
        id: character.id,
        project_id: character.project_id,
        name: character.name,
        age: character.age,
        age_range: character.age_range,
        role: character.role,
        first_appearance_chapter: character.first_appearance_chapter,
        last_appearance_chapter: character.last_appearance_chapter,
        background: character.background,
        personality_traits: JSON.stringify(character.personality_traits),
        speaking_style: character.speaking_style,
        voice_patterns: character.voice_patterns ? JSON.stringify(character.voice_patterns) : null,
        current_arc: character.current_arc,
        created_at: character.created_at.toISOString(),
        updated_at: character.updated_at.toISOString()
      });

      console.log(`✅ Character "${character.name}" stored in Neo4j`);

      // 2. Store in GraphRAG for semantic retrieval
      const characterProfile = this.generateCharacterProfile(character);
      const payload: CharacterStoragePayload = {
        content: characterProfile,
        title: `Character: ${character.name}`,
        metadata: {
          type: 'character_profile',
          project_id: character.project_id,
          character_name: character.name,
          role: character.role,
          age_range: character.age_range,
          personality_traits: character.personality_traits,
          speaking_style: character.speaking_style
        }
      };

      await this.graphragClient.storeDocument(payload);

      console.log(`✅ Character "${character.name}" stored in GraphRAG`);

      // 3. Store voice fingerprint in Qdrant if available
      if (voiceEmbedding && character.voice_patterns) {
        await this.qdrantClient.upsertCharacterVoices([{
          id: character.id,
          vector: voiceEmbedding,
          payload: {
            project_id: character.project_id,
            character_name: character.name,
            consistency_score: 100.0,  // Initial score
            sample_count: 0,
            age_range: character.age_range || 'adult',
            personality_traits: character.personality_traits,
            speaking_style: character.speaking_style,
            voice_patterns: character.voice_patterns,
            last_updated: Math.floor(Date.now() / 1000)
          }
        }]);

        console.log(`✅ Character "${character.name}" voice fingerprint stored in Qdrant`);
      }

      // Invalidate cache
      this.invalidateCache(`character:${character.project_id}:${character.name}`);
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to store character "${character.name}"`,
        'storeCharacter',
        { characterId: character.id, error: (error as Error).message }
      );
    }
  }

  /**
   * Store character relationships
   */
  async storeCharacterRelationship(
    projectId: string,
    sourceCharacter: string,
    targetCharacter: string,
    relationshipType: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      // Get character IDs from Neo4j
      const sourceNode = await this.neo4jClient.queryNodes(
        NodeLabel.CHARACTER,
        { project_id: projectId, name: sourceCharacter },
        1
      );

      const targetNode = await this.neo4jClient.queryNodes(
        NodeLabel.CHARACTER,
        { project_id: projectId, name: targetCharacter },
        1
      );

      if (sourceNode.length === 0 || targetNode.length === 0) {
        throw new Error(`Character not found: ${sourceCharacter} or ${targetCharacter}`);
      }

      // Create relationship
      await this.neo4jClient.createRelationship(
        NodeLabel.CHARACTER,
        sourceNode[0].id,
        NodeLabel.CHARACTER,
        targetNode[0].id,
        relationshipType as RelationshipLabel,
        {
          ...metadata,
          established_at: new Date().toISOString()
        }
      );

      console.log(`✅ Relationship "${relationshipType}" created: ${sourceCharacter} → ${targetCharacter}`);
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to store character relationship`,
        'storeCharacterRelationship',
        { source: sourceCharacter, target: targetCharacter, error: (error as Error).message }
      );
    }
  }

  // ====================================================================
  // PLOT THREAD STORAGE
  // ====================================================================

  /**
   * Store plot thread
   * Stores in:
   * 1. Neo4j graph for tracking
   * 2. GraphRAG for context retrieval
   */
  async storePlotThread(thread: PlotThread): Promise<void> {
    try {
      // 1. Store in Neo4j
      await this.neo4jClient.createNode(NodeLabel.PLOT_THREAD, {
        id: thread.id,
        project_id: thread.project_id,
        name: thread.name,
        description: thread.description,
        status: thread.status,
        introduced_chapter: thread.introduced_chapter,
        resolved_chapter: thread.resolved_chapter,
        characters_involved: JSON.stringify(thread.characters_involved),
        locations_involved: JSON.stringify(thread.locations_involved),
        importance: thread.importance,
        created_at: thread.created_at.toISOString(),
        updated_at: thread.updated_at.toISOString()
      });

      console.log(`✅ Plot thread "${thread.name}" stored in Neo4j`);

      // 2. Store in GraphRAG
      const payload: PlotThreadStoragePayload = {
        content: `Plot Thread: ${thread.name}\n\n${thread.description}\n\nStatus: ${thread.status}\nIntroduced: Chapter ${thread.introduced_chapter}${thread.resolved_chapter ? `\nResolved: Chapter ${thread.resolved_chapter}` : ''}\n\nCharacters involved: ${thread.characters_involved.join(', ')}\nImportance: ${thread.importance}`,
        title: `Plot Thread: ${thread.name}`,
        metadata: {
          type: 'plot_thread',
          project_id: thread.project_id,
          thread_name: thread.name,
          status: thread.status,
          importance: thread.importance,
          characters_involved: thread.characters_involved
        }
      };

      await this.graphragClient.storeDocument(payload);

      console.log(`✅ Plot thread "${thread.name}" stored in GraphRAG`);

      // Invalidate cache
      this.invalidateCache(`plotThread:${thread.project_id}`);
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to store plot thread "${thread.name}"`,
        'storePlotThread',
        { threadId: thread.id, error: (error as Error).message }
      );
    }
  }

  // ====================================================================
  // RESEARCH BRIEF STORAGE
  // ====================================================================

  /**
   * Store research brief from LearningAgent
   */
  async storeResearchBrief(brief: ResearchBrief): Promise<void> {
    try {
      const payload: ResearchBriefStoragePayload = {
        content: brief.content,
        title: `Research: ${brief.topic}`,
        metadata: {
          type: 'research_brief',
          project_id: brief.project_id,
          topic: brief.topic,
          research_type: brief.research_type,
          confidence_score: brief.confidence_score
        }
      };

      await this.graphragClient.storeDocument(payload);

      console.log(`✅ Research brief "${brief.topic}" stored in GraphRAG`);

      // Invalidate cache
      this.invalidateCache(`research:${brief.project_id}`);
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to store research brief "${brief.topic}"`,
        'storeResearchBrief',
        { briefId: brief.id, error: (error as Error).message }
      );
    }
  }

  // ====================================================================
  // RETRIEVAL OPERATIONS
  // ====================================================================

  /**
   * Retrieve recent beats from Qdrant
   */
  async getRecentBeats(
    projectId: string,
    chapterNumber: number,
    limit: number = 5
  ): Promise<Beat[]> {
    const cacheKey = `recentBeats:${projectId}:${chapterNumber}:${limit}`;

    // Check cache
    if (this.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    try {
      const results = await this.qdrantClient.getContinuityContext(
        projectId,
        chapterNumber,
        999,  // High beat number to get all previous beats
        limit
      );

      const beats: Beat[] = results.map(payload => ({
        id: `${payload.project_id}-${payload.chapter_number}-${payload.beat_number}`,
        project_id: payload.project_id,
        chapter_id: '',  // Not in Qdrant payload
        chapter_number: payload.chapter_number,
        beat_number: payload.beat_number,
        beat_type: payload.content_type as any,
        content: '',  // Need to fetch from database if needed
        word_count: 0,
        characters_present: payload.characters_present,
        plot_threads: payload.plot_threads,
        emotional_tone: payload.emotional_tone,
        narrative_function: payload.narrative_function,
        location: undefined,
        pov_character: payload.pov_character || undefined,
        created_at: new Date(payload.timeline_position)
      }));

      // Cache results
      if (this.enableCaching) {
        this.setCache(cacheKey, beats);
      }

      return beats;
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to retrieve recent beats`,
        'getRecentBeats',
        { projectId, chapterNumber, error: (error as Error).message }
      );
    }
  }

  /**
   * Retrieve character from Neo4j with relationships
   */
  async getCharacter(projectId: string, characterName: string): Promise<Character | null> {
    const cacheKey = `character:${projectId}:${characterName}`;

    // Check cache
    if (this.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    try {
      const results = await this.neo4jClient.queryNodes<any>(
        NodeLabel.CHARACTER,
        { project_id: projectId, name: characterName },
        1
      );

      if (results.length === 0) {
        return null;
      }

      const node = results[0];

      const character: Character = {
        id: node.id,
        project_id: node.project_id,
        name: node.name,
        age: node.age,
        age_range: node.age_range,
        role: node.role,
        first_appearance_chapter: node.first_appearance_chapter,
        last_appearance_chapter: node.last_appearance_chapter,
        background: node.background,
        personality_traits: JSON.parse(node.personality_traits || '[]'),
        speaking_style: node.speaking_style,
        voice_patterns: node.voice_patterns ? JSON.parse(node.voice_patterns) : undefined,
        current_arc: node.current_arc,
        created_at: new Date(node.created_at),
        updated_at: new Date(node.updated_at)
      };

      // Cache result
      if (this.enableCaching) {
        this.setCache(cacheKey, character);
      }

      return character;
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to retrieve character "${characterName}"`,
        'getCharacter',
        { projectId, characterName, error: (error as Error).message }
      );
    }
  }

  /**
   * Retrieve all active plot threads
   */
  async getActivePlotThreads(projectId: string): Promise<PlotThread[]> {
    const cacheKey = `activePlotThreads:${projectId}`;

    // Check cache
    if (this.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    try {
      const results = await this.neo4jClient.queryNodes<any>(
        NodeLabel.PLOT_THREAD,
        { project_id: projectId, status: 'active' }
      );

      const threads: PlotThread[] = results.map(node => ({
        id: node.id,
        project_id: node.project_id,
        name: node.name,
        description: node.description,
        status: node.status,
        introduced_chapter: node.introduced_chapter,
        resolved_chapter: node.resolved_chapter,
        characters_involved: JSON.parse(node.characters_involved || '[]'),
        locations_involved: JSON.parse(node.locations_involved || '[]'),
        importance: node.importance,
        created_at: new Date(node.created_at),
        updated_at: new Date(node.updated_at)
      }));

      // Cache results
      if (this.enableCaching) {
        this.setCache(cacheKey, threads);
      }

      return threads;
    } catch (error) {
      throw new MemoryStorageError(
        `Failed to retrieve active plot threads`,
        'getActivePlotThreads',
        { projectId, error: (error as Error).message }
      );
    }
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  /**
   * Generate character profile text for GraphRAG storage
   */
  private generateCharacterProfile(character: Character): string {
    return `# Character Profile: ${character.name}

## Basic Information
- **Role**: ${character.role}
- **Age**: ${character.age_range || character.age || 'Unknown'}
- **First Appearance**: Chapter ${character.first_appearance_chapter}

## Background
${character.background}

## Personality Traits
${character.personality_traits.map(trait => `- ${trait}`).join('\n')}

## Speaking Style
${character.speaking_style}

${character.current_arc ? `## Current Story Arc\n${character.current_arc}` : ''}

${character.voice_patterns ? `## Voice Patterns\n${JSON.stringify(character.voice_patterns, null, 2)}` : ''}
`;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any): void {
    // Check max size
    if (this.cache.size >= this.cacheConfig.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheConfig.ttl
    });
  }

  private invalidateCache(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🗑️  Invalidated ${keysToDelete.length} cache entries matching "${pattern}"`);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🗑️  Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize,
      hitRate: 0  // TODO: Implement hit rate tracking
    };
  }
}
