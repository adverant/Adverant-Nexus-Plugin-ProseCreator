/**
 * NexusProseCreator - Style Analyzer
 *
 * Analyzes and matches writing style for consistency
 */

import {
  StyleProfile,
  TextStatistics,
  LiteraryDevice,
  DialogueAnalysis,
} from './types';

export class StyleAnalyzer {
  /**
   * Analyze existing writing sample to create style profile
   */
  async analyzeExistingSample(sample: string): Promise<StyleProfile> {
    const stats = await this.calculateTextStatistics(sample);
    const dialogueAnalysis = await this.analyzeDialogue(sample);
    const literaryDevices = await this.detectLiteraryDevices(sample);
    const tone = await this.analyzeTone(sample);
    const pov = await this.detectPOV(sample);
    const tense = await this.detectTense(sample);

    return {
      avgSentenceLength: stats.avg_sentence_length,
      avgWordLength: stats.avg_word_length,
      sentenceLengthVariance: stats.sentence_length_variance,
      vocabularyLevel: this.assessVocabularyLevel(stats, sample),
      literaryDevices: literaryDevices.map((d) => d.type),
      tone,
      pov,
      tense,
      dialogueRatio: dialogueAnalysis.dialogue_ratio,
      descriptionDensity: this.calculateDescriptionDensity(sample),
      paragraphLengthPattern: this.detectParagraphPattern(sample),
      sentenceStartVariety: this.calculateSentenceStartVariety(sample),
      transitionStyle: this.detectTransitionStyle(sample),
    };
  }

  /**
   * Match generated content to target style profile
   */
  async matchStyle(content: string, targetStyle: StyleProfile): Promise<string> {
    let matched = content;

    // Adjust sentence length to match target
    const currentStats = await this.calculateTextStatistics(matched);
    if (Math.abs(currentStats.avg_sentence_length - targetStyle.avgSentenceLength) > 3) {
      matched = await this.adjustSentenceLength(matched, targetStyle.avgSentenceLength);
    }

    // Adjust vocabulary level
    const currentVocabLevel = this.assessVocabularyLevel(currentStats, matched);
    if (currentVocabLevel !== targetStyle.vocabularyLevel) {
      matched = await this.adjustVocabulary(matched, targetStyle.vocabularyLevel);
    }

    // Adjust dialogue ratio
    const currentDialogueAnalysis = await this.analyzeDialogue(matched);
    if (Math.abs(currentDialogueAnalysis.dialogue_ratio - targetStyle.dialogueRatio) > 0.1) {
      matched = await this.adjustDialogueRatio(matched, targetStyle.dialogueRatio);
    }

    // Adjust paragraph structure
    const currentPattern = this.detectParagraphPattern(matched);
    if (currentPattern !== targetStyle.paragraphLengthPattern) {
      matched = await this.adjustParagraphStructure(matched, targetStyle.paragraphLengthPattern);
    }

    return matched;
  }

  // ====================================================================
  // TEXT STATISTICS
  // ====================================================================

  private async calculateTextStatistics(text: string): Promise<TextStatistics> {
    const words = this.extractWords(text);
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const sentences = this.splitIntoSentences(text);
    const paragraphs = this.splitIntoParagraphs(text);

    const sentenceLengths = sentences.map((s) => this.extractWords(s).length);
    const avgSentenceLength =
      sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length || 0;

    const wordLengths = words.map((w) => w.length);
    const avgWordLength = wordLengths.reduce((sum, len) => sum + len, 0) / wordLengths.length || 0;

    const variance = this.calculateVariance(sentenceLengths);

    return {
      total_words: words.length,
      unique_words: uniqueWords.size,
      total_sentences: sentences.length,
      total_paragraphs: paragraphs.length,
      avg_sentence_length: avgSentenceLength,
      avg_word_length: avgWordLength,
      sentence_length_variance: variance,
      type_token_ratio: words.length > 0 ? uniqueWords.size / words.length : 0,
      lexical_density: this.calculateLexicalDensity(text),
      readability_score: this.calculateReadabilityScore(avgSentenceLength, avgWordLength),
    };
  }

