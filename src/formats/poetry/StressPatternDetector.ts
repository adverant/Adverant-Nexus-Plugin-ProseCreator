/**
 * Stress Pattern Detector
 * Detects stressed and unstressed syllables in English text
 */

import { Stress, StressPattern, Word, Syllable, MetricalFoot, MeterType } from './types';
import { SyllableCounter } from './SyllableCounter';

export class StressPatternDetector {
  private syllableCounter: SyllableCounter;
  private stressedSyllables: Set<string>;

  constructor() {
    this.syllableCounter = new SyllableCounter();
    this.stressedSyllables = new Set();
    this.loadStressPatterns();
  }

  /**
   * Detect stress pattern for entire line
   */
  async detectStressPattern(line: string): Promise<StressPattern> {
    const words = line.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const wordObjects: Word[] = [];

    for (const wordText of words) {
      const word = await this.analyzeWord(wordText);
      wordObjects.push(word);
    }

    // Extract all syllables and stresses
    const allSyllables: Syllable[] = [];
    const allStresses: Stress[] = [];

    for (const word of wordObjects) {
      allSyllables.push(...word.syllables);
      allStresses.push(...word.stressPattern);
    }

    // Identify metrical feet
    const feet = this.identifyFeet(allSyllables);

    // Determine dominant meter
    const dominantMeter = this.determineDominantMeter(feet);

    // Calculate meter strength
    const meterStrength = this.calculateMeterStrength(feet, dominantMeter);

    return {
      line,
      words: wordObjects,
      stresses: allStresses,
      feet,
      dominantMeter,
      meterStrength
    };
  }

  /**
   * Analyze stress pattern of a single word
   */
  private async analyzeWord(wordText: string): Promise<Word> {
    const cleaned = wordText.replace(/[^a-z]/gi, '');
    const syllableCount = this.syllableCounter.countSyllables(cleaned);

    // Determine stress pattern based on word structure
    const stresses = this.determineWordStress(cleaned, syllableCount.syllables);

    // Create syllable objects
    const syllables: Syllable[] = [];
    const breakdown = syllableCount.breakdown || [cleaned];

    for (let i = 0; i < breakdown.length; i++) {
      syllables.push({
        text: breakdown[i],
        stress: stresses[i] || 'unstressed',
        phonemes: [], // Would use phonetic transcription in production
        position: i
      });
    }

    // Determine rhyme phonemes (simplified)
    const rhymePhonemes = this.extractRhymePhonemes(cleaned);

    return {
      text: wordText,
      syllables,
      totalSyllables: syllableCount.syllables,
      stressPattern: stresses,
      rhymePhonemes
    };
  }

  /**
   * Determine stress pattern for word based on syllable count and position
   */
  private determineWordStress(word: string, syllableCount: number): Stress[] {
    // Single syllable words
    if (syllableCount === 1) {
      // Content words are stressed, function words are not
      return [this.isContentWord(word) ? 'stressed' : 'unstressed'];
    }

    // Two syllable words
    if (syllableCount === 2) {
      // Most nouns: first syllable stressed (TAble, CHAir)
      // Most verbs: second syllable stressed (beLIEVE, reLAX)
      if (this.isNoun(word)) {
        return ['stressed', 'unstressed'];
      } else if (this.isVerb(word)) {
        return ['unstressed', 'stressed'];
      }
      // Default: first syllable stressed
      return ['stressed', 'unstressed'];
    }

    // Three syllable words
    if (syllableCount === 3) {
      // Common patterns: first stressed, or second stressed
      if (word.endsWith('tion') || word.endsWith('sion')) {
        return ['unstressed', 'stressed', 'unstressed']; // colLECtion
      }
      if (word.endsWith('ity') || word.endsWith('ety')) {
        return ['unstressed', 'stressed', 'unstressed']; // variEty
      }
      // Default: first stressed
      return ['stressed', 'unstressed', 'unstressed'];
    }

    // Four+ syllables: typically secondary stress on first, primary on second or third
    const stresses: Stress[] = [];
    for (let i = 0; i < syllableCount; i++) {
      if (i === 0) {
        stresses.push('secondary');
      } else if (i === 1 || i === 2) {
        stresses.push('stressed');
      } else {
        stresses.push('unstressed');
      }
    }

    return stresses;
  }

