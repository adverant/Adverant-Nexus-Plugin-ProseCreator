/**
 * Neo4j Query Patterns for NexusProseCreator
 *
 * Provides pre-built, optimized Cypher queries for common operations
 * All queries are parameterized for security and performance
 */

import { Neo4jClient, QueryParams } from './Neo4jClient';
import {
  CharacterNode,
  CharacterWithRelationships,
  ChapterNode,
  ChapterWithContext,
  PlotThreadNode,
  PlotThreadWithDependencies,
  LocationNode,
  LocationHierarchy,
  EventNode,
  ProjectNode,
  SeriesNode,
  SeriesTimeline,
} from './Neo4jSchema';

/**
 * Query builder for NexusProseCreator
 */
export class Neo4jQueries {
  constructor(private client: Neo4jClient) {}

  // ============================================================================
  // PROJECT & SERIES QUERIES
  // ============================================================================

  /**
   * Get all projects in a series
   */
  async getSeriesProjects(seriesId: string): Promise<Array<{ project: ProjectNode; book_number: number }>> {
    const query = `
      MATCH (s:Series {id: $seriesId})<-[r:BELONGS_TO]-(p:Project)
      RETURN p, r.book_number as book_number
      ORDER BY r.book_number
    `;

    const result = await this.client.executeRead(query, { seriesId });

    return result.records.map((record) => ({
      project: record.get('p').properties as ProjectNode,
      book_number: record.get('book_number'),
    }));
  }

  /**
   * Get series timeline with all books and character evolutions
   */
  async getSeriesTimeline(seriesId: string): Promise<SeriesTimeline> {
    const query = `
      MATCH (s:Series {id: $seriesId})
      OPTIONAL MATCH (s)<-[r:BELONGS_TO]-(p:Project)
      OPTIONAL MATCH (c_old:Character)-[e:EVOLVES_FROM]->(c_new:Character)
      WHERE c_old.project_id IN [(s)<-[:BELONGS_TO]-(proj) | proj.id]
      RETURN s,
             collect(DISTINCT {project: p, book_number: r.book_number}) as books,
             collect(DISTINCT {
               character: c_new,
               evolutions: collect({from: c_old, relationship: e})
             }) as characters
    `;

    const result = await this.client.executeRead(query, { seriesId });

    if (result.records.length === 0) {
      throw new Error(`Series ${seriesId} not found`);
    }

    const record = result.records[0];
    return {
      series: record.get('s').properties as SeriesNode,
      books: record.get('books'),
      characters: record.get('characters'),
    };
  }

  // ============================================================================
  // CHARACTER QUERIES
  // ============================================================================

  /**
   * Get character with all relationships
   */
  async getCharacterWithRelationships(characterId: string): Promise<CharacterWithRelationships> {
    const query = `
      MATCH (c:Character {id: $characterId})

      OPTIONAL MATCH (c)-[k:KNOWS]->(other:Character)

      OPTIONAL MATCH (c)-[loc:LOCATED_AT]->(location:Location)

      OPTIONAL MATCH (pt:PlotThread)-[inv:INVOLVES]->(c)

      RETURN c,
             collect(DISTINCT {target: other, relationship: k}) as knows,
             {location: location, relationship: loc} as locatedAt,
             collect(DISTINCT {plotThread: pt, relationship: inv}) as plotThreads
    `;

    const result = await this.client.executeRead(query, { characterId });

    if (result.records.length === 0) {
      throw new Error(`Character ${characterId} not found`);
    }

    const record = result.records[0];
    return {
      character: record.get('c').properties as CharacterNode,
      relationships: {
        knows: record.get('knows').filter((k: any) => k.target !== null),
        locatedAt: record.get('locatedAt').location ? record.get('locatedAt') : undefined,
        plotThreads: record.get('plotThreads').filter((pt: any) => pt.plotThread !== null),
      },
    };
  }

  /**
   * Get all characters appearing in a chapter
   */
  async getChapterCharacters(chapterId: string): Promise<Array<{ character: CharacterNode; relationship: any }>> {
    const query = `
      MATCH (c:Character)-[r:APPEARS_IN]->(ch:Chapter {id: $chapterId})
      RETURN c, r
      ORDER BY r.significance DESC, c.name
    `;

    const result = await this.client.executeRead(query, { chapterId });

    return result.records.map((record) => ({
      character: record.get('c').properties as CharacterNode,
      relationship: record.get('r').properties,
    }));
  }

