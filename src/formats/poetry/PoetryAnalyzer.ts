/**
 * Poetry Analyzer
 * Comprehensive poetry analysis system
 */

import {
  PoetryAnalysis,
  PoetryForm,
  PoetryFormType,
  Meter,
  RhymeScheme,
  StanzaStructure,
  LiteraryDeviceInstance,
  LiteraryDevice,
  EmotionalArc
} from './types';
import { SyllableCounter } from './SyllableCounter';
import { MeterDetector } from './MeterDetector';
import { RhymeSchemeAnalyzer } from './RhymeSchemeAnalyzer';
import { StressPatternDetector } from './StressPatternDetector';

export class PoetryAnalyzer {
  private syllableCounter: SyllableCounter;
  private meterDetector: MeterDetector;
  private rhymeAnalyzer: RhymeSchemeAnalyzer;
  private stressDetector: StressPatternDetector;

  constructor() {
    this.syllableCounter = new SyllableCounter();
    this.meterDetector = new MeterDetector();
    this.rhymeAnalyzer = new RhymeSchemeAnalyzer();
    this.stressDetector = new StressPatternDetector();
  }

  /**
   * Perform comprehensive analysis of poem
   */
  async analyzePoem(poem: string): Promise<PoetryAnalysis> {
    const lines = poem.split('\n').filter(l => l.trim());

    if (lines.length === 0) {
      throw new Error('Poem is empty');
    }

    // Structural analysis
    const form = await this.detectForm(lines);
    const stanzaStructure = this.analyzeStanzas(lines);

    // Sound pattern analysis
    const meterResult = await this.meterDetector.detectConsistentMeter(lines);
    const rhymeScheme = await this.rhymeAnalyzer.analyzeRhymeScheme(lines);
    const rhythmScore = this.calculateRhythmScore(meterResult, rhymeScheme);

    // Line-level metrics
    const lineLengths = lines.map(l => this.syllableCounter.countSyllablesInLine(l));
    const avgSyllablesPerLine =
      lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;

    // Literary analysis
    const literaryDevices = await this.detectLiteraryDevices(lines);
    const emotionalArc = await this.analyzeEmotionalArc(lines);
    const imagery = this.extractImagery(lines);
    const themes = this.identifyThemes(lines);

    // Quality metrics
    const technicalScore = this.calculateTechnicalScore(meterResult, rhymeScheme);
    const artisticScore = this.calculateArtisticScore(literaryDevices, emotionalArc);
    const overallScore = (technicalScore + artisticScore) / 2;

    // Generate suggestions
    const suggestions = this.generateSuggestions(
      meterResult,
      rhymeScheme,
      form,
      literaryDevices
    );

    return {
      form,
      stanzaStructure,
      totalLines: lines.length,
      totalStanzas: stanzaStructure.length,

      meter: meterResult.meter,
      rhymeScheme,
      rhythmScore,

      lineLengths,
      lineMeters: meterResult.lineMeters,
      avgSyllablesPerLine,

      literaryDevices,
      emotionalArc,
      imagery,
      themes,

      technicalScore,
      artisticScore,
      overallScore,

      suggestions
    };
  }

