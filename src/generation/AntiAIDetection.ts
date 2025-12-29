/**
 * NexusProseCreator - Anti-AI-Detection Engine
 *
 * 15+ advanced humanization techniques to produce undetectable AI content
 * Target: <5% AI detection probability
 */

import { HumanizationMetrics, AIDetectionAssessment, StyleProfile } from './types';

export class AntiAIDetection {
  // AI-typical words to avoid/replace
  private readonly aiTypicalWords = [
    'delve',
    'utilize',
    'leverage',
    'navigate',
    'landscape',
    'tapestry',
    'meticulous',
    'intricate',
    'robust',
    'paramount',
    'testament',
    'nuanced',
    'multifaceted',
    'realm',
    'embark',
    'unveil',
    'unravel',
    'epitome',
    'quintessential',
    'moreover',
    'furthermore',
    'additionally',
    'thus',
    'hence',
    'therefore',
  ];

  // Natural alternatives (randomized)
  private readonly naturalAlternatives: Record<string, string[]> = {
    delve: ['explore', 'dig into', 'investigate', 'look into', 'examine'],
    utilize: ['use', 'apply', 'employ'],
    leverage: ['use', 'take advantage of', 'make use of'],
    navigate: ['go through', 'work through', 'handle', 'deal with'],
    landscape: ['field', 'world', 'area', 'space', 'domain'],
    tapestry: ['mix', 'blend', 'collection', 'array', 'range'],
    robust: ['strong', 'solid', 'sturdy', 'reliable'],
    paramount: ['crucial', 'vital', 'essential', 'critical', 'key'],
    moreover: ['also', 'besides', 'and', 'plus'],
    furthermore: ['also', 'in addition', 'what\'s more'],
    thus: ['so', 'therefore', 'as a result'],
  };

  /**
   * Apply all humanization techniques to content
   */
  async humanize(content: string, styleProfile?: StyleProfile): Promise<string> {
    let humanized = content;

    // Apply all 15+ techniques in sequence
    humanized = await this.diversifyVocabulary(humanized);
    humanized = await this.varySentenceStructure(humanized);
    humanized = await this.naturalizeRhythm(humanized);
    humanized = await this.injectImperfections(humanized);
    humanized = await this.increasePerplexity(humanized);
    humanized = await this.enhanceBurstiness(humanized);
    humanized = await this.varyTransitions(humanized);
    humanized = await this.freshenMetaphors(humanized);
    humanized = await this.naturalizeDialogue(humanized);
    humanized = await this.authenticateEmotions(humanized);
    humanized = await this.diversifyDialogueTags(humanized);
    humanized = await this.optimizeShowVsTell(humanized);
    humanized = await this.addSensoryVariation(humanized);
    humanized = await this.varyParagraphStructure(humanized);
    humanized = await this.naturalizeFlow(humanized);

    if (styleProfile) {
      humanized = await this.matchStyleProfile(humanized, styleProfile);
    }

    return humanized;
  }

