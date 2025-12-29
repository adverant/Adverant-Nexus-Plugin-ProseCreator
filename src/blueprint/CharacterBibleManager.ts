/**
 * CharacterBibleManager - Manages comprehensive character bibles
 *
 * Creates and maintains detailed character bibles including:
 * - Core personality profiles
 * - Voice fingerprints for dialogue consistency
 * - Relationship dynamics
 * - Character arc tracking
 * - Evolution history
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  CharacterBible,
  CharacterCoreProfile,
  CharacterBackground,
  CharacterVoiceProfile,
  CharacterRelationship,
  CharacterArc,
  CharacterAppearance,
  CharacterEvolution,
  GenerateCharacterBibleParams,
  CharacterBibleError,
} from './types';

/**
 * MageAgent orchestrator for character analysis
 */
interface MageAgentOrchestrator {
  orchestrate(params: {
    task: string;
    context: Record<string, any>;
    maxAgents?: number;
  }): Promise<{
    result: any;
    agents_used: string[];
  }>;
}

/**
 * Database client interface
 */
interface DatabaseClient {
  query<T = any>(sql: string, params: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params: any[]): Promise<T | null>;
  insert(table: string, data: Record<string, any>): Promise<{ id: string }>;
  update(table: string, id: string, data: Record<string, any>): Promise<void>;
}

/**
 * GraphRAG client for storing character bibles
 */
interface GraphRAGClient {
  storeDocument(params: {
    content: string;
    title: string;
    metadata: Record<string, any>;
  }): Promise<{ document_id: string }>;

  retrieveDocument(document_id: string): Promise<any>;
}

export interface CharacterBibleManagerConfig {
  mageAgent: MageAgentOrchestrator;
  db: DatabaseClient;
  graphrag: GraphRAGClient;
}

export interface UpdateCharacterBibleParams {
  character_name: string;
  project_id: string;
  updates: Partial<CharacterBible>;
}

export class CharacterBibleManager {
  private mageAgent: MageAgentOrchestrator;
  private db: DatabaseClient;
  private graphrag: GraphRAGClient;

  constructor(config: CharacterBibleManagerConfig) {
    this.mageAgent = config.mageAgent;
    this.db = config.db;
    this.graphrag = config.graphrag;
  }

  /**
   * Generate a comprehensive character bible
   */
  async generateCharacterBible(
    params: GenerateCharacterBibleParams
  ): Promise<CharacterBible> {
    try {
      // Check if bible already exists
      const existing = await this.getCharacterBible(
        params.character_name,
        params.project_id
      );

      if (existing) {
        console.log(
          `Character bible already exists for ${params.character_name}, returning existing`
        );
        return existing;
      }

      // Use MageAgent character-psychologist and other specialists
      const task = `Generate a comprehensive character bible for: ${params.character_name}

Project Context:
${params.series_context ? JSON.stringify(params.series_context, null, 2) : 'Standalone project'}

Requirements:
1. Complete character profile (age, physical description, personality)
2. Detailed background and history
3. Voice profile for dialogue consistency:
   - Vocabulary level
   - Speech patterns and quirks
   - Favorite phrases
   - Tone and accent
   - Example dialogue (5-10 samples)
4. Relationships with other characters
5. Character arc (starting state, transformation, ending state)
6. Core values, fears, and desires
7. Strengths and weaknesses

Use specialized agents:
- character-psychologist: Deep psychological profile
- dialogue-specialist: Voice and speech patterns
- relationship-analyst: Character dynamics
- arc-specialist: Character transformation journey

Return detailed JSON structure.`;

      const result = await this.mageAgent.orchestrate({
        task,
        context: {
          character_name: params.character_name,
          project_id: params.project_id,
          series_context: params.series_context,
        },
        maxAgents: 5,
      });

      const bibleData = result.result;

      const bible: CharacterBible = {
        character_name: params.character_name,
        project_id: params.project_id,
        series_id: params.series_context?.series_id,

        core_profile: this.buildCoreProfile(bibleData.core_profile || {}),
        background: this.buildBackground(bibleData.background || {}),
        voice_profile: this.buildVoiceProfile(bibleData.voice_profile || {}),
        relationships: this.buildRelationships(bibleData.relationships || []),
        character_arc: this.buildCharacterArc(bibleData.character_arc || {}),

        appearance_tracking: [],
        evolution_log: [],

        created_at: new Date(),
        updated_at: new Date(),
        consistency_score: 100.0,
      };

      // Store in database and GraphRAG
      await this.storeCharacterBible(bible);

      // Store voice profile separately for quick retrieval
      await this.storeVoiceFingerprint(bible);

      return bible;
    } catch (error) {
      throw new CharacterBibleError(
        `Failed to generate character bible for ${params.character_name}: ${
          (error as Error).message
        }`,
        { character_name: params.character_name, project_id: params.project_id }
      );
    }
  }

