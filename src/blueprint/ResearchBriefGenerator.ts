/**
 * ResearchBriefGenerator - Generates research briefs via LearningAgent
 *
 * Automatically triggers research for:
 * - Character backgrounds
 * - Location/setting details
 * - Historical contexts
 * - Technical accuracy
 * - Cultural authenticity
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ResearchBrief,
  GenerateResearchBriefParams,
  KeyFact,
  Reference,
  ResearchType,
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
 * GraphRAG client for storing research briefs
 */
interface GraphRAGClient {
  storeDocument(params: {
    content: string;
    title: string;
    metadata: Record<string, any>;
  }): Promise<{ document_id: string }>;
}

/**
 * LearningAgent client for deep research
 */
interface LearningAgentClient {
  research(params: {
    topic: string;
    context: string;
    depth: 'overview' | 'standard' | 'expert';
    focus_areas?: string[];
  }): Promise<{
    job_id: string;
    key_facts: Array<{
      fact: string;
      source: string;
      confidence: number;
      relevance: number;
    }>;
    references: Array<{
      type: string;
      title: string;
      url?: string;
      author?: string;
      credibility_score: number;
    }>;
    insights: string[];
    tips: string[];
  }>;

  getResearchStatus(job_id: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
  }>;
}

export interface ResearchBriefGeneratorConfig {
  db: DatabaseClient;
  graphrag: GraphRAGClient;
  learningAgent: LearningAgentClient;
}

export class ResearchBriefGenerator {
  private db: DatabaseClient;
  private graphrag: GraphRAGClient;
  private learningAgent: LearningAgentClient;

  constructor(config: ResearchBriefGeneratorConfig) {
    this.db = config.db;
    this.graphrag = config.graphrag;
    this.learningAgent = config.learningAgent;
  }

