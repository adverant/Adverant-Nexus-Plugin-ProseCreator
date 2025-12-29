/**
 * Poetry Analysis Types
 * Comprehensive rhythm, meter, and rhyme scheme analysis
 */

export type Stress = 'stressed' | 'unstressed' | 'secondary' | 'weak';

export type MeterType =
  | 'iambic'      // unstressed-stressed (da-DUM)
  | 'trochaic'    // stressed-unstressed (DUM-da)
  | 'anapestic'   // unstressed-unstressed-stressed (da-da-DUM)
  | 'dactylic'    // stressed-unstressed-unstressed (DUM-da-da)
  | 'spondaic'    // stressed-stressed (DUM-DUM)
  | 'pyrrhic'     // unstressed-unstressed (da-da)
  | 'amphibrach'  // unstressed-stressed-unstressed (da-DUM-da)
  | 'free';       // no consistent meter

export type PoetryFormType =
  | 'sonnet'
  | 'shakespearean_sonnet'
  | 'petrarchan_sonnet'
  | 'spenserian_sonnet'
  | 'haiku'
  | 'tanka'
  | 'limerick'
  | 'villanelle'
  | 'sestina'
  | 'pantoum'
  | 'ghazal'
  | 'ode'
  | 'elegy'
  | 'ballad'
  | 'blank_verse'
  | 'free_verse'
  | 'prose_poem'
  | 'concrete_poem'
  | 'acrostic'
  | 'couplet'
  | 'tercet'
  | 'quatrain'
  | 'cinquain'
  | 'rondeau'
  | 'ballade';

export type RhymeQuality =
  | 'perfect'    // Exact match (cat/hat)
  | 'slant'      // Near rhyme (cat/hat vs cat/cut)
  | 'eye'        // Visual similarity (love/move)
  | 'consonance' // Consonant sounds match (cat/cut)
  | 'assonance'  // Vowel sounds match (lake/fade)
  | 'none';

export type LiteraryDevice =
  | 'alliteration'
  | 'assonance'
  | 'consonance'
  | 'metaphor'
  | 'simile'
  | 'personification'
  | 'hyperbole'
  | 'understatement'
  | 'irony'
  | 'paradox'
  | 'oxymoron'
  | 'synecdoche'
  | 'metonymy'
  | 'anaphora'
  | 'epistrophe'
  | 'enjambment'
  | 'caesura'
  | 'onomatopoeia';

export interface Syllable {
  text: string;
  stress: Stress;
  phonemes: string[];
  position: number; // Position in word
}

export interface Word {
  text: string;
  syllables: Syllable[];
  totalSyllables: number;
  stressPattern: Stress[];
  rhymePhonemes: string[]; // Phonemes from last stressed vowel onward
}

export interface MetricalFoot {
  type: MeterType;
  syllables: Syllable[];
  pattern: Stress[];
  position: number; // Position in line
}

export interface Meter {
  type: MeterType;
  feet: number; // Number of feet (monometer=1, dimeter=2, trimeter=3, tetrameter=4, pentameter=5, hexameter=6, heptameter=7, octameter=8)
  name: string; // e.g., "iambic pentameter"
  pattern: Stress[];
  confidence: number; // 0-1
  variations: Array<{
    position: number;
    expected: MeterType;
    actual: MeterType;
    reason: string;
  }>;
}

export interface RhymeGroup {
  letter: string; // A, B, C, etc.
  lines: number[]; // Line numbers in group
  words: string[];
  quality: RhymeQuality;
  phonemeMatch: string[]; // Matching phonemes
}

export interface RhymeScheme {
  scheme: string; // e.g., "ABAB CDCD EFEF GG"
  groups: RhymeGroup[];
  perfectRhymes: number;
  slantRhymes: number;
  internalRhymes: Array<{
    line: number;
    words: string[];
    position: string; // "beginning", "middle", "end"
  }>;
  qualityScore: number; // 0-1
}

export interface StanzaStructure {
  stanzaNumber: number;
  lineCount: number;
  lines: string[];
  syllableCounts: number[];
  rhymeScheme: string;
  meterConsistency: number; // 0-1
}

export interface PoetryForm {
  type: PoetryFormType;
  confidence: number; // 0-1
  requirements: {
    expected: string[];
    met: string[];
    unmet: string[];
  };
  variations?: string; // e.g., "Modified Shakespearean sonnet with alternate rhyme scheme"
}

export interface LiteraryDeviceInstance {
  device: LiteraryDevice;
  line: number;
  text: string;
  explanation: string;
  effectiveness: number; // 0-1
}

export interface EmotionalArc {
  overallTone: string;
  progression: Array<{
    line: number;
    emotion: string;
    intensity: number; // 0-1
  }>;
  climax?: {
    line: number;
    description: string;
  };
  resolution?: {
    line: number;
    description: string;
  };
}

export interface PoetryAnalysis {
  // Structure
  form: PoetryForm;
  stanzaStructure: StanzaStructure[];
  totalLines: number;
  totalStanzas: number;

  // Sound patterns
  meter: Meter;
  rhymeScheme: RhymeScheme;
  rhythmScore: number; // 0-1, overall rhythm quality

  // Line-level metrics
  lineLengths: number[]; // Syllables per line
  lineMeters: Meter[]; // Meter for each line
  avgSyllablesPerLine: number;

  // Literary analysis
  literaryDevices: LiteraryDeviceInstance[];
  emotionalArc: EmotionalArc;
  imagery: string[];
  themes: string[];

  // Quality metrics
  technicalScore: number; // 0-1, adherence to form/meter
  artisticScore: number; // 0-1, effectiveness of devices
  overallScore: number; // 0-1, combined quality

  // Suggestions
  suggestions: Array<{
    type: 'meter' | 'rhyme' | 'structure' | 'device' | 'word-choice';
    line?: number;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface PhonemeTranscription {
  word: string;
  phonemes: string[]; // CMU format (e.g., ["K", "AE1", "T"])
  syllables: string[][]; // Phonemes grouped by syllable
  stresses: number[]; // Stress level for each syllable (0, 1, 2)
}

export interface PhonemeDictionary {
  [word: string]: PhonemeTranscription;
}

export interface SyllableCountResult {
  word: string;
  syllables: number;
  method: 'dictionary' | 'rules' | 'fallback';
  confidence: number; // 0-1
  breakdown?: string[]; // Individual syllables
}

export interface RhymeAnalysis {
  word1: string;
  word2: string;
  rhymes: boolean;
  quality: RhymeQuality;
  phonemeMatch: string[];
  matchLength: number;
  confidence: number; // 0-1
}

export interface StressPattern {
  line: string;
  words: Word[];
  stresses: Stress[];
  feet: MetricalFoot[];
  dominantMeter: MeterType;
  meterStrength: number; // 0-1, how well it matches the pattern
}
