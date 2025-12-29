/**
 * NexusProseCreator - Voice Consistency Checker
 *
 * Maintains character voice consistency across entire manuscript
 * Target: 95%+ voice similarity score
 */

import {
  VoiceProfile,
  CharacterProfile,
  CharacterContext,
  VoiceConsistencyReport,
  VoiceIssue,
} from './types';

export class VoiceConsistency {
  /**
   * Validate character voice in dialogue against established profile
   */
  async validateCharacterVoice(params: {
    character_name: string;
    dialogue: string;
    context: CharacterContext;
  }): Promise<VoiceConsistencyReport> {
    const { character_name, dialogue, context } = params;
    const issues: VoiceIssue[] = [];
    const profile = context.profile;

    // Check 1: Vocabulary matches education/background
    const vocabIssues = this.checkVocabulary(dialogue, profile);
    issues.push(...vocabIssues);

    // Check 2: Speech patterns (formal/informal, contractions, etc.)
    const patternIssues = this.checkSpeechPatterns(dialogue, profile);
    issues.push(...patternIssues);

    // Check 3: Emotional tone matches current state
    const emotionIssues = this.checkEmotionalTone(dialogue, profile);
    issues.push(...emotionIssues);

    // Check 4: Sentence structure consistency
    const structureIssues = this.checkSentenceStructure(dialogue, profile);
    issues.push(...structureIssues);

    // Check 5: Formality level consistency
    const formalityIssues = this.checkFormality(dialogue, profile);
    issues.push(...formalityIssues);

    // Calculate similarity score based on issues
    const similarityScore = this.calculateSimilarityScore(issues);

    // Generate suggestions
    const suggestions = this.generateSuggestions(issues, profile);

    return {
      is_consistent: similarityScore >= 0.95 && issues.length === 0,
      similarity_score: similarityScore,
      issues,
      suggestions,
    };
  }

  /**
   * Compare dialogue to previous samples for consistency
   */
  async compareToPreviousDialogue(
    character_name: string,
    newDialogue: string,
    previousSamples: string[]
  ): Promise<number> {
    if (previousSamples.length === 0) return 1.0;

    const newProfile = this.extractVoiceProfile(newDialogue);
    const previousProfiles = previousSamples.map((sample) =>
      this.extractVoiceProfile(sample)
    );

    // Calculate average similarity to previous samples
    const similarities = previousProfiles.map((prevProfile) =>
      this.compareVoiceProfiles(newProfile, prevProfile)
    );

    const avgSimilarity =
      similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

    return avgSimilarity;
  }

  /**
   * Adjust dialogue to match character's established voice
   */
  async adjustDialogue(dialogue: string, profile: CharacterProfile): Promise<string> {
    let adjusted = dialogue;

    // Apply contractions if character uses them
    if (profile.uses_contractions) {
      adjusted = this.addContractions(adjusted);
    } else {
      adjusted = this.removeContractions(adjusted);
    }

    // Adjust formality level
    adjusted = this.adjustFormality(adjusted, profile.formality_level);

    // Add character-specific quirks
    if (profile.speaking_quirks.length > 0) {
      adjusted = this.addSpeakingQuirks(adjusted, profile.speaking_quirks);
    }

    // Add catchphrases occasionally
    if (profile.catchphrases.length > 0 && Math.random() > 0.9) {
      adjusted = this.addCatchphrase(adjusted, profile.catchphrases);
    }

    // Adjust sentence length to match character's typical pattern
    adjusted = this.adjustSentenceLength(adjusted, profile.typical_sentence_length);

    // Adjust vocabulary complexity
    adjusted = this.adjustVocabularyLevel(adjusted, profile.vocabulary_level);

    return adjusted;
  }

