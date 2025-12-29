/**
 * NexusProseCreator - Continuity Validator
 *
 * Validates generated content for continuity violations
 * Target: 95%+ continuity score
 */

import {
  BeatBlueprint,
  InjectedContext,
  ContinuityValidation,
  ContinuityIssue,
  ContinuityWarning,
  ContinuityIssueType,
  Character,
  PlotThread,
  WorldRule,
  Location,
} from './types';

export class ContinuityValidator {
  /**
   * Validate generated content against blueprint and context
   */
  async validate(params: {
    content: string;
    context: InjectedContext;
    blueprint: BeatBlueprint;
  }): Promise<ContinuityValidation> {
    const { content, context, blueprint } = params;
    const issues: ContinuityIssue[] = [];
    const warnings: ContinuityWarning[] = [];

    // Run all validation checks in parallel
    const [
      characterIssues,
      locationIssues,
      plotThreadIssues,
      worldRuleIssues,
      timelineIssues,
      characterStateIssues,
      voiceIssues,
      toneIssues,
    ] = await Promise.all([
      this.validateCharacters(content, blueprint, context),
      this.validateLocation(content, blueprint, context),
      this.validatePlotThreads(content, blueprint, context),
      this.validateWorldRules(content, context),
      this.validateTimeline(content, context),
      this.validateCharacterStates(content, context),
      this.validateCharacterVoices(content, context),
      this.validateTone(content, blueprint),
    ]);

    // Combine all issues
    issues.push(
      ...characterIssues,
      ...locationIssues,
      ...plotThreadIssues,
      ...worldRuleIssues,
      ...timelineIssues,
      ...characterStateIssues,
      ...voiceIssues,
      ...toneIssues
    );

    // Calculate overall continuity score
    const score = this.calculateContinuityScore(issues);

    // Generate warnings for potential issues
    warnings.push(...this.generateWarnings(content, context, blueprint));

    return {
      is_valid: issues.length === 0,
      score,
      issues,
      warnings,
    };
  }

  // ====================================================================
  // CHARACTER VALIDATION
  // ====================================================================

  private async validateCharacters(
    content: string,
    blueprint: BeatBlueprint,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Extract character names mentioned in content
    const mentionedCharacters = this.extractCharacterNames(content, context);

    // Check for unexpected characters
    for (const characterName of mentionedCharacters) {
      if (!blueprint.characters_present.includes(characterName)) {
        issues.push({
          type: 'unexpected_character',
          severity: 'medium',
          message: `Character "${characterName}" appears but is not listed in blueprint`,
          suggestion: `Either add "${characterName}" to blueprint or remove from content`,
        });
      }
    }

    // Check for missing expected characters
    for (const expectedChar of blueprint.characters_present) {
      if (!mentionedCharacters.includes(expectedChar)) {
        issues.push({
          type: 'missing_character',
          severity: 'high',
          message: `Character "${expectedChar}" is listed in blueprint but doesn't appear in content`,
          suggestion: `Add "${expectedChar}" to the scene or remove from blueprint`,
        });
      }
    }

    return issues;
  }

  private async validateCharacterStates(
    content: string,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    for (const character of context.memory.characters) {
      // Check if dead character appears
      if (
        character.current_state.physical_state === 'dead' &&
        content.toLowerCase().includes(character.name.toLowerCase())
      ) {
        issues.push({
          type: 'character_state_conflict',
          severity: 'critical',
          message: `Character "${character.name}" is dead but appears in content`,
          suggestion: `Remove "${character.name}" or explain as flashback/memory`,
        });
      }

      // Check for physical state inconsistencies
      if (character.current_state.physical_state === 'injured') {
        // Check if they're performing actions that would be difficult with injury
        const athleticActions = ['ran', 'jumped', 'fought', 'climbed'];
        for (const action of athleticActions) {
          const regex = new RegExp(
            `${character.name}\\s+(${action}|${action.slice(0, -2)})`,
            'i'
          );
          if (regex.test(content)) {
            issues.push({
              type: 'character_state_conflict',
              severity: 'medium',
              message: `Character "${character.name}" is injured but performing strenuous action "${action}"`,
              suggestion: `Acknowledge injury or adjust action to be less strenuous`,
            });
          }
        }
      }

      // Check location consistency
      const characterLocation = character.current_state.location;
      if (
        characterLocation &&
        content.toLowerCase().includes(character.name.toLowerCase())
      ) {
        // Character should be in the current scene's location
        // (This is a simplified check - would need more context)
      }
    }

    return issues;
  }

