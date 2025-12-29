/**
 * YouTube SEO Optimizer
 *
 * Optimizes video content for YouTube search and recommendations
 * Focuses on titles, descriptions, tags, and engagement predictions
 */

import {
  YouTubeSEO,
  OptimizedTitle,
  OptimizedDescription,
  TitleVariation,
  ThumbnailConcept,
  KeywordResearch,
  ContentOptimization
} from './types';

export class SEOOptimizer {
  private readonly TITLE_MAX_LENGTH = 60; // Optimal for mobile display
  private readonly DESCRIPTION_MAX_LENGTH = 5000;
  private readonly DESCRIPTION_VISIBLE_LENGTH = 150; // Before "show more"
  private readonly MAX_TAGS = 15; // YouTube allows 500 chars, ~30-40 tags
  private readonly TARGET_KEYWORD_DENSITY = 2.5; // percentage

  /**
   * Optimize video content for YouTube SEO
   */
  async optimizeForYouTube(params: {
    title: string;
    description: string;
    content: string;
    target_keywords?: string[];
  }): Promise<YouTubeSEO> {
    // Optimize title
    const optimizedTitle = await this.optimizeTitle(params.title, params.target_keywords);

    // Optimize description
    const optimizedDescription = await this.optimizeDescription(
      params.description,
      params.content,
      params.target_keywords
    );

    // Generate tags
    const tags = await this.generateTags(params.content, params.target_keywords);

    // Generate thumbnail concepts
    const thumbnailConcepts = await this.generateThumbnailConcepts(params.title);

    // Keyword analysis
    const keywordAnalysis = await this.analyzeKeywords(
      params.title,
      params.description,
      params.content,
      params.target_keywords
    );

    // Engagement predictions
    const engagementPredictions = this.predictEngagement(
      optimizedTitle,
      optimizedDescription,
      params.content
    );

    return {
      title: optimizedTitle,
      description: optimizedDescription,
      tags,
      thumbnail_concepts: thumbnailConcepts,
      keyword_analysis: keywordAnalysis,
      engagement_predictions: engagementPredictions
    };
  }

  /**
   * Optimize video title for CTR and SEO
   */
  private async optimizeTitle(
    title: string,
    targetKeywords?: string[]
  ): Promise<OptimizedTitle> {
    const originalLength = title.length;

    // Generate optimized version
    let optimized = title;

    // Ensure title is within optimal length
    if (originalLength > this.TITLE_MAX_LENGTH) {
      optimized = this.truncateTitle(title);
    }

    // Front-load keywords
    if (targetKeywords && targetKeywords.length > 0) {
      optimized = this.frontLoadKeyword(optimized, targetKeywords[0]);
    }

    // Add numbers if not present (numbers increase CTR)
    if (!/\d/.test(optimized)) {
      optimized = this.suggestNumberAddition(optimized);
    }

    // Calculate scores
    const keywordScore = this.calculateKeywordScore(optimized, targetKeywords);
    const curiosityScore = this.calculateCuriosityScore(optimized);
    const emotionalScore = this.calculateEmotionalScore(optimized);

    // Generate variations
    const variations = await this.generateTitleVariations(title, targetKeywords);

    // Generate recommendations
    const recommendations = this.generateTitleRecommendations(
      optimized,
      keywordScore,
      curiosityScore,
      emotionalScore
    );

    return {
      original: title,
      optimized,
      character_count: optimized.length,
      keyword_score: keywordScore,
      curiosity_score: curiosityScore,
      emotional_score: emotionalScore,
      variations,
      recommendations
    };
  }

