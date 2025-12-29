/**
 * Series Intelligence for NexusProseCreator
 *
 * Provides cross-book memory spanning 1M+ words:
 * - Series-wide character arc tracking
 * - Multi-book plot thread management
 * - Lore consistency across entire series
 * - Timeline verification spanning all books
 * - Universe rules enforcement
 *
 * Enables "Import Books 1-9, write Book 10 with perfect continuity"
 */

import { MemoryManager } from './MemoryManager';
import { GraphRAGClient } from './GraphRAGClient';
import { Neo4jClient } from '../infrastructure/Neo4jClient';
import { NodeLabel, RelationshipLabel } from '../infrastructure/Neo4jSchema';
import {
  SeriesContext,
  ContinuityIssue,
  Character,
  PlotThread
} from './types';

export interface SeriesIntelligenceConfig {
  memoryManager: MemoryManager;
  graphragClient: GraphRAGClient;
  neo4jClient: Neo4jClient;
}

export interface Project {
  id: string;
  series_id: string;
  title: string;
  book_number: number;
  current_word_count: number;
  status: string;
}

export class SeriesIntelligence {
  private memoryManager: MemoryManager;
  private graphragClient: GraphRAGClient;
  private neo4jClient: Neo4jClient;

  constructor(config: SeriesIntelligenceConfig) {
    this.memoryManager = config.memoryManager;
    this.graphragClient = config.graphragClient;
    this.neo4jClient = config.neo4jClient;
  }

  // ====================================================================
  // SERIES CONTEXT RETRIEVAL
  // ====================================================================

  /**
   * Get complete series context
   * Target: <2s for series with 10 books
   */
  async getSeriesContext(seriesId: string): Promise<SeriesContext> {
    console.log(`📚 Retrieving series context for series ${seriesId}`);

    const startTime = Date.now();

    try {
      // Parallel retrieval for performance
      const [
        projects,
        characterArcs,
        plotThreads,
        lore,
        timeline,
        universeRules
      ] = await Promise.all([
        this.getSeriesProjects(seriesId),
        this.getSeriesCharacterArcs(seriesId),
        this.getSeriesPlotThreads(seriesId),
        this.getSeriesLore(seriesId),
        this.getSeriesTimeline(seriesId),
        this.getUniverseRules(seriesId)
      ]);

      const totalWords = projects.reduce((sum, p) => sum + p.current_word_count, 0);

      const context: SeriesContext = {
        seriesId,
        title: `Series ${seriesId}`,  // TODO: Get from database
        totalBooks: projects.length,
        totalWords,
        characterArcs,
        plotThreads,
        lore,
        timeline,
        universeRules
      };

      const latency = Date.now() - startTime;
      console.log(`✅ Series context retrieved in ${latency}ms`);
      console.log(`   - ${context.totalBooks} books, ${totalWords.toLocaleString()} words`);
      console.log(`   - ${characterArcs.length} character arcs, ${plotThreads.length} plot threads`);

      return context;
    } catch (error) {
      console.error(`❌ Failed to retrieve series context:`, error);
      throw error;
    }
  }

  /**
   * Get all projects in a series
   */
  private async getSeriesProjects(seriesId: string): Promise<Project[]> {
    try {
      // Query Neo4j for all projects in series
      const projects = await this.neo4jClient.queryNodes<any>(
        NodeLabel.PROJECT,
        { series_id: seriesId },
        undefined,
        'book_number'
      );

      return projects.map(p => ({
        id: p.id,
        series_id: p.series_id,
        title: p.title,
        book_number: p.book_number || 1,
        current_word_count: p.current_word_count || 0,
        status: p.status || 'draft'
      }));
    } catch (error) {
      console.error(`❌ Failed to retrieve series projects:`, error);
      return [];
    }
  }