  private async validateCharacterVoices(
    content: string,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Extract dialogue from content
    const dialogueSegments = this.extractDialogue(content);

    for (const { speaker, dialogue } of dialogueSegments) {
      // Find character profile
      const profile = context.characterProfiles[speaker];
      if (!profile) continue;

      // Check vocabulary level consistency
      const dialogueWords = this.extractWords(dialogue);
      const avgWordLength =
        dialogueWords.reduce((sum, w) => sum + w.length, 0) / dialogueWords.length;

      // Sophisticated characters should use longer words
      if (profile.vocabulary_level === 'sophisticated' && avgWordLength < 4) {
        issues.push({
          type: 'voice_inconsistency',
          severity: 'low',
          message: `"${speaker}"'s dialogue uses simple vocabulary (avg ${avgWordLength.toFixed(1)} letters) but should be sophisticated`,
          suggestion: `Use more complex vocabulary for "${speaker}"`,
        });
      }

      // Simple vocabulary characters shouldn't use complex words
      if (profile.vocabulary_level === 'simple' && avgWordLength > 6) {
        issues.push({
          type: 'voice_inconsistency',
          severity: 'medium',
          message: `"${speaker}"'s dialogue uses complex vocabulary (avg ${avgWordLength.toFixed(1)} letters) but should be simple`,
          suggestion: `Simplify vocabulary for "${speaker}"`,
        });
      }

      // Check contractions usage
      const hasContractions = /\b(I'm|you're|can't|won't|don't)\b/i.test(dialogue);
      if (profile.uses_contractions && !hasContractions && dialogue.split(/\s+/).length > 10) {
        issues.push({
          type: 'voice_inconsistency',
          severity: 'low',
          message: `"${speaker}" typically uses contractions but none found in dialogue`,
          suggestion: `Add contractions to "${speaker}"'s dialogue`,
        });
      }
    }

    return issues;
  }

  // ====================================================================
  // LOCATION VALIDATION
  // ====================================================================

  private async validateLocation(
    content: string,
    blueprint: BeatBlueprint,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Extract location mentions from content
    const mentionedLocations = this.extractLocationNames(content, context);

    // Check if blueprint location is mentioned or implied
    const blueprintLocation = blueprint.location.toLowerCase();
    const contentLower = content.toLowerCase();

    if (!contentLower.includes(blueprintLocation) && mentionedLocations.length === 0) {
      issues.push({
        type: 'location_inconsistency',
        severity: 'low',
        message: `Blueprint specifies location "${blueprint.location}" but it's not clearly established in content`,
        suggestion: `Add location details for "${blueprint.location}"`,
      });
    }

    // Check for conflicting locations
    for (const mentionedLoc of mentionedLocations) {
      if (mentionedLoc.toLowerCase() !== blueprintLocation && mentionedLoc !== blueprint.location) {
        issues.push({
          type: 'location_inconsistency',
          severity: 'high',
          message: `Content mentions location "${mentionedLoc}" but blueprint specifies "${blueprint.location}"`,
          suggestion: `Change location to "${blueprint.location}" or update blueprint`,
        });
      }
    }

    return issues;
  }

  // ====================================================================
  // PLOT THREAD VALIDATION
  // ====================================================================

  private async validatePlotThreads(
    content: string,
    blueprint: BeatBlueprint,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Check that active plot threads are advanced
    for (const threadName of blueprint.plot_threads_active) {
      const thread = context.activePlotThreads.find((t) => t.name === threadName);
      if (!thread) continue;

      // Check if thread is referenced in content
      const threadMentioned =
        content.toLowerCase().includes(threadName.toLowerCase()) ||
        thread.key_events.some((event) => content.toLowerCase().includes(event.toLowerCase()));

      if (!threadMentioned) {
        issues.push({
          type: 'plot_thread_violation',
          severity: 'medium',
          message: `Plot thread "${threadName}" marked as active but not advanced in content`,
          suggestion: `Add content that advances "${threadName}" plot thread`,
        });
      }

      // Check if thread is resolved prematurely
      if (thread.status !== 'resolved' && this.detectResolution(content, thread)) {
        issues.push({
          type: 'plot_thread_violation',
          severity: 'high',
          message: `Plot thread "${threadName}" appears to be resolved but status is "${thread.status}"`,
          suggestion: `Either continue thread or update status to "resolved"`,
        });
      }
    }

    return issues;
  }

  // ====================================================================
  // WORLD RULE VALIDATION
  // ====================================================================

  private async validateWorldRules(
    content: string,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    for (const rule of context.memory.worldRules) {
      // Check for violations (simplified)
      const violations = this.detectRuleViolations(content, rule);
      issues.push(...violations);
    }

    return issues;
  }

  private detectRuleViolations(content: string, rule: WorldRule): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];
    const contentLower = content.toLowerCase();