  /**
   * Generate comprehensive research brief
   */
  async generateBrief(
    params: GenerateResearchBriefParams
  ): Promise<ResearchBrief> {
    try {
      // Check if brief already exists for this topic
      const existing = await this.getExistingBrief(
        params.project_id,
        params.topic
      );

      if (existing && !this.isExpired(existing)) {
        console.log(
          `Research brief already exists for "${params.topic}", returning cached`
        );
        return existing;
      }

      // Determine research depth based on priority
      const depth = this.getResearchDepth(params.priority);

      // Use LearningAgent for deep research
      const researchResult = await this.learningAgent.research({
        topic: params.topic,
        context: params.context,
        depth,
        focus_areas: this.getFocusAreas(params.research_type),
      });

      // Transform LearningAgent output to ResearchBrief
      const brief: ResearchBrief = {
        id: uuidv4(),
        project_id: params.project_id,
        topic: params.topic,
        research_type: params.research_type,
        context: params.context,

        key_facts: researchResult.key_facts.map((f) => ({
          fact: f.fact,
          source: f.source,
          confidence: f.confidence,
          relevance: f.relevance,
          verification_status: f.confidence > 0.8 ? 'verified' : 'needs_verification',
        })),

        references: researchResult.references.map((r) => ({
          type: (r.type as any) || 'url',
          title: r.title,
          url: r.url,
          author: r.author,
          publication_date: undefined,
          credibility_score: r.credibility_score,
        })),

        expert_insights: researchResult.insights,
        authenticity_tips: researchResult.tips,

        learning_agent_job_id: researchResult.job_id,
        confidence_score: this.calculateOverallConfidence(researchResult.key_facts),
        generated_at: new Date(),
        expires_at: this.calculateExpiry(params.priority),
      };

      // Store brief in database and GraphRAG
      await this.storeBrief(brief);

      return brief;
    } catch (error) {
      throw new Error(
        `Failed to generate research brief: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get research brief by topic
   */
  async getBrief(
    project_id: string,
    topic: string
  ): Promise<ResearchBrief | null> {
    return this.getExistingBrief(project_id, topic);
  }

  /**
   * Get all research briefs for a project
   */
  async getProjectBriefs(project_id: string): Promise<ResearchBrief[]> {
    try {
      const results = await this.db.query<{ content: string }>(
        `SELECT content FROM prose.research_briefs
         WHERE project_id = $1
         ORDER BY created_at DESC`,
        [project_id]
      );

      return results.map((r) => JSON.parse(r.content) as ResearchBrief);
    } catch (error) {
      console.error('Error getting project research briefs:', error);
      return [];
    }
  }

  /**
   * Get briefs by research type
   */
  async getBriefsByType(
    project_id: string,
    research_type: ResearchType
  ): Promise<ResearchBrief[]> {
    try {
      const results = await this.db.query<{ content: string }>(
        `SELECT content FROM prose.research_briefs
         WHERE project_id = $1 AND research_type = $2
         ORDER BY created_at DESC`,
        [project_id, research_type]
      );

      return results.map((r) => JSON.parse(r.content) as ResearchBrief);
    } catch (error) {
      console.error('Error getting briefs by type:', error);
      return [];
    }
  }

  /**
   * Trigger proactive research for upcoming content
   */
  async triggerProactiveResearch(
    project_id: string,
    upcoming_chapters: Array<{
      chapter_number: number;
      summary: string;
      characters: string[];
      locations: string[];
    }>
  ): Promise<ResearchBrief[]> {
    const briefs: ResearchBrief[] = [];

    // Extract research topics from upcoming chapters
    const topics = this.extractResearchTopics(upcoming_chapters);

    // Generate briefs for each topic in parallel
    const briefPromises = topics.map((topic) =>
      this.generateBrief({
        project_id,
        topic: topic.topic,
        context: topic.context,
        research_type: topic.type,
        priority: 'medium',
      })
    );

    const results = await Promise.allSettled(briefPromises);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        briefs.push(result.value);
      } else {
        console.error('Proactive research failed:', result.reason);
      }
    });

    return briefs;
  }

  /**
   * Refresh expired or outdated brief
   */
  async refreshBrief(brief_id: string): Promise<ResearchBrief> {
    try {
      const brief = await this.db.queryOne<{ content: string }>(
        `SELECT content FROM prose.research_briefs WHERE id = $1`,
        [brief_id]
      );

      if (!brief) {
        throw new Error(`Research brief ${brief_id} not found`);
      }

      const existingBrief = JSON.parse(brief.content) as ResearchBrief;

      // Re-generate with same parameters
      const refreshed = await this.generateBrief({
        project_id: existingBrief.project_id,
        topic: existingBrief.topic,
        context: existingBrief.context,
        research_type: existingBrief.research_type,
        priority: 'high',
      });

      return refreshed;
    } catch (error) {
      throw new Error(`Failed to refresh brief: ${(error as Error).message}`);
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private async getExistingBrief(
    project_id: string,
    topic: string
  ): Promise<ResearchBrief | null> {
    try {
      const result = await this.db.queryOne<{ content: string }>(
        `SELECT content FROM prose.research_briefs
         WHERE project_id = $1 AND topic = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [project_id, topic]
      );

      if (!result) {
        return null;
      }

      return JSON.parse(result.content) as ResearchBrief;
    } catch (error) {
      console.error('Error getting existing brief:', error);
      return null;
    }
  }

  private isExpired(brief: ResearchBrief): boolean {
    if (!brief.expires_at) {
      return false;
    }

    return new Date() > new Date(brief.expires_at);
  }

  private getResearchDepth(
    priority: 'immediate' | 'high' | 'medium' | 'low'
  ): 'overview' | 'standard' | 'expert' {
    switch (priority) {
      case 'immediate':
      case 'high':
        return 'expert';
      case 'medium':
        return 'standard';
      case 'low':
        return 'overview';
    }
  }