  /**
   * Detect poetry form
   */
  private async detectForm(lines: string[]): Promise<PoetryForm> {
    const lineCount = lines.length;
    const syllableCounts = lines.map(l => this.syllableCounter.countSyllablesInLine(l));
    const rhymeScheme = await this.rhymeAnalyzer.analyzeRhymeScheme(lines);
    const meterResult = await this.meterDetector.detectConsistentMeter(lines);

    // Haiku: 3 lines, 5-7-5 syllables
    if (
      lineCount === 3 &&
      syllableCounts[0] === 5 &&
      syllableCounts[1] === 7 &&
      syllableCounts[2] === 5
    ) {
      return {
        type: 'haiku',
        confidence: 1.0,
        requirements: {
          expected: ['3 lines', '5-7-5 syllables', 'nature theme'],
          met: ['3 lines', '5-7-5 syllables'],
          unmet: []
        }
      };
    }

    // Sonnet: 14 lines, iambic pentameter
    if (lineCount === 14) {
      const isIambicPent = await this.meterDetector.isIambicPentameter(lines);

      if (isIambicPent) {
        // Check rhyme scheme
        if (rhymeScheme.scheme.replace(/\s/g, '') === 'ABABCDCDEFEFGG') {
          return {
            type: 'shakespearean_sonnet',
            confidence: 0.95,
            requirements: {
              expected: ['14 lines', 'iambic pentameter', 'ABAB CDCD EFEF GG rhyme'],
              met: ['14 lines', 'iambic pentameter', 'ABAB CDCD EFEF GG rhyme'],
              unmet: []
            }
          };
        } else if (rhymeScheme.scheme.replace(/\s/g, '') === 'ABBAABBACDECDE') {
          return {
            type: 'petrarchan_sonnet',
            confidence: 0.95,
            requirements: {
              expected: ['14 lines', 'iambic pentameter', 'ABBA ABBA CDE CDE rhyme'],
              met: ['14 lines', 'iambic pentameter', 'ABBA ABBA CDE CDE rhyme'],
              unmet: []
            }
          };
        }

        return {
          type: 'sonnet',
          confidence: 0.85,
          requirements: {
            expected: ['14 lines', 'iambic pentameter', 'specific rhyme scheme'],
            met: ['14 lines', 'iambic pentameter'],
            unmet: ['specific rhyme scheme']
          },
          variations: 'Non-traditional rhyme scheme'
        };
      }
    }

    // Limerick: 5 lines, AABBA rhyme
    if (lineCount === 5 && rhymeScheme.scheme.replace(/\s/g, '') === 'AABBA') {
      return {
        type: 'limerick',
        confidence: 0.9,
        requirements: {
          expected: ['5 lines', 'AABBA rhyme', 'humorous tone'],
          met: ['5 lines', 'AABBA rhyme'],
          unmet: []
        }
      };
    }

    // Blank verse: iambic pentameter, no rhyme
    if (meterResult.meter.type === 'iambic' && rhymeScheme.perfectRhymes === 0) {
      return {
        type: 'blank_verse',
        confidence: 0.8,
        requirements: {
          expected: ['iambic meter', 'no rhyme scheme'],
          met: ['iambic meter', 'no rhyme scheme'],
          unmet: []
        }
      };
    }

    // Free verse: no consistent meter or rhyme
    if (meterResult.consistency < 0.5 && rhymeScheme.perfectRhymes < lineCount * 0.3) {
      return {
        type: 'free_verse',
        confidence: 0.9,
        requirements: {
          expected: ['no fixed meter', 'no fixed rhyme scheme'],
          met: ['no fixed meter', 'no fixed rhyme scheme'],
          unmet: []
        }
      };
    }

    // Default to free verse
    return {
      type: 'free_verse',
      confidence: 0.7,
      requirements: {
        expected: [],
        met: [],
        unmet: []
      }
    };
  }

  /**
   * Analyze stanza structure
   */
  private analyzeStanzas(lines: string[]): StanzaStructure[] {
    const stanzas: StanzaStructure[] = [];
    let currentStanza: string[] = [];
    let stanzaNumber = 1;

    for (const line of lines) {
      if (line.trim() === '') {
        if (currentStanza.length > 0) {
          stanzas.push(this.createStanzaStructure(currentStanza, stanzaNumber++));
          currentStanza = [];
        }
      } else {
        currentStanza.push(line);
      }
    }

    if (currentStanza.length > 0) {
      stanzas.push(this.createStanzaStructure(currentStanza, stanzaNumber));
    }

    return stanzas;
  }

  /**
   * Create stanza structure object
   */
  private createStanzaStructure(lines: string[], number: number): StanzaStructure {
    const syllableCounts = lines.map(l => this.syllableCounter.countSyllablesInLine(l));

    return {
      stanzaNumber: number,
      lineCount: lines.length,
      lines,
      syllableCounts,
      rhymeScheme: '', // Would analyze per-stanza
      meterConsistency: 0 // Would calculate
    };
  }

  /**
   * Calculate rhythm score
   */
  private calculateRhythmScore(
    meterResult: { consistency: number },
    rhymeScheme: RhymeScheme
  ): number {
    const meterWeight = 0.6;
    const rhymeWeight = 0.4;

    return meterResult.consistency * meterWeight + rhymeScheme.qualityScore * rhymeWeight;
  }

