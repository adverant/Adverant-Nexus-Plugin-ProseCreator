/**
 * BlueprintManager - Central orchestrator for all blueprint operations
 *
 * Manages the lifecycle of living blueprints including:
 * - Series-level blueprint creation
 * - Project-level blueprint generation
 * - Blueprint evolution as story progresses
 * - Version control and history tracking
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  SeriesBlueprint,
  ProjectBlueprint,
  BlueprintUpdate,
  CreateSeriesBlueprintParams,
  CreateProjectBlueprintParams,
  EvolveBlueprintParams,
  BlueprintManagerResponse,
  BlueprintError,
} from './types';
import { BlueprintGenerator } from './BlueprintGenerator';
import { BlueprintEvolver } from './BlueprintEvolver';
import { CharacterBibleManager } from './CharacterBibleManager';
import { PlotThreadTracker } from './PlotThreadTracker';

/**
 * Database client interface (would be implemented by actual DB client)
 */
interface DatabaseClient {
  query<T = any>(sql: string, params: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params: any[]): Promise<T | null>;
  insert(table: string, data: Record<string, any>): Promise<{ id: string }>;
  update(table: string, id: string, data: Record<string, any>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
}

/**
 * GraphRAG client interface for memory storage/retrieval
 */
interface GraphRAGClient {
  storeDocument(params: {
    content: string;
    title: string;
    metadata: Record<string, any>;
  }): Promise<{ document_id: string }>;

  retrieveDocument(document_id: string): Promise<any>;

  searchDocuments(params: {
    query: string;
    limit?: number;
    filters?: Record<string, any>;
  }): Promise<any[]>;
}

/**
 * Series intelligence service for multi-book context
 */
interface SeriesIntelligenceService {
  getSeriesContext(series_id: string): Promise<{
    genre: string;
    existing_characters: string[];
    major_plot_threads: string[];
    world_rules: any;
    timeline: any;
  }>;
}

export interface BlueprintManagerConfig {
  db: DatabaseClient;
  graphrag: GraphRAGClient;
  seriesIntelligence: SeriesIntelligenceService;
  blueprintGenerator: BlueprintGenerator;
  blueprintEvolver: BlueprintEvolver;
  characterBibleManager: CharacterBibleManager;
  plotThreadTracker: PlotThreadTracker;
}

export class BlueprintManager {
  private db: DatabaseClient;
  private graphrag: GraphRAGClient;
  private seriesIntelligence: SeriesIntelligenceService;
  private generator: BlueprintGenerator;
  private evolver: BlueprintEvolver;
  private characterBibleManager: CharacterBibleManager;
  private plotThreadTracker: PlotThreadTracker;

  constructor(config: BlueprintManagerConfig) {
    this.db = config.db;
    this.graphrag = config.graphrag;
    this.seriesIntelligence = config.seriesIntelligence;
    this.generator = config.blueprintGenerator;
    this.evolver = config.blueprintEvolver;
    this.characterBibleManager = config.characterBibleManager;
    this.plotThreadTracker = config.plotThreadTracker;
  }