  /**
   * Find characters by name (fuzzy search)
   */
  async searchCharactersByName(projectId: string, searchText: string, limit: number = 10): Promise<CharacterNode[]> {
    const query = `
      CALL db.index.fulltext.queryNodes('character_fulltext', $searchText)
      YIELD node, score
      WHERE node.project_id = $projectId
      RETURN node
      ORDER BY score DESC
      LIMIT $limit
    `;

    const result = await this.client.executeRead(query, { projectId, searchText, limit });

    return result.records.map((record) => record.get('node').properties as CharacterNode);
  }

  /**
   * Get character evolution across series
   */
  async getCharacterEvolution(characterName: string, seriesId: string): Promise<CharacterNode[]> {
    const query = `
      MATCH (s:Series {id: $seriesId})<-[:BELONGS_TO]-(p:Project)
      MATCH (c:Character {name: $characterName})
      WHERE c.project_id = p.id
      OPTIONAL MATCH path = (c)-[:EVOLVES_FROM*]->(latest:Character)
      WITH c, latest, length(path) as evolution_depth
      ORDER BY evolution_depth DESC
      RETURN DISTINCT c
      ORDER BY c.first_appearance
    `;

    const result = await this.client.executeRead(query, { characterName, seriesId });

    return result.records.map((record) => record.get('c').properties as CharacterNode);
  }

  // ============================================================================
  // CHAPTER QUERIES
  // ============================================================================

  /**
   * Get chapter with full context
   */
  async getChapterWithContext(chapterId: string): Promise<ChapterWithContext> {
    const query = `
      MATCH (ch:Chapter {id: $chapterId})

      OPTIONAL MATCH (c:Character)-[app:APPEARS_IN]->(ch)

      OPTIONAL MATCH (ev:Event {chapter_number: ch.chapter_number})
      WHERE ev.project_id = ch.project_id

      OPTIONAL MATCH (pt:PlotThread)-[occ:OCCURS_IN]->(loc:Location)
      WHERE occ.chapter = ch.chapter_number AND pt.project_id = ch.project_id

      RETURN ch,
             collect(DISTINCT {character: c, relationship: app}) as characters,
             collect(DISTINCT ev) as events,
             collect(DISTINCT pt) as plotThreads,
             loc as location
    `;

    const result = await this.client.executeRead(query, { chapterId });

    if (result.records.length === 0) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    const record = result.records[0];
    return {
      chapter: record.get('ch').properties as ChapterNode,
      characters: record.get('characters').filter((c: any) => c.character !== null),
      events: record.get('events').filter((e: any) => e !== null).map((e: any) => e.properties as EventNode),
      plotThreads: record.get('plotThreads').filter((pt: any) => pt !== null).map((pt: any) => pt.properties as PlotThreadNode),
      location: record.get('location') ? record.get('location').properties as LocationNode : undefined,
    };
  }

  /**
   * Get chapters in order for a project
   */
  async getProjectChapters(projectId: string, status?: string): Promise<ChapterNode[]> {
    const statusFilter = status ? 'AND ch.status = $status' : '';

    const query = `
      MATCH (ch:Chapter {project_id: $projectId})
      WHERE 1=1 ${statusFilter}
      RETURN ch
      ORDER BY ch.chapter_number
    `;

    const result = await this.client.executeRead(query, { projectId, status });

    return result.records.map((record) => record.get('ch').properties as ChapterNode);
  }

  /**
   * Get chapter navigation (previous and next)
   */
  async getChapterNavigation(
    chapterId: string
  ): Promise<{ current: ChapterNode; previous?: ChapterNode; next?: ChapterNode }> {
    const query = `
      MATCH (current:Chapter {id: $chapterId})

      OPTIONAL MATCH (previous:Chapter {project_id: current.project_id})
      WHERE previous.chapter_number = current.chapter_number - 1

      OPTIONAL MATCH (next:Chapter {project_id: current.project_id})
      WHERE next.chapter_number = current.chapter_number + 1

      RETURN current, previous, next
    `;

    const result = await this.client.executeRead(query, { chapterId });

    if (result.records.length === 0) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    const record = result.records[0];
    return {
      current: record.get('current').properties as ChapterNode,
      previous: record.get('previous') ? record.get('previous').properties as ChapterNode : undefined,
      next: record.get('next') ? record.get('next').properties as ChapterNode : undefined,
    };
  }

  // ============================================================================
  // PLOT THREAD QUERIES
  // ============================================================================

