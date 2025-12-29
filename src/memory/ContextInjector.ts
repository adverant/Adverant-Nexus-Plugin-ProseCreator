/**
 * Context Injector for NexusProseCreator
 *
 * Implements the Beat-by-Beat Context Injection Protocol:
 * 1. Retrieve recent beats (last 5) for continuity
 * 2. Retrieve relevant character information
 * 3. Retrieve active plot threads
 * 4. Retrieve location details
 * 5. Retrieve similar past beats for style matching
 * 6. Check for continuity issues
 *
 * Target Performance: <500ms for full context assembly
 */

import { MemoryManager } from './MemoryManager';
import { ContinuityEngine } from './ContinuityEngine';
import { Neo4jClient } from '../infrastructure/Neo4jClient';
import { NexusProseQdrantClient } from '../infrastructure/QdrantClient';
import { NodeLabel } from '../infrastructure/Neo4jSchema';
import {
  ContextInjectorConfig,
  ChapterBlueprint,
  InjectedContext,
  CharacterContext,
  PlotThreadContext,
  LocationContext,
  ContinuityWarning,
  Beat,
  Character,
  PlotThread
} from './types';

export class ContextInjector {
  private memoryManager: MemoryManager;
  private continuityEngine: ContinuityEngine;
  private neo4jClient: Neo4jClient;
  private qdrantClient: NexusProseQdrantClient;
  private contextSize: number;
  private maxTokens: number;
  private enableSmartTruncation: boolean;

  constructor(config: ContextInjectorConfig) {
    this.memoryManager = config.memoryManager;
    this.continuityEngine = config.continuityEngine;
    this.neo4jClient = this.memoryManager['neo4jClient'];  // Access private field
    this.qdrantClient = this.memoryManager['qdrantClient'];  // Access private field
    this.contextSize = config.contextSize || 5;
    this.maxTokens = config.maxTokens || 8000;
    this.enableSmartTruncation = config.enableSmartTruncation ?? true;
  }

  // ====================================================================
  // MAIN CONTEXT INJECTION
  // ====================================================================

  /**
   * Inject complete context for beat generation
   * Target: <500ms total latency
   */
  async injectContextForBeat(params: {
    project_id: string;
    chapter_number: number;
    beat_number: number;
    blueprint: ChapterBlueprint;
  }): Promise<InjectedContext> {
    const startTime = Date.now();

    console.log(`📥 Injecting context for Chapter ${params.chapter_number}, Beat ${params.beat_number}`);

    try {
      // Parallel execution for performance
      const [
        recentBeats,
        characters,
        plotThreads,
        location,
        similarBeats
      ] = await Promise.all([
        this.getRecentBeats(params.project_id, params.chapter_number),
        this.getCharacterContext(params.project_id, params.blueprint.characters_present),
        this.getPlotThreadContext(params.project_id, params.blueprint.plot_threads),
        this.getLocationContext(params.project_id, params.blueprint.location),
        this.getSimilarBeats(params.project_id, params.blueprint.narrative_function)
      ]);

      // Check continuity with all retrieved context
      const continuityWarnings = await this.continuityEngine.check({
        recentBeats,
        characters,
        plotThreads,
        location,
        similarBeats,
        injectionTimestamp: new Date(),
        contextTokenCount: 0  // Will be calculated
      });

      // Calculate token count
      const contextTokenCount = this.estimateTokenCount({
        recentBeats,
        characters,
        plotThreads,
        location,
        similarBeats,
        continuityWarnings,
        injectionTimestamp: new Date(),
        contextTokenCount: 0
      });

      const context: InjectedContext = {
        recentBeats,
        characters,
        plotThreads,
        location,
        similarBeats,
        continuityWarnings,
        injectionTimestamp: new Date(),
        contextTokenCount
      };

      // Smart truncation if over token limit
      if (this.enableSmartTruncation && contextTokenCount > this.maxTokens) {
        console.log(`⚠️  Context exceeds ${this.maxTokens} tokens, applying smart truncation`);
        return this.truncateContext(context);
      }

      const latency = Date.now() - startTime;
      console.log(`✅ Context injected in ${latency}ms (${contextTokenCount} tokens)`);

      return context;
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error(`❌ Context injection failed after ${latency}ms:`, error);
      throw error;
    }
  }

