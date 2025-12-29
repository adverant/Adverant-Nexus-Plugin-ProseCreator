/**
 * YouTube Script Formatter
 *
 * Formats video scripts optimized for YouTube content
 * Includes timing analysis, timestamps, and engagement optimization
 */

import {
  FormattedVideoScript,
  ScriptBeat,
  Hook,
  Introduction,
  MainContent,
  ContentSection,
  CallToAction,
  Outro,
  Timestamp,
  EngagementStrategy,
  ScriptTimingAnalysis,
  VideoScriptFormattingOptions
} from './types';

export class YouTubeScriptFormatter {
  private readonly DEFAULT_SPEAKING_RATE = 150; // words per minute
  private readonly HOOK_MAX_DURATION = 30; // seconds
  private readonly INTRO_TARGET_DURATION = 45; // seconds
  private readonly CTA_TARGET_DURATION = 45; // seconds
  private readonly OUTRO_TARGET_DURATION = 20; // seconds

  /**
   * Format a complete video script for YouTube
   */
  async formatVideoScript(params: {
    project_id: string;
    title: string;
    target_duration: number; // minutes
    beats: ScriptBeat[];
    options?: Partial<VideoScriptFormattingOptions>;
  }): Promise<FormattedVideoScript> {
    const options = this.getDefaultOptions(params.options);

    // Separate beats by type
    const hookBeat = params.beats.find(b => b.type === 'hook') || params.beats[0];
    const introBeat = params.beats.find(b => b.type === 'intro') || params.beats[1];
    const ctaBeat = params.beats.find(b => b.type === 'cta') || params.beats[params.beats.length - 2];
    const outroBeat = params.beats.find(b => b.type === 'outro') || params.beats[params.beats.length - 1];
    const mainBeats = params.beats.filter(b => b.type === 'main');

    // Format each section
    const hook = this.formatHook(hookBeat, options);
    const intro = this.formatIntro(introBeat, options);
    const mainContent = this.formatMainContent(mainBeats, options);
    const cta = this.formatCTA(ctaBeat, options);
    const outro = this.formatOutro(outroBeat, options);

    // Calculate total metrics
    const totalWordCount = this.calculateTotalWordCount(params.beats);
    const actualDuration = this.estimateTotalDuration(params.beats, options.speaking_rate);

    // Generate timestamps for YouTube description
    const timestamps = this.generateTimestamps(params.beats, options);

    // Create engagement strategy
    const engagementStrategy = this.createEngagementStrategy(params.beats);

    return {
      metadata: {
        title: params.title,
        target_duration: params.target_duration,
        actual_duration: actualDuration,
        word_count: totalWordCount,
        estimated_speaking_rate: options.speaking_rate,
        format_version: '1.0.0',
        created_at: new Date()
      },
      hook,
      intro,
      main_content: mainContent,
      cta,
      outro,
      timestamps,
      engagement_strategy: engagementStrategy,
      seo: {
        title: {
          original: params.title,
          optimized: params.title,
          character_count: params.title.length,
          keyword_score: 0,
          curiosity_score: 0,
          emotional_score: 0,
          variations: [],
          recommendations: []
        },
        description: {
          original: '',
          optimized: '',
          character_count: 0,
          keyword_density: 0,
          cta_count: 0,
          link_count: 0,
          timestamp_included: true,
          structure: {
            first_paragraph: '',
            body: '',
            timestamps: '',
            links: '',
            social_media: ''
          }
        },
        tags: [],
        thumbnail_concepts: [],
        keyword_analysis: {
          primary_keyword: '',
          secondary_keywords: [],
          search_volume_score: 0,
          competition_score: 0,
          keyword_placement: {
            in_title: false,
            in_first_sentence: false,
            in_description: false,
            in_tags: false
          }
        },
        engagement_predictions: {
          estimated_ctr: 0,
          estimated_retention: {
            predicted_retention: [],
            critical_moments: [],
            overall_retention_score: 0,
            average_view_duration: 0
          },
          estimated_engagement_rate: 0
        }
      }
    };
  }