  /**
   * Get plot thread with all dependencies
   */
  async getPlotThreadWithDependencies(plotThreadId: string): Promise<PlotThreadWithDependencies> {
    const query = `
      MATCH (pt:PlotThread {id: $plotThreadId})

      OPTIONAL MATCH (pt)-[inv:INVOLVES]->(c:Character)

      OPTIONAL MATCH (pt)-[occ:OCCURS_IN]->(loc:Location)

      OPTIONAL MATCH (pt)-[dev:DEVELOPS]->(developed:PlotThread)

      RETURN pt,
             collect(DISTINCT {character: c, relationship: inv}) as characters,
             collect(DISTINCT {location: loc, relationship: occ}) as locations,
             collect(DISTINCT developed) as developments
    `;

    const result = await this.client.executeRead(query, { plotThreadId });

    if (result.records.length === 0) {
      throw new Error(`PlotThread ${plotThreadId} not found`);
    }

    const record = result.records[0];
    return {
      plotThread: record.get('pt').properties as PlotThreadNode,
      characters: record.get('characters').filter((c: any) => c.character !== null),
      locations: record.get('locations').filter((l: any) => l.location !== null),
      developments: record.get('developments').filter((d: any) => d !== null).map((d: any) => d.properties as PlotThreadNode),
    };
  }

  /**
   * Get unresolved plot threads for a project
   */
  async getUnresolvedPlotThreads(projectId: string): Promise<PlotThreadNode[]> {
    const query = `
      MATCH (pt:PlotThread {project_id: $projectId})
      WHERE pt.status IN ['introduced', 'developing']
      RETURN pt
      ORDER BY pt.importance DESC, pt.introduced_chapter
    `;

    const result = await this.client.executeRead(query, { projectId });

    return result.records.map((record) => record.get('pt').properties as PlotThreadNode);
  }

  /**
   * Find plot threads by type
   */
  async getPlotThreadsByType(projectId: string, threadType: string): Promise<PlotThreadNode[]> {
    const query = `
      MATCH (pt:PlotThread {project_id: $projectId, thread_type: $threadType})
      RETURN pt
      ORDER BY pt.introduced_chapter
    `;

    const result = await this.client.executeRead(query, { projectId, threadType });

    return result.records.map((record) => record.get('pt').properties as PlotThreadNode);
  }

  // ============================================================================
  // LOCATION QUERIES
  // ============================================================================

  /**
   * Get location hierarchy
   */
  async getLocationHierarchy(locationId: string): Promise<LocationHierarchy> {
    const query = `
      MATCH (loc:Location {id: $locationId})

      OPTIONAL MATCH (parent:Location)-[:CONTAINS]->(loc)

      OPTIONAL MATCH (loc)-[:CONTAINS]->(child:Location)

      OPTIONAL MATCH (c:Character)-[:LOCATED_AT]->(loc)

      OPTIONAL MATCH (ev:Event)-[:OCCURS_IN]->(loc)

      RETURN loc, parent,
             collect(DISTINCT child) as children,
             collect(DISTINCT c) as characters,
             collect(DISTINCT ev) as events
    `;

    const result = await this.client.executeRead(query, { locationId });

    if (result.records.length === 0) {
      throw new Error(`Location ${locationId} not found`);
    }

    const record = result.records[0];
    return {
      location: record.get('loc').properties as LocationNode,
      parent: record.get('parent') ? record.get('parent').properties as LocationNode : undefined,
      children: record.get('children').filter((c: any) => c !== null).map((c: any) => c.properties as LocationNode),
      characters: record.get('characters').filter((c: any) => c !== null).map((c: any) => c.properties as CharacterNode),
      events: record.get('events').filter((e: any) => e !== null).map((e: any) => e.properties as EventNode),
    };
  }

  /**
   * Search locations by name or description
   */
  async searchLocations(projectId: string, searchText: string, limit: number = 10): Promise<LocationNode[]> {
    const query = `
      CALL db.index.fulltext.queryNodes('location_fulltext', $searchText)
      YIELD node, score
      WHERE node.project_id = $projectId
      RETURN node
      ORDER BY score DESC
      LIMIT $limit
    `;

    const result = await this.client.executeRead(query, { projectId, searchText, limit });

    return result.records.map((record) => record.get('node').properties as LocationNode);
  }

  // ============================================================================
  // EVENT QUERIES
  // ============================================================================

  /**
   * Get events by timeline position
   */
  async getEventsByTimeline(projectId: string, timelineStart: string, timelineEnd?: string): Promise<EventNode[]> {
    const timelineEndFilter = timelineEnd ? 'AND ev.timeline_position <= $timelineEnd' : '';

    const query = `
      MATCH (ev:Event {project_id: $projectId})
      WHERE ev.timeline_position >= $timelineStart ${timelineEndFilter}
      RETURN ev
      ORDER BY ev.timeline_position, ev.chapter_number
    `;

    const result = await this.client.executeRead(query, { projectId, timelineStart, timelineEnd });

    return result.records.map((record) => record.get('ev').properties as EventNode);
  }

