/**
 * Rhyme Scheme Analyzer
 * Analyzes rhyme patterns in poetry
 */

import { RhymeScheme, RhymeGroup, RhymeQuality, RhymeAnalysis } from './types';

export class RhymeSchemeAnalyzer {
  /**
   * Analyze rhyme scheme for lines of poetry
   */
  async analyzeRhymeScheme(lines: string[]): Promise<RhymeScheme> {
    const endWords = lines.map(line => this.getEndWord(line));
    const rhymeGroups = this.groupRhymes(endWords);
    const scheme = this.generateScheme(rhymeGroups, lines.length);
    const internalRhymes = await this.detectInternalRhymes(lines);

    let perfectRhymes = 0;
    let slantRhymes = 0;

    for (const group of rhymeGroups) {
      if (group.quality === 'perfect') {
        perfectRhymes += group.lines.length - 1;
      } else if (group.quality === 'slant') {
        slantRhymes += group.lines.length - 1;
      }
    }

    const qualityScore = this.calculateRhymeQuality(rhymeGroups);

    return {
      scheme,
      groups: rhymeGroups,
      perfectRhymes,
      slantRhymes,
      internalRhymes,
      qualityScore
    };
  }

  /**
   * Get the last significant word from a line
   */
  private getEndWord(line: string): string {
    const cleaned = line.trim().replace(/[.,!?;:"']/g, '');
    const words = cleaned.split(/\s+/);
    return words[words.length - 1]?.toLowerCase() || '';
  }

  /**
   * Group words that rhyme together
   */
  private groupRhymes(endWords: string[]): RhymeGroup[] {
    const groups: RhymeGroup[] = [];
    const used = new Set<number>();

    for (let i = 0; i < endWords.length; i++) {
      if (used.has(i)) continue;

      const word = endWords[i];
      if (!word) continue;

      const group: RhymeGroup = {
        letter: String.fromCharCode(65 + groups.length),
        lines: [i],
        words: [word],
        quality: 'perfect',
        phonemeMatch: this.extractRhymePhonemes(word)
      };

      // Find all words that rhyme with this one
      for (let j = i + 1; j < endWords.length; j++) {
        if (used.has(j)) continue;

        const otherWord = endWords[j];
        if (!otherWord) continue;

        const rhymeAnalysis = this.doRhyme(word, otherWord);
        if (rhymeAnalysis.rhymes) {
          group.lines.push(j);
          group.words.push(otherWord);
          used.add(j);

          // Update quality to lowest quality in group
          if (rhymeAnalysis.quality === 'slant' && group.quality === 'perfect') {
            group.quality = 'slant';
          }
        }
      }

      groups.push(group);
      used.add(i);
    }

    return groups;
  }

  /**
   * Generate rhyme scheme string (e.g., "ABAB CDCD")
   */
  private generateScheme(groups: RhymeGroup[], totalLines: number): string {
    const scheme: string[] = new Array(totalLines).fill('X');

    for (const group of groups) {
      for (const lineIndex of group.lines) {
        scheme[lineIndex] = group.letter;
      }
    }

    // Group by stanzas (every 4 lines typically)
    const stanzaSize = this.detectStanzaSize(totalLines);
    const chunks: string[] = [];

    for (let i = 0; i < scheme.length; i += stanzaSize) {
      chunks.push(scheme.slice(i, i + stanzaSize).join(''));
    }

    return chunks.join(' ');
  }

  /**
   * Detect likely stanza size
   */
  private detectStanzaSize(totalLines: number): number {
    if (totalLines % 4 === 0) return 4;
    if (totalLines % 3 === 0) return 3;
    if (totalLines % 5 === 0) return 5;
    if (totalLines % 6 === 0) return 6;
    return Math.min(4, totalLines);
  }

  /**
   * Check if two words rhyme
   */
  private doRhyme(word1: string, word2: string): RhymeAnalysis {
    // Exact match (not a rhyme)
    if (word1 === word2) {
      return {
        word1,
        word2,
        rhymes: false,
        quality: 'none',
        phonemeMatch: [],
        matchLength: 0,
        confidence: 1.0
      };
    }

    // Extract phonemes
    const phonemes1 = this.extractRhymePhonemes(word1);
    const phonemes2 = this.extractRhymePhonemes(word2);

    // Check perfect rhyme
    if (this.arraysEqual(phonemes1, phonemes2)) {
      return {
        word1,
        word2,
        rhymes: true,
        quality: 'perfect',
        phonemeMatch: phonemes1,
        matchLength: phonemes1.length,
        confidence: 0.95
      };
    }

    // Check slant rhyme (similar ending sounds)
    const commonSuffix = this.findCommonSuffix(word1, word2);
    if (commonSuffix.length >= 2) {
      return {
        word1,
        word2,
        rhymes: true,
        quality: 'slant',
        phonemeMatch: [commonSuffix],
        matchLength: commonSuffix.length,
        confidence: 0.7
      };
    }

    // Check consonance (matching consonants)
    if (this.hasConsonance(word1, word2)) {
      return {
        word1,
        word2,
        rhymes: true,
        quality: 'consonance',
        phonemeMatch: [],
        matchLength: 0,
        confidence: 0.5
      };
    }

    // Check assonance (matching vowels)
    if (this.hasAssonance(word1, word2)) {
      return {
        word1,
        word2,
        rhymes: true,
        quality: 'assonance',
        phonemeMatch: [],
        matchLength: 0,
        confidence: 0.5
      };
    }

    // Check eye rhyme (look similar but don't sound similar)
    if (this.hasEyeRhyme(word1, word2)) {
      return {
        word1,
        word2,
        rhymes: false,
        quality: 'eye',
        phonemeMatch: [],
        matchLength: 0,
        confidence: 0.3
      };
    }

    return {
      word1,
      word2,
      rhymes: false,
      quality: 'none',
      phonemeMatch: [],
      matchLength: 0,
      confidence: 1.0
    };
  }

  /**
   * Extract rhyme phonemes (from last stressed vowel onward)
   */
  private extractRhymePhonemes(word: string): string[] {
    // Simplified - would use phonetic transcription in production
    const lastVowelIndex = word.search(/[aeiouy][^aeiouy]*$/i);
    if (lastVowelIndex >= 0) {
      return [word.slice(lastVowelIndex).toLowerCase()];
    }
    return [word.slice(-2).toLowerCase()];
  }

  /**
   * Find common suffix between words
   */
  private findCommonSuffix(word1: string, word2: string): string {
    let i = 1;
    while (
      i <= Math.min(word1.length, word2.length) &&
      word1[word1.length - i] === word2[word2.length - i]
    ) {
      i++;
    }
    return word1.slice(word1.length - i + 1);
  }

  /**
   * Check for consonance (matching consonant sounds)
   */
  private hasConsonance(word1: string, word2: string): boolean {
    const consonants1 = word1.replace(/[aeiouy]/gi, '').toLowerCase();
    const consonants2 = word2.replace(/[aeiouy]/gi, '').toLowerCase();

    if (consonants1.length < 2 || consonants2.length < 2) return false;

    // Check if endings match
    const ending1 = consonants1.slice(-2);
    const ending2 = consonants2.slice(-2);

    return ending1 === ending2 || ending1[ending1.length - 1] === ending2[ending2.length - 1];
  }

  /**
   * Check for assonance (matching vowel sounds)
   */
  private hasAssonance(word1: string, word2: string): boolean {
    const vowels1 = word1.match(/[aeiouy]/gi)?.join('').toLowerCase() || '';
    const vowels2 = word2.match(/[aeiouy]/gi)?.join('').toLowerCase() || '';

    if (vowels1.length < 1 || vowels2.length < 1) return false;

    // Check if last vowels match
    return vowels1[vowels1.length - 1] === vowels2[vowels2.length - 1];
  }

  /**
   * Check for eye rhyme (visual similarity)
   */
  private hasEyeRhyme(word1: string, word2: string): boolean {
    if (word1.length < 3 || word2.length < 3) return false;

    const ending1 = word1.slice(-3);
    const ending2 = word2.slice(-3);

    return ending1 === ending2;
  }

  /**
   * Detect internal rhymes within lines
   */
  private async detectInternalRhymes(
    lines: string[]
  ): Promise<Array<{ line: number; words: string[]; position: string }>> {
    const internalRhymes: Array<{ line: number; words: string[]; position: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const words = lines[i]
        .toLowerCase()
        .replace(/[.,!?;:"']/g, '')
        .split(/\s+/);

      if (words.length < 3) continue;

      const endWord = words[words.length - 1];

      // Check for rhymes within the line
      for (let j = 0; j < words.length - 1; j++) {
        const word = words[j];
        const rhymeAnalysis = this.doRhyme(word, endWord);

        if (rhymeAnalysis.rhymes && rhymeAnalysis.quality === 'perfect') {
          internalRhymes.push({
            line: i,
            words: [word, endWord],
            position: j < words.length / 2 ? 'beginning' : 'middle'
          });
        }
      }
    }

    return internalRhymes;
  }

  /**
   * Calculate overall rhyme quality score
   */
  private calculateRhymeQuality(groups: RhymeGroup[]): number {
    let totalScore = 0;
    let totalRhymes = 0;

    for (const group of groups) {
      if (group.lines.length < 2) continue;

      const rhymeCount = group.lines.length - 1;
      const score = group.quality === 'perfect' ? 1.0 : 0.6;

      totalScore += score * rhymeCount;
      totalRhymes += rhymeCount;
    }

    return totalRhymes > 0 ? totalScore / totalRhymes : 0;
  }

  /**
   * Validate rhyme scheme
   */
  validateRhymeScheme(scheme: RhymeScheme): {
    valid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check quality
    if (scheme.qualityScore < 0.7) {
      issues.push('Low rhyme quality');
      suggestions.push('Use more perfect rhymes instead of slant rhymes');
    }

    // Check consistency
    if (scheme.slantRhymes > scheme.perfectRhymes) {
      suggestions.push('Consider strengthening slant rhymes to perfect rhymes');
    }

    // Check for forced rhymes (words only differing in last letter)
    for (const group of scheme.groups) {
      if (group.words.length >= 2) {
        for (let i = 0; i < group.words.length - 1; i++) {
          const w1 = group.words[i];
          const w2 = group.words[i + 1];

          if (w1.length > 3 && w2.length > 3) {
            const prefix1 = w1.slice(0, -1);
            const prefix2 = w2.slice(0, -1);

            if (prefix1 === prefix2) {
              issues.push(`Potential forced rhyme: ${w1}/${w2}`);
            }
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Helper: Check if arrays are equal
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Suggest rhyming words
   */
  suggestRhymes(word: string): string[] {
    // Simplified - would use rhyming dictionary in production
    const suggestions: string[] = [];
    const rhymeSound = this.extractRhymePhonemes(word)[0];

    // This would query a rhyming dictionary
    // For now, return placeholder
    return [
      'Use rhyming dictionary for suggestions',
      'Common rhyme patterns: -ight, -tion, -ness'
    ];
  }
}
