/**
 * NexusProseCreator - Prompt Builder
 *
 * Constructs detailed prompts with injected context for beat generation
 */

import {
  BeatBlueprint,
  InjectedContext,
  PromptComponents,
  PromptBuildOptions,
  StyleProfile,
  CharacterProfile,
  PlotThread,
  WorldRule,
} from './types';

export class PromptBuilder {
  private readonly defaultOptions: PromptBuildOptions = {
    includeCharacterVoices: true,
    includePlotContext: true,
    includeWorldRules: true,
    includePreviousBeats: 2,
    includeStyleExamples: true,
    maxContextTokens: 8000,
  };

  /**
   * Build a complete prompt for beat generation
   */
  buildBeatPrompt(
    blueprint: BeatBlueprint,
    context: InjectedContext,
    options?: Partial<PromptBuildOptions>
  ): PromptComponents {
    const opts = { ...this.defaultOptions, ...options };

    return {
      systemPrompt: this.buildSystemPrompt(context.styleProfile),
      contextPrompt: this.buildContextPrompt(context, opts),
      taskPrompt: this.buildTaskPrompt(blueprint),
      stylePrompt: this.buildStylePrompt(context.styleProfile),
      constraintsPrompt: this.buildConstraintsPrompt(blueprint, context),
      examplesPrompt: opts.includeStyleExamples
        ? this.buildExamplesPrompt(context)
        : undefined,
    };
  }

  /**
   * Combine all prompt components into a single prompt string
   */
  combinePromptComponents(components: PromptComponents): string {
    const parts: string[] = [
      `<system>\n${components.systemPrompt}\n</system>`,
      `<context>\n${components.contextPrompt}\n</context>`,
      `<task>\n${components.taskPrompt}\n</task>`,
      `<style>\n${components.stylePrompt}\n</style>`,
      `<constraints>\n${components.constraintsPrompt}\n</constraints>`,
    ];

    if (components.examplesPrompt) {
      parts.push(`<examples>\n${components.examplesPrompt}\n</examples>`);
    }

    return parts.join('\n\n');
  }

  /**
   * Build system prompt defining the AI's role
   */
  private buildSystemPrompt(styleProfile: StyleProfile): string {
    return `You are a master creative writer with expertise in crafting best-selling fiction. Your writing is:

1. **Undetectable as AI**: Natural variation, human imperfections, authentic voice
2. **Perfectly Consistent**: Maintains continuity with all established plot, characters, and world rules
3. **Emotionally Resonant**: Creates genuine emotional connections with readers
4. **Genre-Appropriate**: Follows genre conventions while bringing fresh perspective
5. **Show, Don't Tell**: Uses vivid sensory details and action rather than exposition

You write in ${styleProfile.pov} POV, ${styleProfile.tense} tense.

Your prose is characterized by:
- Average sentence length: ${styleProfile.avgSentenceLength} words
- Vocabulary level: ${styleProfile.vocabularyLevel}
- Tone: ${styleProfile.tone}
- ${Math.round(styleProfile.dialogueRatio * 100)}% dialogue ratio

CRITICAL: You must maintain perfect continuity with all provided context. Never contradict established facts.`;
  }

  /**
   * Build context prompt with memory, characters, plot, world
   */
  private buildContextPrompt(
    context: InjectedContext,
    options: PromptBuildOptions
  ): string {
    const sections: string[] = [];

    // Previous beats for continuity
    if (options.includePreviousBeats > 0 && context.previous_beats.length > 0) {
      const recentBeats = context.previous_beats.slice(-options.includePreviousBeats);
      sections.push(this.formatPreviousBeats(recentBeats));
    }

    // Active plot threads
    if (options.includePlotContext && context.activePlotThreads.length > 0) {
      sections.push(this.formatPlotThreads(context.activePlotThreads));
    }

    // Character information
    if (options.includeCharacterVoices && Object.keys(context.characterProfiles).length > 0) {
      sections.push(this.formatCharacterProfiles(context.characterProfiles));
    }

    // World rules and state
    if (options.includeWorldRules) {
      sections.push(this.formatWorldContext(context));
    }

    // Pending foreshadowing
    if (context.pendingForeshadowing.length > 0) {
      sections.push(this.formatForeshadowing(context.pendingForeshadowing));
    }

    return sections.join('\n\n');
  }