    // Magic system rules
    if (rule.category === 'magic') {
      // Check limitations are respected
      for (const limitation of rule.limitations) {
        // Look for violations of limitations
        // This is simplified - would need more sophisticated NLP
        if (contentLower.includes('magic') && !contentLower.includes(limitation.toLowerCase())) {
          // Potential violation
          issues.push({
            type: 'world_rule_violation',
            severity: 'medium',
            message: `Magic use in content may violate rule: "${rule.rule}"`,
            suggestion: `Ensure magic usage respects limitation: "${limitation}"`,
          });
        }
      }
    }

    // Technology rules
    if (rule.category === 'technology') {
      // Check for anachronistic technology
      // Simplified check
    }

    // Physics rules
    if (rule.category === 'physics') {
      // Check for impossible actions
      // Simplified check
    }

    return issues;
  }

  // ====================================================================
  // TIMELINE VALIDATION
  // ====================================================================

  private async validateTimeline(
    content: string,
    context: InjectedContext
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Check for temporal inconsistencies
    const timeReferences = this.extractTimeReferences(content);

    for (const timeRef of timeReferences) {
      // Check against world state
      if (context.worldState.current_date) {
        // Validate time reference makes sense
        // This would require sophisticated date parsing
      }
    }

    // Check for impossible timelines (e.g., character in two places at once)
    // This would require more context from previous beats

    return issues;
  }

  // ====================================================================
  // TONE VALIDATION
  // ====================================================================

  private async validateTone(
    content: string,
    blueprint: BeatBlueprint
  ): Promise<ContinuityIssue[]> {
    const issues: ContinuityIssue[] = [];

    // Detect tone from content
    const detectedTone = this.detectTone(content);
    const expectedTone = blueprint.emotional_tone.toLowerCase();

    // Check if tones match
    if (!this.tonesMatch(detectedTone, expectedTone)) {
      issues.push({
        type: 'tone_mismatch',
        severity: 'medium',
        message: `Content tone (${detectedTone}) doesn't match blueprint (${expectedTone})`,
        suggestion: `Adjust content to reflect ${expectedTone} emotional tone`,
      });
    }

    return issues;
  }

  private detectTone(content: string): string {
    const lowerContent = content.toLowerCase();

    // Detect based on keywords and punctuation
    if (/!{2,}/.test(content) || /\b(angry|furious|rage|yell)\b/.test(lowerContent)) {
      return 'angry';
    }

    if (/\b(sad|depressed|tears|crying|sorrow)\b/.test(lowerContent)) {
      return 'sad';
    }

    if (/\b(happy|joy|laugh|smile|delight)\b/.test(lowerContent)) {
      return 'happy';
    }

    if (/\b(tense|nervous|anxious|fear|suspense)\b/.test(lowerContent)) {
      return 'tense';
    }

    if (/\b(dark|grim|ominous|dread)\b/.test(lowerContent)) {
      return 'dark';
    }

    return 'neutral';
  }

  private tonesMatch(detected: string, expected: string): boolean {
    if (detected === expected) return true;

    // Similar tones
    const toneGroups = [
      ['angry', 'furious', 'tense'],
      ['sad', 'melancholic', 'somber'],
      ['happy', 'joyful', 'cheerful'],
      ['dark', 'ominous', 'grim'],
    ];

    for (const group of toneGroups) {
      if (group.includes(detected) && group.includes(expected)) {
        return true;
      }
    }

    return false;
  }

  // ====================================================================
  // WARNING GENERATION
  // ====================================================================

  private generateWarnings(
    content: string,
    context: InjectedContext,
    blueprint: BeatBlueprint
  ): ContinuityWarning[] {
    const warnings: ContinuityWarning[] = [];

    // Warn about new information introduced
    const newCharacters = this.detectNewCharacters(content, context);
    if (newCharacters.length > 0) {
      warnings.push({
        type: 'new_character_detected',
        message: `New character(s) introduced: ${newCharacters.join(', ')}`,
        suggestion: 'Ensure these are intentional additions and add to character database',
      });
    }

    // Warn about potential foreshadowing
    const foreshadowingKeywords = ['soon', 'later', 'eventually', 'one day', 'would'];
    if (foreshadowingKeywords.some((kw) => content.toLowerCase().includes(kw))) {
      warnings.push({
        type: 'potential_foreshadowing',
        message: 'Content may contain foreshadowing',
        suggestion: 'Document foreshadowing for future reference',
      });
    }

    // Warn about word count deviation
    const actualWordCount = this.extractWords(content).length;
    const targetWordCount = blueprint.target_word_count;
    const deviation = Math.abs(actualWordCount - targetWordCount) / targetWordCount;

    if (deviation > 0.2) {
      warnings.push({
        type: 'word_count_deviation',
        message: `Word count (${actualWordCount}) differs from target (${targetWordCount}) by ${Math.round(deviation * 100)}%`,
        suggestion: deviation > 0 ? 'Consider trimming content' : 'Consider expanding content',
      });
    }

    return warnings;
  }

  // ====================================================================
  // SCORE CALCULATION
  // ====================================================================

  private calculateContinuityScore(issues: ContinuityIssue[]): number {
    if (issues.length === 0) return 100;

    // Deduct points based on severity
    let deduction = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          deduction += 25;
          break;
        case 'high':
          deduction += 15;
          break;
        case 'medium':
          deduction += 8;
          break;
        case 'low':
          deduction += 3;
          break;
      }
    }

    return Math.max(0, 100 - deduction);
  }

  // ====================================================================
  // HELPER METHODS
  // ====================================================================

  private extractCharacterNames(content: string, context: InjectedContext): string[] {
    const names: string[] = [];

    for (const character of context.memory.characters) {
      if (content.includes(character.name)) {
        names.push(character.name);
      }
    }

    return names;
  }

  private extractLocationNames(content: string, context: InjectedContext): string[] {
    const locations: string[] = [];

    for (const location of context.memory.locations) {
      if (content.toLowerCase().includes(location.name.toLowerCase())) {
        locations.push(location.name);
      }
    }

    return locations;
  }

  private extractDialogue(content: string): Array<{ speaker: string; dialogue: string }> {
    const segments: Array<{ speaker: string; dialogue: string }> = [];

    // Extract dialogue with attribution
    // Pattern: "dialogue text," Speaker said.
    const dialoguePattern = /[""]([^"""]+)[""],?\s+(\w+)\s+(said|asked|replied|answered|whispered)/gi;

    let match;
    while ((match = dialoguePattern.exec(content)) !== null) {
      segments.push({
        speaker: match[2],
        dialogue: match[1],
      });
    }

    // Also try reverse pattern: Speaker said, "dialogue"
    const reversePattern = /(\w+)\s+(said|asked|replied|answered|whispered),?\s+[""]([^"""]+)[""]/ gi;

    while ((match = reversePattern.exec(content)) !== null) {
      segments.push({
        speaker: match[1],
        dialogue: match[3],
      });
    }

    return segments;
  }

  private detectResolution(content: string, thread: PlotThread): boolean {
    const resolutionKeywords = [
      'finally',
      'resolved',
      'solved',
      'ended',
      'concluded',
      'finished',
      'complete',
    ];

    const contentLower = content.toLowerCase();
    const threadLower = thread.name.toLowerCase();

    // Check if thread name appears near resolution keywords
    for (const keyword of resolutionKeywords) {
      const pattern = new RegExp(`${keyword}.{0,50}${threadLower}|${threadLower}.{0,50}${keyword}`, 'i');
      if (pattern.test(content)) {
        return true;
      }
    }

    return false;
  }

  private extractTimeReferences(content: string): string[] {
    const timePatterns = [
      /\b(yesterday|today|tomorrow|last week|next month)\b/gi,
      /\b(morning|afternoon|evening|night)\b/gi,
      /\b(dawn|dusk|noon|midnight)\b/gi,
      /\b(\d{1,2}:\d{2}\s*(am|pm)?)\b/gi,
    ];

    const references: string[] = [];

    for (const pattern of timePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        references.push(...matches);
      }
    }

    return references;
  }

  private detectNewCharacters(content: string, context: InjectedContext): string[] {
    // Extract proper nouns (simplified - capitalized words not at sentence start)
    const properNouns = content.match(/\s([A-Z][a-z]+)/g) || [];
    const uniqueNouns = [...new Set(properNouns.map((n) => n.trim()))];

    // Filter out known characters
    const knownNames = context.memory.characters.map((c) => c.name);
    const newCharacters = uniqueNouns.filter((noun) => !knownNames.includes(noun));

    return newCharacters;
  }

  private extractWords(text: string): string[] {
    return (text.match(/\b\w+\b/g) || []).filter((w) => w.length > 0);
  }
}
