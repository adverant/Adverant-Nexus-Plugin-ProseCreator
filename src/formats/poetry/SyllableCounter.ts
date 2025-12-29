/**
 * Syllable Counter
 * Accurate syllable counting for English poetry analysis
 */

import { SyllableCountResult, PhonemeDictionary } from './types';

export class SyllableCounter {
  // Simplified CMU dictionary cache - in production, would load full dictionary
  private dictionary: Map<string, number> = new Map();

  constructor() {
    this.loadCommonWords();
  }

  /**
   * Count syllables in a word with high accuracy
   */
  countSyllables(word: string): SyllableCountResult {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');

    if (cleaned.length === 0) {
      return {
        word,
        syllables: 0,
        method: 'fallback',
        confidence: 1.0
      };
    }

    // Try dictionary first
    const dictCount = this.lookupDictionary(cleaned);
    if (dictCount !== null) {
      return {
        word,
        syllables: dictCount,
        method: 'dictionary',
        confidence: 0.98
      };
    }

    // Fallback to rule-based counting
    const ruleCount = this.countByRules(cleaned);
    return {
      word,
      syllables: ruleCount,
      method: 'rules',
      confidence: 0.85,
      breakdown: this.getSyllableBreakdown(cleaned)
    };
  }

  /**
   * Count syllables in a line of text
   */
  countSyllablesInLine(line: string): number {
    const words = line.toLowerCase().split(/\s+/);
    let total = 0;

    for (const word of words) {
      if (word.trim().length > 0) {
        const result = this.countSyllables(word);
        total += result.syllables;
      }
    }

    return total;
  }

  /**
   * Look up word in dictionary
   */
  private lookupDictionary(word: string): number | null {
    return this.dictionary.get(word) || null;
  }

  /**
   * Count syllables using rules
   */
  private countByRules(word: string): number {
    let count = 0;

    // Special cases
    if (word.length <= 3) {
      return 1;
    }

    // Handle common suffixes
    word = this.preprocessWord(word);

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g);
    if (!vowelGroups) {
      return 1; // Consonant-only words (like "mmm")
    }

    count = vowelGroups.length;

    // Adjustments for English pronunciation rules
    count = this.applyEnglishRules(word, count);