  private getFocusAreas(research_type: ResearchType): string[] {
    const focusMap: Record<ResearchType, string[]> = {
      character: [
        'background',
        'motivation',
        'psychology',
        'profession',
        'era-appropriate behavior',
      ],
      location: [
        'geography',
        'climate',
        'culture',
        'architecture',
        'historical context',
      ],
      historical: [
        'timeline',
        'major events',
        'societal norms',
        'technology level',
        'political climate',
      ],
      technical: [
        'accuracy',
        'terminology',
        'procedures',
        'real-world examples',
        'expert knowledge',
      ],
      cultural: [
        'traditions',
        'values',
        'customs',
        'language',
        'social structure',
      ],
      scientific: [
        'principles',
        'applications',
        'limitations',
        'current research',
        'accuracy',
      ],
    };

    return focusMap[research_type] || [];
  }

  private calculateOverallConfidence(
    facts: Array<{ confidence: number }>
  ): number {
    if (facts.length === 0) return 0;

    const sum = facts.reduce((acc, f) => acc + f.confidence, 0);
    return Math.round((sum / facts.length) * 100);
  }

  private calculateExpiry(
    priority: 'immediate' | 'high' | 'medium' | 'low'
  ): Date {
    const now = new Date();

    switch (priority) {
      case 'immediate':
        // Expire in 1 week (likely used immediately)
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'high':
        // Expire in 1 month
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'medium':
        // Expire in 3 months
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      case 'low':
        // Expire in 6 months
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    }
  }

  private async storeBrief(brief: ResearchBrief): Promise<void> {
    // Store in GraphRAG
    await this.graphrag.storeDocument({
      content: JSON.stringify(brief, null, 2),
      title: `Research Brief: ${brief.topic}`,
      metadata: {
        type: 'research_brief',
        project_id: brief.project_id,
        research_type: brief.research_type,
        topic: brief.topic,
      },
    });

    // Store in database
    await this.db.insert('prose.research_briefs', {
      id: brief.id,
      project_id: brief.project_id,
      topic: brief.topic,
      research_type: brief.research_type,
      content: JSON.stringify(brief),
      sources: JSON.stringify(brief.references),
      confidence_score: brief.confidence_score,
      learning_agent_job_id: brief.learning_agent_job_id,
    });
  }

  private extractResearchTopics(
    chapters: Array<{
      chapter_number: number;
      summary: string;
      characters: string[];
      locations: string[];
    }>
  ): Array<{ topic: string; context: string; type: ResearchType }> {
    const topics: Array<{ topic: string; context: string; type: ResearchType }> =
      [];

    chapters.forEach((chapter) => {
      // Extract character research needs
      chapter.characters.forEach((char) => {
        if (char && char.trim().length > 0) {
          topics.push({
            topic: `Character background: ${char}`,
            context: `Character appearing in chapter ${chapter.chapter_number}: ${chapter.summary}`,
            type: 'character',
          });
        }
      });

      // Extract location research needs
      chapter.locations.forEach((loc) => {
        if (loc && loc.trim().length > 0) {
          topics.push({
            topic: `Location details: ${loc}`,
            context: `Setting for chapter ${chapter.chapter_number}: ${chapter.summary}`,
            type: 'location',
          });
        }
      });

      // Extract technical/historical topics from summary keywords
      const keywords = this.extractKeywords(chapter.summary);
      keywords.forEach((keyword) => {
        topics.push({
          topic: keyword,
          context: `Referenced in chapter ${chapter.chapter_number}: ${chapter.summary}`,
          type: 'technical',
        });
      });
    });

    // Deduplicate topics
    const uniqueTopics = Array.from(
      new Map(topics.map((t) => [t.topic, t])).values()
    );

    return uniqueTopics;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, use NLP)
    const keywords: string[] = [];

    // Look for technical terms, proper nouns, specific concepts
    const technicalTermsPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const matches = text.match(technicalTermsPattern);

    if (matches) {
      keywords.push(...matches.slice(0, 3)); // Limit to top 3
    }

    return keywords;
  }
}