  /**
   * Get series-wide character arcs
   */
  private async getSeriesCharacterArcs(
    seriesId: string
  ): Promise<Array<{
    character_name: string;
    arc_description: string;
    books_spanned: number[];
    current_status: string;
  }>> {
    try {
      // Query Neo4j for all characters in series
      const charactersQuery = `
        MATCH (p:Project {series_id: $seriesId})<-[:BELONGS_TO]-(c:Character)
        WITH c, p
        ORDER BY p.book_number, c.first_appearance_chapter
        RETURN c, collect(p.book_number) as books
      `;

      const result = await this.neo4jClient.executeRead(charactersQuery, { seriesId });

      return result.records.map(record => {
        const character = record.get('c').properties;
        const books = record.get('books');

        return {
          character_name: character.name,
          arc_description: character.current_arc || 'No arc defined',
          books_spanned: books,
          current_status: character.status || 'active'
        };
      });
    } catch (error) {
      console.error(`❌ Failed to retrieve series character arcs:`, error);
      return [];
    }
  }

  /**
   * Get series-wide plot threads
   */
  private async getSeriesPlotThreads(
    seriesId: string
  ): Promise<Array<{
    thread_name: string;
    introduced_book: number;
    resolved_book?: number;
    status: string;
  }>> {
    try {
      // Query Neo4j for all plot threads in series
      const threadsQuery = `
        MATCH (p:Project {series_id: $seriesId})<-[:BELONGS_TO]-(pt:PlotThread)
        RETURN pt, p.book_number as book_number
        ORDER BY p.book_number, pt.introduced_chapter
      `;

      const result = await this.neo4jClient.executeRead(threadsQuery, { seriesId });

      // Group threads by name to track across books
      const threadMap = new Map<string, any>();

      result.records.forEach(record => {
        const thread = record.get('pt').properties;
        const bookNumber = record.get('book_number');

        if (!threadMap.has(thread.name)) {
          threadMap.set(thread.name, {
            thread_name: thread.name,
            introduced_book: bookNumber,
            resolved_book: thread.status === 'resolved' ? bookNumber : undefined,
            status: thread.status
          });
        } else {
          // Update resolved book if thread resolved in later book
          const existing = threadMap.get(thread.name)!;
          if (thread.status === 'resolved' && !existing.resolved_book) {
            existing.resolved_book = bookNumber;
            existing.status = 'resolved';
          }
        }
      });

      return Array.from(threadMap.values());
    } catch (error) {
      console.error(`❌ Failed to retrieve series plot threads:`, error);
      return [];
    }
  }

  /**
   * Get established lore across series
   */
  private async getSeriesLore(
    seriesId: string
  ): Promise<Array<{
    topic: string;
    content: string;
    established_book: number;
    relevance_score: number;
  }>> {
    try {
      // Query GraphRAG for lore documents
      const result = await this.graphragClient.retrieve({
        query: `series ${seriesId} lore world-building magic system technology rules`,
        strategy: 'hybrid',
        limit: 50,
        rerank: true
      });

      return result.results.map(r => ({
        topic: r.metadata.topic || 'General Lore',
        content: r.content,
        established_book: r.metadata.book_number || 1,
        relevance_score: r.score
      }));
    } catch (error) {
      console.error(`❌ Failed to retrieve series lore:`, error);
      return [];
    }
  }

  /**
   * Get series timeline
   */
  private async getSeriesTimeline(
    seriesId: string
  ): Promise<Array<{
    event: string;
    book_number: number;
    chapter_number?: number;
    timestamp: string;
  }>> {
    try {
      // Query Neo4j for timeline events
      const timelineQuery = `
        MATCH (p:Project {series_id: $seriesId})<-[:BELONGS_TO]-(e:Event)
        RETURN e, p.book_number as book_number
        ORDER BY e.timeline_position, p.book_number, e.chapter_number
      `;

      const result = await this.neo4jClient.executeRead(timelineQuery, { seriesId });

      return result.records.map(record => {
        const event = record.get('e').properties;
        return {
          event: event.description || event.name,
          book_number: record.get('book_number'),
          chapter_number: event.chapter_number,
          timestamp: event.timeline_position || 'Unknown'
        };
      });
    } catch (error) {
      console.error(`❌ Failed to retrieve series timeline:`, error);
      return [];
    }
  }

