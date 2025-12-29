/**
 * Hook Optimizer
 *
 * Optimizes the first 30 seconds of YouTube videos for maximum retention
 * YouTube's algorithm heavily weights the first 30 seconds of viewer retention
 */

import { HookAnalysis, HookSuggestion } from './types';

export class HookOptimizer {
  private readonly TARGET_DURATION = 30; // seconds
  private readonly IDEAL_WORD_COUNT_MIN = 40;
  private readonly IDEAL_WORD_COUNT_MAX = 75;
  private readonly SPEAKING_RATE = 150; // words per minute

  /**
   * Analyze and optimize a video hook
   */
  async optimizeHook(hook: string): Promise<HookAnalysis> {
    const wordCount = this.countWords(hook);
    const estimatedDuration = this.estimateDuration(hook);

    // Perform all checks
    const checks = {
      has_question: this.containsQuestion(hook),
      has_statistic: this.containsStatistic(hook),
      has_story_hook: this.containsStoryElement(hook),
      addresses_viewer_pain: this.addressesPainPoint(hook),
      creates_curiosity_gap: this.createsCuriosityGap(hook),
      too_long: estimatedDuration > this.TARGET_DURATION + 5,
      too_vague: wordCount < 15 || !this.hasSpecificDetails(hook),
      has_emotional_trigger: this.hasEmotionalTrigger(hook)
    };

    // Calculate retention score
    const retentionScore = this.predictRetentionScore(hook, checks);

    // Generate suggestions
    const suggestions = this.generateSuggestions(hook, checks, retentionScore);

    return {
      current_text: hook,
      word_count: wordCount,
      estimated_duration: estimatedDuration,
      checks,
      retention_score: retentionScore,
      suggestions
    };
  }

  /**
   * Generate multiple hook variations
   */
  async generateHookVariations(
    hook: string,
    count: number = 3
  ): Promise<Array<{ variation: string; score: number; type: string }>> {
    const variations: Array<{ variation: string; score: number; type: string }> = [];

    // Question-based variation
    if (!this.containsQuestion(hook)) {
      const questionHook = this.convertToQuestionHook(hook);
      const score = await this.scoreHook(questionHook);
      variations.push({
        variation: questionHook,
        score,
        type: 'question'
      });
    }

    // Statistic-based variation
    const statHook = this.enhanceWithStatistic(hook);
    if (statHook !== hook) {
      const score = await this.scoreHook(statHook);
      variations.push({
        variation: statHook,
        score,
        type: 'statistic'
      });
    }

    // Story-based variation
    const storyHook = this.convertToStoryHook(hook);
    const score = await this.scoreHook(storyHook);
    variations.push({
      variation: storyHook,
      score,
      type: 'story'
    });

    // Problem-solution variation
    const problemHook = this.convertToProblemHook(hook);
    const problemScore = await this.scoreHook(problemHook);
    variations.push({
      variation: problemHook,
      score: problemScore,
      type: 'problem'
    });

    return variations.sort((a, b) => b.score - a.score).slice(0, count);
  }

