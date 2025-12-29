/**
 * TimelineManager - Manages chronological timeline across story/series
 *
 * Tracks events in chronological order, detects timeline inconsistencies,
 * and maintains temporal coherence across complex narratives.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  SeriesTimeline,
  TimelineEvent,
  TimelineError,
  Beat,
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
 * MageAgent for timeline analysis
 */
interface MageAgentOrchestrator {
  orchestrate(params: {
    task: string;
    context: Record<string, any>;
    maxAgents?: number;
  }): Promise<{
    result: any;
  }>;
}

export interface TimelineManagerConfig {
  db: DatabaseClient;
  mageAgent: MageAgentOrchestrator;
}

export interface AddTimelineEventParams {
  project_id: string;
  series_id?: string;
  name: string;
  description: string;
  date: string;
  chapter_reference: number;
  beat_reference?: number;
  characters_involved: string[];
  significance: 'minor' | 'moderate' | 'major' | 'critical';
}

export class TimelineManager {
  private db: DatabaseClient;
  private mageAgent: MageAgentOrchestrator;

  constructor(config: TimelineManagerConfig) {
    this.db = config.db;
    this.mageAgent = config.mageAgent;
  }

  /**
   * Get complete timeline for a project or series
   */
  async getTimeline(
    id: string,
    type: 'project' | 'series' = 'project'
  ): Promise<SeriesTimeline> {
    try {
      const table = type === 'series' ? 'prose.series' : 'prose.projects';

      const record = await this.db.queryOne<{ timeline: string }>(
        `SELECT timeline FROM ${table} WHERE id = $1`,
        [id]
      );

      if (!record || !record.timeline) {
        return {
          events: [],
          chronology_type: 'linear',
          time_scale: 'unknown',
        };
      }

      return JSON.parse(record.timeline) as SeriesTimeline;
    } catch (error) {
      console.error('Error getting timeline:', error);
      return {
        events: [],
        chronology_type: 'linear',
        time_scale: 'unknown',
      };
    }
  }

  /**
   * Add event to timeline
   */
  async addEvent(params: AddTimelineEventParams): Promise<TimelineEvent> {
    try {
      const timeline = await this.getTimeline(
        params.series_id || params.project_id,
        params.series_id ? 'series' : 'project'
      );

      const event: TimelineEvent = {
        id: uuidv4(),
        name: params.name,
        description: params.description,
        date: params.date,
        chapter_reference: params.chapter_reference,
        beat_reference: params.beat_reference,
        characters_involved: params.characters_involved,
        significance: params.significance,
        chronological_order: timeline.events.length,
      };

      timeline.events.push(event);

      // Re-sort events chronologically
      await this.sortTimelineEvents(timeline);

      // Update database
      await this.updateTimeline(
        params.series_id || params.project_id,
        params.series_id ? 'series' : 'project',
        timeline
      );

      return event;
    } catch (error) {
      const timelineError = error as TimelineError;
      throw new Error(`Failed to add timeline event: ${timelineError.message}`);
    }
  }