  // ====================================================================
  // CONTEXT RETRIEVAL METHODS
  // ====================================================================

  /**
   * Get recent beats for continuity
   * Retrieves last N beats from current or previous chapter
   */
  private async getRecentBeats(
    projectId: string,
    chapterNumber: number
  ): Promise<Beat[]> {
    try {
      const beats = await this.memoryManager.getRecentBeats(
        projectId,
        chapterNumber,
        this.contextSize
      );

      console.log(`✅ Retrieved ${beats.length} recent beats`);
      return beats;
    } catch (error) {
      console.error(`❌ Failed to retrieve recent beats:`, error);
      return [];  // Return empty array on failure, don't block generation
    }
  }

  /**
   * Get character context with profiles and relationships
   */
  private async getCharacterContext(
    projectId: string,
    characterNames: string[]
  ): Promise<CharacterContext[]> {
    if (characterNames.length === 0) {
      return [];
    }

    try {
      // Parallel character retrieval
      const characterPromises = characterNames.map(name =>
        this.memoryManager.getCharacter(projectId, name)
      );

      const characters = await Promise.all(characterPromises);

      // Get relationships for each character
      const contextPromises = characters.map(async (character) => {
        if (!character) {
          return null;
        }

        // Get relationships from Neo4j
        const relationships = await this.neo4jClient.getRelationships(
          NodeLabel.CHARACTER,
          character.id
        );

        // Get recent mentions from Qdrant
        const recentMentions = await this.getCharacterRecentMentions(
          projectId,
          character.name
        );

        return {
          profile: character,
          relationships: relationships.map(rel => ({
            source: rel.direction === 'outgoing' ? character.name : (rel.node as any).name,
            target: rel.direction === 'incoming' ? character.name : (rel.node as any).name,
            relationship_type: rel.relationship.type,
            status: rel.relationship.properties?.status || 'active',
            metadata: rel.relationship.properties
          })),
          recentMentions,
          currentArc: character.current_arc || '',
          emotionalState: 'neutral'  // TODO: Derive from recent beats
        };
      });

      const contexts = await Promise.all(contextPromises);
      const validContexts = contexts.filter((c): c is CharacterContext => c !== null);

      console.log(`✅ Retrieved context for ${validContexts.length} characters`);
      return validContexts;
    } catch (error) {
      console.error(`❌ Failed to retrieve character context:`, error);
      return [];
    }
  }

  /**
   * Get recent mentions of a character
   */
  private async getCharacterRecentMentions(
    projectId: string,
    characterName: string
  ): Promise<Array<{ chapter_number: number; beat_number: number; context: string }>> {
    try {
      const beatPayloads = await this.qdrantClient.findBeatsByCharacter(
        projectId,
        characterName,
        { limit: 5 }
      );

      return beatPayloads.map(result => ({
        chapter_number: result.payload.chapter_number,
        beat_number: result.payload.beat_number,
        context: `${result.payload.emotional_tone} - ${result.payload.narrative_function}`
      }));
    } catch (error) {
      console.error(`❌ Failed to retrieve character mentions:`, error);
      return [];
    }
  }

  /**
   * Get plot thread context
   */
  private async getPlotThreadContext(
    projectId: string,
    threadIds: string[]
  ): Promise<PlotThreadContext[]> {
    if (threadIds.length === 0) {
      return [];
    }

    try {
      // Get all active plot threads
      const allThreads = await this.memoryManager.getActivePlotThreads(projectId);

      // Filter to requested threads
      const relevantThreads = allThreads.filter(thread =>
        threadIds.includes(thread.id) || threadIds.includes(thread.name)
      );

      // Build context for each thread
      const contexts: PlotThreadContext[] = relevantThreads.map(thread => ({
        thread,
        recentDevelopments: this.extractRecentDevelopments(thread),
        dependencies: [],  // TODO: Implement plot thread dependency tracking
        nextExpectedDevelopment: this.predictNextDevelopment(thread)
      }));

      console.log(`✅ Retrieved context for ${contexts.length} plot threads`);
      return contexts;
    } catch (error) {
      console.error(`❌ Failed to retrieve plot thread context:`, error);
      return [];
    }
  }