  /**
   * Build task prompt describing what to write
   */
  private buildTaskPrompt(blueprint: BeatBlueprint): string {
    return `Write Beat #${blueprint.beat_number} (${blueprint.beat_type.toUpperCase()}):

**Scene Goal**: ${blueprint.scene_goal}

**Description**: ${blueprint.description}

**Characters Present**: ${blueprint.characters_present.join(', ')}

**Location**: ${blueprint.location}

${blueprint.pov_character ? `**POV Character**: ${blueprint.pov_character}\n` : ''}
**Emotional Tone**: ${blueprint.emotional_tone}

${blueprint.conflict ? `**Conflict**: ${blueprint.conflict}\n` : ''}
${blueprint.resolution ? `**Resolution**: ${blueprint.resolution}\n` : ''}
**Target Word Count**: ${blueprint.target_word_count} words

**Active Plot Threads**: ${blueprint.plot_threads_active.join(', ')}`;
  }

  /**
   * Build style prompt with specific writing guidelines
   */
  private buildStylePrompt(styleProfile: StyleProfile): string {
    const guidelines: string[] = [
      `**Narrative POV**: ${this.formatPOV(styleProfile.pov)}`,
      `**Tense**: ${styleProfile.tense}`,
      `**Tone**: ${styleProfile.tone}`,
      `**Vocabulary**: ${styleProfile.vocabularyLevel}`,
    ];

    if (styleProfile.literaryDevices.length > 0) {
      guidelines.push(`**Literary Devices**: ${styleProfile.literaryDevices.join(', ')}`);
    }

    guidelines.push(`**Paragraph Style**: ${styleProfile.paragraphLengthPattern}`);
    guidelines.push(`**Sentence Variety**: High (${styleProfile.sentenceStartVariety}/10)`);
    guidelines.push(`**Transitions**: ${styleProfile.transitionStyle}`);

    return `Writing Style Guidelines:\n\n${guidelines.join('\n')}

**CRITICAL STYLE RULES**:
- Vary sentence length (5-${styleProfile.avgSentenceLength * 2} words)
- Mix sentence types (simple, compound, complex, compound-complex)
- Use sensory details (sight, sound, smell, touch, taste)
- Show emotion through action and dialogue, not exposition
- Avoid clichés and AI-typical phrases ("delve", "tapestry", "testament")
- Create unique, fresh metaphors
- Use contractions in dialogue for natural speech
- Vary paragraph length for rhythm and pacing`;
  }

  /**
   * Build constraints prompt with continuity requirements
   */
  private buildConstraintsPrompt(blueprint: BeatBlueprint, context: InjectedContext): string {
    const constraints: string[] = [
      '**ABSOLUTE REQUIREMENTS**:',
      '',
      '1. **Continuity**: Never contradict established facts from context',
      '2. **Character Consistency**: Maintain each character\'s established voice and personality',
      '3. **World Rules**: Respect all established magic/tech/physics rules',
      '4. **Timeline**: Events must be temporally consistent',
      `5. **Location**: Scene takes place in ${blueprint.location}`,
      `6. **Characters**: Only ${blueprint.characters_present.join(', ')} should appear`,
    ];

    // Add world rule constraints
    const relevantRules = context.memory.worldRules.filter(
      (rule) => this.isRuleRelevantToBeat(rule, blueprint)
    );
    if (relevantRules.length > 0) {
      constraints.push('', '**Active World Rules**:');
      relevantRules.forEach((rule) => {
        constraints.push(`- ${rule.category.toUpperCase()}: ${rule.rule}`);
        if (rule.limitations.length > 0) {
          constraints.push(`  Limitations: ${rule.limitations.join('; ')}`);
        }
      });
    }

    // Add plot thread constraints
    if (blueprint.plot_threads_active.length > 0) {
      constraints.push('', '**Plot Threads to Advance**:');
      blueprint.plot_threads_active.forEach((threadName) => {
        const thread = context.activePlotThreads.find((t) => t.name === threadName);
        if (thread) {
          constraints.push(`- ${thread.name}: ${thread.description}`);
          constraints.push(`  Status: ${thread.status}`);
        }
      });
    }

    constraints.push(
      '',
      '**FORBIDDEN**:',
      '- Do NOT add new characters without explicit instruction',
      '- Do NOT change established character personalities or backstories',
      '- Do NOT introduce new world rules without instruction',
      '- Do NOT resolve plot threads unless instructed',
      '- Do NOT use AI-typical phrases or clichés',
      '- Do NOT write meta-commentary or break the fourth wall'
    );

    return constraints.join('\n');
  }

