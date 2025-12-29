/**
 * PlotThreadTracker - Tracks and manages plot threads across the story
 *
 * Monitors plot thread progression, detects unresolved threads,
 * identifies plot holes, and ensures narrative coherence.
 */

import type {
  PlotThread,
  PlotThreadStatus,
  PlotBeat,
  Beat,
  PlotThreadError,
} from './types';

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
 * Qdrant client for semantic search of beats mentioning plot threads
 */
interface QdrantClient {
  searchByPlotThread(thread_id: string): Promise<Beat[]>;
  searchByMetadata(filters: Record<string, any>): Promise<Beat[]>;
}

export interface PlotThreadTrackerConfig {
  db: DatabaseClient;
  qdrant: QdrantClient;
}

export class PlotThreadTracker {
  private db: DatabaseClient;
  private qdrant: QdrantClient;

  constructor(config: PlotThreadTrackerConfig) {
    this.db = config.db;
    this.qdrant = config.qdrant;
  }

  /**
   * Track a specific plot thread and return its current status
   */
  async trackThread(thread_id: string): Promise<PlotThreadStatus> {
    try {
      // Get thread from database
      const thread = await this.db.queryOne<any>(
        `SELECT * FROM prose.plot_threads WHERE id = $1`,
        [thread_id]
      );

      if (!thread) {
        throw new Error(`Plot thread ${thread_id} not found`);
      }

      // Get all beats mentioning this thread from Qdrant
      const beats = await this.qdrant.searchByPlotThread(thread_id);

      // Analyze thread status
      const keyDevelopments = beats
        .filter((b) => b.is_key_development)
        .map((b) => ({
          chapter_number: Math.floor(b.beat_number / 10) + 1,
          beat_number: b.beat_number,
          description: b.content.substring(0, 200),
          significance: 'development' as const,
          is_key_development: true,
          emotional_impact: 7,
        }));

      const foreshadowingInstances = beats.filter(
        (b) => b.is_foreshadowing
      ).length;

      const lastMentionChapter =
        beats.length > 0
          ? Math.max(...beats.map((b) => Math.floor(b.beat_number / 10) + 1))
          : thread.start_chapter;

      const progress =
        thread.estimated_beats > 0
          ? Math.min(100, (beats.length / thread.estimated_beats) * 100)
          : 0;

      const status: PlotThreadStatus = {
        thread_id,
        title: thread.title,
        status: thread.status,
        progress,
        last_mention_chapter: lastMentionChapter,
        foreshadowing_instances: foreshadowingInstances,
        key_developments: keyDevelopments,
        resolution_complete: thread.status === 'resolved',
        continuity_issues: await this.detectContinuityIssues(thread_id, beats),
      };

      // Update thread in database with new progress
      await this.updateThreadProgress(thread_id, progress, lastMentionChapter);

      return status;
    } catch (error) {
      const plotError = error as PlotThreadError;
      throw new Error(`Failed to track thread: ${plotError.message}`);
    }
  }

  /**
   * Get all plot threads for a project
   */
  async getProjectThreads(project_id: string): Promise<PlotThread[]> {
    try {
      const threads = await this.db.query<any>(
        `SELECT * FROM prose.plot_threads
         WHERE project_id = $1
         ORDER BY importance DESC, start_chapter ASC`,
        [project_id]
      );

      return threads.map((t) => this.mapToPlotThread(t));
    } catch (error) {
      console.error('Error getting project threads:', error);
      return [];
    }
  }

  /**
   * Detect unresolved plot threads that may have been forgotten
   */
  async detectUnresolvedThreads(
    project_id: string,
    current_chapter: number
  ): Promise<PlotThread[]> {
    try {
      // Find threads marked 'active' but not mentioned in recent chapters
      const activeThreads = await this.db.query<any>(
        `SELECT * FROM prose.plot_threads
         WHERE project_id = $1
         AND status = 'active'`,
        [project_id]
      );

      const unresolvedThreads: PlotThread[] = [];
      const staleness_threshold = 5; // Chapters without mention

      for (const thread of activeThreads) {
        const status = await this.trackThread(thread.id);

        const chaptersSinceMention = current_chapter - status.last_mention_chapter;

        // Thread is unresolved if:
        // 1. Hasn't been mentioned in 5+ chapters
        // 2. Is marked as critical or major importance
        // 3. Is not yet resolved
        if (
          chaptersSinceMention >= staleness_threshold &&
          (thread.importance === 'critical' || thread.importance === 'major') &&
          !status.resolution_complete
        ) {
          unresolvedThreads.push(this.mapToPlotThread(thread));
        }
      }

      return unresolvedThreads;
    } catch (error) {
      console.error('Error detecting unresolved threads:', error);
      return [];
    }
  }