  /**
   * Predict viewer retention score (0-100)
   */
  private predictRetentionScore(hook: string, checks: HookAnalysis['checks']): number {
    let score = 50; // Base score

    // Positive factors
    if (checks.has_question) score += 15;
    if (checks.has_statistic) score += 10;
    if (checks.has_story_hook) score += 20;
    if (checks.addresses_viewer_pain) score += 15;
    if (checks.creates_curiosity_gap) score += 15;
    if (checks.has_emotional_trigger) score += 10;

    // Content quality factors
    if (this.hasSpecificDetails(hook)) score += 5;
    if (this.usesStrongVerbs(hook)) score += 5;
    if (this.hasPersonalConnection(hook)) score += 5;

    // Negative factors
    if (checks.too_long) score -= 20;
    if (checks.too_vague) score -= 15;
    if (this.isClickbaity(hook)) score -= 10;
    if (this.hasFiller(hook)) score -= 10;

    // Ensure score is within bounds
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    hook: string,
    checks: HookAnalysis['checks'],
    score: number
  ): HookSuggestion[] {
    const suggestions: HookSuggestion[] = [];

    // Critical suggestions (score < 50)
    if (score < 50) {
      if (!checks.has_question && !checks.has_statistic && !checks.has_story_hook) {
        suggestions.push({
          type: 'rewrite',
          suggestion: 'Completely rewrite the hook to include a question, statistic, or story element',
          impact: 'high',
          reasoning: 'Current hook lacks any strong retention elements',
          example: 'Did you know that 90% of viewers leave within the first 30 seconds? Here\'s how to keep them watching...'
        });
      }
    }

    // High-impact suggestions
    if (!checks.has_question) {
      suggestions.push({
        type: 'add_element',
        suggestion: 'Start with a question to immediately engage viewers',
        impact: 'high',
        reasoning: 'Questions create curiosity and prompt viewers to seek answers',
        example: 'Have you ever wondered why some videos go viral while others don\'t?'
      });
    }

    if (!checks.addresses_viewer_pain && !checks.creates_curiosity_gap) {
      suggestions.push({
        type: 'add_element',
        suggestion: 'Address a specific viewer pain point or problem',
        impact: 'high',
        reasoning: 'Viewers stay when they know you\'re solving their problem',
        example: 'Struggling to get views on your videos? This one trick changed everything for me...'
      });
    }

    if (checks.too_long) {
      suggestions.push({
        type: 'remove_element',
        suggestion: 'Shorten the hook to under 30 seconds',
        impact: 'high',
        reasoning: 'Long hooks lose viewer attention before delivering value',
        example: 'Remove unnecessary details and get to the point faster'
      });
    }

    // Medium-impact suggestions
    if (!checks.has_statistic) {
      suggestions.push({
        type: 'add_element',
        suggestion: 'Include a surprising statistic or number',
        impact: 'medium',
        reasoning: 'Statistics add credibility and capture attention',
        example: '95% of people don\'t know this simple trick...'
      });
    }

    if (!checks.has_story_hook) {
      suggestions.push({
        type: 'add_element',
        suggestion: 'Start with a brief story or scenario',
        impact: 'medium',
        reasoning: 'Stories create emotional connection and relatability',
        example: 'Last week, I discovered something that completely changed how I...'
      });
    }

    if (!checks.has_emotional_trigger) {
      suggestions.push({
        type: 'add_element',
        suggestion: 'Add emotional language to create stronger connection',
        impact: 'medium',
        reasoning: 'Emotional triggers increase engagement and retention',
        example: 'This amazing discovery will shock you...'
      });
    }

    // Low-impact suggestions
    if (checks.too_vague) {
      suggestions.push({
        type: 'add_element',
        suggestion: 'Add specific details and concrete examples',
        impact: 'medium',
        reasoning: 'Specific details make the hook more credible and interesting',
        example: 'Instead of "improve your skills", say "double your productivity in 7 days"'
      });
    }

    if (this.hasFiller(hook)) {
      suggestions.push({
        type: 'remove_element',
        suggestion: 'Remove filler words and get to the point faster',
        impact: 'low',
        reasoning: 'Filler words dilute the message and waste valuable seconds',
        example: 'Remove "um", "like", "you know", "basically", etc.'
      });
    }

    // Sort by impact
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
  }

  /**
   * Score a hook (0-100)
   */
  private async scoreHook(hook: string): Promise<number> {
    const checks = {
      has_question: this.containsQuestion(hook),
      has_statistic: this.containsStatistic(hook),
      has_story_hook: this.containsStoryElement(hook),
      addresses_viewer_pain: this.addressesPainPoint(hook),
      creates_curiosity_gap: this.createsCuriosityGap(hook),
      too_long: this.estimateDuration(hook) > this.TARGET_DURATION + 5,
      too_vague: !this.hasSpecificDetails(hook),
      has_emotional_trigger: this.hasEmotionalTrigger(hook)
    };

    return this.predictRetentionScore(hook, checks);
  }

  // Helper methods for hook analysis

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimateDuration(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil((wordCount / this.SPEAKING_RATE) * 60); // seconds
  }

  private containsQuestion(text: string): boolean {
    return /\?/.test(text) || /^(what|why|how|when|where|who|which|do|does|did|can|could|would|will|is|are)/i.test(text.trim());
  }