  /**
   * Generate title variations with different approaches
   */
  private async generateTitleVariations(
    title: string,
    targetKeywords?: string[]
  ): Promise<TitleVariation[]> {
    const variations: TitleVariation[] = [];

    // Number-based variation
    variations.push({
      text: this.createNumberBasedTitle(title),
      score: 75,
      reasoning: 'Numbers increase CTR by providing specific expectations'
    });

    // Question-based variation
    variations.push({
      text: this.createQuestionBasedTitle(title),
      score: 70,
      reasoning: 'Questions create curiosity and engagement'
    });

    // How-to variation
    variations.push({
      text: this.createHowToTitle(title),
      score: 80,
      reasoning: 'How-to titles are highly searchable and clicked'
    });

    // Curiosity gap variation
    variations.push({
      text: this.createCuriosityGapTitle(title),
      score: 65,
      reasoning: 'Curiosity gaps drive clicks but can feel clickbait-y'
    });

    // Benefit-focused variation
    variations.push({
      text: this.createBenefitFocusedTitle(title),
      score: 85,
      reasoning: 'Benefit-focused titles directly address viewer needs'
    });

    return variations.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Optimize video description for SEO and engagement
   */
  private async optimizeDescription(
    description: string,
    content: string,
    targetKeywords?: string[]
  ): Promise<OptimizedDescription> {
    // Extract keywords from content
    const keywords = await this.extractKeywords(content, 20);

    // Build optimized description structure
    const structure = {
      first_paragraph: this.createFirstParagraph(description, keywords),
      body: this.createDescriptionBody(description, content, keywords),
      timestamps: '--- TIMESTAMPS ---\n[Generated by video script]',
      links: '--- LINKS ---\n[Insert relevant links here]',
      social_media: '--- FOLLOW ME ---\n[Social media links]'
    };

    const optimized = this.assembleDescription(structure);

    // Calculate metrics
    const keywordDensity = this.calculateKeywordDensity(optimized, keywords);
    const ctaCount = this.countCTAs(optimized);
    const linkCount = (optimized.match(/https?:\/\//g) || []).length;

    return {
      original: description,
      optimized,
      character_count: optimized.length,
      keyword_density: keywordDensity,
      cta_count: ctaCount,
      link_count: linkCount,
      timestamp_included: true,
      structure
    };
  }

  /**
   * Generate relevant tags for the video
   */
  private async generateTags(
    content: string,
    targetKeywords?: string[]
  ): Promise<string[]> {
    const tags: string[] = [];

    // Add target keywords first
    if (targetKeywords) {
      tags.push(...targetKeywords);
    }

    // Extract keywords from content
    const contentKeywords = await this.extractKeywords(content, 30);

    // Add content keywords
    for (const keyword of contentKeywords) {
      if (!tags.includes(keyword.keyword) && tags.length < this.MAX_TAGS) {
        tags.push(keyword.keyword);
      }
    }

    // Add variations of main keywords
    const variations = this.generateKeywordVariations(tags.slice(0, 3));
    for (const variation of variations) {
      if (!tags.includes(variation) && tags.length < this.MAX_TAGS) {
        tags.push(variation);
      }
    }

    // Add trending/related tags (would integrate with YouTube API)
    const trending = ['2024', 'tutorial', 'guide', 'tips', 'how to'];
    for (const tag of trending) {
      if (!tags.includes(tag) && tags.length < this.MAX_TAGS) {
        tags.push(tag);
      }
    }

    return tags.slice(0, this.MAX_TAGS);
  }

  /**
   * Generate thumbnail concepts
   */
  private async generateThumbnailConcepts(title: string): Promise<ThumbnailConcept[]> {
    const concepts: ThumbnailConcept[] = [];

    // Concept 1: Text-focused with bold statement
    concepts.push({
      concept: 'Bold Text Overlay',
      elements: {
        text_overlay: this.extractKeyPhrase(title),
        primary_visual: 'Close-up reaction shot with expressive emotion',
        emotion: 'excitement',
        color_scheme: ['#FF0000', '#FFFFFF', '#000000'],
        composition: 'Rule of thirds with text on left third, face on right'
      },
      score: 85,
      reasoning: 'Bold text with emotional face is proven high-CTR combination'
    });

    // Concept 2: Before/After split
    concepts.push({
      concept: 'Before/After Split Screen',
      elements: {
        text_overlay: 'BEFORE → AFTER',
        primary_visual: 'Split screen showing transformation',
        emotion: 'curiosity',
        color_scheme: ['#FF6B00', '#00A8FF', '#FFFFFF'],
        composition: 'Vertical split with contrasting sides'
      },
      score: 80,
      reasoning: 'Before/after creates curiosity about the transformation'
    });

    // Concept 3: Number-focused
    concepts.push({
      concept: 'Large Number with Visual',
      elements: {
        text_overlay: this.extractNumber(title) || '#1',
        primary_visual: 'Visual representation of the main topic',
        emotion: 'curiosity',
        color_scheme: ['#FFD700', '#000000', '#FFFFFF'],
        composition: 'Large number in top-left, visual in background'
      },
      score: 75,
      reasoning: 'Numbers create specific expectations and stand out'
    });

    // Concept 4: Question-based
    if (title.includes('?')) {
      concepts.push({
        concept: 'Question Thumbnail',
        elements: {
          text_overlay: title.split('?')[0] + '?',
          primary_visual: 'Confused or curious facial expression',
          emotion: 'curiosity',
          color_scheme: ['#9C27B0', '#FFFFFF', '#000000'],
          composition: 'Question text at top, expressive face below'
        },
        score: 78,
        reasoning: 'Questions engage viewers and prompt them to seek answers'
      });
    }

    // Concept 5: Shock/Surprise
    concepts.push({
      concept: 'Shock Value',
      elements: {
        text_overlay: 'SHOCKING!',
        primary_visual: 'Shocked facial expression with pointing gesture',
        emotion: 'shock',
        color_scheme: ['#FF0000', '#FFFF00', '#000000'],
        composition: 'Face and gesture dominate, bold text overlay'
      },
      score: 70,
      reasoning: 'Shock value can drive clicks but may feel clickbait-y'
    });

    return concepts.sort((a, b) => b.score - a.score);
  }

  /**
   * Analyze keyword placement and effectiveness
   */
  private async analyzeKeywords(
    title: string,
    description: string,
    content: string,
    targetKeywords?: string[]
  ): Promise<YouTubeSEO['keyword_analysis']> {
    const primaryKeyword = targetKeywords?.[0] || await this.extractPrimaryKeyword(content);
    const secondaryKeywords = targetKeywords?.slice(1) || await this.extractSecondaryKeywords(content, 5);

    // Check keyword placement
    const keywordPlacement = {
      in_title: new RegExp(primaryKeyword, 'i').test(title),
      in_first_sentence: new RegExp(primaryKeyword, 'i').test(description.split('.')[0] || ''),
      in_description: new RegExp(primaryKeyword, 'i').test(description),
      in_tags: true // Assumed if using generateTags
    };

    // Calculate scores (would integrate with keyword research tools)
    const searchVolumeScore = 65; // Placeholder
    const competitionScore = 55; // Placeholder

    return {
      primary_keyword: primaryKeyword,
      secondary_keywords: secondaryKeywords,
      search_volume_score: searchVolumeScore,
      competition_score: competitionScore,
      keyword_placement: keywordPlacement
    };
  }

  /**
   * Predict engagement metrics
   */
  private predictEngagement(
    title: OptimizedTitle,
    description: OptimizedDescription,
    content: string
  ): YouTubeSEO['engagement_predictions'] {
    // Predict CTR based on title optimization
    const estimatedCTR = this.calculateCTRPrediction(title);

    // Predict retention curve
    const estimatedRetention = this.predictRetentionCurve(content);

    // Predict overall engagement rate
    const estimatedEngagementRate = this.calculateEngagementRate(title, description);

    return {
      estimated_ctr: estimatedCTR,
      estimated_retention: estimatedRetention,
      estimated_engagement_rate: estimatedEngagementRate
    };
  }

  // Helper methods

  private truncateTitle(title: string): string {
    if (title.length <= this.TITLE_MAX_LENGTH) return title;

    // Try to truncate at word boundary
    const truncated = title.slice(0, this.TITLE_MAX_LENGTH - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > this.TITLE_MAX_LENGTH * 0.8) {
      return truncated.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  private frontLoadKeyword(title: string, keyword: string): string {
    if (title.toLowerCase().startsWith(keyword.toLowerCase())) {
      return title;
    }

    // Check if keyword is already in title
    if (new RegExp(keyword, 'i').test(title)) {
      return title;
    }

    return `${keyword}: ${title}`;
  }

  private suggestNumberAddition(title: string): string {
    // Common number patterns
    const patterns = [
      '7 Ways to',
      '10 Tips for',
      '5 Steps to',
      'Top 10',
      '3 Secrets to'
    ];

    // Return original if it already works well
    return title;
  }

  private calculateKeywordScore(title: string, keywords?: string[]): number {
    if (!keywords || keywords.length === 0) return 50;

    let score = 0;
    const titleLower = title.toLowerCase();

    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += 30;
        // Bonus for keyword at start
        if (titleLower.startsWith(keyword.toLowerCase())) {
          score += 20;
        }
      }
    }

    return Math.min(100, score);
  }

  private calculateCuriosityScore(title: string): number {
    let score = 50;

    // Question
    if (/\?$/.test(title)) score += 20;

    // Curiosity keywords
    const curiosityWords = ['secret', 'hidden', 'nobody', 'never', 'surprise', 'shock', 'discover', 'reveal'];
    for (const word of curiosityWords) {
      if (new RegExp(word, 'i').test(title)) score += 10;
    }

    // Numbers
    if (/\d+/.test(title)) score += 10;

    return Math.min(100, score);
  }

  private calculateEmotionalScore(title: string): number {
    let score = 30;

    const emotionalWords = [
      'amazing', 'incredible', 'shocking', 'unbelievable', 'essential',
      'powerful', 'ultimate', 'perfect', 'best', 'worst', 'love', 'hate'
    ];

    for (const word of emotionalWords) {
      if (new RegExp(word, 'i').test(title)) score += 15;
    }

    return Math.min(100, score);
  }

  private generateTitleRecommendations(
    title: string,
    keywordScore: number,
    curiosityScore: number,
    emotionalScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (title.length > this.TITLE_MAX_LENGTH) {
      recommendations.push(`Shorten title to ${this.TITLE_MAX_LENGTH} characters for better mobile display`);
    }

    if (keywordScore < 50) {
      recommendations.push('Include target keyword at the beginning of the title');
    }

    if (curiosityScore < 60) {
      recommendations.push('Add a number or create a curiosity gap to increase CTR');
    }

    if (emotionalScore < 50) {
      recommendations.push('Use emotional language to create stronger connection');
    }

    if (!/\d/.test(title)) {
      recommendations.push('Consider adding a number (e.g., "7 Ways..." or "Top 10...")');
    }

    return recommendations;
  }

  private createNumberBasedTitle(title: string): string {
    return `7 ${title} Tips That Actually Work`;
  }

  private createQuestionBasedTitle(title: string): string {
    return `How to ${title}? (Step-by-Step Guide)`;
  }

  private createHowToTitle(title: string): string {
    return `How to ${title} in 2024 (Complete Guide)`;
  }

  private createCuriosityGapTitle(title: string): string {
    return `The ${title} Secret Nobody Tells You`;
  }

  private createBenefitFocusedTitle(title: string): string {
    return `${title}: Double Your Results in 30 Days`;
  }

  private createFirstParagraph(description: string, keywords: KeywordResearch[]): string {
    // First 150 characters are crucial (visible without "show more")
    const firstSentence = description.split('.')[0] || description;

    if (firstSentence.length <= this.DESCRIPTION_VISIBLE_LENGTH) {
      return firstSentence + '.';
    }

    return firstSentence.slice(0, this.DESCRIPTION_VISIBLE_LENGTH - 3) + '...';
  }

  private createDescriptionBody(description: string, content: string, keywords: KeywordResearch[]): string {
    return description + '\n\n' + content.slice(0, 500);
  }

  private assembleDescription(structure: OptimizedDescription['structure']): string {
    return `${structure.first_paragraph}\n\n${structure.body}\n\n${structure.timestamps}\n\n${structure.links}\n\n${structure.social_media}`;
  }

  private calculateKeywordDensity(text: string, keywords: KeywordResearch[]): number {
    if (keywords.length === 0) return 0;

    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    let keywordCount = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword.keyword.toLowerCase(), 'g');
      const matches = text.toLowerCase().match(regex);
      keywordCount += matches ? matches.length : 0;
    }

    return (keywordCount / totalWords) * 100;
  }

  private countCTAs(text: string): number {
    const ctaPatterns = /subscribe|like|comment|share|click|download|visit|check out/gi;
    return (text.match(ctaPatterns) || []).length;
  }

  private async extractKeywords(text: string, count: number): Promise<KeywordResearch[]> {
    // Simple keyword extraction (would use NLP in production)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([keyword, freq]) => ({
        keyword,
        search_volume: 1000, // Placeholder
        competition: 'medium',
        difficulty_score: 50,
        relevance_score: Math.min(100, freq * 10),
        trending: false,
        related_keywords: []
      }));
  }

  private generateKeywordVariations(keywords: string[]): string[] {
    const variations: string[] = [];

    for (const keyword of keywords) {
      variations.push(`${keyword} 2024`);
      variations.push(`${keyword} tutorial`);
      variations.push(`${keyword} guide`);
      variations.push(`how to ${keyword}`);
    }

    return variations;
  }

  private extractKeyPhrase(title: string): string {
    const words = title.split(' ');
    return words.slice(0, 3).join(' ').toUpperCase();
  }

  private extractNumber(title: string): string | null {
    const match = title.match(/\d+/);
    return match ? match[0] : null;
  }

  private async extractPrimaryKeyword(content: string): Promise<string> {
    const keywords = await this.extractKeywords(content, 1);
    return keywords[0]?.keyword || 'content';
  }

  private async extractSecondaryKeywords(content: string, count: number): Promise<string[]> {
    const keywords = await this.extractKeywords(content, count + 1);
    return keywords.slice(1).map(k => k.keyword);
  }

  private calculateCTRPrediction(title: OptimizedTitle): number {
    // Average CTR based on title optimization
    let ctr = 3.0; // Base CTR percentage

    if (title.keyword_score > 70) ctr += 1.5;
    if (title.curiosity_score > 70) ctr += 2.0;
    if (title.emotional_score > 70) ctr += 1.5;
    if (title.character_count <= this.TITLE_MAX_LENGTH) ctr += 1.0;

    return Math.min(15, ctr); // Max realistic CTR
  }

  private predictRetentionCurve(content: string): YouTubeSEO['engagement_predictions']['estimated_retention'] {
    const duration = (content.split(/\s+/).length / 150) * 60; // Estimated seconds

    return {
      predicted_retention: [
        { timestamp: 0, retention_percentage: 100 },
        { timestamp: 30, retention_percentage: 70, reason: 'Critical first 30 seconds' },
        { timestamp: 60, retention_percentage: 60 },
        { timestamp: duration / 2, retention_percentage: 50 },
        { timestamp: duration, retention_percentage: 40 }
      ],
      critical_moments: [
        {
          timestamp: 30,
          type: 'drop_risk',
          description: 'First 30 seconds - highest drop-off point',
          recommendation: 'Strong hook essential here'
        },
        {
          timestamp: duration * 0.75,
          type: 'drop_risk',
          description: 'Late-video fatigue',
          recommendation: 'Add pattern interrupt or engagement moment'
        }
      ],
      overall_retention_score: 55,
      average_view_duration: duration * 0.5
    };
  }

  private calculateEngagementRate(title: OptimizedTitle, description: OptimizedDescription): number {
    let engagement = 2.0; // Base 2% engagement rate

    if (title.emotional_score > 70) engagement += 0.5;
    if (description.cta_count > 2) engagement += 0.5;
    if (description.keyword_density > 1.5 && description.keyword_density < 3.5) engagement += 0.3;

    return Math.min(8, engagement); // Max realistic engagement rate
  }
}