  /**
   * Detect plot holes related to a thread
   */
  async detectPlotHoles(thread_id: string): Promise<string[]> {
    const plotHoles: string[] = [];

    try {
      const thread = await this.db.queryOne<any>(
        `SELECT * FROM prose.plot_threads WHERE id = $1`,
        [thread_id]
      );

      if (!thread) return plotHoles;

      const beats = await this.qdrant.searchByPlotThread(thread_id);

      // Check for logical inconsistencies
      // 1. Thread marked as resolved but resolution chapter has no beats
      if (thread.status === 'resolved' && thread.resolution_chapter) {
        const resolutionBeats = beats.filter(
          (b) =>
            Math.floor(b.beat_number / 10) + 1 === thread.resolution_chapter
        );

        if (resolutionBeats.length === 0) {
          plotHoles.push(
            `Thread marked as resolved in chapter ${thread.resolution_chapter}, but no beats found in that chapter`
          );
        }
      }

      // 2. Large gaps in thread progression
      const chapterMentions = new Set(
        beats.map((b) => Math.floor(b.beat_number / 10) + 1)
      );
      const chapters = Array.from(chapterMentions).sort((a, b) => a - b);

      for (let i = 0; i < chapters.length - 1; i++) {
        const gap = chapters[i + 1] - chapters[i];
        if (gap > 10 && thread.importance === 'critical') {
          plotHoles.push(
            `Large gap (${gap} chapters) in critical plot thread between chapters ${chapters[i]} and ${chapters[i + 1]}`
          );
        }
      }

      // 3. Thread introduced after supposed start chapter
      if (beats.length > 0) {
        const firstMention = Math.min(
          ...beats.map((b) => Math.floor(b.beat_number / 10) + 1)
        );
        if (firstMention > thread.start_chapter) {
          plotHoles.push(
            `Thread supposed to start in chapter ${thread.start_chapter}, but first mentioned in chapter ${firstMention}`
          );
        }
      }
    } catch (error) {
      console.error('Error detecting plot holes:', error);
    }

    return plotHoles;
  }

  /**
   * Get thread timeline visualization
   */
  async getThreadTimeline(thread_id: string): Promise<{
    thread_id: string;
    title: string;
    timeline: Array<{
      chapter: number;
      mentions: number;
      key_developments: number;
      foreshadowing: number;
    }>;
  }> {
    try {
      const thread = await this.db.queryOne<any>(
        `SELECT * FROM prose.plot_threads WHERE id = $1`,
        [thread_id]
      );

      if (!thread) {
        throw new Error(`Thread ${thread_id} not found`);
      }

      const beats = await this.qdrant.searchByPlotThread(thread_id);

      // Group beats by chapter
      const chapterMap = new Map<
        number,
        { mentions: number; key_developments: number; foreshadowing: number }
      >();

      beats.forEach((beat) => {
        const chapter = Math.floor(beat.beat_number / 10) + 1;
        if (!chapterMap.has(chapter)) {
          chapterMap.set(chapter, {
            mentions: 0,
            key_developments: 0,
            foreshadowing: 0,
          });
        }

        const data = chapterMap.get(chapter)!;
        data.mentions++;
        if (beat.is_key_development) data.key_developments++;
        if (beat.is_foreshadowing) data.foreshadowing++;
      });

      const timeline = Array.from(chapterMap.entries())
        .map(([chapter, data]) => ({
          chapter,
          ...data,
        }))
        .sort((a, b) => a.chapter - b.chapter);

      return {
        thread_id,
        title: thread.title,
        timeline,
      };
    } catch (error) {
      throw new Error(`Failed to get thread timeline: ${(error as Error).message}`);
    }
  }

  /**
   * Update thread status based on analysis
   */
  async updateThreadStatus(
    thread_id: string,
    new_status: 'planned' | 'active' | 'resolved' | 'abandoned',
    resolution_chapter?: number
  ): Promise<void> {
    try {
      const updates: any = { status: new_status };

      if (resolution_chapter) {
        updates.resolution_chapter = resolution_chapter;
      }

      if (new_status === 'resolved') {
        updates.progress = 100;
      }

      await this.db.update('prose.plot_threads', thread_id, updates);
    } catch (error) {
      console.error('Error updating thread status:', error);
      throw error;
    }
  }

  /**
   * Get threads by importance level
   */
  async getThreadsByImportance(
    project_id: string,
    importance: 'critical' | 'major' | 'moderate' | 'minor'
  ): Promise<PlotThread[]> {
    try {
      const threads = await this.db.query<any>(
        `SELECT * FROM prose.plot_threads
         WHERE project_id = $1 AND importance = $2
         ORDER BY start_chapter ASC`,
        [project_id, importance]
      );

      return threads.map((t) => this.mapToPlotThread(t));
    } catch (error) {
      console.error('Error getting threads by importance:', error);
      return [];
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private async detectContinuityIssues(
    thread_id: string,
    beats: Beat[]
  ): Promise<string[]> {
    const issues: string[] = [];

    // Simple continuity checks (can be enhanced with ML)
    if (beats.length === 0) {
      issues.push('No beats found for this thread');
    }

    // Check for contradictions in beat content (simplified)
    // In production, this would use semantic analysis

    return issues;
  }

  private async updateThreadProgress(
    thread_id: string,
    progress: number,
    last_mention_chapter: number
  ): Promise<void> {
    try {
      await this.db.update('prose.plot_threads', thread_id, {
        progress,
        last_mention_chapter,
      });
    } catch (error) {
      console.error('Error updating thread progress:', error);
    }
  }

  private mapToPlotThread(dbRecord: any): PlotThread {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      description: dbRecord.description,
      plot_type: dbRecord.plot_type || 'subplot',
      importance: dbRecord.importance || 'moderate',
      start_chapter: dbRecord.start_chapter,
      resolution_chapter: dbRecord.resolution_chapter,
      status: dbRecord.status,
      key_beats: dbRecord.key_beats || [],
      foreshadowing_elements: dbRecord.foreshadowing_elements || [],
      related_characters: dbRecord.related_characters || [],
      related_threads: dbRecord.related_threads || [],
      last_mention_chapter: dbRecord.last_mention_chapter,
      progress: dbRecord.progress || 0,
      estimated_beats: dbRecord.estimated_beats || 5,
    };
  }
}