  /**
   * Calculate lexical density (content words vs function words)
   */
  private calculateLexicalDensity(text: string): number {
    const words = this.extractWords(text);
    const functionWords = new Set([
      'the',
      'a',
      'an',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'must',
      'can',
      'of',
      'to',
      'in',
      'for',
      'on',
      'with',
      'at',
      'by',
      'from',
      'as',
      'but',
      'or',
      'and',
      'if',
      'than',
      'because',
      'while',
      'where',
      'after',
      'so',
      'though',
      'since',
      'until',
      'whether',
      'before',
      'although',
      'nor',
      'like',
      'once',
      'unless',
      'now',
      'except',
    ]);

    const contentWords = words.filter((w) => !functionWords.has(w.toLowerCase()));
    return words.length > 0 ? contentWords.length / words.length : 0;
  }

  /**
   * Calculate readability score (simplified Flesch-Kincaid)
   */
  private calculateReadabilityScore(avgSentenceLength: number, avgWordLength: number): number {
    // Simplified Flesch Reading Ease
    // Score: 206.835 - 1.015(avgSentenceLength) - 84.6(avgSyllablesPerWord)
    // Using word length as proxy for syllables (rough approximation)
    const avgSyllables = avgWordLength / 2;
    const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllables;
    return Math.max(0, Math.min(100, score));
  }

  // ====================================================================
  // LITERARY DEVICE DETECTION
  // ====================================================================

  private async detectLiteraryDevices(text: string): Promise<LiteraryDevice[]> {
    const devices: LiteraryDevice[] = [];

    // Detect metaphors (simplified - looks for "like" and "as")
    const similes = text.match(/\b(like|as)\s+\w+/gi) || [];
    if (similes.length > 0) {
      devices.push({
        type: 'simile',
        count: similes.length,
        examples: similes.slice(0, 3),
      });
    }

    // Detect alliteration (simplified)
    const alliterations = this.detectAlliteration(text);
    if (alliterations.length > 0) {
      devices.push({
        type: 'alliteration',
        count: alliterations.length,
        examples: alliterations.slice(0, 3),
      });
    }

    // Detect repetition
    const repetitions = this.detectRepetition(text);
    if (repetitions.length > 0) {
      devices.push({
        type: 'repetition',
        count: repetitions.length,
        examples: repetitions.slice(0, 3),
      });
    }

    // Detect rhetorical questions
    const rhetoricalQuestions = text.match(/\?/g) || [];
    if (rhetoricalQuestions.length > 0) {
      devices.push({
        type: 'rhetorical_question',
        count: rhetoricalQuestions.length,
        examples: this.extractQuestionsExamples(text),
      });
    }

    return devices;
  }