  /**
   * Build examples prompt with style samples
   */
  private buildExamplesPrompt(context: InjectedContext): string {
    if (context.previous_beats.length === 0) {
      return 'No previous examples available. This is the beginning of the story.';
    }

    const examples = context.previous_beats.slice(-2).map((beat, index) => {
      return `**Example ${index + 1}** (Chapter ${beat.chapter}, Beat ${beat.beat}):\n${beat.content}`;
    });

    return `Previous Writing Samples (for style reference):\n\n${examples.join('\n\n---\n\n')}

Match the style, tone, and quality of these examples while creating fresh, original content.`;
  }

  // ====================================================================
  // FORMATTING HELPERS
  // ====================================================================

  private formatPreviousBeats(
    beats: Array<{ chapter: number; beat: number; content: string }>
  ): string {
    const formatted = beats.map((beat) => {
      return `**Chapter ${beat.chapter}, Beat ${beat.beat}**:\n${beat.content}`;
    });

    return `**Story So Far** (Previous Beats):\n\n${formatted.join('\n\n---\n\n')}`;
  }

  private formatPlotThreads(threads: PlotThread[]): string {
    const formatted = threads.map((thread) => {
      return `- **${thread.name}** (${thread.importance}, ${thread.status})
  ${thread.description}
  Characters: ${thread.involved_characters.join(', ')}
  Key Events: ${thread.key_events.join('; ')}${
    thread.foreshadowing.length > 0
      ? `\n  Foreshadowing: ${thread.foreshadowing.join('; ')}`
      : ''
  }`;
    });

    return `**Active Plot Threads**:\n\n${formatted.join('\n\n')}`;
  }

  private formatCharacterProfiles(profiles: Record<string, CharacterProfile>): string {
    const formatted = Object.entries(profiles).map(([name, profile]) => {
      return `**${name}**:
- Education: ${profile.education_level}
- Vocabulary: ${profile.vocabulary_level}
- Formality: ${profile.formality_level}
- Sentence Style: ${profile.typical_sentence_length}
- Uses Contractions: ${profile.uses_contractions ? 'Yes' : 'No'}
- Current Emotion: ${profile.current_emotional_state}
- Speech Patterns: ${profile.speech_patterns.join('; ')}${
  profile.catchphrases.length > 0 ? `\n- Catchphrases: ${profile.catchphrases.join('; ')}` : ''
}${
  profile.speaking_quirks.length > 0
    ? `\n- Speaking Quirks: ${profile.speaking_quirks.join('; ')}`
    : ''
}`;
    });

    return `**Character Voice Profiles**:\n\n${formatted.join('\n\n')}`;
  }