  /**
   * Format hook section (first 30 seconds)
   */
  private formatHook(beat: ScriptBeat, options: VideoScriptFormattingOptions): Hook {
    const duration = Math.min(
      this.estimateDuration(beat.content, options.speaking_rate),
      this.HOOK_MAX_DURATION
    );

    // Detect hook type
    const hookType = this.detectHookType(beat.content);

    // Calculate retention score
    const retentionScore = this.calculateHookRetentionScore(beat.content);

    // Generate suggestions if needed
    const suggestions = retentionScore < 70 ? this.generateHookSuggestions(beat.content) : [];

    return {
      text: beat.content,
      duration,
      type: hookType,
      retention_score: retentionScore,
      engagement_elements: {
        has_question: this.containsQuestion(beat.content),
        has_statistic: this.containsStatistic(beat.content),
        has_story_element: this.containsStoryElement(beat.content),
        addresses_pain_point: this.addressesPainPoint(beat.content),
        creates_curiosity: this.createsCuriosityGap(beat.content),
        emotional_trigger: this.detectEmotionalTrigger(beat.content)
      },
      suggestions
    };
  }

  /**
   * Format introduction section
   */
  private formatIntro(beat: ScriptBeat, options: VideoScriptFormattingOptions): Introduction {
    return {
      text: beat.content,
      duration: this.estimateDuration(beat.content, options.speaking_rate),
      elements: {
        value_proposition: this.extractValueProposition(beat.content),
        credibility_statement: this.extractCredibilityStatement(beat.content),
        preview_of_content: this.extractContentPreview(beat.content),
        subscribe_cta: this.containsSubscribeCTA(beat.content)
      }
    };
  }

  /**
   * Format main content sections
   */
  private formatMainContent(beats: ScriptBeat[], options: VideoScriptFormattingOptions): MainContent {
    let cumulativeDuration = 0;

    const sections: ContentSection[] = beats.map(beat => {
      const duration = this.estimateDuration(beat.content, options.speaking_rate);
      const timestamp = this.formatTimestamp(cumulativeDuration);
      cumulativeDuration += duration;

      return {
        title: beat.title,
        content: beat.content,
        duration,
        timestamp,
        key_points: this.extractKeyPoints(beat.content),
        visual_elements: beat.metadata.broll_suggestions,
        engagement_moments: this.identifyEngagementMoments(beat.content, cumulativeDuration)
      };
    });

    return {
      sections,
      total_duration: cumulativeDuration,
      word_count: beats.reduce((sum, b) => sum + b.word_count, 0)
    };
  }

  /**
   * Format call-to-action section
   */
  private formatCTA(beat: ScriptBeat, options: VideoScriptFormattingOptions): CallToAction {
    return {
      text: beat.content,
      duration: this.estimateDuration(beat.content, options.speaking_rate),
      cta_type: this.detectCTAType(beat.content),
      primary_action: this.extractPrimaryAction(beat.content),
      secondary_action: this.extractSecondaryAction(beat.content),
      urgency_level: this.calculateUrgencyLevel(beat.content),
      value_proposition: this.extractValueProposition(beat.content)
    };
  }

  /**
   * Format outro section
   */
  private formatOutro(beat: ScriptBeat, options: VideoScriptFormattingOptions): Outro {
    return {
      text: beat.content,
      duration: this.estimateDuration(beat.content, options.speaking_rate),
      elements: {
        thank_you: this.containsThankYou(beat.content),
        next_video_tease: this.extractNextVideoTease(beat.content),
        subscribe_reminder: this.containsSubscribeReminder(beat.content),
        end_screen_elements: this.extractEndScreenElements(beat.content)
      }
    };
  }

  /**
   * Generate chapter timestamps for YouTube description
   */
  private generateTimestamps(
    beats: ScriptBeat[],
    options: VideoScriptFormattingOptions
  ): Timestamp[] {
    const timestamps: Timestamp[] = [];
    let cumulativeTime = 0;

    for (const beat of beats) {
      timestamps.push({
        time: this.formatTimestamp(cumulativeTime),
        title: beat.title,
        description: beat.summary
      });

      cumulativeTime += this.estimateDuration(beat.content, options.speaking_rate);
    }

    return timestamps;
  }

