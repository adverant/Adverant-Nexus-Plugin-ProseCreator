/**
 * BlueprintEvolver - Auto-updates blueprints as story progresses
 *
 * Analyzes divergences between planned blueprint and actual written content,
 * then intelligently updates the blueprint to reflect the evolved story.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ProjectBlueprint,
  Beat,
  BlueprintUpdate,
  BlueprintChange,
  Divergence,
  EvolutionError,
} from './types';

/**
 * MageAgent orchestrator interface for analyzing divergences
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

export interface BlueprintEvolverConfig {
  mageAgent: MageAgentOrchestrator;
}

export interface EvolveParams {
  project_id: string;
  chapter_number: number;
  completed_beats: Beat[];
  current_blueprint: ProjectBlueprint;
}

export class BlueprintEvolver {
  private mageAgent: MageAgentOrchestrator;

  constructor(config: BlueprintEvolverConfig) {
    this.mageAgent = config.mageAgent;
  }

  /**
   * Evolve blueprint based on what was actually written
   */
  async evolve(params: EvolveParams): Promise<BlueprintUpdate> {
    try {
      const changes: BlueprintChange[] = [];

      // 1. Analyze divergences between planned and actual content
      const divergences = await this.analyzeDivergences(
        params.completed_beats,
        params.current_blueprint,
        params.chapter_number
      );

      // 2. Update character arcs based on actual development
      const characterChanges = await this.updateCharacterArcs(
        params.completed_beats,
        params.current_blueprint
      );
      changes.push(...characterChanges);

      // 3. Update plot thread statuses
      const plotThreadChanges = await this.updatePlotThreads(
        params.completed_beats,
        params.current_blueprint
      );
      changes.push(...plotThreadChanges);

      // 4. Update foreshadowing tracker
      const foreshadowingChanges = await this.updateForeshadowing(
        params.completed_beats,
        params.current_blueprint
      );
      changes.push(...foreshadowingChanges);

      // 5. Update character relationships
      const relationshipChanges = await this.updateRelationships(
        params.completed_beats,
        params.current_blueprint
      );
      changes.push(...relationshipChanges);

      // 6. Extract new world-building elements
      const worldBuildingChanges = await this.extractWorldBuilding(
        params.completed_beats,
        params.current_blueprint
      );
      changes.push(...worldBuildingChanges);

      // 7. Determine if future chapters need regeneration
      const triggered_regeneration = divergences.significance > 0.5;

      if (triggered_regeneration) {
        const futureChapterChanges = await this.regenerateFutureChapters(
          params.project_id,
          params.chapter_number,
          params.completed_beats,
          params.current_blueprint
        );
        changes.push(...futureChapterChanges);
      }

      return {
        project_id: params.project_id,
        chapter_number: params.chapter_number,
        timestamp: new Date(),
        changes,
        significance: divergences.significance,
        triggered_regeneration,
      };
    } catch (error) {
      const evolError = error as EvolutionError;
      throw new Error(
        `Failed to evolve blueprint: ${evolError.message || 'Unknown error'}`
      );
    }
  }

  // ====================================================================
  // DIVERGENCE ANALYSIS
  // ====================================================================

  private async analyzeDivergences(
    beats: Beat[],
    blueprint: ProjectBlueprint,
    chapter_number: number
  ): Promise<{ significance: number; details: Divergence[] }> {
    // Get planned chapter blueprint
    const plannedChapter = blueprint.chapters.find(
      (ch) => ch.chapter_number === chapter_number
    );

    if (!plannedChapter) {
      return { significance: 0, details: [] };
    }

    const task = `Analyze divergences between planned chapter blueprint and actual written content.

Planned Chapter Blueprint:
${JSON.stringify(plannedChapter, null, 2)}

Actual Written Beats:
${beats.map((b, i) => `Beat ${i + 1}: ${b.content.substring(0, 200)}...`).join('\n\n')}

Requirements:
1. Identify significant plot divergences
2. Identify character behavior divergences
3. Identify tone/mood divergences
4. Identify pacing divergences
5. Calculate overall significance score (0-1)
6. Provide detailed analysis

Return JSON with divergences array and overall significance score.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        planned_chapter: plannedChapter,
        actual_beats: beats,
        chapter_number,
      },
      maxAgents: 3,
    });

    const divergences: Divergence[] = (result.result.divergences || []).map(
      (d: any) => ({
        chapter_number,
        beat_number: d.beat_number || 0,
        planned: d.planned || '',
        actual: d.actual || '',
        significance: d.significance || 0,
        impact_on_future_chapters: d.impact_on_future_chapters || [],
      })
    );

    return {
      significance: result.result.overall_significance || 0,
      details: divergences,
    };
  }

  // ====================================================================
  // CHARACTER ARC UPDATES
  // ====================================================================

  private async updateCharacterArcs(
    beats: Beat[],
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange[]> {
    const changes: BlueprintChange[] = [];

    // Extract all characters mentioned in beats
    const charactersInBeats = this.extractCharacters(beats);

    for (const characterName of charactersInBeats) {
      const character = blueprint.characters.find((c) => c.name === characterName);
      if (!character) continue;

      // Analyze character development in these beats
      const arcUpdate = await this.analyzeCharacterDevelopment(
        characterName,
        beats,
        character
      );

      if (arcUpdate) {
        changes.push({
          type: 'character_evolution',
          category: 'character',
          description: `Updated arc for ${characterName}: ${arcUpdate.description}`,
          old_value: character.arc,
          new_value: arcUpdate.new_arc,
          affected_chapters: arcUpdate.affected_chapters,
          requires_user_approval: arcUpdate.significant,
        });
      }
    }

    return changes;
  }

  private async analyzeCharacterDevelopment(
    characterName: string,
    beats: Beat[],
    currentCharacter: any
  ): Promise<{
    description: string;
    new_arc: any;
    affected_chapters: number[];
    significant: boolean;
  } | null> {
    // Filter beats where character appears
    const relevantBeats = beats.filter((b) =>
      b.characters_present.includes(characterName)
    );

    if (relevantBeats.length === 0) return null;

    const task = `Analyze character development and update character arc.

Character: ${characterName}

Current Arc:
${JSON.stringify(currentCharacter.arc, null, 2)}

Scenes with Character:
${relevantBeats.map((b, i) => `Scene ${i + 1}:\n${b.content.substring(0, 300)}...`).join('\n\n')}

Requirements:
1. Identify character growth or change
2. Update key developments in arc
3. Adjust transformation if significant change occurred
4. Determine if this affects future chapters
5. Assess if change is significant enough to require user approval

Return updated arc and analysis.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        character_name: characterName,
        current_arc: currentCharacter.arc,
        beats: relevantBeats,
      },
      maxAgents: 2,
    });

    if (!result.result.has_changes) return null;

    return {
      description: result.result.description || 'Character development detected',
      new_arc: result.result.updated_arc,
      affected_chapters: result.result.affected_chapters || [],
      significant: result.result.significance > 0.7,
    };
  }

  // ====================================================================
  // PLOT THREAD UPDATES
  // ====================================================================

  private async updatePlotThreads(
    beats: Beat[],
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange[]> {
    const changes: BlueprintChange[] = [];

    // Extract all plot threads mentioned
    const threadsInBeats = this.extractPlotThreads(beats);

    for (const threadId of threadsInBeats) {
      const thread = blueprint.plot_threads.find((t) => t.id === threadId);
      if (!thread) continue;

      const threadUpdate = await this.analyzeThreadProgress(
        threadId,
        beats,
        thread
      );

      if (threadUpdate) {
        changes.push({
          type: 'plot_thread_update',
          category: 'plot',
          description: `Updated ${thread.title}: ${threadUpdate.description}`,
          old_value: { status: thread.status, progress: thread.progress },
          new_value: {
            status: threadUpdate.new_status,
            progress: threadUpdate.new_progress,
            last_mention_chapter: threadUpdate.last_mention_chapter,
          },
          affected_chapters: threadUpdate.affected_chapters,
          requires_user_approval: false,
        });
      }
    }

    return changes;
  }

  private async analyzeThreadProgress(
    threadId: string,
    beats: Beat[],
    thread: any
  ): Promise<{
    description: string;
    new_status: string;
    new_progress: number;
    last_mention_chapter: number;
    affected_chapters: number[];
  } | null> {
    const relevantBeats = beats.filter((b) =>
      b.plot_threads_referenced.includes(threadId)
    );

    if (relevantBeats.length === 0) return null;

    // Simple progress calculation (can be enhanced with ML)
    const new_progress = Math.min(100, thread.progress + relevantBeats.length * 10);
    const last_chapter = Math.max(...relevantBeats.map((b) => b.beat_number));

    // Determine if thread reached resolution
    const hasResolution = relevantBeats.some(
      (b) =>
        b.content.toLowerCase().includes('resolved') ||
        b.content.toLowerCase().includes('concluded') ||
        b.is_key_development
    );

    const new_status = hasResolution ? 'resolved' : 'active';

    return {
      description: hasResolution
        ? 'Thread appears to be resolved'
        : `Thread progressed (${relevantBeats.length} new beats)`,
      new_status,
      new_progress,
      last_mention_chapter: last_chapter,
      affected_chapters: [],
    };
  }

  // ====================================================================
  // FORESHADOWING UPDATES
  // ====================================================================

  private async updateForeshadowing(
    beats: Beat[],
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange[]> {
    const changes: BlueprintChange[] = [];

    // Extract potential foreshadowing from beats
    const foreshadowingBeats = beats.filter((b) => b.is_foreshadowing);

    for (const beat of foreshadowingBeats) {
      const newForeshadowing = {
        id: uuidv4(),
        thread_id: beat.plot_threads_referenced[0] || '',
        planted_chapter: Math.floor(beat.beat_number / 10) + 1, // Rough chapter estimate
        planted_beat: beat.beat_number,
        planted_content: beat.content.substring(0, 200),
        payoff_chapter: undefined,
        payoff_description: 'TBD',
        subtlety_level: 'moderate' as const,
        status: 'planted' as const,
      };

      changes.push({
        type: 'foreshadowing_update',
        category: 'foreshadowing',
        description: `New foreshadowing element planted in beat ${beat.beat_number}`,
        old_value: null,
        new_value: newForeshadowing,
        affected_chapters: [],
        requires_user_approval: false,
      });
    }

    return changes;
  }

  // ====================================================================
  // RELATIONSHIP UPDATES
  // ====================================================================

  private async updateRelationships(
    beats: Beat[],
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange[]> {
    const changes: BlueprintChange[] = [];

    // Find beats with multiple characters (relationship scenes)
    const relationshipBeats = beats.filter((b) => b.characters_present.length >= 2);

    for (const beat of relationshipBeats) {
      const pairs = this.getCharacterPairs(beat.characters_present);

      for (const [char1, char2] of pairs) {
        const relationshipUpdate = await this.analyzeRelationshipChange(
          char1,
          char2,
          beat,
          blueprint
        );

        if (relationshipUpdate) {
          changes.push(relationshipUpdate);
        }
      }
    }

    return changes;
  }

  private async analyzeRelationshipChange(
    char1: string,
    char2: string,
    beat: Beat,
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange | null> {
    // Analyze if relationship changed in this beat
    const character1 = blueprint.characters.find((c) => c.name === char1);
    if (!character1) return null;

    const currentRelationship = (character1 as any).relationships?.find(
      (r: any) => r.character_name === char2
    );

    // Simple heuristic: look for relationship keywords in beat content
    const content = beat.content.toLowerCase();
    const relationshipKeywords = [
      'trust',
      'betrayal',
      'friendship',
      'romance',
      'conflict',
      'reconciliation',
      'alliance',
      'enemy',
    ];

    const hasRelationshipChange = relationshipKeywords.some((keyword) =>
      content.includes(keyword)
    );

    if (!hasRelationshipChange) return null;

    return {
      type: 'relationship_change',
      category: 'character',
      description: `Relationship change between ${char1} and ${char2}`,
      old_value: currentRelationship,
      new_value: {
        // This would be more sophisticated with ML analysis
        updated_dynamics: `Updated in beat ${beat.beat_number}`,
      },
      affected_chapters: [],
      requires_user_approval: true,
    };
  }

  // ====================================================================
  // WORLD BUILDING EXTRACTION
  // ====================================================================

  private async extractWorldBuilding(
    beats: Beat[],
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange[]> {
    const changes: BlueprintChange[] = [];

    // Look for new locations, rules, or world elements
    const task = `Extract new world-building elements from written content.

Current World Building:
${JSON.stringify(blueprint.world_building, null, 2)}

Written Content:
${beats.map((b, i) => `Beat ${i + 1} (Location: ${b.location}):\n${b.content.substring(0, 200)}...`).join('\n\n')}

Requirements:
1. Identify new locations not in current world building
2. Identify new world rules or systems mentioned
3. Identify cultural elements
4. Determine if these are significant additions

Return array of new world-building elements.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        current_world_building: blueprint.world_building,
        beats,
      },
      maxAgents: 2,
    });

    const newElements = result.result.new_elements || [];

    for (const element of newElements) {
      changes.push({
        type: 'world_rule_addition',
        category: 'world',
        description: `New ${element.type}: ${element.name}`,
        old_value: null,
        new_value: element,
        affected_chapters: [],
        requires_user_approval: element.significant,
      });
    }

    return changes;
  }

  // ====================================================================
  // FUTURE CHAPTER REGENERATION
  // ====================================================================

  private async regenerateFutureChapters(
    project_id: string,
    current_chapter: number,
    completed_beats: Beat[],
    blueprint: ProjectBlueprint
  ): Promise<BlueprintChange[]> {
    const changes: BlueprintChange[] = [];

    // Regenerate blueprints for upcoming chapters based on divergence
    const futureChapters = blueprint.chapters.filter(
      (ch) => ch.chapter_number > current_chapter
    );

    if (futureChapters.length === 0) return changes;

    const task = `Regenerate future chapter blueprints based on story divergence.

Completed Chapter: ${current_chapter}

Recent Story Developments:
${completed_beats.map((b, i) => `Beat ${i + 1}: ${b.content.substring(0, 150)}...`).join('\n\n')}

Current Future Chapters:
${futureChapters.slice(0, 5).map((ch) => `Chapter ${ch.chapter_number}: ${ch.summary}`).join('\n')}

Requirements:
1. Adjust future chapter summaries to account for story changes
2. Update plot thread trajectories
3. Maintain thematic consistency
4. Ensure logical story progression

Return updated blueprints for next 5 chapters.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        current_chapter,
        completed_beats,
        future_chapters: futureChapters.slice(0, 5),
      },
      maxAgents: 3,
    });

    const updatedChapters = result.result.updated_chapters || [];

    for (const updated of updatedChapters) {
      changes.push({
        type: 'timeline_adjustment',
        category: 'timeline',
        description: `Regenerated Chapter ${updated.chapter_number} blueprint`,
        old_value: futureChapters.find(
          (ch) => ch.chapter_number === updated.chapter_number
        ),
        new_value: updated,
        affected_chapters: [updated.chapter_number],
        requires_user_approval: true,
      });
    }

    return changes;
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  private extractCharacters(beats: Beat[]): Set<string> {
    const characters = new Set<string>();
    beats.forEach((beat) => {
      beat.characters_present.forEach((char) => characters.add(char));
    });
    return characters;
  }

  private extractPlotThreads(beats: Beat[]): Set<string> {
    const threads = new Set<string>();
    beats.forEach((beat) => {
      beat.plot_threads_referenced.forEach((thread) => threads.add(thread));
    });
    return threads;
  }

  private getCharacterPairs(characters: string[]): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        pairs.push([characters[i], characters[j]]);
      }
    }
    return pairs;
  }
}