  private detectAlliteration(text: string): string[] {
    const sentences = this.splitIntoSentences(text);
    const alliterations: string[] = [];

    for (const sentence of sentences) {
      const words = this.extractWords(sentence);
      for (let i = 0; i < words.length - 2; i++) {
        const firstLetter = words[i][0].toLowerCase();
        if (
          words[i + 1][0].toLowerCase() === firstLetter &&
          words[i + 2][0].toLowerCase() === firstLetter
        ) {
          alliterations.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
      }
    }

    return alliterations;
  }

  private detectRepetition(text: string): string[] {
    const sentences = this.splitIntoSentences(text);
    const repetitions: string[] = [];

    // Look for repeated phrases (3+ words)
    for (let i = 0; i < sentences.length - 1; i++) {
      const words1 = this.extractWords(sentences[i]);
      const words2 = this.extractWords(sentences[i + 1]);

      for (let j = 0; j < words1.length - 2; j++) {
        const phrase = `${words1[j]} ${words1[j + 1]} ${words1[j + 2]}`.toLowerCase();
        const sentence2Lower = sentences[i + 1].toLowerCase();
        if (sentence2Lower.includes(phrase)) {
          repetitions.push(phrase);
        }
      }
    }

    return repetitions;
  }

  private extractQuestionsExamples(text: string): string[] {
    const questions = text.match(/[^.!?]*\?/g) || [];
    return questions.slice(0, 3).map((q) => q.trim());
  }

  // ====================================================================
  // TONE ANALYSIS
  // ====================================================================

  private async analyzeTone(text: string): Promise<string> {
    const words = this.extractWords(text);
    const lowerWords = words.map((w) => w.toLowerCase());

    // Sentiment word lists (simplified)
    const darkWords = ['dark', 'death', 'shadow', 'fear', 'pain', 'blood', 'cold', 'empty'];
    const lightWords = ['bright', 'joy', 'happy', 'warm', 'love', 'hope', 'light', 'smile'];
    const formalWords = ['therefore', 'thus', 'hence', 'moreover', 'furthermore'];
    const casualWords = ["I'm", 'gonna', 'wanna', 'yeah', 'nah'];

    const darkCount = lowerWords.filter((w) => darkWords.includes(w)).length;
    const lightCount = lowerWords.filter((w) => lightWords.includes(w)).length;
    const formalCount = lowerWords.filter((w) => formalWords.includes(w)).length;
    const casualCount = lowerWords.filter((w) => casualWords.includes(w)).length;

    // Determine tone based on word counts
    if (darkCount > lightCount * 1.5) return 'dark';
    if (lightCount > darkCount * 1.5) return 'light';
    if (formalCount > casualCount * 2) return 'formal';
    if (casualCount > formalCount * 2) return 'casual';

    return 'neutral';
  }

  // ====================================================================
  // POV DETECTION
  // ====================================================================

  private async detectPOV(text: string): Promise<StyleProfile['pov']> {
    const firstPersonPronouns = /\b(I|me|my|mine|we|us|our|ours)\b/gi;
    const secondPersonPronouns = /\b(you|your|yours)\b/gi;
    const thirdPersonPronouns = /\b(he|him|his|she|her|hers|they|them|their|theirs)\b/gi;

    const firstCount = (text.match(firstPersonPronouns) || []).length;
    const secondCount = (text.match(secondPersonPronouns) || []).length;
    const thirdCount = (text.match(thirdPersonPronouns) || []).length;

    if (firstCount > secondCount && firstCount > thirdCount) {
      return 'first_person';
    }
    if (secondCount > firstCount && secondCount > thirdCount) {
      return 'second_person';
    }

    // For third person, check if omniscient (multiple character perspectives)
    // Simplified: if many different character names mentioned
    return 'third_person_limited';
  }

  // ====================================================================
  // TENSE DETECTION
  // ====================================================================

  private async detectTense(text: string): Promise<StyleProfile['tense']> {
    const pastTenseVerbs = /\b(was|were|had|did|went|came|saw|said|told|asked)\b/gi;
    const presentTenseVerbs = /\b(is|are|has|does|goes|comes|sees|says|tells|asks)\b/gi;
    const futureTenseVerbs = /\b(will|shall|going to)\b/gi;

    const pastCount = (text.match(pastTenseVerbs) || []).length;
    const presentCount = (text.match(presentTenseVerbs) || []).length;
    const futureCount = (text.match(futureTenseVerbs) || []).length;

    if (pastCount > presentCount && pastCount > futureCount) {
      return 'past';
    }
    if (presentCount > pastCount && presentCount > futureCount) {
      return 'present';
    }
    if (futureCount > pastCount && futureCount > presentCount) {
      return 'future';
    }

    return 'past'; // Default
  }

  // ====================================================================
  // DIALOGUE ANALYSIS
  // ====================================================================

  private async analyzeDialogue(text: string): Promise<DialogueAnalysis> {
    // Extract dialogue (text within quotes)
    const dialogueRegex = /[""]([^"""]+)[""]|"([^"]+)"/g;
    const dialogueMatches = text.match(dialogueRegex) || [];

    const dialogueWordCount = dialogueMatches
      .map((d) => this.extractWords(d).length)
      .reduce((sum, count) => sum + count, 0);

    const totalWordCount = this.extractWords(text).length;
    const dialogueRatio = totalWordCount > 0 ? dialogueWordCount / totalWordCount : 0;

    // Calculate average exchange length
    const avgExchangeLength =
      dialogueMatches.length > 0
        ? dialogueMatches.map((d) => this.extractWords(d).length).reduce((sum, l) => sum + l, 0) /
          dialogueMatches.length
        : 0;

    // Detect dialogue tag variety
    const dialogueTags = text.match(/\b(said|asked|replied|answered|whispered|shouted)\b/gi) || [];
    const uniqueTags = new Set(dialogueTags.map((t) => t.toLowerCase()));
    const dialogueTagVariety = dialogueTags.length > 0 ? uniqueTags.size / dialogueTags.length : 0;

    // Detect subtext (simplified: look for dialogue with implied meaning)
    const subtextPresent = this.hasSubtext(text);

    return {
      dialogue_ratio: dialogueRatio,
      avg_exchange_length: avgExchangeLength,
      dialogue_tag_variety: dialogueTagVariety,
      subtext_present: subtextPresent,
    };
  }

  private hasSubtext(text: string): boolean {
    // Simplified: Check for dialogue with contrasting action/description
    // E.g., "I'm fine," she said, tears streaming down her face.
    const patterns = [
      /[""][^"""]+[""],?\s+\w+\s+(said|replied|answered),?\s+\w+/gi,
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) return true;
    }

    return false;
  }