  /**
   * Create engagement strategy
   */
  private createEngagementStrategy(beats: ScriptBeat[]): EngagementStrategy {
    let patternInterrupts = 0;
    let engagementPrompts = 0;
    const retentionTactics: string[] = [];
    const recommendedGraphics: string[] = [];
    const recommendedBroll: string[] = [];

    for (const beat of beats) {
      // Count pattern interrupts (questions, statistics, stories)
      if (this.containsQuestion(beat.content)) patternInterrupts++;
      if (this.containsStatistic(beat.content)) patternInterrupts++;
      if (this.containsStoryElement(beat.content)) patternInterrupts++;

      // Count engagement prompts
      if (this.containsEngagementPrompt(beat.content)) engagementPrompts++;

      // Collect B-roll suggestions
      if (beat.metadata.broll_suggestions) {
        recommendedBroll.push(...beat.metadata.broll_suggestions);
      }

      // Collect graphics suggestions
      if (beat.metadata.graphics) {
        recommendedGraphics.push(...beat.metadata.graphics);
      }
    }

    // Add retention tactics
    if (patternInterrupts > 0) {
      retentionTactics.push(`Use ${patternInterrupts} pattern interrupts throughout video`);
    }
    if (engagementPrompts > 0) {
      retentionTactics.push(`Include ${engagementPrompts} engagement prompts to drive interaction`);
    }
    if (recommendedBroll.length > 0) {
      retentionTactics.push(`Use B-roll footage during ${recommendedBroll.length} sections for visual variety`);
    }

    return {
      pattern_interrupts: patternInterrupts,
      engagement_prompts: engagementPrompts,
      retention_tactics: retentionTactics,
      recommended_graphics: recommendedGraphics,
      recommended_broll: recommendedBroll
    };
  }

  /**
   * Analyze script timing
   */
  async analyzeScriptTiming(
    beats: ScriptBeat[],
    options: VideoScriptFormattingOptions
  ): Promise<ScriptTimingAnalysis> {
    const totalDuration = this.estimateTotalDuration(beats, options.speaking_rate);
    const totalWordCount = this.calculateTotalWordCount(beats);

    // Section breakdown
    const sectionBreakdown = beats.map(beat => {
      const duration = this.estimateDuration(beat.content, options.speaking_rate);
      return {
        section: beat.title,
        duration,
        percentage: (duration / totalDuration) * 100
      };
    });

    // Pacing analysis
    const actualWPM = (totalWordCount / totalDuration) * 60;
    const pacingIssues = this.detectPacingIssues(beats, options.speaking_rate);

    // Engagement distribution
    const patternInterruptsPerMinute = this.countPatternInterrupts(beats) / (totalDuration / 60);
    const engagementPromptsPerMinute = this.countEngagementPrompts(beats) / (totalDuration / 60);

    return {
      total_duration: totalDuration,
      section_breakdown: sectionBreakdown,
      pacing_analysis: {
        words_per_minute: actualWPM,
        recommended_wpm: options.speaking_rate,
        pacing_issues: pacingIssues
      },
      engagement_distribution: {
        pattern_interrupts_per_minute: patternInterruptsPerMinute,
        engagement_prompts_per_minute: engagementPromptsPerMinute,
        visual_changes_per_minute: 0 // Would need visual timeline data
      }
    };
  }

  // Helper methods

  private detectHookType(text: string): Hook['type'] {
    if (this.containsQuestion(text)) return 'question';
    if (this.containsStatistic(text)) return 'statistic';
    if (this.containsStoryElement(text)) return 'story';
    if (this.containsControversy(text)) return 'controversy';
    if (this.addressesPainPoint(text)) return 'problem';
    return 'curiosity_gap';
  }