  /**
   * Get events by significance
   */
  async getCriticalEvents(projectId: string): Promise<EventNode[]> {
    const query = `
      MATCH (ev:Event {project_id: $projectId})
      WHERE ev.significance IN ['critical', 'major']
      RETURN ev
      ORDER BY ev.chapter_number
    `;

    const result = await this.client.executeRead(query, { projectId });

    return result.records.map((record) => record.get('ev').properties as EventNode);
  }

  // ============================================================================
  // CONTINUITY QUERIES
  // ============================================================================

  /**
   * Check for character continuity issues
   * Returns characters who appear in multiple locations at the same time
   */
  async findCharacterContinuityIssues(projectId: string): Promise<Array<{
    character: CharacterNode;
    locations: Array<{ location: LocationNode; chapter: number }>;
  }>> {
    const query = `
      MATCH (c:Character {project_id: $projectId})-[r1:LOCATED_AT]->(loc1:Location)
      MATCH (c)-[r2:LOCATED_AT]->(loc2:Location)
      WHERE loc1.id <> loc2.id
        AND r1.chapter = r2.chapter
      RETURN DISTINCT c,
             collect(DISTINCT {location: loc1, chapter: r1.chapter}) +
             collect(DISTINCT {location: loc2, chapter: r2.chapter}) as locations
    `;

    const result = await this.client.executeRead(query, { projectId });

    return result.records.map((record) => ({
      character: record.get('c').properties as CharacterNode,
      locations: record.get('locations'),
    }));
  }

  /**
   * Find plot threads mentioned but never resolved
   */
  async findUnresolvedPlotThreads(projectId: string, currentChapter: number): Promise<PlotThreadNode[]> {
    const query = `
      MATCH (pt:PlotThread {project_id: $projectId})
      WHERE pt.introduced_chapter <= $currentChapter
        AND (pt.resolved_chapter IS NULL OR pt.resolved_chapter > $currentChapter)
        AND pt.status <> 'abandoned'
      RETURN pt
      ORDER BY pt.introduced_chapter
    `;

    const result = await this.client.executeRead(query, { projectId, currentChapter });

    return result.records.map((record) => record.get('pt').properties as PlotThreadNode);
  }

  // ============================================================================
  // STATISTICS QUERIES
  // ============================================================================

  /**
   * Get project statistics
   */
  async getProjectStatistics(projectId: string): Promise<{
    totalCharacters: number;
    totalLocations: number;
    totalPlotThreads: number;
    totalEvents: number;
    totalChapters: number;
    unresolvedPlotThreads: number;
  }> {
    const query = `
      MATCH (p:Project {id: $projectId})
      OPTIONAL MATCH (c:Character {project_id: $projectId})
      OPTIONAL MATCH (l:Location {project_id: $projectId})
      OPTIONAL MATCH (pt:PlotThread {project_id: $projectId})
      OPTIONAL MATCH (ev:Event {project_id: $projectId})
      OPTIONAL MATCH (ch:Chapter {project_id: $projectId})
      OPTIONAL MATCH (upt:PlotThread {project_id: $projectId})
      WHERE upt.status IN ['introduced', 'developing']
      RETURN count(DISTINCT c) as totalCharacters,
             count(DISTINCT l) as totalLocations,
             count(DISTINCT pt) as totalPlotThreads,
             count(DISTINCT ev) as totalEvents,
             count(DISTINCT ch) as totalChapters,
             count(DISTINCT upt) as unresolvedPlotThreads
    `;

    const result = await this.client.executeRead(query, { projectId });

    if (result.records.length === 0) {
      throw new Error(`Project ${projectId} not found`);
    }

    const record = result.records[0];
    return {
      totalCharacters: record.get('totalCharacters').toNumber(),
      totalLocations: record.get('totalLocations').toNumber(),
      totalPlotThreads: record.get('totalPlotThreads').toNumber(),
      totalEvents: record.get('totalEvents').toNumber(),
      totalChapters: record.get('totalChapters').toNumber(),
      unresolvedPlotThreads: record.get('unresolvedPlotThreads').toNumber(),
    };
  }

  /**
   * Get character appearance frequency
   */
  async getCharacterAppearanceFrequency(projectId: string): Promise<Array<{
    character: CharacterNode;
    appearances: number;
    chapters: number[];
  }>> {
    const query = `
      MATCH (c:Character {project_id: $projectId})-[app:APPEARS_IN]->(ch:Chapter)
      RETURN c,
             count(app) as appearances,
             collect(DISTINCT ch.chapter_number) as chapters
      ORDER BY appearances DESC
    `;

    const result = await this.client.executeRead(query, { projectId });

    return result.records.map((record) => ({
      character: record.get('c').properties as CharacterNode,
      appearances: record.get('appearances').toNumber(),
      chapters: record.get('chapters'),
    }));
  }
}