  // ====================================================================
  // VOCABULARY LEVEL ASSESSMENT
  // ====================================================================

  private assessVocabularyLevel(
    stats: TextStatistics,
    sample: string
  ): StyleProfile['vocabularyLevel'] {
    // Based on average word length and lexical density
    const avgWordLength = stats.avg_word_length;
    const lexicalDensity = stats.lexical_density;

    // Count syllables (rough approximation based on word length)
    const words = this.extractWords(sample);
    const avgSyllables = words.reduce((sum, word) => sum + Math.ceil(word.length / 3), 0) / words.length;

    if (avgWordLength < 4.5 && lexicalDensity < 0.5) {
      return 'elementary';
    } else if (avgWordLength < 5.5 && lexicalDensity < 0.6) {
      return 'intermediate';
    } else if (avgWordLength < 6.5 && lexicalDensity < 0.7) {
      return 'advanced';
    } else {
      return 'literary';
    }
  }

  // ====================================================================
  // DESCRIPTION DENSITY
  // ====================================================================

  private calculateDescriptionDensity(text: string): number {
    // Ratio of descriptive words (adjectives, adverbs) to total words
    const descriptivePatterns = [
      /\b\w+ly\b/g, // Adverbs ending in -ly
      // Would need more sophisticated NLP for accurate adjective detection
    ];

    let descriptiveCount = 0;
    for (const pattern of descriptivePatterns) {
      descriptiveCount += (text.match(pattern) || []).length;
    }

    const totalWords = this.extractWords(text).length;
    return totalWords > 0 ? descriptiveCount / totalWords : 0;
  }

  // ====================================================================
  // PARAGRAPH PATTERNS
  // ====================================================================

  private detectParagraphPattern(text: string): StyleProfile['paragraphLengthPattern'] {
    const paragraphs = this.splitIntoParagraphs(text);
    const lengths = paragraphs.map((p) => this.extractWords(p).length);

    if (lengths.length < 2) return 'medium';

    const avgLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
    const variance = this.calculateVariance(lengths);

    if (avgLength < 50 && variance < 100) return 'short';
    if (avgLength > 150 && variance < 500) return 'long';
    if (variance > 1000) return 'varied';

    return 'medium';
  }

  // ====================================================================
  // SENTENCE START VARIETY
  // ====================================================================

  private calculateSentenceStartVariety(text: string): number {
    const sentences = this.splitIntoSentences(text);
    const firstWords = sentences.map((s) => {
      const words = this.extractWords(s);
      return words.length > 0 ? words[0].toLowerCase() : '';
    });

    const uniqueStarts = new Set(firstWords);
    const variety = firstWords.length > 0 ? uniqueStarts.size / firstWords.length : 0;

    return Math.round(variety * 10); // Scale to 0-10
  }

  // ====================================================================
  // TRANSITION STYLE
  // ====================================================================

  private detectTransitionStyle(text: string): StyleProfile['transitionStyle'] {
    const formalTransitions = [
      'however',
      'therefore',
      'furthermore',
      'moreover',
      'thus',
      'hence',
      'consequently',
    ];
    const abruptTransitions = ['but', 'yet', 'so', 'still', 'now', 'then'];

    const formalCount = formalTransitions.reduce((count, trans) => {
      return count + (text.match(new RegExp(`\\b${trans}\\b`, 'gi')) || []).length;
    }, 0);

    const abruptCount = abruptTransitions.reduce((count, trans) => {
      return count + (text.match(new RegExp(`\\b${trans}\\b`, 'gi')) || []).length;
    }, 0);

    if (formalCount > abruptCount * 2) return 'smooth';
    if (abruptCount > formalCount * 2) return 'abrupt';

    return 'varied';
  }

  // ====================================================================
  // STYLE ADJUSTMENT METHODS
  // ====================================================================