  /**
   * Extract voice profile from dialogue sample
   */
  private extractVoiceProfile(dialogue: string): VoiceProfile {
    const words = this.extractWords(dialogue);
    const sentences = this.splitIntoSentences(dialogue);

    const sentenceLengths = sentences.map((s) => this.extractWords(s).length);
    const avgSentenceLength =
      sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length || 0;

    const variance = this.calculateVariance(sentenceLengths);

    // Calculate vocabulary complexity (average word length)
    const wordLengths = words.map((w) => w.length);
    const avgWordLength = wordLengths.reduce((sum, len) => sum + len, 0) / words.length || 0;

    // Extract common and rare words
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      const lower = word.toLowerCase();
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    });

    const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
    const commonWords = sortedWords.slice(0, 10).map(([word]) => word);
    const rareWords = sortedWords
      .filter(([, count]) => count === 1)
      .map(([word]) => word)
      .slice(0, 10);

    // Detect speech patterns
    const speechPatterns = this.detectSpeechPatterns(dialogue);

    return {
      character_name: '',
      avg_sentence_length: avgSentenceLength,
      sentence_length_variance: variance,
      vocabulary_complexity: avgWordLength,
      common_words: commonWords,
      rare_words: rareWords,
      speech_patterns: speechPatterns,
      dialogue_samples: [dialogue],
      consistency_score: 1.0,
    };
  }

  /**
   * Compare two voice profiles for similarity
   */
  private compareVoiceProfiles(profile1: VoiceProfile, profile2: VoiceProfile): number {
    let similarity = 0;
    let totalWeight = 0;

    // Compare sentence length (weight: 20%)
    const sentenceLengthDiff = Math.abs(
      profile1.avg_sentence_length - profile2.avg_sentence_length
    );
    const sentenceLengthSimilarity = Math.max(0, 1 - sentenceLengthDiff / 20);
    similarity += sentenceLengthSimilarity * 0.2;
    totalWeight += 0.2;

    // Compare vocabulary complexity (weight: 20%)
    const vocabDiff = Math.abs(profile1.vocabulary_complexity - profile2.vocabulary_complexity);
    const vocabSimilarity = Math.max(0, 1 - vocabDiff / 5);
    similarity += vocabSimilarity * 0.2;
    totalWeight += 0.2;

    // Compare common words overlap (weight: 25%)
    const commonWordsOverlap = this.calculateWordOverlap(
      profile1.common_words,
      profile2.common_words
    );
    similarity += commonWordsOverlap * 0.25;
    totalWeight += 0.25;

    // Compare speech patterns (weight: 35%)
    const patternsOverlap = this.calculatePatternOverlap(
      profile1.speech_patterns,
      profile2.speech_patterns
    );
    similarity += patternsOverlap * 0.35;
    totalWeight += 0.35;

    return similarity / totalWeight;
  }

  // ====================================================================
  // VALIDATION CHECKS
  // ====================================================================

  private checkVocabulary(dialogue: string, profile: CharacterProfile): VoiceIssue[] {
    const issues: VoiceIssue[] = [];
    const words = this.extractWords(dialogue);

    // Check for words too advanced for education level
    if (profile.vocabulary_level === 'simple') {
      const advancedWords = ['subsequently', 'nevertheless', 'furthermore', 'consequently'];
      for (const word of words) {
        if (advancedWords.includes(word.toLowerCase())) {
          issues.push({
            type: 'vocabulary',
            severity: 'medium',
            message: `Word "${word}" seems too advanced for character's vocabulary level (${profile.vocabulary_level})`,
            example: word,
            suggestion: this.findSimplerAlternative(word),
          });
        }
      }
    }

    // Check for words too simple for sophisticated character
    if (profile.vocabulary_level === 'sophisticated') {
      const simpleWords = ['good', 'bad', 'nice', 'stuff'];
      for (const word of words) {
        if (simpleWords.includes(word.toLowerCase())) {
          issues.push({
            type: 'vocabulary',
            severity: 'low',
            message: `Word "${word}" seems too simple for character's vocabulary level (${profile.vocabulary_level})`,
            example: word,
            suggestion: this.findSophisticatedAlternative(word),
          });
        }
      }
    }

    return issues;
  }

  private checkSpeechPatterns(dialogue: string, profile: CharacterProfile): VoiceIssue[] {
    const issues: VoiceIssue[] = [];

    // Check contractions usage
    const hasContractions = /\b(I'm|you're|he's|she's|it's|we're|they're|can't|won't|don't)\b/i.test(
      dialogue
    );

    if (profile.uses_contractions && !hasContractions && dialogue.length > 50) {
      issues.push({
        type: 'speech_pattern',
        severity: 'low',
        message: 'Character typically uses contractions but none found in this dialogue',
        suggestion: 'Add contractions like "I\'m", "you\'re", "can\'t" where appropriate',
      });
    }

    if (!profile.uses_contractions && hasContractions) {
      issues.push({
        type: 'speech_pattern',
        severity: 'medium',
        message: 'Character does not typically use contractions but some found in dialogue',
        suggestion: 'Expand contractions to full forms (e.g., "I\'m" → "I am")',
      });
    }

    // Check for expected speech patterns
    for (const pattern of profile.speech_patterns) {
      if (!dialogue.toLowerCase().includes(pattern.toLowerCase())) {
        // Pattern not found - could be okay, but worth noting
        issues.push({
          type: 'speech_pattern',
          severity: 'low',
          message: `Character's typical speech pattern "${pattern}" not present`,
          suggestion: `Consider incorporating "${pattern}" if contextually appropriate`,
        });
      }
    }

    return issues;
  }

  private checkEmotionalTone(dialogue: string, profile: CharacterProfile): VoiceIssue[] {
    const issues: VoiceIssue[] = [];

    // Extract emotional tone from dialogue
    const detectedEmotion = this.detectEmotion(dialogue);

    // Compare to expected emotional state
    const expectedEmotion = profile.current_emotional_state.toLowerCase();

    if (!this.emotionsMatch(detectedEmotion, expectedEmotion)) {
      issues.push({
        type: 'emotional_tone',
        severity: 'high',
        message: `Dialogue emotion (${detectedEmotion}) doesn't match character's current state (${expectedEmotion})`,
        suggestion: `Adjust tone to reflect ${expectedEmotion} emotion`,
      });
    }

    return issues;
  }

  private checkSentenceStructure(dialogue: string, profile: CharacterProfile): VoiceIssue[] {
    const issues: VoiceIssue[] = [];
    const sentences = this.splitIntoSentences(dialogue);

    if (sentences.length === 0) return issues;

    const avgLength =
      sentences.reduce((sum, s) => sum + this.extractWords(s).length, 0) / sentences.length;

    // Check against typical sentence length
    const expectedLength = this.getExpectedSentenceLength(profile.typical_sentence_length);

    if (Math.abs(avgLength - expectedLength) > 5) {
      issues.push({
        type: 'sentence_structure',
        severity: 'medium',
        message: `Sentence length (${avgLength.toFixed(1)} words) differs from character's typical (${profile.typical_sentence_length})`,
        suggestion: `Adjust sentences to be more ${profile.typical_sentence_length}`,
      });
    }

    return issues;
  }

  private checkFormality(dialogue: string, profile: CharacterProfile): VoiceIssue[] {
    const issues: VoiceIssue[] = [];

    const detectedFormality = this.detectFormality(dialogue);

    if (detectedFormality !== profile.formality_level) {
      issues.push({
        type: 'formality',
        severity: 'medium',
        message: `Dialogue formality (${detectedFormality}) doesn't match character's typical level (${profile.formality_level})`,
        suggestion: `Adjust to be more ${profile.formality_level}`,
      });
    }

    return issues;
  }

  // ====================================================================
  // DIALOGUE ADJUSTMENT METHODS
  // ====================================================================

  private addContractions(dialogue: string): string {
    return dialogue
      .replace(/\bI am\b/g, "I'm")
      .replace(/\byou are\b/g, "you're")
      .replace(/\bhe is\b/g, "he's")
      .replace(/\bshe is\b/g, "she's")
      .replace(/\bit is\b/g, "it's")
      .replace(/\bwe are\b/g, "we're")
      .replace(/\bthey are\b/g, "they're")
      .replace(/\bcannot\b/g, "can't")
      .replace(/\bwill not\b/g, "won't")
      .replace(/\bdo not\b/g, "don't")
      .replace(/\bdoes not\b/g, "doesn't")
      .replace(/\bdid not\b/g, "didn't")
      .replace(/\bhave not\b/g, "haven't")
      .replace(/\bhas not\b/g, "hasn't")
      .replace(/\bhad not\b/g, "hadn't")
      .replace(/\bwould not\b/g, "wouldn't")
      .replace(/\bshould not\b/g, "shouldn't")
      .replace(/\bcould not\b/g, "couldn't");
  }

  private removeContractions(dialogue: string): string {
    return dialogue
      .replace(/\bI'm\b/g, 'I am')
      .replace(/\byou're\b/g, 'you are')
      .replace(/\bhe's\b/g, 'he is')
      .replace(/\bshe's\b/g, 'she is')
      .replace(/\bit's\b/g, 'it is')
      .replace(/\bwe're\b/g, 'we are')
      .replace(/\bthey're\b/g, 'they are')
      .replace(/\bcan't\b/g, 'cannot')
      .replace(/\bwon't\b/g, 'will not')
      .replace(/\bdon't\b/g, 'do not')
      .replace(/\bdoesn't\b/g, 'does not')
      .replace(/\bdidn't\b/g, 'did not')
      .replace(/\bhaven't\b/g, 'have not')
      .replace(/\bhasn't\b/g, 'has not')
      .replace(/\bhadn't\b/g, 'had not')
      .replace(/\bwouldn't\b/g, 'would not')
      .replace(/\bshouldn't\b/g, 'should not')
      .replace(/\bcouldn't\b/g, 'could not');
  }

  private adjustFormality(
    dialogue: string,
    formalityLevel: CharacterProfile['formality_level']
  ): string {
    let adjusted = dialogue;

    if (formalityLevel === 'very_formal' || formalityLevel === 'formal') {
      // Make more formal
      adjusted = this.removeContractions(adjusted);
      adjusted = this.replaceCasualWords(adjusted);
    } else if (formalityLevel === 'very_informal' || formalityLevel === 'informal') {
      // Make more casual
      adjusted = this.addContractions(adjusted);
      adjusted = this.addCasualWords(adjusted);
    }

    return adjusted;
  }

  private replaceCasualWords(dialogue: string): string {
    const casual ToFormal: Record<string, string> = {
      yeah: 'yes',
      nah: 'no',
      gonna: 'going to',
      wanna: 'want to',
      gotta: 'have to',
      kinda: 'kind of',
      sorta: 'sort of',
    };

    let result = dialogue;
    for (const [casual, formal] of Object.entries(casualToFormal)) {
      const regex = new RegExp(`\\b${casual}\\b`, 'gi');
      result = result.replace(regex, formal);
    }

    return result;
  }

  private addCasualWords(dialogue: string): string {
    // Occasionally add filler words
    if (Math.random() > 0.8) {
      const fillers = ['well, ', 'you know, ', 'I mean, ', 'like, '];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      return filler + dialogue;
    }
    return dialogue;
  }

  private addSpeakingQuirks(dialogue: string, quirks: string[]): string {
    // Occasionally add a quirk if it fits naturally
    if (Math.random() > 0.85 && quirks.length > 0) {
      const quirk = quirks[Math.floor(Math.random() * quirks.length)];
      // Append or prepend quirk
      return Math.random() > 0.5 ? `${dialogue} ${quirk}` : `${quirk} ${dialogue}`;
    }
    return dialogue;
  }

  private addCatchphrase(dialogue: string, catchphrases: string[]): string {
    const catchphrase = catchphrases[Math.floor(Math.random() * catchphrases.length)];
    // Add to end of dialogue
    return `${dialogue} ${catchphrase}`;
  }

  private adjustSentenceLength(
    dialogue: string,
    targetLength: CharacterProfile['typical_sentence_length']
  ): string {
    // Would implement sentence combining/splitting based on target
    return dialogue;
  }

  private adjustVocabularyLevel(
    dialogue: string,
    targetLevel: CharacterProfile['vocabulary_level']
  ): string {
    // Would implement vocabulary replacement based on target level
    return dialogue;
  }

  // ====================================================================
  // HELPER METHODS
  // ====================================================================

  private detectSpeechPatterns(dialogue: string): string[] {
    const patterns: string[] = [];

    // Detect common patterns
    if (/\b(you know|I mean|like)\b/i.test(dialogue)) {
      patterns.push('uses_filler_words');
    }

    if (/\b(gonna|wanna|gotta)\b/i.test(dialogue)) {
      patterns.push('uses_casual_contractions');
    }

    if (/\?.*\?/i.test(dialogue)) {
      patterns.push('asks_multiple_questions');
    }

    if (/\.\.\./i.test(dialogue)) {
      patterns.push('trails_off');
    }

    if (/[A-Z]{2,}/i.test(dialogue)) {
      patterns.push('emphasizes_words');
    }

    return patterns;
  }

  private detectEmotion(dialogue: string): string {
    const lowerDialogue = dialogue.toLowerCase();

    // Simple emotion detection based on keywords
    if (
      /\b(angry|furious|mad|rage|hate)\b/.test(lowerDialogue) ||
      /!{2,}/.test(dialogue)
    ) {
      return 'angry';
    }

    if (/\b(sad|depressed|unhappy|crying|tears)\b/.test(lowerDialogue)) {
      return 'sad';
    }

    if (/\b(happy|joyful|excited|thrilled|love)\b/.test(lowerDialogue)) {
      return 'happy';
    }

    if (/\b(afraid|scared|frightened|terrified|fear)\b/.test(lowerDialogue)) {
      return 'fearful';
    }

    if (/\b(confused|puzzled|uncertain|wondering)\b/.test(lowerDialogue) || /\?{2,}/.test(dialogue)) {
      return 'confused';
    }

    return 'neutral';
  }

  private emotionsMatch(detected: string, expected: string): boolean {
    // Exact match
    if (detected === expected) return true;

    // Similar emotions
    const emotionGroups = [
      ['angry', 'furious', 'mad', 'irritated'],
      ['sad', 'depressed', 'unhappy', 'melancholy'],
      ['happy', 'joyful', 'excited', 'pleased'],
      ['fearful', 'afraid', 'scared', 'anxious'],
    ];

    for (const group of emotionGroups) {
      if (group.includes(detected) && group.includes(expected)) {
        return true;
      }
    }

    // Neutral matches with anything mildly
    if (detected === 'neutral' || expected === 'neutral') {
      return true;
    }

    return false;
  }

  private detectFormality(dialogue: string): CharacterProfile['formality_level'] {
    const lowerDialogue = dialogue.toLowerCase();

    // Count formal vs casual markers
    const formalMarkers = [
      'therefore',
      'thus',
      'furthermore',
      'moreover',
      'consequently',
      'additionally',
    ];
    const casualMarkers = ['yeah', 'nah', 'gonna', 'wanna', 'gotta', 'kinda', 'sorta'];

    const formalCount = formalMarkers.filter((m) => lowerDialogue.includes(m)).length;
    const casualCount = casualMarkers.filter((m) => lowerDialogue.includes(m)).length;

    const hasContractions = /\b(I'm|you're|can't|won't|don't)\b/.test(dialogue);

    if (formalCount > casualCount && !hasContractions) {
      return 'very_formal';
    }
    if (formalCount > 0 || !hasContractions) {
      return 'formal';
    }
    if (casualCount > formalCount && hasContractions) {
      return 'very_informal';
    }
    if (casualCount > 0 || hasContractions) {
      return 'informal';
    }

    return 'neutral';
  }

  private getExpectedSentenceLength(pattern: CharacterProfile['typical_sentence_length']): number {
    switch (pattern) {
      case 'short':
        return 7;
      case 'medium':
        return 15;
      case 'long':
        return 25;
      case 'varied':
        return 15;
      default:
        return 15;
    }
  }

  private calculateWordOverlap(words1: string[], words2: string[]): number {
    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1.map((w) => w.toLowerCase()));
    const set2 = new Set(words2.map((w) => w.toLowerCase()));

    const intersection = new Set([...set1].filter((w) => set2.has(w)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  private calculatePatternOverlap(patterns1: string[], patterns2: string[]): number {
    if (patterns1.length === 0 || patterns2.length === 0) return 0;

    const set1 = new Set(patterns1.map((p) => p.toLowerCase()));
    const set2 = new Set(patterns2.map((p) => p.toLowerCase()));

    const intersection = new Set([...set1].filter((p) => set2.has(p)));

    return intersection.size / Math.max(set1.size, set2.size);
  }

  private calculateSimilarityScore(issues: VoiceIssue[]): number {
    if (issues.length === 0) return 1.0;

    // Deduct points based on severity
    let deduction = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          deduction += 0.15;
          break;
        case 'medium':
          deduction += 0.08;
          break;
        case 'low':
          deduction += 0.03;
          break;
      }
    }

    return Math.max(0, 1.0 - deduction);
  }

  private generateSuggestions(issues: VoiceIssue[], profile: CharacterProfile): string[] {
    const suggestions = issues.map((issue) => issue.suggestion).filter((s) => s !== undefined);

    // Add general suggestions
    if (issues.some((i) => i.type === 'vocabulary')) {
      suggestions.push(
        `Match vocabulary to ${profile.vocabulary_level} level (${profile.education_level} education)`
      );
    }

    if (issues.some((i) => i.type === 'formality')) {
      suggestions.push(`Maintain ${profile.formality_level} formality throughout`);
    }

    return suggestions as string[];
  }

  private findSimplerAlternative(word: string): string {
    const alternatives: Record<string, string> = {
      subsequently: 'then',
      nevertheless: 'but',
      furthermore: 'also',
      consequently: 'so',
    };

    return alternatives[word.toLowerCase()] || 'simpler word';
  }

  private findSophisticatedAlternative(word: string): string {
    const alternatives: Record<string, string> = {
      good: 'excellent',
      bad: 'dreadful',
      nice: 'pleasant',
      stuff: 'items',
    };

    return alternatives[word.toLowerCase()] || 'more sophisticated word';
  }

  private extractWords(text: string): string[] {
    return (text.match(/\b\w+\b/g) || []).filter((w) => w.length > 0);
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sd) => sum + sd, 0) / numbers.length;
  }
}