  /**
   * Technique 1: Diversify Vocabulary
   * Replace AI-typical words with natural alternatives
   */
  private async diversifyVocabulary(text: string): Promise<string> {
    let result = text;

    for (const aiWord of this.aiTypicalWords) {
      const regex = new RegExp(`\\b${aiWord}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        const alternatives = this.naturalAlternatives[aiWord.toLowerCase()];
        if (alternatives && alternatives.length > 0) {
          const replacement = this.randomChoice(alternatives);
          return this.matchCase(match, replacement);
        }
        return match;
      });
    }

    return result;
  }

  /**
   * Technique 2: Vary Sentence Structure
   * Mix simple, compound, complex, and compound-complex sentences
   */
  private async varySentenceStructure(text: string): Promise<string> {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length < 3) return text;

    // Detect patterns of uniform sentence structure
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const variance = this.calculateVariance(lengths);

    // If variance is too low (uniform sentences), add variety
    if (variance < 10) {
      // Combine some short sentences, split some long ones
      const varied: string[] = [];
      let i = 0;

      while (i < sentences.length) {
        const sentenceLength = lengths[i];

        // Combine very short sentences (< 8 words) occasionally
        if (sentenceLength < 8 && i + 1 < sentences.length && Math.random() > 0.6) {
          const combined = `${sentences[i].trim()} ${sentences[i + 1].trim()}`;
          varied.push(combined);
          i += 2;
        }
        // Split very long sentences (> 30 words) occasionally
        else if (sentenceLength > 30 && Math.random() > 0.7) {
          const split = this.splitLongSentence(sentences[i]);
          varied.push(...split);
          i++;
        } else {
          varied.push(sentences[i]);
          i++;
        }
      }

      return varied.join(' ');
    }

    return text;
  }

  /**
   * Technique 3: Naturalize Rhythm
   * Break up overly uniform cadence and pacing
   */
  private async naturalizeRhythm(text: string): Promise<string> {
    const paragraphs = text.split(/\n\n+/);

    const naturalizedParagraphs = paragraphs.map((para) => {
      const sentences = this.splitIntoSentences(para);

      // Vary sentence starters
      const varied = sentences.map((sentence, index) => {
        // Avoid starting every sentence with "The", "He", "She", etc.
        if (index > 0 && Math.random() > 0.8) {
          return this.varyStarter(sentence);
        }
        return sentence;
      });

      return varied.join(' ');
    });

    return naturalizedParagraphs.join('\n\n');
  }

  /**
   * Technique 4: Inject Imperfections
   * Add subtle, natural quirks (NOT grammatical errors)
   */
  private async injectImperfections(text: string): Promise<string> {
    let result = text;

    // Occasionally add em dashes for mid-thought breaks
    const sentences = this.splitIntoSentences(result);
    const modified = sentences.map((sentence) => {
      if (Math.random() > 0.92 && sentence.length > 50) {
        // Find a natural break point (after a clause)
        const words = sentence.split(/\s+/);
        if (words.length > 8) {
          const breakPoint = Math.floor(words.length / 2) + Math.floor(Math.random() * 3);
          words[breakPoint] = `—${words[breakPoint]}`;
        }
        return words.join(' ');
      }
      return sentence;
    });

    result = modified.join(' ');

    // Occasionally add sentence fragments (for dramatic effect)
    if (Math.random() > 0.85) {
      result = this.addOccasionalFragment(result);
    }

    // Occasionally add ellipses for trailing thoughts
    if (Math.random() > 0.9) {
      result = this.addTrailingThought(result);
    }

    return result;
  }

  /**
   * Technique 5: Increase Perplexity
   * Use less predictable word choices
   */
  private async increasePerplexity(text: string): Promise<string> {
    // Replace some common words with less common (but still natural) synonyms
    const commonToUncommon: Record<string, string[]> = {
      said: ['remarked', 'noted', 'observed', 'murmured', 'muttered'],
      looked: ['glanced', 'peered', 'gazed', 'stared', 'observed'],
      walked: ['strode', 'ambled', 'sauntered', 'trudged', 'marched'],
      thought: ['pondered', 'considered', 'reflected', 'contemplated', 'mused'],
      felt: ['sensed', 'perceived', 'experienced', 'recognized'],
    };

    let result = text;

    for (const [common, uncommon] of Object.entries(commonToUncommon)) {
      // Only replace some occurrences (20-30%)
      const regex = new RegExp(`\\b${common}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        let replacementCount = 0;
        const maxReplacements = Math.ceil(matches.length * 0.25);

        result = result.replace(regex, (match) => {
          if (replacementCount < maxReplacements && Math.random() > 0.7) {
            replacementCount++;
            const replacement = this.randomChoice(uncommon);
            return this.matchCase(match, replacement);
          }
          return match;
        });
      }
    }

    return result;
  }

  /**
   * Technique 6: Enhance Burstiness
   * Create dramatic variation in sentence length
   */
  private async enhanceBurstiness(text: string): Promise<string> {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length < 4) return text;

    // Check current burstiness
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const currentBurstiness = this.calculateBurstiness(lengths);

    if (currentBurstiness < 0.3) {
      // Low burstiness - add variety
      const enhanced: string[] = [];

      for (let i = 0; i < sentences.length; i++) {
        const length = lengths[i];

        // After a long sentence, occasionally add a very short one
        if (length > 20 && i + 1 < sentences.length && Math.random() > 0.6) {
          enhanced.push(sentences[i]);
          // Create a short, punchy sentence
          const nextShort = this.shortenSentence(sentences[i + 1]);
          enhanced.push(nextShort);
          i++; // Skip next
        } else {
          enhanced.push(sentences[i]);
        }
      }

      return enhanced.join(' ');
    }