  private async adjustSentenceLength(text: string, targetAvg: number): Promise<string> {
    const sentences = this.splitIntoSentences(text);
    const currentAvg = this.calculateAverageSentenceLength(sentences);

    if (currentAvg < targetAvg) {
      // Combine short sentences
      return this.combineSentences(sentences, targetAvg);
    } else {
      // Split long sentences
      return this.splitSentences(sentences, targetAvg);
    }
  }

  private combineSentences(sentences: string[], targetAvg: number): string {
    const result: string[] = [];
    let i = 0;

    while (i < sentences.length) {
      const currentLength = this.extractWords(sentences[i]).length;

      if (currentLength < targetAvg * 0.7 && i + 1 < sentences.length) {
        // Combine with next sentence
        result.push(`${sentences[i]} ${sentences[i + 1]}`);
        i += 2;
      } else {
        result.push(sentences[i]);
        i++;
      }
    }

    return result.join(' ');
  }

  private splitSentences(sentences: string[], targetAvg: number): string {
    const result: string[] = [];

    for (const sentence of sentences) {
      const length = this.extractWords(sentence).length;

      if (length > targetAvg * 1.5) {
        // Split long sentence
        const split = this.splitLongSentence(sentence);
        result.push(...split);
      } else {
        result.push(sentence);
      }
    }

    return result.join(' ');
  }

  private splitLongSentence(sentence: string): string[] {
    // Split on conjunctions or semicolons
    const parts = sentence.split(/\s+(and|but|or|;)\s+/).filter((p) => p.trim().length > 5);
    if (parts.length > 1) {
      return parts.map((part, index) => {
        if (index === 0) return part.trim() + '.';
        return part.trim().charAt(0).toUpperCase() + part.trim().slice(1) + '.';
      });
    }
    return [sentence];
  }

  private async adjustVocabulary(
    text: string,
    targetLevel: StyleProfile['vocabularyLevel']
  ): Promise<string> {
    // Simplified: Would use more sophisticated word replacement
    return text;
  }

  private async adjustDialogueRatio(text: string, targetRatio: number): Promise<string> {
    // Simplified: Would add/remove dialogue to match ratio
    return text;
  }

  private async adjustParagraphStructure(
    text: string,
    targetPattern: StyleProfile['paragraphLengthPattern']
  ): Promise<string> {
    const paragraphs = this.splitIntoParagraphs(text);

    switch (targetPattern) {
      case 'short':
        return this.createShortParagraphs(paragraphs);
      case 'long':
        return this.createLongParagraphs(paragraphs);
      case 'varied':
        return this.createVariedParagraphs(paragraphs);
      default:
        return text;
    }
  }

  private createShortParagraphs(paragraphs: string[]): string {
    const result: string[] = [];

    for (const para of paragraphs) {
      const sentences = this.splitIntoSentences(para);
      if (sentences.length > 3) {
        // Split into smaller paragraphs
        for (let i = 0; i < sentences.length; i += 2) {
          result.push(sentences.slice(i, i + 2).join(' '));
        }
      } else {
        result.push(para);
      }
    }

    return result.join('\n\n');
  }

  private createLongParagraphs(paragraphs: string[]): string {
    const result: string[] = [];
    let buffer: string[] = [];

    for (const para of paragraphs) {
      buffer.push(para);

      if (buffer.length >= 2) {
        result.push(buffer.join(' '));
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      result.push(buffer.join(' '));
    }

    return result.join('\n\n');
  }

  private createVariedParagraphs(paragraphs: string[]): string {
    // Alternate between short and long paragraphs
    const result: string[] = [];
    let useLong = false;

    for (const para of paragraphs) {
      if (useLong) {
        result.push(para);
      } else {
        const sentences = this.splitIntoSentences(para);
        if (sentences.length > 2) {
          result.push(sentences[0]);
          result.push(sentences.slice(1).join(' '));
        } else {
          result.push(para);
        }
      }
      useLong = !useLong;
    }

    return result.join('\n\n');
  }

  // ====================================================================
  // HELPER METHODS
  // ====================================================================

  private extractWords(text: string): string[] {
    return (text.match(/\b\w+\b/g) || []).filter((w) => w.length > 0);
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private splitIntoParagraphs(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  private calculateAverageSentenceLength(sentences: string[]): number {
    if (sentences.length === 0) return 0;
    const totalWords = sentences.reduce(
      (sum, s) => sum + this.extractWords(s).length,
      0
    );
    return totalWords / sentences.length;
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sd) => sum + sd, 0) / numbers.length;
  }
}