  /**
   * Extract recent developments from plot thread
   */
  private extractRecentDevelopments(thread: PlotThread): Array<{
    chapter_number: number;
    description: string;
  }> {
    // TODO: Query GraphRAG for recent plot thread developments
    // For now, return basic info
    return [{
      chapter_number: thread.introduced_chapter,
      description: `Plot thread introduced: ${thread.description}`
    }];
  }

  /**
   * Predict next expected development based on plot thread status
   */
  private predictNextDevelopment(thread: PlotThread): string | undefined {
    if (thread.status === 'introduced') {
      return 'Develop the conflict or stakes';
    } else if (thread.status === 'active') {
      return 'Continue escalation or introduce complication';
    } else if (thread.status === 'resolved') {
      return undefined;  // Thread complete
    }

    return 'Continue thread development';
  }

  /**
   * Get location context
   */
  private async getLocationContext(
    projectId: string,
    locationName: string
  ): Promise<LocationContext | null> {
    if (!locationName) {
      return null;
    }

    try {
      // Query Neo4j for location
      const locations = await this.neo4jClient.queryNodes<any>(
        NodeLabel.LOCATION,
        { project_id: projectId, name: locationName },
        1
      );

      if (locations.length === 0) {
        console.warn(`⚠️  Location "${locationName}" not found in graph`);
        return null;
      }

      const location = locations[0];

      // Get characters currently at this location
      const charactersAtLocation = await this.getCharactersAtLocation(
        projectId,
        location.id
      );

      // Get recent events at this location
      const recentEvents = await this.getLocationRecentEvents(
        projectId,
        locationName
      );

      const context: LocationContext = {
        id: location.id,
        name: location.name,
        type: location.type || 'generic',
        description: location.description || '',
        established_chapter: location.established_chapter || 1,
        characters_present: charactersAtLocation,
        recent_events: recentEvents,
        world_rules: JSON.parse(location.world_rules || '[]')
      };

      console.log(`✅ Retrieved location context for "${locationName}"`);
      return context;
    } catch (error) {
      console.error(`❌ Failed to retrieve location context:`, error);
      return null;
    }
  }

  /**
   * Get characters currently at a location
   */
  private async getCharactersAtLocation(
    projectId: string,
    locationId: string
  ): Promise<string[]> {
    try {
      // Query Neo4j for LOCATED_AT relationships
      const relationships = await this.neo4jClient.getRelationships(
        NodeLabel.LOCATION,
        locationId,
        undefined,
        'incoming'
      );

      return relationships
        .filter(rel => rel.relationship.type === 'LOCATED_AT')
        .map(rel => (rel.node as any).name);
    } catch (error) {
      console.error(`❌ Failed to get characters at location:`, error);
      return [];
    }
  }

  /**
   * Get recent events at a location
   */
  private async getLocationRecentEvents(
    projectId: string,
    locationName: string
  ): Promise<Array<{ chapter_number: number; description: string }>> {
    // TODO: Query GraphRAG for events at this location
    // For now, return empty array
    return [];
  }

  /**
   * Get similar beats for style matching
   * Uses Qdrant similarity search
   */
  private async getSimilarBeats(
    projectId: string,
    narrativeFunction: string
  ): Promise<Beat[]> {
    try {
      // TODO: Generate embedding for narrative function and search
      // For now, return empty array
      console.log(`ℹ️  Similar beats search not yet implemented`);
      return [];
    } catch (error) {
      console.error(`❌ Failed to retrieve similar beats:`, error);
      return [];
    }
  }

  // ====================================================================
  // CONTEXT OPTIMIZATION
  // ====================================================================

  /**
   * Estimate token count for context
   * Rough approximation: 1 token ≈ 4 characters
   */
  private estimateTokenCount(context: InjectedContext): number {
    const json = JSON.stringify(context);
    return Math.ceil(json.length / 4);
  }