  /**
   * Detect literary devices
   */
  private async detectLiteraryDevices(lines: string[]): Promise<LiteraryDeviceInstance[]> {
    const devices: LiteraryDeviceInstance[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Alliteration
      if (this.hasAlliteration(line)) {
        devices.push({
          device: 'alliteration',
          line: i,
          text: line,
          explanation: 'Repetition of initial consonant sounds',
          effectiveness: 0.7
        });
      }

      // Metaphor/Simile
      if (/\b(like|as)\b/.test(line)) {
        devices.push({
          device: 'simile',
          line: i,
          text: line,
          explanation: 'Comparison using "like" or "as"',
          effectiveness: 0.8
        });
      }

      // Personification
      if (this.hasPersonification(line)) {
        devices.push({
          device: 'personification',
          line: i,
          text: line,
          explanation: 'Human qualities attributed to non-human',
          effectiveness: 0.7
        });
      }

      // Anaphora (repetition at beginning)
      if (i > 0 && this.hasAnaphora(lines[i - 1], line)) {
        devices.push({
          device: 'anaphora',
          line: i,
          text: line,
          explanation: 'Repetition of words at beginning of lines',
          effectiveness: 0.8
        });
      }

      // Enjambment
      if (this.hasEnjambment(line)) {
        devices.push({
          device: 'enjambment',
          line: i,
          text: line,
          explanation: 'Sentence continues to next line without pause',
          effectiveness: 0.6
        });
      }
    }

    return devices;
  }

  /**
   * Analyze emotional arc
   */
  private async analyzeEmotionalArc(lines: string[]): Promise<EmotionalArc> {
    const progression: Array<{ line: number; emotion: string; intensity: number }> = [];

    for (let i = 0; i < lines.length; i++) {
      const emotion = this.detectEmotion(lines[i]);
      const intensity = this.measureEmotionalIntensity(lines[i]);

      progression.push({
        line: i,
        emotion,
        intensity
      });
    }

    // Find climax (highest intensity)
    let maxIntensity = 0;
    let climaxLine = 0;

    for (const point of progression) {
      if (point.intensity > maxIntensity) {
        maxIntensity = point.intensity;
        climaxLine = point.line;
      }
    }

    return {
      overallTone: this.determineOverallTone(progression),
      progression,
      climax: {
        line: climaxLine,
        description: `Emotional peak at line ${climaxLine + 1}`
      },
      resolution: climaxLine < lines.length - 1
        ? {
            line: lines.length - 1,
            description: 'Concluding resolution'
          }
        : undefined
    };
  }

  /**
   * Extract imagery from lines
   */
  private extractImagery(lines: string[]): string[] {
    const imagery: string[] = [];

    for (const line of lines) {
      // Detect sensory words
      if (/\b(see|saw|look|watch|bright|dark|color|red|blue)\b/i.test(line)) {
        imagery.push(`Visual: ${line.slice(0, 50)}...`);
      }
      if (/\b(hear|sound|loud|quiet|whisper|echo)\b/i.test(line)) {
        imagery.push(`Auditory: ${line.slice(0, 50)}...`);
      }
      if (/\b(touch|feel|soft|rough|warm|cold)\b/i.test(line)) {
        imagery.push(`Tactile: ${line.slice(0, 50)}...`);
      }
      if (/\b(smell|scent|aroma|fragrance)\b/i.test(line)) {
        imagery.push(`Olfactory: ${line.slice(0, 50)}...`);
      }
      if (/\b(taste|sweet|bitter|sour)\b/i.test(line)) {
        imagery.push(`Gustatory: ${line.slice(0, 50)}...`);
      }
    }

    return imagery.slice(0, 10); // Limit to top 10
  }

  /**
   * Identify themes
   */
  private identifyThemes(lines: string[]): string[] {
    const text = lines.join(' ').toLowerCase();
    const themes: string[] = [];

    const themePatterns: Record<string, RegExp> = {
      Love: /\b(love|heart|passion|romance|desire)\b/,
      Death: /\b(death|die|grave|mortal|eternal)\b/,
      Nature: /\b(nature|tree|flower|river|mountain|sky|sun|moon)\b/,
      Time: /\b(time|moment|past|future|yesterday|tomorrow|forever)\b/,
      Identity: /\b(i|me|myself|who|identity|self)\b/,
      Loss: /\b(loss|lost|gone|miss|absence)\b/,
      Hope: /\b(hope|dream|wish|aspire|future)\b/,
      Struggle: /\b(fight|battle|struggle|overcome|conquer)\b/
    };

    for (const [theme, pattern] of Object.entries(themePatterns)) {
      if (pattern.test(text)) {
        themes.push(theme);
      }
    }

    return themes;
  }