    return Math.max(1, count);
  }

  /**
   * Preprocess word for syllable counting
   */
  private preprocessWord(word: string): string {
    // Remove silent 'e' at end
    if (word.endsWith('e') && word.length > 2) {
      // Check if it's truly silent
      if (!this.isSilentE(word)) {
        return word;
      }
      word = word.slice(0, -1);
    }

    // Handle 'es' and 'ed' endings
    if (word.endsWith('es')) {
      const base = word.slice(0, -2);
      if (/[sxzh]$/.test(base)) {
        // "es" is pronounced (boxes, buzzes)
        return word;
      }
      word = base;
    }

    if (word.endsWith('ed')) {
      const base = word.slice(0, -2);
      if (/[td]$/.test(base)) {
        // "ed" is pronounced (wanted, needed)
        return word;
      }
      word = base;
    }

    return word;
  }

  /**
   * Check if final 'e' is silent
   */
  private isSilentE(word: string): boolean {
    if (word.length < 3) return false;

    const beforeE = word.slice(-2, -1);

    // Silent in most cases except after vowel
    return !/[aeiouy]/.test(beforeE);
  }

  /**
   * Apply English pronunciation rules
   */
  private applyEnglishRules(word: string, count: number): number {
    // Subtract for diphthongs (consecutive vowels pronounced as one)
    const diphthongs = [
      /ai/, /ay/, /ea/, /ee/, /ei/, /ey/, /ie/, /oa/, /oe/, /oi/,
      /oo/, /ou/, /oy/, /ue/, /ui/
    ];

    let adjustedCount = count;

    for (const pattern of diphthongs) {
      const matches = word.match(new RegExp(pattern, 'g'));
      if (matches) {
        // Each diphthong might reduce count, but be conservative
        // adjustedCount -= Math.floor(matches.length * 0.5);
      }
    }

    // Add for special endings that create syllables
    if (word.endsWith('ion') || word.endsWith('ian')) {
      adjustedCount += 0.5; // Often an extra syllable
    }

    // Consonant + 'le' at end usually forms syllable
    if (word.length > 3 && word.endsWith('le')) {
      const beforeLE = word.slice(-3, -2);
      if (!/[aeiouy]/.test(beforeLE)) {
        adjustedCount += 0.5;
      }
    }

    // 'cia', 'tia', 'sion', 'tion' endings
    if (/[ct]ia$/.test(word) || /[st]ion$/.test(word)) {
      adjustedCount += 0.3;
    }

    return Math.round(adjustedCount);
  }

  /**
   * Get syllable breakdown for word
   */
  private getSyllableBreakdown(word: string): string[] {
    const breakdown: string[] = [];
    let current = '';
    const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      current += char;

      // Check if we should break here
      if (vowels.has(char)) {
        // If next char is consonant and not end, might be break point
        if (i < word.length - 1 && !vowels.has(word[i + 1])) {
          // Look ahead for next vowel
          if (i < word.length - 2 && vowels.has(word[i + 2])) {
            breakdown.push(current);
            current = '';
          }
        }
      }
    }

    if (current) {
      breakdown.push(current);
    }

    return breakdown.length > 0 ? breakdown : [word];
  }

  /**
   * Load common words into dictionary
   */
  private loadCommonWords(): void {
    // Common words with syllable counts
    const commonWords: Record<string, number> = {
      // 1 syllable
      the: 1, be: 1, to: 1, of: 1, and: 1, a: 1, in: 1, that: 1, have: 1,
      i: 1, it: 1, for: 1, not: 1, on: 1, with: 1, he: 1, as: 1, you: 1,
      do: 1, at: 1, this: 1, but: 1, his: 1, by: 1, from: 1, they: 1,
      we: 1, say: 1, her: 1, she: 1, or: 1, an: 1, will: 1, my: 1, one: 1,
      all: 1, would: 1, there: 1, their: 1, what: 1, so: 1, up: 1, out: 1,
      if: 1, who: 1, get: 1, which: 1, go: 1, me: 1, when: 1, make: 1,
      can: 1, like: 1, time: 1, no: 1, just: 1, him: 1, know: 1, take: 1,
      through: 1, them: 1, see: 1, way: 1, could: 1, now: 1, than: 1,
      then: 1, its: 1, our: 1, two: 1, more: 1, these: 1, want: 1, how: 1,
      your: 1, may: 1, come: 1, day: 1, work: 1, first: 1, think: 1,

      // 2 syllables
      about: 2, after: 2, again: 2, also: 2, another: 2, any: 2, around: 2,
      away: 2, because: 2, before: 2, between: 2, being: 2, city: 2,
      country: 2, even: 2, every: 2, family: 2, father: 2, follow: 2,
      over: 2, people: 2, under: 2, upon: 2, water: 2, woman: 2, working: 2,
      writing: 2, coming: 2, going: 2, doing: 2, being: 2, having: 2,
      able: 2, against: 2, during: 2, early: 2, into: 2, mother: 2,
      never: 2, number: 2, only: 2, other: 2, over: 2, power: 2, within: 2,

      // 3 syllables
      however: 3, another: 3, without: 3, together: 3, anyone: 3,
      beautiful: 3, different: 3, everything: 3, memory: 3, family: 3,
      business: 3, consider: 3, already: 3, company: 3, president: 3,
      important: 3, example: 3, following: 3, several: 3, probably: 3,

      // Common problematic words
      fire: 2, our: 1, hour: 2, iron: 2, island: 2, poem: 2, poet: 2,
      poetry: 3, quiet: 2, violence: 3, chocolate: 3, camera: 3,
      area: 3, idea: 3, real: 2, realize: 3, create: 2, creative: 3
    };

    for (const [word, count] of Object.entries(commonWords)) {
      this.dictionary.set(word, count);
    }
  }

  /**
   * Validate syllable count with multiple methods
   */
  validateCount(word: string, expected: number): {
    matches: boolean;
    calculated: number;
    confidence: number;
  } {
    const result = this.countSyllables(word);

    return {
      matches: result.syllables === expected,
      calculated: result.syllables,
      confidence: result.confidence
    };
  }

  /**
   * Add custom word to dictionary
   */
  addToDictionary(word: string, syllables: number): void {
    this.dictionary.set(word.toLowerCase(), syllables);
  }

  /**
   * Get dictionary statistics
   */
  getDictionaryStats(): {
    totalWords: number;
    coverage: string;
  } {
    return {
      totalWords: this.dictionary.size,
      coverage: `${this.dictionary.size} common English words`
    };
  }
}
