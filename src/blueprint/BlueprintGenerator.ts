/**
 * BlueprintGenerator - Generates initial blueprints using MageAgent orchestration
 *
 * Uses unlimited multi-agent system to create comprehensive, detailed blueprints
 * for series and individual projects with genre-specific expertise.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ProjectBlueprint,
  SeriesBlueprint,
  ChapterBlueprint,
  BeatBlueprint,
  CharacterProfile,
  PlotThread,
  WorldBuildingElements,
  ForeshadowingElement,
} from './types';

/**
 * MageAgent orchestrator interface
 */
interface MageAgentOrchestrator {
  orchestrate(params: {
    task: string;
    context: Record<string, any>;
    maxAgents?: number;
    timeout?: number;
  }): Promise<{
    result: any;
    agents_used: string[];
    execution_time_ms: number;
    cost: number;
  }>;
}

export interface BlueprintGeneratorConfig {
  mageAgent: MageAgentOrchestrator;
}

export interface GenerateSeriesBlueprintParams {
  series_id: string;
  premise: string;
  books: number;
  genre: string;
}

export interface GenerateProjectBlueprintParams {
  premise: string;
  target_word_count: number;
  genre: string;
  subgenre?: string;
  series_context?: any;
  book_number?: number;
}

export interface GenerateChapterBlueprintParams {
  project_id: string;
  chapter_number: number;
  chapter_summary: string;
  project_context: ProjectBlueprint;
}

export class BlueprintGenerator {
  private mageAgent: MageAgentOrchestrator;

  constructor(config: BlueprintGeneratorConfig) {
    this.mageAgent = config.mageAgent;
  }