  private formatWorldContext(context: InjectedContext): string {
    const sections: string[] = ['**World Context**:'];

    // World state
    if (context.worldState) {
      const state = context.worldState;
      sections.push('');
      sections.push('**Current World State**:');
      if (state.current_date) sections.push(`- Date: ${state.current_date}`);
      if (state.season) sections.push(`- Season: ${state.season}`);
      if (state.time_of_day) sections.push(`- Time: ${state.time_of_day}`);
      if (state.weather) sections.push(`- Weather: ${state.weather}`);
      if (state.political_situation) sections.push(`- Politics: ${state.political_situation}`);
      if (state.recent_events.length > 0) {
        sections.push(`- Recent Events: ${state.recent_events.join('; ')}`);
      }
    }

    // World rules
    if (context.memory.worldRules.length > 0) {
      sections.push('');
      sections.push('**World Rules**:');
      context.memory.worldRules.forEach((rule) => {
        sections.push(`- ${rule.category.toUpperCase()}: ${rule.rule}`);
        if (rule.limitations.length > 0) {
          sections.push(`  Limitations: ${rule.limitations.join('; ')}`);
        }
      });
    }

    // Locations
    if (context.memory.locations.length > 0) {
      sections.push('');
      sections.push('**Known Locations**:');
      context.memory.locations.forEach((loc) => {
        sections.push(`- ${loc.name} (${loc.type}): ${loc.description}`);
        if (loc.atmosphere) sections.push(`  Atmosphere: ${loc.atmosphere}`);
        if (loc.notable_features.length > 0) {
          sections.push(`  Features: ${loc.notable_features.join('; ')}`);
        }
      });
    }

    return sections.join('\n');
  }

  private formatForeshadowing(foreshadowing: string[]): string {
    return `**Pending Foreshadowing** (subtly integrate if relevant):\n\n${foreshadowing
      .map((item) => `- ${item}`)
      .join('\n')}

Note: Foreshadowing should be subtle and natural, not forced.`;
  }

  private formatPOV(pov: string): string {
    switch (pov) {
      case 'first_person':
        return 'First Person (I/we)';
      case 'second_person':
        return 'Second Person (you)';
      case 'third_person_limited':
        return 'Third Person Limited (he/she, one character\'s perspective)';
      case 'third_person_omniscient':
        return 'Third Person Omniscient (he/she, multiple perspectives)';
      default:
        return pov;
    }
  }

  /**
   * Check if a world rule is relevant to the current beat
   */
  private isRuleRelevantToBeat(rule: WorldRule, blueprint: BeatBlueprint): boolean {
    // Magic/tech rules relevant for action beats
    if (
      blueprint.beat_type === 'action' &&
      (rule.category === 'magic' || rule.category === 'technology')
    ) {
      return true;
    }

    // Social/political rules relevant for dialogue
    if (
      blueprint.beat_type === 'dialogue' &&
      (rule.category === 'social' || rule.category === 'political')
    ) {
      return true;
    }

    // Physics rules always relevant
    if (rule.category === 'physics') {
      return true;
    }

    return false;
  }

  /**
   * Estimate token count for a prompt (rough approximation)
   */
  estimateTokenCount(prompt: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(prompt.length / 4);
  }

  /**
   * Truncate context to fit within token limit
   */
  truncateContext(components: PromptComponents, maxTokens: number): PromptComponents {
    const fullPrompt = this.combinePromptComponents(components);
    const estimatedTokens = this.estimateTokenCount(fullPrompt);

    if (estimatedTokens <= maxTokens) {
      return components; // No truncation needed
    }

    // Truncation strategy: Remove examples first, then reduce previous beats
    const truncated = { ...components };

    // Remove examples
    if (truncated.examplesPrompt) {
      truncated.examplesPrompt = undefined;
      const newPrompt = this.combinePromptComponents(truncated);
      if (this.estimateTokenCount(newPrompt) <= maxTokens) {
        return truncated;
      }
    }

    // Further truncation would require more sophisticated logic
    // For now, return truncated version and log warning
    console.warn(
      `Prompt exceeds token limit (${estimatedTokens} > ${maxTokens}). Consider reducing context.`
    );
    return truncated;
  }
}