  /**
   * Extract timeline events from completed beats
   */
  async extractEventsFromBeats(
    project_id: string,
    chapter_number: number,
    beats: Beat[]
  ): Promise<TimelineEvent[]> {
    const task = `Extract significant timeline events from written content.

Chapter: ${chapter_number}

Written Content:
${beats.map((b, i) => `Beat ${i + 1}:\n${b.content}`).join('\n\n')}

Requirements:
1. Identify events with temporal significance
2. Extract in-universe dates or time references
3. Identify character participation in events
4. Classify significance level
5. Extract event descriptions

Return array of timeline events.`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        project_id,
        chapter_number,
        beats,
      },
      maxAgents: 2,
    });

    const extractedEvents: TimelineEvent[] = (result.result.events || []).map(
      (e: any, idx: number) => ({
        id: uuidv4(),
        name: e.name || `Event ${idx + 1}`,
        description: e.description || '',
        date: e.date || 'Unknown',
        chapter_reference: chapter_number,
        beat_reference: e.beat_reference,
        characters_involved: e.characters_involved || [],
        significance: e.significance || 'minor',
        chronological_order: 0, // Will be set when added to timeline
      })
    );

    // Auto-add to timeline
    for (const event of extractedEvents) {
      await this.addEvent({
        project_id,
        name: event.name,
        description: event.description,
        date: event.date,
        chapter_reference: event.chapter_reference,
        beat_reference: event.beat_reference,
        characters_involved: event.characters_involved,
        significance: event.significance,
      });
    }

    return extractedEvents;
  }

  /**
   * Detect timeline inconsistencies
   */
  async detectInconsistencies(
    id: string,
    type: 'project' | 'series' = 'project'
  ): Promise<
    Array<{
      type: 'chronology_error' | 'date_contradiction' | 'character_age_error';
      description: string;
      affected_events: string[];
      severity: 'low' | 'medium' | 'high';
    }>
  > {
    try {
      const timeline = await this.getTimeline(id, type);

      if (timeline.events.length < 2) {
        return [];
      }

      const task = `Analyze timeline for inconsistencies.

Timeline:
${JSON.stringify(timeline.events, null, 2)}

Chronology Type: ${timeline.chronology_type}
Time Scale: ${timeline.time_scale}

Requirements:
1. Check chronological ordering
2. Detect date contradictions
3. Identify impossible time gaps
4. Check character age consistency
5. Verify event sequences

Return array of inconsistencies found.`;

      const result = await this.mageAgent.orchestrate({
        task,
        context: {
          timeline,
        },
        maxAgents: 2,
      });

      return result.result.inconsistencies || [];
    } catch (error) {
      console.error('Error detecting timeline inconsistencies:', error);
      return [];
    }
  }

  /**
   * Get events in chronological order
   */
  async getChronologicalEvents(
    id: string,
    type: 'project' | 'series' = 'project'
  ): Promise<TimelineEvent[]> {
    const timeline = await this.getTimeline(id, type);
    return timeline.events.sort((a, b) => a.chronological_order - b.chronological_order);
  }

  /**
   * Get events by significance
   */
  async getEventsBySignificance(
    id: string,
    significance: 'minor' | 'moderate' | 'major' | 'critical',
    type: 'project' | 'series' = 'project'
  ): Promise<TimelineEvent[]> {
    const timeline = await this.getTimeline(id, type);
    return timeline.events.filter((e) => e.significance === significance);
  }

  /**
   * Get events involving a character
   */
  async getCharacterEvents(
    id: string,
    character_name: string,
    type: 'project' | 'series' = 'project'
  ): Promise<TimelineEvent[]> {
    const timeline = await this.getTimeline(id, type);
    return timeline.events.filter((e) =>
      e.characters_involved.includes(character_name)
    );
  }

  /**
   * Get events in a chapter range
   */
  async getEventsByChapterRange(
    id: string,
    start_chapter: number,
    end_chapter: number,
    type: 'project' | 'series' = 'project'
  ): Promise<TimelineEvent[]> {
    const timeline = await this.getTimeline(id, type);
    return timeline.events.filter(
      (e) =>
        e.chapter_reference >= start_chapter && e.chapter_reference <= end_chapter
    );
  }

  /**
   * Update timeline chronology type (linear vs non-linear)
   */
  async updateChronologyType(
    id: string,
    chronology_type: 'linear' | 'non-linear' | 'multi-thread',
    type: 'project' | 'series' = 'project'
  ): Promise<void> {
    const timeline = await this.getTimeline(id, type);
    timeline.chronology_type = chronology_type;
    await this.updateTimeline(id, type, timeline);
  }

  /**
   * Calculate time scale of the story
   */
  async calculateTimeScale(
    id: string,
    type: 'project' | 'series' = 'project'
  ): Promise<string> {
    const timeline = await this.getTimeline(id, type);

    if (timeline.events.length < 2) {
      return 'unknown';
    }

    const task = `Calculate the time scale of the story based on events.

Events:
${timeline.events.map((e) => `${e.date}: ${e.name}`).join('\n')}

Requirements:
1. Analyze date patterns
2. Calculate duration between first and last event
3. Determine time scale (hours, days, weeks, months, years, decades)

Return time scale description (e.g., "3 months", "10 years", "a single day").`;

    const result = await this.mageAgent.orchestrate({
      task,
      context: {
        events: timeline.events,
      },
      maxAgents: 1,
    });

    const time_scale = result.result.time_scale || 'unknown';

    timeline.time_scale = time_scale;
    await this.updateTimeline(id, type, timeline);

    return time_scale;
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private async sortTimelineEvents(timeline: SeriesTimeline): Promise<void> {
    // Sort by date parsing (if possible) or by chapter reference
    timeline.events.sort((a, b) => {
      // Try to parse dates
      const dateA = this.parseDate(a.date);
      const dateB = this.parseDate(b.date);

      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }

      // Fallback to chapter reference
      return a.chapter_reference - b.chapter_reference;
    });

    // Re-assign chronological order
    timeline.events.forEach((event, idx) => {
      event.chronological_order = idx;
    });
  }

  private parseDate(dateString: string): Date | null {
    try {
      // Try standard date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Try custom format parsing (e.g., "Day 5", "Year 2045")
      const dayMatch = dateString.match(/Day\s+(\d+)/i);
      if (dayMatch) {
        return new Date(2000, 0, parseInt(dayMatch[1]));
      }

      const yearMatch = dateString.match(/Year\s+(\d+)/i);
      if (yearMatch) {
        return new Date(parseInt(yearMatch[1]), 0, 1);
      }

      return null;
    } catch {
      return null;
    }
  }

  private async updateTimeline(
    id: string,
    type: 'project' | 'series',
    timeline: SeriesTimeline
  ): Promise<void> {
    const table = type === 'series' ? 'prose.series' : 'prose.projects';

    await this.db.update(table, id, {
      timeline: JSON.stringify(timeline),
    });
  }
}