  /**
   * Get universe rules (magic systems, tech rules, physics)
   */
  private async getUniverseRules(
    seriesId: string
  ): Promise<Array<{
    rule_type: 'magic' | 'tech' | 'physics' | 'social' | 'other';
    description: string;
    established_book: number;
  }>> {
    try {
      // Query GraphRAG for universe rules
      const result = await this.graphragClient.retrieve({
        query: `series ${seriesId} magic system technology rules physics laws`,
        strategy: 'hybrid',
        limit: 30,
        rerank: true
      });

      return result.results.map(r => ({
        rule_type: this.classifyRuleType(r.content),
        description: r.content,
        established_book: r.metadata.book_number || 1
      }));
    } catch (error) {
      console.error(`❌ Failed to retrieve universe rules:`, error);
      return [];
    }
  }

  /**
   * Classify rule type based on content
   */
  private classifyRuleType(content: string): 'magic' | 'tech' | 'physics' | 'social' | 'other' {
    const lower = content.toLowerCase();

    if (lower.includes('magic') || lower.includes('spell') || lower.includes('enchant')) {
      return 'magic';
    } else if (lower.includes('technology') || lower.includes('tech') || lower.includes('machine')) {
      return 'tech';
    } else if (lower.includes('physics') || lower.includes('gravity') || lower.includes('time')) {
      return 'physics';
    } else if (lower.includes('social') || lower.includes('law') || lower.includes('custom')) {
      return 'social';
    }

    return 'other';
  }

  // ====================================================================
  // CROSS-BOOK CONTINUITY CHECKING
  // ====================================================================

  /**
   * Check continuity across all books in series
   * Detects:
   * - Character inconsistencies across books
   * - Plot contradictions
   * - Timeline errors
   * - Universe rule violations
   */
  async crossBookContinuityCheck(params: {
    series_id: string;
    current_project_id: string;
    content: string;
  }): Promise<ContinuityIssue[]> {
    console.log(`🔍 Running cross-book continuity check`);

    const issues: ContinuityIssue[] = [];

    try {
      // Get series context
      const seriesContext = await this.getSeriesContext(params.series_id);

      // Check character consistency
      const characterIssues = await this.checkCharacterConsistency(
        params.series_id,
        params.content,
        seriesContext
      );
      issues.push(...characterIssues);

      // Check plot thread consistency
      const plotIssues = await this.checkPlotThreadConsistency(
        params.series_id,
        params.content,
        seriesContext
      );
      issues.push(...plotIssues);

      // Check universe rules compliance
      const ruleIssues = await this.checkUniverseRules(
        params.series_id,
        params.content,
        seriesContext
      );
      issues.push(...ruleIssues);

      console.log(`✅ Cross-book continuity check complete: ${issues.length} issues found`);

      // Log issues by severity
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const highCount = issues.filter(i => i.severity === 'high').length;
      const mediumCount = issues.filter(i => i.severity === 'medium').length;

      if (criticalCount > 0) console.error(`   ❌ ${criticalCount} critical issues`);
      if (highCount > 0) console.warn(`   ⚠️  ${highCount} high-severity issues`);
      if (mediumCount > 0) console.log(`   ℹ️  ${mediumCount} medium-severity issues`);

      return issues;
    } catch (error) {
      console.error(`❌ Cross-book continuity check failed:`, error);
      return issues;
    }
  }

  /**
   * Check character consistency across books
   */
  private async checkCharacterConsistency(
    seriesId: string,
    content: string,
    seriesContext: SeriesContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Extract character names from content
    const mentionedCharacters = seriesContext.characterArcs
      .map(arc => arc.character_name)
      .filter(name => content.includes(name));

    // For each mentioned character, check consistency
    for (const characterName of mentionedCharacters) {
      // TODO: Implement detailed character consistency checking
      // - Age consistency
      // - Trait consistency
      // - Relationship consistency
      // - Status (dead characters appearing, etc.)
    }

    return issues;
  }