  /**
   * Update character bible with new information
   */
  async updateCharacterBible(
    params: UpdateCharacterBibleParams
  ): Promise<CharacterBible> {
    try {
      const existing = await this.getCharacterBible(
        params.character_name,
        params.project_id
      );

      if (!existing) {
        throw new CharacterBibleError(
          `Character bible not found for ${params.character_name}`,
          params
        );
      }

      // Merge updates
      const updated: CharacterBible = {
        ...existing,
        ...params.updates,
        updated_at: new Date(),
      };

      // Recalculate consistency score if voice profile changed
      if (params.updates.voice_profile) {
        updated.consistency_score = await this.calculateConsistencyScore(updated);
      }

      // Store updated bible
      await this.storeCharacterBible(updated);

      return updated;
    } catch (error) {
      throw new CharacterBibleError(
        `Failed to update character bible: ${(error as Error).message}`,
        params
      );
    }
  }

  /**
   * Get character bible from storage
   */
  async getCharacterBible(
    character_name: string,
    project_id: string
  ): Promise<CharacterBible | null> {
    try {
      const result = await this.db.queryOne<{ voice_patterns: string }>(
        `SELECT * FROM prose.character_voices
         WHERE character_name = $1 AND project_id = $2`,
        [character_name, project_id]
      );

      if (!result) {
        return null;
      }

      // Reconstruct CharacterBible from database record
      // In production, this would be stored as complete JSON in GraphRAG
      const patterns = JSON.parse(result.voice_patterns);

      return patterns as CharacterBible;
    } catch (error) {
      console.error('Error retrieving character bible:', error);
      return null;
    }
  }

  /**
   * Track character appearance in a beat/chapter
   */
  async trackAppearance(params: {
    character_name: string;
    project_id: string;
    chapter_number: number;
    beat_number: number;
    description_used: string;
    context: string;
    significant_change?: string;
  }): Promise<void> {
    const bible = await this.getCharacterBible(
      params.character_name,
      params.project_id
    );

    if (!bible) {
      console.warn(
        `No bible found for ${params.character_name}, skipping appearance tracking`
      );
      return;
    }

    const appearance: CharacterAppearance = {
      chapter_number: params.chapter_number,
      beat_number: params.beat_number,
      description_used: params.description_used,
      context: params.context,
      significant_change: params.significant_change,
    };

    bible.appearance_tracking.push(appearance);
    bible.updated_at = new Date();

    await this.storeCharacterBible(bible);
  }

  /**
   * Log character evolution event
   */
  async logEvolution(params: {
    character_name: string;
    project_id: string;
    chapter_number: number;
    change_description: string;
    trigger_event: string;
    impact_on_relationships: string[];
  }): Promise<void> {
    const bible = await this.getCharacterBible(
      params.character_name,
      params.project_id
    );

    if (!bible) {
      console.warn(
        `No bible found for ${params.character_name}, skipping evolution log`
      );
      return;
    }

    const evolution: CharacterEvolution = {
      chapter_number: params.chapter_number,
      change_description: params.change_description,
      trigger_event: params.trigger_event,
      impact_on_relationships: params.impact_on_relationships,
      updated_at: new Date(),
    };

    bible.evolution_log.push(evolution);
    bible.updated_at = new Date();

    await this.storeCharacterBible(bible);
  }