  /**
   * Calculate technical score
   */
  private calculateTechnicalScore(
    meterResult: { consistency: number },
    rhymeScheme: RhymeScheme
  ): number {
    return (meterResult.consistency * 0.5 + rhymeScheme.qualityScore * 0.5) * 100;
  }

  /**
   * Calculate artistic score
   */
  private calculateArtisticScore(
    devices: LiteraryDeviceInstance[],
    arc: EmotionalArc
  ): number {
    const deviceScore = Math.min(devices.length / 5, 1.0); // Up to 5 devices = 100%
    const avgEffectiveness =
      devices.reduce((sum, d) => sum + d.effectiveness, 0) / Math.max(devices.length, 1);

    return ((deviceScore * 0.5 + avgEffectiveness * 0.5) * 100);
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(
    meterResult: any,
    rhymeScheme: RhymeScheme,
    form: PoetryForm,
    devices: LiteraryDeviceInstance[]
  ): Array<{
    type: 'meter' | 'rhyme' | 'structure' | 'device' | 'word-choice';
    line?: number;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const suggestions: any[] = [];

    // Meter suggestions
    if (meterResult.consistency < 0.7) {
      suggestions.push({
        type: 'meter',
        description: 'Consider strengthening metrical consistency',
        priority: 'medium'
      });
    }

    // Rhyme suggestions
    if (rhymeScheme.qualityScore < 0.7) {
      suggestions.push({
        type: 'rhyme',
        description: 'Improve rhyme quality by using more perfect rhymes',
        priority: 'medium'
      });
    }

    // Literary device suggestions
    if (devices.length < 3) {
      suggestions.push({
        type: 'device',
        description: 'Add more literary devices for richness',
        priority: 'low'
      });
    }

    return suggestions;
  }

  // Helper methods

  private hasAlliteration(line: string): boolean {
    const words = line.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i][0] === words[i + 1][0]) {
        return true;
      }
    }
    return false;
  }

  private hasPersonification(line: string): boolean {
    return /\b(wind|sun|moon|death|time|love)\s+(speaks|cries|laughs|dances|sings)\b/i.test(
      line
    );
  }

  private hasAnaphora(line1: string, line2: string): boolean {
    const words1 = line1.trim().split(/\s+/);
    const words2 = line2.trim().split(/\s+/);
    return words1[0]?.toLowerCase() === words2[0]?.toLowerCase();
  }

  private hasEnjambment(line: string): boolean {
    return !/[.!?]$/.test(line.trim());
  }

  private detectEmotion(line: string): string {
    const text = line.toLowerCase();
    if (/\b(joy|happy|delight|glad)\b/.test(text)) return 'joy';
    if (/\b(sad|sorrow|grief|tears)\b/.test(text)) return 'sadness';
    if (/\b(anger|rage|fury|hate)\b/.test(text)) return 'anger';
    if (/\b(fear|afraid|terror|dread)\b/.test(text)) return 'fear';
    if (/\b(love|adore|cherish)\b/.test(text)) return 'love';
    return 'neutral';
  }

  private measureEmotionalIntensity(line: string): number {
    let intensity = 0.5;

    // Exclamation marks increase intensity
    intensity += (line.match(/!/g) || []).length * 0.1;

    // Emotional words increase intensity
    const emotionalWords = ['very', 'so', 'extremely', 'utterly', 'completely'];
    for (const word of emotionalWords) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(line)) {
        intensity += 0.1;
      }
    }

    return Math.min(1.0, intensity);
  }

  private determineOverallTone(
    progression: Array<{ emotion: string; intensity: number }>
  ): string {
    const emotions: Record<string, number> = {};

    for (const point of progression) {
      emotions[point.emotion] = (emotions[point.emotion] || 0) + point.intensity;
    }

    let maxScore = 0;
    let dominantEmotion = 'neutral';

    for (const [emotion, score] of Object.entries(emotions)) {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }
}