  /**
   * Identify metrical feet in syllable sequence
   */
  private identifyFeet(syllables: Syllable[]): MetricalFoot[] {
    const feet: MetricalFoot[] = [];
    let i = 0;

    while (i < syllables.length) {
      // Try to identify 2-syllable feet first (most common)
      if (i + 1 < syllables.length) {
        const pattern = [
          syllables[i].stress,
          syllables[i + 1].stress
        ];

        const foot = this.identifyFoot(pattern, [syllables[i], syllables[i + 1]], feet.length);
        if (foot) {
          feet.push(foot);
          i += 2;
          continue;
        }
      }

      // Try 3-syllable feet
      if (i + 2 < syllables.length) {
        const pattern = [
          syllables[i].stress,
          syllables[i + 1].stress,
          syllables[i + 2].stress
        ];

        const foot = this.identifyFoot(
          pattern,
          [syllables[i], syllables[i + 1], syllables[i + 2]],
          feet.length
        );
        if (foot) {
          feet.push(foot);
          i += 3;
          continue;
        }
      }

      // Single syllable foot (incomplete)
      feet.push({
        type: 'free',
        syllables: [syllables[i]],
        pattern: [syllables[i].stress],
        position: feet.length
      });
      i++;
    }

    return feet;
  }

  /**
   * Identify foot type from stress pattern
   */
  private identifyFoot(
    pattern: Stress[],
    syllables: Syllable[],
    position: number
  ): MetricalFoot | null {
    const isStressed = (s: Stress) => s === 'stressed' || s === 'secondary';
    const isUnstressed = (s: Stress) => s === 'unstressed' || s === 'weak';

    // 2-syllable feet
    if (pattern.length === 2) {
      if (isUnstressed(pattern[0]) && isStressed(pattern[1])) {
        return { type: 'iambic', syllables, pattern, position };
      }
      if (isStressed(pattern[0]) && isUnstressed(pattern[1])) {
        return { type: 'trochaic', syllables, pattern, position };
      }
      if (isStressed(pattern[0]) && isStressed(pattern[1])) {
        return { type: 'spondaic', syllables, pattern, position };
      }
      if (isUnstressed(pattern[0]) && isUnstressed(pattern[1])) {
        return { type: 'pyrrhic', syllables, pattern, position };
      }
    }

    // 3-syllable feet
    if (pattern.length === 3) {
      if (isUnstressed(pattern[0]) && isUnstressed(pattern[1]) && isStressed(pattern[2])) {
        return { type: 'anapestic', syllables, pattern, position };
      }
      if (isStressed(pattern[0]) && isUnstressed(pattern[1]) && isUnstressed(pattern[2])) {
        return { type: 'dactylic', syllables, pattern, position };
      }
      if (isUnstressed(pattern[0]) && isStressed(pattern[1]) && isUnstressed(pattern[2])) {
        return { type: 'amphibrach', syllables, pattern, position };
      }
    }

    return null;
  }

  /**
   * Determine dominant meter from feet
   */
  private determineDominantMeter(feet: MetricalFoot[]): MeterType {
    const counts: Partial<Record<MeterType, number>> = {};

    for (const foot of feet) {
      counts[foot.type] = (counts[foot.type] || 0) + 1;
    }

    let maxCount = 0;
    let dominantMeter: MeterType = 'free';

    for (const [meter, count] of Object.entries(counts) as [MeterType, number][]) {
      if (count > maxCount) {
        maxCount = count;
        dominantMeter = meter;
      }
    }

    return dominantMeter;
  }

  /**
   * Calculate how well line matches meter
   */
  private calculateMeterStrength(feet: MetricalFoot[], dominantMeter: MeterType): number {
    if (feet.length === 0) return 0;

    const matchingFeet = feet.filter(f => f.type === dominantMeter).length;
    return matchingFeet / feet.length;
  }

  /**
   * Extract rhyme phonemes from word
   */
  private extractRhymePhonemes(word: string): string[] {
    // Simplified - would use phonetic transcription in production
    // Return last vowel + consonants
    const lastVowelIndex = word.search(/[aeiouy][^aeiouy]*$/i);
    if (lastVowelIndex >= 0) {
      return [word.slice(lastVowelIndex).toLowerCase()];
    }
    return [word.slice(-2).toLowerCase()];
  }

  /**
   * Check if word is content word (typically stressed)
   */
  private isContentWord(word: string): boolean {
    const functionWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on',
      'at', 'by', 'for', 'with', 'from', 'as', 'is', 'was', 'be', 'been'
    ]);
    return !functionWords.has(word.toLowerCase());
  }

  /**
   * Simple heuristic to identify nouns
   */
  private isNoun(word: string): boolean {
    // Very simplified - would use POS tagging in production
    return word.endsWith('ness') || word.endsWith('ment') || word.endsWith('tion');
  }

  /**
   * Simple heuristic to identify verbs
   */
  private isVerb(word: string): boolean {
    // Very simplified
    return word.endsWith('ing') || word.endsWith('ed') || word.endsWith('ize');
  }

  /**
   * Load stress patterns for common words
   */
  private loadStressPatterns(): void {
    // Would load CMU Pronouncing Dictionary in production
    // For now, using heuristics
  }
}