  /**
   * Analyze voice consistency in dialogue
   */
  async checkVoiceConsistency(params: {
    character_name: string;
    project_id: string;
    dialogue_sample: string;
  }): Promise<{
    consistency_score: number;
    deviations: Array<{
      type: string;
      expected: string;
      actual: string;
      severity: string;
    }>;
  }> {
    const bible = await this.getCharacterBible(
      params.character_name,
      params.project_id
    );

    if (!bible) {
      return { consistency_score: 0, deviations: [] };
    }

    const task = `Analyze voice consistency for character dialogue.

Character Voice Profile:
${JSON.stringify(bible.voice_profile, null, 2)}

Dialogue Sample:
"${params.dialogue_sample}"

Requirements:
1. Compare vocabulary level (simple/moderate/sophisticated)
2. Check for speech patterns and quirks
3. Verify tone consistency
4. Identify deviations from established voice
5. Calculate consistency score (0-100)

Return analysis with score and deviations.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        voice_profile: bible.voice_profile,
        dialogue_sample: params.dialogue_sample,
      },
      maxAgents: 2,
    });

    return {
      consistency_score: result.result.consistency_score || 100,
      deviations: result.result.deviations || [],
    };
  }

  /**
   * Get all character bibles for a project
   */
  async getProjectCharacterBibles(
    project_id: string
  ): Promise<CharacterBible[]> {
    try {
      const results = await this.db.query<{ voice_patterns: string }>(
        `SELECT * FROM prose.character_voices WHERE project_id = $1`,
        [project_id]
      );

      return results.map((r) => JSON.parse(r.voice_patterns) as CharacterBible);
    } catch (error) {
      console.error('Error retrieving project character bibles:', error);
      return [];
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private async storeCharacterBible(bible: CharacterBible): Promise<void> {
    // Store in GraphRAG for semantic search
    await this.graphrag.storeDocument({
      content: JSON.stringify(bible, null, 2),
      title: `Character Bible: ${bible.character_name}`,
      metadata: {
        type: 'character_bible',
        project_id: bible.project_id,
        character_name: bible.character_name,
      },
    });

    // Store in database
    const existing = await this.db.queryOne(
      `SELECT id FROM prose.character_voices
       WHERE character_name = $1 AND project_id = $2`,
      [bible.character_name, bible.project_id]
    );

    if (existing) {
      await this.db.update('prose.character_voices', existing.id, {
        voice_patterns: JSON.stringify(bible),
        consistency_score: bible.consistency_score,
        last_updated: new Date(),
      });
    } else {
      await this.db.insert('prose.character_voices', {
        project_id: bible.project_id,
        character_name: bible.character_name,
        voice_patterns: JSON.stringify(bible),
        dialogue_samples: bible.voice_profile.example_dialogue,
        consistency_score: bible.consistency_score,
        age_range: bible.core_profile.age.toString(),
        background: bible.background.current_situation,
        personality_traits: bible.core_profile.personality_traits.join(', '),
        speaking_style: bible.voice_profile.tone,
      });
    }
  }

  private async storeVoiceFingerprint(bible: CharacterBible): Promise<void> {
    // Store voice fingerprint for fast voice consistency checks
    // This would use Qdrant for semantic similarity matching
    const fingerprint = {
      character_name: bible.character_name,
      project_id: bible.project_id,
      vocabulary_level: bible.voice_profile.vocabulary_level,
      speech_patterns: bible.voice_profile.speech_patterns,
      tone: bible.voice_profile.tone,
      example_dialogue: bible.voice_profile.example_dialogue,
    };

    // Store in Qdrant collection (character_voice_collection)
    // Implementation would use QdrantClient from infrastructure
  }

  private async calculateConsistencyScore(
    bible: CharacterBible
  ): Promise<number> {
    // Calculate consistency score based on:
    // 1. Number of appearances tracked
    // 2. Voice deviations detected
    // 3. Character arc coherence

    const baseScore = 100;
    const appearances = bible.appearance_tracking.length;

    if (appearances === 0) return baseScore;

    // Deduct points for inconsistencies (simplified logic)
    const evolutionChanges = bible.evolution_log.length;
    const deduction = Math.min(20, evolutionChanges * 2);

    return Math.max(0, baseScore - deduction);
  }

  private buildCoreProfile(data: any): CharacterCoreProfile {
    return {
      age: data.age || 30,
      gender: data.gender || 'unknown',
      physical_description: data.physical_description || '',
      personality_traits: data.personality_traits || [],
      core_values: data.core_values || [],
      fears: data.fears || [],
      desires: data.desires || [],
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      quirks: data.quirks || [],
    };
  }

  private buildBackground(data: any): CharacterBackground {
    return {
      childhood: data.childhood || '',
      formative_experiences: data.formative_experiences || [],
      education: data.education || '',
      family: data.family || [],
      occupation: data.occupation || '',
      current_situation: data.current_situation || '',
    };
  }

  private buildVoiceProfile(data: any): CharacterVoiceProfile {
    return {
      vocabulary_level: data.vocabulary_level || 'moderate',
      speech_patterns: data.speech_patterns || [],
      favorite_phrases: data.favorite_phrases || [],
      accent: data.accent,
      tone: data.tone || 'neutral',
      example_dialogue: data.example_dialogue || [],
      speech_quirks: data.speech_quirks || [],
      internal_monologue_style: data.internal_monologue_style || '',
    };
  }

  private buildRelationships(data: any[]): CharacterRelationship[] {
    return data.map((rel) => ({
      character_name: rel.character_name || '',
      relationship_type: rel.relationship_type || 'acquaintance',
      history: rel.history || '',
      current_status: rel.current_status || '',
      dynamics: rel.dynamics || '',
      tension_points: rel.tension_points || [],
      evolution_over_time: rel.evolution_over_time || '',
    }));
  }

  private buildCharacterArc(data: any): CharacterArc {
    return {
      starting_state: data.starting_state || '',
      key_developments: data.key_developments || [],
      transformation: data.transformation || '',
      ending_state: data.ending_state || '',
      arc_type: data.arc_type || 'flat_arc',
    };
  }
}