  private containsStatistic(text: string): boolean {
    return /\d+%|\d+ out of \d+|\d+ times|\d+x|\d+\+|#\d+/.test(text);
  }

  private containsStoryElement(text: string): boolean {
    const storyKeywords = [
      'once', 'story', 'imagine', 'picture this', 'remember when',
      'last week', 'yesterday', 'recently', 'when I', 'I was'
    ];
    return storyKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private addressesPainPoint(text: string): boolean {
    const painKeywords = [
      'problem', 'struggle', 'frustrated', 'difficult', 'challenge',
      'issue', 'trouble', 'failing', 'stuck', 'can\'t', 'unable'
    ];
    return painKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private createsCuriosityGap(text: string): boolean {
    const curiosityKeywords = [
      'secret', 'hidden', 'never knew', 'surprising', 'discover',
      'reveal', 'truth', 'nobody tells', 'what they don\'t',
      'you won\'t believe', 'shocking', 'mystery'
    ];
    return curiosityKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private hasEmotionalTrigger(text: string): boolean {
    const emotionalKeywords = [
      'amazing', 'incredible', 'shocking', 'unbelievable', 'wow',
      'excited', 'love', 'hate', 'angry', 'frustrated', 'happy',
      'sad', 'worried', 'concerned', 'thrilled', 'devastated'
    ];
    return emotionalKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private hasSpecificDetails(text: string): boolean {
    // Check for numbers, specific names, dates, etc.
    return /\d+|[A-Z][a-z]+ [A-Z][a-z]+|20\d{2}|yesterday|today|tomorrow/.test(text);
  }

  private usesStrongVerbs(text: string): boolean {
    const strongVerbs = [
      'discover', 'reveal', 'transform', 'master', 'dominate',
      'crush', 'destroy', 'explode', 'skyrocket', 'double', 'triple'
    ];
    return strongVerbs.some(verb => text.toLowerCase().includes(verb));
  }

  private hasPersonalConnection(text: string): boolean {
    return /\b(you|your|you\'re|you\'ll)\b/i.test(text);
  }

  private isClickbaity(text: string): boolean {
    const clickbaitPhrases = [
      'you won\'t believe',
      'doctors hate',
      'this one weird trick',
      'number 7 will shock',
      'what happened next'
    ];
    return clickbaitPhrases.some(phrase => text.toLowerCase().includes(phrase));
  }

  private hasFiller(text: string): boolean {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually'];
    return fillerWords.some(word => text.toLowerCase().includes(word));
  }

  // Hook variation generators

  private convertToQuestionHook(hook: string): string {
    // Extract main topic
    const words = hook.split(' ');
    const mainTopic = words.slice(0, 5).join(' ');

    return `Have you ever wondered how to ${mainTopic.toLowerCase()}? ${hook}`;
  }

  private enhanceWithStatistic(hook: string): string {
    // Add a generic statistic placeholder
    return `Did you know that 90% of people struggle with this? ${hook}`;
  }

  private convertToStoryHook(hook: string): string {
    return `Last week, I discovered something that completely changed everything. ${hook}`;
  }

  private convertToProblemHook(hook: string): string {
    return `Struggling with this common problem? Here's the solution. ${hook}`;
  }

  /**
   * A/B test hook variations
   */
  async compareHooks(hookA: string, hookB: string): Promise<{
    winner: 'A' | 'B' | 'tie';
    scoreA: number;
    scoreB: number;
    recommendation: string;
  }> {
    const scoreA = await this.scoreHook(hookA);
    const scoreB = await this.scoreHook(hookB);

    const difference = Math.abs(scoreA - scoreB);

    let winner: 'A' | 'B' | 'tie';
    let recommendation: string;

    if (difference < 5) {
      winner = 'tie';
      recommendation = 'Both hooks are similar in quality. Test both with real audience.';
    } else if (scoreA > scoreB) {
      winner = 'A';
      recommendation = `Hook A is stronger (${scoreA} vs ${scoreB}). Use Hook A for better retention.`;
    } else {
      winner = 'B';
      recommendation = `Hook B is stronger (${scoreB} vs ${scoreA}). Use Hook B for better retention.`;
    }

    return {
      winner,
      scoreA,
      scoreB,
      recommendation
    };
  }
}