  /**
   * Create a series-level blueprint spanning multiple books
   */
  async createSeriesBlueprint(
    params: CreateSeriesBlueprintParams
  ): Promise<BlueprintManagerResponse<SeriesBlueprint>> {
    const startTime = Date.now();

    try {
      // 1. Validate input
      this.validateSeriesParams(params);

      // 2. Create series record in database
      const seriesResult = await this.db.insert('prose.series', {
        user_id: params.user_id,
        title: params.series_title,
        planned_books: params.total_books,
        genre: params.genre,
        description: params.premise,
        total_word_count: 0,
        book_count: 0,
        universe_rules: {},
        timeline: { events: [], chronology_type: 'linear' },
      });

      // 3. Generate high-level series blueprint using MageAgent
      const blueprint = await this.generator.generateSeriesBlueprint({
        series_id: seriesResult.id,
        premise: params.premise,
        books: params.total_books,
        genre: params.genre,
      });

      // 4. Store blueprint in GraphRAG for retrieval
      const graphragResult = await this.graphrag.storeDocument({
        content: JSON.stringify(blueprint, null, 2),
        title: `Series Blueprint: ${params.series_title}`,
        metadata: {
          type: 'series_blueprint',
          series_id: seriesResult.id,
          user_id: params.user_id,
          genre: params.genre,
          total_books: params.total_books,
        },
      });

      // 5. Store blueprint version in database
      await this.db.insert('prose.blueprints', {
        project_id: seriesResult.id,
        blueprint_type: 'series_blueprint',
        version: 1,
        content: JSON.stringify(blueprint),
        changes: {},
        trigger_chapter: null,
        google_drive_id: null,
      });

      const seriesBlueprint: SeriesBlueprint = {
        id: seriesResult.id,
        user_id: params.user_id,
        series_title: params.series_title,
        genre: params.genre,
        premise: params.premise,
        total_books: params.total_books,
        universe_rules: blueprint.universe_rules,
        major_characters: blueprint.major_characters,
        overarching_plot: blueprint.overarching_plot,
        timeline: blueprint.timeline,
        themes: blueprint.themes,
        created_at: new Date(),
        updated_at: new Date(),
      };

      return {
        success: true,
        data: seriesBlueprint,
        metadata: {
          execution_time_ms: Date.now() - startTime,
          agents_used: blueprint.agents_used,
        },
      };
    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Create a project-level blueprint (single book/script)
   */
  async createProjectBlueprint(
    params: CreateProjectBlueprintParams
  ): Promise<BlueprintManagerResponse<ProjectBlueprint>> {
    const startTime = Date.now();

    try {
      // 1. Validate input
      this.validateProjectParams(params);

      // 2. Get series context if this is part of a series
      let seriesContext;
      if (params.series_id) {
        seriesContext = await this.seriesIntelligence.getSeriesContext(
          params.series_id
        );
      }

      // 3. Generate project blueprint with series awareness
      const blueprint = await this.generator.generateProjectBlueprint({
        premise: params.premise,
        target_word_count: params.target_word_count,
        genre: params.genre,
        subgenre: params.subgenre,
        series_context: seriesContext,
        book_number: params.book_number,
      });

      // 4. Create project record
      const projectResult = await this.db.insert('prose.projects', {
        user_id: blueprint.user_id,
        series_id: params.series_id || null,
        title: params.project_title,
        format: 'novel', // Default to novel
        genre: params.genre,
        subgenre: params.subgenre || null,
        target_word_count: params.target_word_count,
        current_word_count: 0,
        consistency_score: 100.0,
        ai_detection_score: 0.0,
        status: 'draft',
      });

      blueprint.id = projectResult.id;
      blueprint.project_id = projectResult.id;

      // 5. Store blueprint in GraphRAG and database
      await this.storeBlueprint(blueprint);

      // 6. Generate character bibles for main characters
      await this.generateInitialCharacterBibles(blueprint);

      return {
        success: true,
        data: blueprint,
        metadata: {
          execution_time_ms: Date.now() - startTime,
          agents_used: blueprint.agents_used,
        },
      };
    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Evolve blueprint based on what was actually written
   */
  async evolveBlueprint(
    params: EvolveBlueprintParams
  ): Promise<BlueprintManagerResponse<BlueprintUpdate>> {
    const startTime = Date.now();

    try {
      // 1. Get current blueprint
      const currentBlueprint = await this.getProjectBlueprint(params.project_id);
      if (!currentBlueprint) {
        throw new Error(`Blueprint not found for project ${params.project_id}`);
      }

      // 2. Auto-update blueprint based on completed beats
      const evolution = await this.evolver.evolve({
        project_id: params.project_id,
        chapter_number: params.chapter_number,
        completed_beats: params.completed_beats,
        current_blueprint: currentBlueprint,
      });

      // 3. Apply evolution changes to database
      await this.applyEvolution(evolution);

      // 4. Update character bibles based on new content
      await this.updateCharacterBiblesFromBeats(
        params.project_id,
        params.completed_beats
      );

      // 5. Update plot thread statuses
      await this.updatePlotThreads(params.project_id, params.completed_beats);

      // 6. Increment blueprint version
      await this.incrementBlueprintVersion(
        params.project_id,
        evolution,
        params.chapter_number
      );

      return {
        success: true,
        data: evolution,
        metadata: {
          execution_time_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get the current blueprint for a project
   */
  async getProjectBlueprint(project_id: string): Promise<ProjectBlueprint | null> {
    try {
      const result = await this.db.queryOne<{ content: string }>(
        `SELECT content FROM prose.blueprints
         WHERE project_id = $1
         AND blueprint_type = 'project_blueprint'
         ORDER BY version DESC
         LIMIT 1`,
        [project_id]
      );

      if (!result) {
        return null;
      }

      return JSON.parse(result.content) as ProjectBlueprint;
    } catch (error) {
      console.error('Error getting project blueprint:', error);
      return null;
    }
  }

  /**
   * Get blueprint history (all versions)
   */
  async getBlueprintHistory(
    project_id: string,
    blueprint_type: string = 'project_blueprint'
  ): Promise<Array<{ version: number; content: ProjectBlueprint; created_at: Date }>> {
    try {
      const results = await this.db.query<{
        version: number;
        content: string;
        created_at: Date;
      }>(
        `SELECT version, content, created_at
         FROM prose.blueprints
         WHERE project_id = $1 AND blueprint_type = $2
         ORDER BY version DESC`,
        [project_id, blueprint_type]
      );

      return results.map((r) => ({
        version: r.version,
        content: JSON.parse(r.content),
        created_at: r.created_at,
      }));
    } catch (error) {
      console.error('Error getting blueprint history:', error);
      return [];
    }
  }

  /**
   * Revert to a previous blueprint version
   */
  async revertToVersion(
    project_id: string,
    version: number
  ): Promise<BlueprintManagerResponse<ProjectBlueprint>> {
    const startTime = Date.now();

    try {
      const versionData = await this.db.queryOne<{ content: string }>(
        `SELECT content FROM prose.blueprints
         WHERE project_id = $1
         AND blueprint_type = 'project_blueprint'
         AND version = $2`,
        [project_id, version]
      );

      if (!versionData) {
        throw new Error(`Version ${version} not found for project ${project_id}`);
      }

      const blueprint = JSON.parse(versionData.content) as ProjectBlueprint;

      // Create new version with reverted content
      const latestVersion = await this.db.queryOne<{ version: number }>(
        `SELECT MAX(version) as version FROM prose.blueprints
         WHERE project_id = $1 AND blueprint_type = 'project_blueprint'`,
        [project_id]
      );

      const newVersion = (latestVersion?.version || 0) + 1;

      await this.db.insert('prose.blueprints', {
        project_id,
        blueprint_type: 'project_blueprint',
        version: newVersion,
        content: JSON.stringify(blueprint),
        changes: {
          type: 'revert',
          reverted_to_version: version,
          reason: 'Manual revert',
        },
        trigger_chapter: null,
      });

      return {
        success: true,
        data: blueprint,
        metadata: {
          execution_time_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private async storeBlueprint(blueprint: ProjectBlueprint): Promise<void> {
    // Store in GraphRAG
    await this.graphrag.storeDocument({
      content: JSON.stringify(blueprint, null, 2),
      title: `Project Blueprint: ${blueprint.title}`,
      metadata: {
        type: 'project_blueprint',
        project_id: blueprint.project_id,
        genre: blueprint.genre,
        target_word_count: blueprint.target_word_count,
      },
    });

    // Store in database
    await this.db.insert('prose.blueprints', {
      project_id: blueprint.project_id,
      blueprint_type: 'project_blueprint',
      version: 1,
      content: JSON.stringify(blueprint),
      changes: {},
      trigger_chapter: null,
      google_drive_id: null,
    });
  }

  private async generateInitialCharacterBibles(
    blueprint: ProjectBlueprint
  ): Promise<void> {
    const majorCharacters = blueprint.characters.filter(
      (c: any) => c.importance === 'protagonist' || c.importance === 'major'
    );

    for (const character of majorCharacters) {
      try {
        await this.characterBibleManager.generateCharacterBible({
          project_id: blueprint.project_id,
          character_name: character.name,
          series_context: blueprint.series_id
            ? await this.seriesIntelligence.getSeriesContext(blueprint.series_id)
            : undefined,
        });
      } catch (error) {
        console.error(`Error generating character bible for ${character.name}:`, error);
        // Continue with other characters even if one fails
      }
    }
  }

  private async applyEvolution(evolution: BlueprintUpdate): Promise<void> {
    const blueprint = await this.getProjectBlueprint(evolution.project_id);
    if (!blueprint) {
      throw new Error(`Blueprint not found for project ${evolution.project_id}`);
    }

    // Apply each change to the blueprint
    for (const change of evolution.changes) {
      this.applyChange(blueprint, change);
    }

    // Store updated blueprint
    await this.storeBlueprint(blueprint);
  }

  private applyChange(blueprint: ProjectBlueprint, change: any): void {
    switch (change.type) {
      case 'character_evolution':
        this.applyCharacterEvolution(blueprint, change);
        break;
      case 'plot_thread_update':
        this.applyPlotThreadUpdate(blueprint, change);
        break;
      case 'world_rule_addition':
        this.applyWorldRuleAddition(blueprint, change);
        break;
      case 'timeline_adjustment':
        this.applyTimelineAdjustment(blueprint, change);
        break;
      case 'relationship_change':
        this.applyRelationshipChange(blueprint, change);
        break;
      case 'foreshadowing_update':
        this.applyForeshadowingUpdate(blueprint, change);
        break;
      default:
        console.warn(`Unknown change type: ${change.type}`);
    }
  }

  private applyCharacterEvolution(blueprint: ProjectBlueprint, change: any): void {
    const character = blueprint.characters.find((c) => c.name === change.character_name);
    if (character && change.new_value) {
      Object.assign(character, change.new_value);
    }
  }

  private applyPlotThreadUpdate(blueprint: ProjectBlueprint, change: any): void {
    const thread = blueprint.plot_threads.find((t) => t.id === change.thread_id);
    if (thread && change.new_value) {
      Object.assign(thread, change.new_value);
    }
  }

  private applyWorldRuleAddition(blueprint: ProjectBlueprint, change: any): void {
    if (change.new_value) {
      blueprint.world_building.rules_and_laws.push(change.new_value);
    }
  }

  private applyTimelineAdjustment(blueprint: ProjectBlueprint, change: any): void {
    // Timeline adjustments would update the timeline structure
    if (change.new_value) {
      // Update timeline based on change
    }
  }

  private applyRelationshipChange(blueprint: ProjectBlueprint, change: any): void {
    // Update character relationships
    const character = blueprint.characters.find((c) => c.name === change.character_name);
    if (character && change.new_value) {
      // Update relationships
    }
  }

  private applyForeshadowingUpdate(blueprint: ProjectBlueprint, change: any): void {
    if (change.new_value) {
      blueprint.foreshadowing_plan.push(change.new_value);
    }
  }

  private async updateCharacterBiblesFromBeats(
    project_id: string,
    beats: any[]
  ): Promise<void> {
    // Extract characters mentioned in beats and update their bibles
    const characters = new Set<string>();
    beats.forEach((beat) => {
      beat.characters_present?.forEach((char: string) => characters.add(char));
    });

    for (const characterName of characters) {
      try {
        await this.characterBibleManager.updateCharacterBible({
          character_name: characterName,
          project_id,
          updates: {
            // Updates would be derived from beat content
          },
        });
      } catch (error) {
        console.error(`Error updating character bible for ${characterName}:`, error);
      }
    }
  }

  private async updatePlotThreads(project_id: string, beats: any[]): Promise<void> {
    // Extract plot threads mentioned in beats and update their status
    const threads = new Set<string>();
    beats.forEach((beat) => {
      beat.plot_threads_referenced?.forEach((thread: string) => threads.add(thread));
    });

    for (const threadId of threads) {
      try {
        await this.plotThreadTracker.trackThread(threadId);
      } catch (error) {
        console.error(`Error tracking plot thread ${threadId}:`, error);
      }
    }
  }

  private async incrementBlueprintVersion(
    project_id: string,
    evolution: BlueprintUpdate,
    chapter_number: number
  ): Promise<void> {
    const latestVersion = await this.db.queryOne<{ version: number }>(
      `SELECT MAX(version) as version FROM prose.blueprints
       WHERE project_id = $1 AND blueprint_type = 'project_blueprint'`,
      [project_id]
    );

    const newVersion = (latestVersion?.version || 0) + 1;
    const blueprint = await this.getProjectBlueprint(project_id);

    if (blueprint) {
      await this.db.insert('prose.blueprints', {
        project_id,
        blueprint_type: 'project_blueprint',
        version: newVersion,
        content: JSON.stringify(blueprint),
        changes: evolution.changes,
        trigger_chapter: chapter_number,
        google_drive_id: null,
      });
    }
  }

  private validateSeriesParams(params: CreateSeriesBlueprintParams): void {
    if (!params.user_id) {
      throw new Error('user_id is required');
    }
    if (!params.series_title || params.series_title.trim().length === 0) {
      throw new Error('series_title is required');
    }
    if (!params.total_books || params.total_books < 1) {
      throw new Error('total_books must be at least 1');
    }
    if (!params.genre || params.genre.trim().length === 0) {
      throw new Error('genre is required');
    }
    if (!params.premise || params.premise.trim().length === 0) {
      throw new Error('premise is required');
    }
  }

  private validateProjectParams(params: CreateProjectBlueprintParams): void {
    if (!params.project_title || params.project_title.trim().length === 0) {
      throw new Error('project_title is required');
    }
    if (!params.target_word_count || params.target_word_count < 1000) {
      throw new Error('target_word_count must be at least 1000');
    }
    if (!params.premise || params.premise.trim().length === 0) {
      throw new Error('premise is required');
    }
    if (!params.genre || params.genre.trim().length === 0) {
      throw new Error('genre is required');
    }
  }

  private handleError(error: Error, startTime: number): BlueprintManagerResponse {
    console.error('BlueprintManager error:', error);

    return {
      success: false,
      error: error.message,
      metadata: {
        execution_time_ms: Date.now() - startTime,
      },
    };
  }
}