  /**
   * Truncate context intelligently to fit within token limit
   * Priority order:
   * 1. Keep continuity warnings (critical)
   * 2. Keep recent beats (essential for continuity)
   * 3. Keep character contexts (essential for voice)
   * 4. Keep plot threads (important)
   * 5. Reduce similar beats (nice to have)
   * 6. Reduce location details (nice to have)
   */
  private truncateContext(context: InjectedContext): InjectedContext {
    const truncated = { ...context };

    // Start by reducing similar beats
    if (truncated.similarBeats.length > 2) {
      truncated.similarBeats = truncated.similarBeats.slice(0, 2);
    }

    // Check token count again
    let tokenCount = this.estimateTokenCount(truncated);
    if (tokenCount <= this.maxTokens) {
      truncated.contextTokenCount = tokenCount;
      return truncated;
    }

    // Reduce recent beats
    if (truncated.recentBeats.length > 3) {
      truncated.recentBeats = truncated.recentBeats.slice(0, 3);
    }

    // Check token count again
    tokenCount = this.estimateTokenCount(truncated);
    if (tokenCount <= this.maxTokens) {
      truncated.contextTokenCount = tokenCount;
      return truncated;
    }

    // Reduce character relationship details
    truncated.characters = truncated.characters.map(char => ({
      ...char,
      relationships: char.relationships.slice(0, 3),
      recentMentions: char.recentMentions.slice(0, 2)
    }));

    // Check token count again
    tokenCount = this.estimateTokenCount(truncated);
    if (tokenCount <= this.maxTokens) {
      truncated.contextTokenCount = tokenCount;
      return truncated;
    }

    // Reduce plot threads
    if (truncated.plotThreads.length > 3) {
      truncated.plotThreads = truncated.plotThreads
        .sort((a, b) => {
          const importanceOrder = { primary: 0, secondary: 1, tertiary: 2 };
          return importanceOrder[a.thread.importance] - importanceOrder[b.thread.importance];
        })
        .slice(0, 3);
    }

    tokenCount = this.estimateTokenCount(truncated);
    truncated.contextTokenCount = tokenCount;

    if (tokenCount > this.maxTokens) {
      console.warn(`⚠️  Context still exceeds ${this.maxTokens} tokens after truncation: ${tokenCount} tokens`);
    }

    return truncated;
  }

  /**
   * Format context as human-readable text for LLM prompt
   */
  formatContextForPrompt(context: InjectedContext): string {
    const sections: string[] = [];

    // Recent beats
    if (context.recentBeats.length > 0) {
      sections.push('## Recent Beats (for continuity)\n');
      context.recentBeats.forEach((beat, idx) => {
        sections.push(`**Beat ${beat.chapter_number}.${beat.beat_number}** (${beat.emotional_tone})`);
        sections.push(`Characters: ${beat.characters_present.join(', ')}`);
        sections.push(`Function: ${beat.narrative_function}\n`);
      });
    }

    // Characters
    if (context.characters.length > 0) {
      sections.push('## Characters Present\n');
      context.characters.forEach(char => {
        sections.push(`**${char.profile.name}** (${char.profile.role})`);
        sections.push(`Traits: ${char.profile.personality_traits.join(', ')}`);
        sections.push(`Speaking style: ${char.profile.speaking_style}`);
        sections.push(`Current arc: ${char.currentArc}\n`);
      });
    }

    // Plot threads
    if (context.plotThreads.length > 0) {
      sections.push('## Active Plot Threads\n');
      context.plotThreads.forEach(thread => {
        sections.push(`**${thread.thread.name}** (${thread.thread.importance})`);
        sections.push(`Status: ${thread.thread.status}`);
        sections.push(`${thread.thread.description}\n`);
      });
    }

    // Location
    if (context.location) {
      sections.push('## Location\n');
      sections.push(`**${context.location.name}** (${context.location.type})`);
      sections.push(`${context.location.description}`);
      if (context.location.world_rules.length > 0) {
        sections.push(`Rules: ${context.location.world_rules.join(', ')}\n`);
      }
    }

    // Continuity warnings
    if (context.continuityWarnings.length > 0) {
      sections.push('## ⚠️ Continuity Warnings\n');
      context.continuityWarnings.forEach(warning => {
        sections.push(`**${warning.severity.toUpperCase()}**: ${warning.description}`);
        sections.push(`Suggested fix: ${warning.suggested_fix}\n`);
      });
    }

    return sections.join('\n');
  }
}