  /**
   * Generate comprehensive series blueprint spanning multiple books
   */
  async generateSeriesBlueprint(
    params: GenerateSeriesBlueprintParams
  ): Promise<any> {
    const task = `Generate a comprehensive series blueprint for a ${params.books}-book series in the ${params.genre} genre.

Premise: ${params.premise}

Requirements:
1. Overarching plot spanning all ${params.books} books
2. Major character arcs that develop across the series
3. Universe rules (magic system, technology, world laws)
4. Series-wide timeline and major events
5. Thematic elements that unify the series
6. Key turning points for each book
7. Foreshadowing plan for long-term payoffs

Return a detailed JSON structure with all components.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        series_id: params.series_id,
        premise: params.premise,
        total_books: params.books,
        genre: params.genre,
      },
      maxAgents: 10, // Use multiple specialists
      timeout: 120000, // 2 minutes
    });

    return {
      ...result.result,
      agents_used: result.agents_used,
    };
  }

  /**
   * Generate comprehensive project (book) blueprint
   */
  async generateProjectBlueprint(
    params: GenerateProjectBlueprintParams
  ): Promise<ProjectBlueprint> {
    // Calculate estimated chapters
    const estimated_chapters = Math.ceil(params.target_word_count / 3000);

    const task = `Generate a comprehensive project blueprint for a ${params.genre}${
      params.subgenre ? `/${params.subgenre}` : ''
    } novel.

Premise: ${params.premise}

Target Word Count: ${params.target_word_count}
Estimated Chapters: ${estimated_chapters}
${params.book_number ? `Book Number in Series: ${params.book_number}` : ''}
${params.series_context ? `\nSeries Context:\n${JSON.stringify(params.series_context, null, 2)}` : ''}

Requirements:
1. Complete character profiles with arcs (protagonist, antagonist, supporting)
2. Main plot and subplot threads with beat breakdown
3. Chapter-by-chapter breakdown with summaries
4. World-building elements (setting, rules, culture)
5. Thematic elements
6. Foreshadowing plan
7. Character relationships and dynamics

Use specialized agents:
- plot-architect: Overall plot structure
- subplot-weaver: Subplot threads
- character-psychologist: Character arcs and development
- pacing-optimizer: Chapter/beat breakdown
- world-building-expert: Setting details
- foreshadowing-specialist: Foreshadowing plan
- theme-analyst: Thematic elements
- tension-builder: Tension curve

Return detailed JSON structure.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        premise: params.premise,
        target_word_count: params.target_word_count,
        estimated_chapters,
        genre: params.genre,
        subgenre: params.subgenre,
        series_context: params.series_context,
        book_number: params.book_number,
      },
      maxAgents: 10,
      timeout: 180000, // 3 minutes
    });

    // Transform agent output into ProjectBlueprint structure
    const blueprint = this.transformToProjectBlueprint(
      result.result,
      params,
      estimated_chapters
    );

    // Add metadata
    (blueprint as any).agents_used = result.agents_used;
    (blueprint as any).user_id = 'placeholder'; // Would come from request context

    return blueprint;
  }

  /**
   * Generate detailed chapter blueprint with beat-by-beat breakdown
   */
  async generateChapterBlueprint(
    params: GenerateChapterBlueprintParams
  ): Promise<ChapterBlueprint> {
    const task = `Generate a detailed chapter blueprint with beat-by-beat breakdown.

Chapter Number: ${params.chapter_number}
Chapter Summary: ${params.chapter_summary}

Project Context:
- Genre: ${params.project_context.genre}
- POV Character: ${params.project_context.characters[0]?.name || 'TBD'}
- Active Plot Threads: ${params.project_context.plot_threads
      .filter((t) => t.status === 'active')
      .map((t) => t.title)
      .join(', ')}

Requirements:
1. Break chapter into 8-12 beats (250-400 words each)
2. Each beat should have:
   - Narrative function (setup, conflict, development, climax, etc.)
   - Characters present
   - Location
   - Emotional tone
   - Plot threads referenced
   - Pacing notes
3. Maintain overall chapter emotional arc
4. Balance action, dialogue, description, and internal monologue

Return detailed beat breakdown.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        project_id: params.project_id,
        chapter_number: params.chapter_number,
        chapter_summary: params.chapter_summary,
        project_context: params.project_context,
      },
      maxAgents: 5,
      timeout: 60000, // 1 minute
    });

    return this.transformToChapterBlueprint(result.result, params.chapter_number);
  }

  /**
   * Generate beat blueprints for a chapter
   */
  async generateChapterBeats(
    chapter_summary: string,
    target_word_count: number,
    context: any
  ): Promise<BeatBlueprint[]> {
    const beat_count = Math.ceil(target_word_count / 350); // ~350 words per beat

    const task = `Generate ${beat_count} beat blueprints for a chapter.

Chapter Summary: ${chapter_summary}
Target Word Count: ${target_word_count}

Context:
${JSON.stringify(context, null, 2)}

Requirements:
1. Each beat should be 250-400 words
2. Balance different beat types:
   - Action beats
   - Dialogue beats
   - Description beats
   - Internal monologue beats
   - Transition beats
3. Maintain narrative flow and pacing
4. Include variety in tone and function

Return array of beat blueprints.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        chapter_summary,
        target_word_count,
        beat_count,
        ...context,
      },
      maxAgents: 3,
      timeout: 45000,
    });

    return this.transformToBeats(result.result);
  }

  // ====================================================================
  // PRIVATE TRANSFORMATION METHODS
  // ====================================================================

  private transformToProjectBlueprint(
    agentOutput: any,
    params: GenerateProjectBlueprintParams,
    estimated_chapters: number
  ): ProjectBlueprint {
    return {
      id: uuidv4(),
      project_id: '', // Set by BlueprintManager
      series_id: agentOutput.series_id,
      title: agentOutput.title || 'Untitled Project',
      premise: params.premise,
      genre: params.genre,
      subgenre: params.subgenre,
      target_word_count: params.target_word_count,
      estimated_chapters,
      book_number: params.book_number,

      characters: this.transformCharacters(agentOutput.characters || []),
      plot_threads: this.transformPlotThreads(agentOutput.plot_threads || []),
      chapters: this.transformChapters(agentOutput.chapters || [], estimated_chapters),
      world_building: this.transformWorldBuilding(agentOutput.world_building || {}),
      themes: agentOutput.themes || [],
      foreshadowing_plan: this.transformForeshadowing(
        agentOutput.foreshadowing || []
      ),

      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
      last_evolution: new Date(),
    };
  }

  private transformCharacters(characters: any[]): CharacterProfile[] {
    return characters.map((char) => ({
      name: char.name,
      role: char.role || 'supporting',
      importance: char.importance || 'minor',
      arc: char.arc || {
        starting_state: 'Unknown',
        key_developments: [],
        transformation: 'None',
        ending_state: 'Unknown',
        arc_type: 'flat_arc',
      },
      introduction_chapter: char.introduction_chapter || 1,
      key_relationships: char.key_relationships || [],
      traits: char.traits || [],
      background: char.background || '',
      goals: char.goals || [],
      conflicts: char.conflicts || [],
    }));
  }

  private transformPlotThreads(threads: any[]): PlotThread[] {
    return threads.map((thread) => ({
      id: uuidv4(),
      title: thread.title || 'Untitled Thread',
      description: thread.description || '',
      plot_type: thread.plot_type || 'subplot',
      importance: thread.importance || 'moderate',
      start_chapter: thread.start_chapter || 1,
      resolution_chapter: thread.resolution_chapter,
      status: 'planned',
      key_beats: thread.key_beats || [],
      foreshadowing_elements: [],
      related_characters: thread.related_characters || [],
      related_threads: thread.related_threads || [],
      last_mention_chapter: undefined,
      progress: 0,
      estimated_beats: thread.estimated_beats || 5,
    }));
  }

  private transformChapters(
    chapters: any[],
    estimated_chapters: number
  ): ChapterBlueprint[] {
    // If agent provided chapters, use them; otherwise generate basic structure
    if (chapters.length > 0) {
      return chapters.map((ch, idx) => this.transformChapter(ch, idx + 1));
    }

    // Generate basic chapter structure
    return Array.from({ length: estimated_chapters }, (_, idx) => ({
      chapter_number: idx + 1,
      title: `Chapter ${idx + 1}`,
      summary: '',
      pov_character: '',
      location: '',
      timeline_position: '',
      plot_threads_active: [],
      estimated_word_count: 3000,
      beats: [],
      emotional_arc: {
        start_emotion: 'neutral',
        peak_emotion: 'tension',
        end_emotion: 'resolution',
        tension_points: [],
      },
      tension_level: 5,
      key_developments: [],
    }));
  }

  private transformChapter(chapter: any, chapter_number: number): ChapterBlueprint {
    return {
      chapter_number,
      title: chapter.title || `Chapter ${chapter_number}`,
      summary: chapter.summary || '',
      pov_character: chapter.pov_character || '',
      location: chapter.location || '',
      timeline_position: chapter.timeline_position || '',
      plot_threads_active: chapter.plot_threads || [],
      estimated_word_count: chapter.word_count || 3000,
      beats: this.transformToBeats(chapter.beats || []),
      emotional_arc: chapter.emotional_arc || {
        start_emotion: 'neutral',
        peak_emotion: 'tension',
        end_emotion: 'resolution',
        tension_points: [],
      },
      tension_level: chapter.tension_level || 5,
      key_developments: chapter.key_developments || [],
    };
  }

  private transformWorldBuilding(worldBuilding: any): WorldBuildingElements {
    return {
      magic_system: worldBuilding.magic_system,
      technology_level: worldBuilding.technology_level,
      locations: worldBuilding.locations || [],
      cultures: worldBuilding.cultures || [],
      historical_events: worldBuilding.historical_events || [],
      rules_and_laws: worldBuilding.rules_and_laws || [],
      economics: worldBuilding.economics,
      politics: worldBuilding.politics,
    };
  }

  private transformForeshadowing(foreshadowing: any[]): ForeshadowingElement[] {
    return foreshadowing.map((f) => ({
      id: uuidv4(),
      thread_id: f.thread_id || '',
      planted_chapter: f.planted_chapter || 1,
      planted_beat: f.planted_beat || 1,
      planted_content: f.planted_content || '',
      payoff_chapter: f.payoff_chapter,
      payoff_description: f.payoff_description || '',
      subtlety_level: f.subtlety_level || 'moderate',
      status: 'planned',
    }));
  }

  private transformToChapterBlueprint(
    agentOutput: any,
    chapter_number: number
  ): ChapterBlueprint {
    return {
      chapter_number,
      title: agentOutput.title || `Chapter ${chapter_number}`,
      summary: agentOutput.summary || '',
      pov_character: agentOutput.pov_character || '',
      location: agentOutput.location || '',
      timeline_position: agentOutput.timeline_position || '',
      plot_threads_active: agentOutput.plot_threads_active || [],
      estimated_word_count: agentOutput.estimated_word_count || 3000,
      beats: this.transformToBeats(agentOutput.beats || []),
      emotional_arc: agentOutput.emotional_arc || {
        start_emotion: 'neutral',
        peak_emotion: 'tension',
        end_emotion: 'resolution',
        tension_points: [],
      },
      tension_level: agentOutput.tension_level || 5,
      key_developments: agentOutput.key_developments || [],
    };
  }

  private transformToBeats(beats: any[]): BeatBlueprint[] {
    return beats.map((beat, idx) => ({
      beat_number: idx + 1,
      beat_type: beat.beat_type || 'action',
      narrative_function: beat.narrative_function || 'plot_advancement',
      description: beat.description || '',
      characters_present: beat.characters_present || [],
      location: beat.location || '',
      emotional_tone: beat.emotional_tone || 'neutral',
      plot_threads_referenced: beat.plot_threads_referenced || [],
      estimated_word_count: beat.estimated_word_count || 350,
      pacing_notes: beat.pacing_notes || '',
    }));
  }
}

/**
 * Standalone interface for CharacterProfile (referenced above)
 */
export interface CharacterProfile {
  name: string;
  role: string;
  importance: 'protagonist' | 'antagonist' | 'major' | 'supporting' | 'minor';
  arc: any;
  introduction_chapter: number;
  key_relationships: string[];
  traits: string[];
  background: string;
  goals: string[];
  conflicts: string[];
}