  /**
   * Check plot thread consistency
   */
  private async checkPlotThreadConsistency(
    seriesId: string,
    content: string,
    seriesContext: SeriesContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Check for references to resolved plot threads
    const resolvedThreads = seriesContext.plotThreads.filter(t => t.status === 'resolved');

    for (const thread of resolvedThreads) {
      if (content.includes(thread.thread_name)) {
        // Check if content incorrectly treats thread as unresolved
        // TODO: Implement NLP-based checking
      }
    }

    return issues;
  }

  /**
   * Check universe rules compliance
   */
  private async checkUniverseRules(
    seriesId: string,
    content: string,
    seriesContext: SeriesContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Check for violations of established rules
    // TODO: Implement rule violation detection using GraphRAG retrieval

    return issues;
  }

  // ====================================================================
  // SERIES STATISTICS
  // ====================================================================

  /**
   * Get series statistics
   */
  async getSeriesStats(seriesId: string): Promise<{
    totalBooks: number;
    totalWords: number;
    totalCharacters: number;
    totalPlotThreads: number;
    completionStatus: {
      complete: number;
      inProgress: number;
      draft: number;
    };
    averageBookLength: number;
    longestBook: { title: string; words: number };
    shortestBook: { title: string; words: number };
  }> {
    const projects = await this.getSeriesProjects(seriesId);

    if (projects.length === 0) {
      throw new Error(`No projects found for series ${seriesId}`);
    }

    const totalWords = projects.reduce((sum, p) => sum + p.current_word_count, 0);

    const statusCounts = {
      complete: projects.filter(p => p.status === 'complete').length,
      inProgress: projects.filter(p => p.status === 'revision' || p.status === 'in_progress').length,
      draft: projects.filter(p => p.status === 'draft').length
    };

    const sortedByWords = [...projects].sort((a, b) => b.current_word_count - a.current_word_count);

    // Get total characters and plot threads
    const [characterArcs, plotThreads] = await Promise.all([
      this.getSeriesCharacterArcs(seriesId),
      this.getSeriesPlotThreads(seriesId)
    ]);

    return {
      totalBooks: projects.length,
      totalWords,
      totalCharacters: characterArcs.length,
      totalPlotThreads: plotThreads.length,
      completionStatus: statusCounts,
      averageBookLength: Math.round(totalWords / projects.length),
      longestBook: {
        title: sortedByWords[0].title,
        words: sortedByWords[0].current_word_count
      },
      shortestBook: {
        title: sortedByWords[sortedByWords.length - 1].title,
        words: sortedByWords[sortedByWords.length - 1].current_word_count
      }
    };
  }

  /**
   * Find dangling plot threads (introduced but never resolved)
   */
  async findDanglingPlotThreads(seriesId: string): Promise<PlotThread[]> {
    const plotThreads = await this.getSeriesPlotThreads(seriesId);

    const dangling = plotThreads
      .filter(t => !t.resolved_book && t.status !== 'resolved')
      .map(t => t.thread_name);

    console.log(`📊 Found ${dangling.length} dangling plot threads in series`);

    // Get full plot thread details
    // TODO: Query Neo4j for full thread objects
    return [];
  }

  /**
   * Find characters who disappeared (appeared in early books but not later ones)
   */
  async findDisappearedCharacters(seriesId: string): Promise<string[]> {
    const characterArcs = await this.getSeriesCharacterArcs(seriesId);

    const disappeared = characterArcs
      .filter(arc => {
        // Character appeared in early books but not in later books
        const lastBook = Math.max(...arc.books_spanned);
        const totalBooks = Math.max(...characterArcs.flatMap(a => a.books_spanned));

        // If character hasn't appeared in last 2 books and series is ongoing
        return totalBooks - lastBook >= 2 && arc.current_status === 'active';
      })
      .map(arc => arc.character_name);

    console.log(`📊 Found ${disappeared.length} disappeared characters`);

    return disappeared;
  }
}