  private calculateHookRetentionScore(text: string): number {
    let score = 50;

    if (this.containsQuestion(text)) score += 15;
    if (this.containsStatistic(text)) score += 10;
    if (this.containsStoryElement(text)) score += 20;
    if (this.addressesPainPoint(text)) score += 15;
    if (this.detectEmotionalTrigger(text)) score += 10;
    if (this.createsCuriosityGap(text)) score += 15;

    // Penalties
    if (text.length > 200) score -= 10; // Too long
    if (text.split(' ').length < 10) score -= 15; // Too short/vague

    return Math.min(100, Math.max(0, score));
  }

  private containsQuestion(text: string): boolean {
    return /\?/.test(text);
  }

  private containsStatistic(text: string): boolean {
    return /\d+%|\d+ out of \d+|\d+ times|\d+x/.test(text);
  }

  private containsStoryElement(text: string): boolean {
    const storyKeywords = ['once', 'story', 'imagine', 'picture this', 'remember when'];
    return storyKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private addressesPainPoint(text: string): boolean {
    const painKeywords = ['problem', 'struggle', 'frustrated', 'difficult', 'challenge', 'issue'];
    return painKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private containsControversy(text: string): boolean {
    const controversyKeywords = ['controversial', 'debate', 'argument', 'disagree', 'wrong'];
    return controversyKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private createsCuriosityGap(text: string): boolean {
    const curiosityKeywords = ['secret', 'hidden', 'never knew', 'surprising', 'discover', 'reveal'];
    return curiosityKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private detectEmotionalTrigger(text: string): string | null {
    if (/excit|amaz|wow|incredible/.test(text.toLowerCase())) return 'excitement';
    if (/worry|concern|problem|issue/.test(text.toLowerCase())) return 'concern';
    if (/happy|joy|love|great/.test(text.toLowerCase())) return 'happiness';
    if (/shock|surpris|unbeliev/.test(text.toLowerCase())) return 'shock';
    if (/curious|wonder|interest/.test(text.toLowerCase())) return 'curiosity';
    return null;
  }

  private generateHookSuggestions(text: string): string[] {
    const suggestions: string[] = [];

    if (!this.containsQuestion(text)) {
      suggestions.push('Consider starting with a question to engage viewers immediately');
    }
    if (!this.containsStatistic(text) && !this.containsStoryElement(text)) {
      suggestions.push('Add a surprising statistic or story element to capture attention');
    }
    if (text.length > 200) {
      suggestions.push('Shorten the hook to under 30 seconds of speaking time');
    }
    if (!this.addressesPainPoint(text) && !this.createsCuriosityGap(text)) {
      suggestions.push('Address a viewer pain point or create a curiosity gap');
    }

    return suggestions;
  }

  private estimateDuration(text: string, wpm: number): number {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil((wordCount / wpm) * 60); // seconds
  }

  private estimateTotalDuration(beats: ScriptBeat[], wpm: number): number {
    return beats.reduce((total, beat) => total + this.estimateDuration(beat.content, wpm), 0);
  }

  private calculateTotalWordCount(beats: ScriptBeat[]): number {
    return beats.reduce((total, beat) => total + beat.word_count, 0);
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private extractKeyPoints(text: string): string[] {
    // Simple extraction - could be enhanced with NLP
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private identifyEngagementMoments(text: string, startTime: number): any[] {
    const moments: any[] = [];

    if (this.containsQuestion(text)) {
      moments.push({
        type: 'comment_prompt',
        text: 'Question that could prompt viewer comments',
        timestamp: this.formatTimestamp(startTime),
        reason: 'Engagement opportunity'
      });
    }

    return moments;
  }

  private detectCTAType(text: string): CallToAction['cta_type'] {
    if (/subscribe/i.test(text)) return 'subscribe';
    if (/like/i.test(text)) return 'like';
    if (/comment/i.test(text)) return 'comment';
    if (/share/i.test(text)) return 'share';
    if (/link|website|download/i.test(text)) return 'link';
    return 'subscribe';
  }

  private extractValueProposition(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences[0]?.trim() || '';
  }

  private extractCredibilityStatement(text: string): string | undefined {
    const credKeywords = ['expert', 'experience', 'years', 'professional'];
    const sentences = text.split(/[.!?]+/);
    const credSentence = sentences.find(s =>
      credKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    return credSentence?.trim();
  }

  private extractContentPreview(text: string): string {
    return text.slice(0, 200) + (text.length > 200 ? '...' : '');
  }

  private containsSubscribeCTA(text: string): boolean {
    return /subscribe/i.test(text);
  }

  private extractPrimaryAction(text: string): string {
    const actionMatch = text.match(/(subscribe|like|comment|share|click|download|visit)/i);
    return actionMatch ? actionMatch[0] : 'subscribe';
  }

  private extractSecondaryAction(text: string): string | undefined {
    const actions = text.match(/(subscribe|like|comment|share|click|download|visit)/gi);
    return actions && actions.length > 1 ? actions[1] : undefined;
  }

  private calculateUrgencyLevel(text: string): 'low' | 'medium' | 'high' {
    const highUrgency = /now|today|limited|urgent|don't wait/i;
    const mediumUrgency = /soon|this week|before/i;

    if (highUrgency.test(text)) return 'high';
    if (mediumUrgency.test(text)) return 'medium';
    return 'low';
  }

  private containsThankYou(text: string): boolean {
    return /thank|thanks/i.test(text);
  }

  private extractNextVideoTease(text: string): string | undefined {
    const teaseMatch = text.match(/next (video|time)|coming up|watch (next|more)/i);
    if (teaseMatch) {
      const startIndex = text.indexOf(teaseMatch[0]);
      return text.slice(startIndex, startIndex + 100).trim();
    }
    return undefined;
  }

  private containsSubscribeReminder(text: string): boolean {
    return /subscribe/i.test(text);
  }

  private extractEndScreenElements(text: string): string[] {
    const elements: string[] = [];
    if (/subscribe/i.test(text)) elements.push('Subscribe button');
    if (/video/i.test(text)) elements.push('Suggested videos');
    if (/playlist/i.test(text)) elements.push('Playlist');
    return elements;
  }

  private containsEngagementPrompt(text: string): boolean {
    return /comment|let me know|what do you think|leave a|share your/i.test(text);
  }

  private countPatternInterrupts(beats: ScriptBeat[]): number {
    return beats.reduce((count, beat) => {
      let interrupts = 0;
      if (this.containsQuestion(beat.content)) interrupts++;
      if (this.containsStatistic(beat.content)) interrupts++;
      if (this.containsStoryElement(beat.content)) interrupts++;
      return count + interrupts;
    }, 0);
  }

  private countEngagementPrompts(beats: ScriptBeat[]): number {
    return beats.filter(beat => this.containsEngagementPrompt(beat.content)).length;
  }

  private detectPacingIssues(beats: ScriptBeat[], targetWPM: number): any[] {
    const issues: any[] = [];
    let cumulativeTime = 0;

    for (const beat of beats) {
      const duration = this.estimateDuration(beat.content, targetWPM);
      const actualWPM = (beat.word_count / duration) * 60;

      if (actualWPM > targetWPM * 1.3) {
        issues.push({
          timestamp: cumulativeTime,
          issue: 'too_fast',
          recommendation: `Slow down pace in "${beat.title}" section (${Math.round(actualWPM)} WPM)`
        });
      } else if (actualWPM < targetWPM * 0.7) {
        issues.push({
          timestamp: cumulativeTime,
          issue: 'too_slow',
          recommendation: `Increase pace in "${beat.title}" section (${Math.round(actualWPM)} WPM)`
        });
      }

      cumulativeTime += duration;
    }

    return issues;
  }

  private getDefaultOptions(options?: Partial<VideoScriptFormattingOptions>): VideoScriptFormattingOptions {
    return {
      speaking_rate: options?.speaking_rate || this.DEFAULT_SPEAKING_RATE,
      include_timestamps: options?.include_timestamps ?? true,
      include_visual_notes: options?.include_visual_notes ?? true,
      include_broll_suggestions: options?.include_broll_suggestions ?? true,
      optimize_for_shorts: options?.optimize_for_shorts ?? false,
      target_audience: options?.target_audience || 'general',
      platform: options?.platform || 'youtube'
    };
  }
}