    return text;
  }

  /**
   * Technique 7: Vary Transitions
   * Replace robotic connectors with natural transitions
   */
  private async varyTransitions(text: string): Promise<string> {
    const roboticTransitions: Record<string, string[]> = {
      'However,': ['But', 'Yet', 'Still,', 'Even so,'],
      'Therefore,': ['So', 'That\'s why', 'Because of this,'],
      'In conclusion,': ['So', 'Ultimately,', 'In the end,'],
      'For example,': ['Like', 'Say', 'Take', 'Consider'],
      'In addition,': ['Also', 'Plus', 'And', 'What\'s more,'],
      'Nevertheless,': ['Still', 'Even so', 'Yet'],
    };

    let result = text;

    for (const [robotic, natural] of Object.entries(roboticTransitions)) {
      const regex = new RegExp(robotic, 'gi');
      result = result.replace(regex, () => {
        return this.randomChoice(natural);
      });
    }

    return result;
  }

  /**
   * Technique 8: Freshen Metaphors
   * Replace cliché and AI-typical metaphors
   */
  private async freshenMetaphors(text: string): Promise<string> {
    const clicheMetaphors = [
      { pattern: /a beacon of hope/gi, fresh: ['a glimmer of possibility', 'a thread of hope'] },
      { pattern: /the tip of the iceberg/gi, fresh: ['barely scratching the surface', 'just the beginning'] },
      { pattern: /a double-edged sword/gi, fresh: ['a mixed blessing', 'both gift and curse'] },
    ];

    let result = text;

    for (const { pattern, fresh } of clicheMetaphors) {
      result = result.replace(pattern, () => this.randomChoice(fresh));
    }

    return result;
  }

  /**
   * Technique 9: Naturalize Dialogue
   * Make dialogue sound like real human speech
   */
  private async naturalizeDialogue(text: string): Promise<string> {
    // Find dialogue (text within quotes)
    const dialogueRegex = /[""]([^"""]+)[""]|"([^"]+)"/g;

    return text.replace(dialogueRegex, (match, content1, content2) => {
      const content = content1 || content2;
      let natural = content;

      // Add contractions in casual dialogue
      natural = natural.replace(/\bI am\b/g, "I'm");
      natural = natural.replace(/\byou are\b/g, "you're");
      natural = natural.replace(/\bhe is\b/g, "he's");
      natural = natural.replace(/\bshe is\b/g, "she's");
      natural = natural.replace(/\bit is\b/g, "it's");
      natural = natural.replace(/\bwe are\b/g, "we're");
      natural = natural.replace(/\bthey are\b/g, "they're");
      natural = natural.replace(/\bcannot\b/g, "can't");
      natural = natural.replace(/\bwill not\b/g, "won't");
      natural = natural.replace(/\bdo not\b/g, "don't");

      // Occasionally add filler words/interjections
      if (Math.random() > 0.85) {
        const fillers = ['well, ', 'you know, ', 'I mean, ', 'so, ', 'uh, '];
        natural = this.randomChoice(fillers) + natural;
      }

      // Occasionally trail off
      if (Math.random() > 0.92) {
        natural = natural.replace(/\.$/, '...');
      }

      return match.replace(content, natural);
    });
  }

  /**
   * Technique 10: Authenticate Emotions
   * Show raw, genuine emotional expression
   */
  private async authenticateEmotions(text: string): Promise<string> {
    // Replace "telling" emotions with "showing" actions
    const emotionPatterns = [
      {
        pattern: /\b(he|she|they) (was|were) (angry|furious|mad)\b/gi,
        replacement: (match: string, pronoun: string) => {
          const actions = [
            `${pronoun} clenched ${pronoun === 'they' ? 'their' : 'his'} jaw`,
            `${pronoun} felt heat rising in ${pronoun === 'they' ? 'their' : 'his'} chest`,
            `${pronoun} fought the urge to yell`,
          ];
          return this.randomChoice(actions);
        },
      },
      {
        pattern: /\b(he|she|they) (was|were) (sad|unhappy|upset)\b/gi,
        replacement: (match: string, pronoun: string) => {
          const actions = [
            `${pronoun} felt a tightness in ${pronoun === 'they' ? 'their' : 'his'} throat`,
            `${pronoun} blinked back tears`,
            `${pronoun} looked away`,
          ];
          return this.randomChoice(actions);
        },
      },
    ];

    let result = text;

    for (const { pattern, replacement } of emotionPatterns) {
      result = result.replace(pattern, (match, pronoun) => {
        if (Math.random() > 0.5) {
          return replacement(match, pronoun);
        }
        return match;
      });
    }

    return result;
  }

  /**
   * Technique 11: Diversify Dialogue Tags
   * Vary beyond "said"
   */
  private async diversifyDialogueTags(text: string): Promise<string> {
    const saidAlternatives = [
      'asked',
      'replied',
      'answered',
      'whispered',
      'murmured',
      'muttered',
      'called',
      'shouted',
      'yelled',
      'snapped',
      'added',
      'continued',
      'explained',
      'noted',
      'remarked',
    ];

    // Replace some (not all) instances of "said"
    let result = text;
    let replacementCount = 0;
    const maxReplacements = Math.ceil((text.match(/\bsaid\b/gi) || []).length * 0.4);

    result = result.replace(/\bsaid\b/gi, (match) => {
      if (replacementCount < maxReplacements && Math.random() > 0.5) {
        replacementCount++;
        return this.randomChoice(saidAlternatives);
      }
      return match;
    });

    return result;
  }

  /**
   * Technique 12: Optimize Show vs Tell
   * Convert exposition to action/dialogue
   */
  private async optimizeShowVsTell(text: string): Promise<string> {
    // Detect and convert "telling" patterns to "showing"
    const tellingPatterns = [
      {
        pattern: /\b(he|she|they) felt (nervous|anxious|worried)\b/gi,
        show: (pronoun: string) => {
          const actions = [
            `${pronoun} shifted ${pronoun === 'they' ? 'their' : 'his'} weight`,
            `${pronoun} couldn't sit still`,
            `sweat beaded on ${pronoun === 'they' ? 'their' : 'his'} forehead`,
          ];
          return this.randomChoice(actions);
        },
      },
    ];

    let result = text;

    for (const { pattern, show } of tellingPatterns) {
      result = result.replace(pattern, (match, pronoun) => {
        if (Math.random() > 0.6) {
          return show(pronoun);
        }
        return match;
      });
    }

    return result;
  }

  /**
   * Technique 13: Add Sensory Variation
   * Incorporate varied sensory details
   */
  private async addSensoryVariation(text: string): Promise<string> {
    // This is a placeholder - in production, would use NLP to identify
    // places where sensory details could be added naturally
    return text;
  }

  /**
   * Technique 14: Vary Paragraph Structure
   * Mix short and long paragraphs for rhythm
   */
  private async varyParagraphStructure(text: string): Promise<string> {
    const paragraphs = text.split(/\n\n+/);
    if (paragraphs.length < 3) return text;

    // Check for uniform paragraph length
    const lengths = paragraphs.map((p) => p.split(/\s+/).length);
    const variance = this.calculateVariance(lengths);

    if (variance < 20) {
      // Low variance - split or combine paragraphs
      const varied: string[] = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const length = lengths[i];

        // Split very long paragraphs
        if (length > 100 && Math.random() > 0.6) {
          const sentences = this.splitIntoSentences(paragraphs[i]);
          const mid = Math.floor(sentences.length / 2);
          varied.push(sentences.slice(0, mid).join(' '));
          varied.push(sentences.slice(mid).join(' '));
        }
        // Combine very short paragraphs
        else if (length < 20 && i + 1 < paragraphs.length && lengths[i + 1] < 20) {
          varied.push(`${paragraphs[i]} ${paragraphs[i + 1]}`);
          i++; // Skip next
        } else {
          varied.push(paragraphs[i]);
        }
      }

      return varied.join('\n\n');
    }

    return text;
  }

  /**
   * Technique 15: Naturalize Flow
   * Ensure natural reading flow without AI "polish"
   */
  private async naturalizeFlow(text: string): Promise<string> {
    // Remove excessive commas (AI over-punctuates)
    let result = text.replace(/,(\s+,)+/g, ','); // Multiple commas

    // Vary sentence conjunctions
    result = result.replace(/\band\b.*?\band\b.*?\band\b/gi, (match) => {
      // Replace one "and" with comma or period
      return match.replace(/\band\b/, ',');
    });

    return result;
  }

  /**
   * Match style profile for consistency
   */
  private async matchStyleProfile(text: string, profile: StyleProfile): Promise<string> {
    // Would implement style matching based on profile
    // For now, return text as-is
    return text;
  }

  // ====================================================================
  // ASSESSMENT METHODS
  // ====================================================================

  /**
   * Assess AI detection probability
   */
  async assessScore(content: string): Promise<number> {
    const metrics = await this.calculateMetrics(content);

    // Weight each factor
    const weights = {
      vocabulary_diversity: 0.25,
      sentence_structure_entropy: 0.25,
      perplexity: 0.25,
      burstiness: 0.25,
    };

    // Calculate weighted score (0-100, lower is better)
    const score =
      (1 - metrics.vocabulary_diversity) * weights.vocabulary_diversity * 100 +
      (1 - metrics.sentence_structure_entropy) * weights.sentence_structure_entropy * 100 +
      (1 - metrics.perplexity) * weights.perplexity * 100 +
      (1 - metrics.burstiness) * weights.burstiness * 100;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate humanization metrics
   */
  async calculateMetrics(content: string): Promise<HumanizationMetrics> {
    const ttr = this.calculateTTR(content);
    const entropy = this.calculateStructureEntropy(content);
    const perplexity = this.calculatePerplexityScore(content);
    const burstiness = this.calculateBurstinessScore(content);

    const overallScore = (ttr + entropy + perplexity + burstiness) / 4;

    return {
      vocabulary_diversity: ttr,
      sentence_structure_entropy: entropy,
      perplexity,
      burstiness,
      overall_score: overallScore,
    };
  }

  // ====================================================================
  // HELPER METHODS
  // ====================================================================

  private calculateTTR(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    return words.length > 0 ? uniqueWords.size / words.length : 0;
  }

  private calculateStructureEntropy(text: string): number {
    const sentences = this.splitIntoSentences(text);
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const variance = this.calculateVariance(lengths);
    const mean = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
    return Math.min(1, variance / (mean * mean));
  }

  private calculatePerplexityScore(text: string): number {
    // Simplified perplexity based on word choice variety
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequencies: Record<string, number> = {};
    words.forEach((word) => {
      frequencies[word] = (frequencies[word] || 0) + 1;
    });

    const avgFreq = words.length / Object.keys(frequencies).length;
    return Math.min(1, 1 / Math.log(avgFreq + 1));
  }

  private calculateBurstinessScore(content: string): number {
    const sentences = this.splitIntoSentences(content);
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    return this.calculateBurstiness(lengths);
  }

  private calculateBurstiness(lengths: number[]): number {
    if (lengths.length < 2) return 0;
    const variance = this.calculateVariance(lengths);
    const mean = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation
    return Math.min(1, cv);
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sd) => sum + sd, 0) / numbers.length;
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private splitLongSentence(sentence: string): string[] {
    // Split on semicolons or commas (simplified)
    const parts = sentence.split(/[;,]/).filter((p) => p.trim().length > 5);
    if (parts.length > 1) {
      return parts.map((p, i) => {
        const trimmed = p.trim();
        if (i === 0) return trimmed + '.';
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + '.';
      });
    }
    return [sentence];
  }

  private shortenSentence(sentence: string): string {
    // Take first clause only
    const words = sentence.split(/\s+/);
    if (words.length > 10) {
      return words.slice(0, 5).join(' ') + '.';
    }
    return sentence;
  }

  private varyStarter(sentence: string): string {
    const words = sentence.split(/\s+/);
    if (words.length < 5) return sentence;

    // Occasionally add introductory phrase
    const intros = ['Still,', 'Yet', 'But', 'And', 'Then', 'Now'];
    if (Math.random() > 0.7) {
      return `${this.randomChoice(intros)} ${sentence}`;
    }

    return sentence;
  }

  private addOccasionalFragment(text: string): string {
    // Add a short, punchy fragment after a sentence
    const sentences = this.splitIntoSentences(text);
    if (sentences.length < 2) return text;

    const fragments = ['Not yet.', 'Never.', 'Always.', 'Maybe.', 'Somehow.'];
    const insertAt = Math.floor(Math.random() * sentences.length);
    sentences.splice(insertAt, 0, this.randomChoice(fragments));

    return sentences.join(' ');
  }

  private addTrailingThought(text: string): string {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length === 0) return text;

    const lastSentence = sentences[sentences.length - 1];
    if (lastSentence.length > 30 && !lastSentence.endsWith('...')) {
      sentences[sentences.length - 1] = lastSentence.replace(/\.$/, '...');
    }

    return sentences.join(' ');
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private matchCase(original: string, replacement: string): string {
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement.toLowerCase();
  }
}
