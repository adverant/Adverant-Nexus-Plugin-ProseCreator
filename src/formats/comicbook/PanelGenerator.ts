/**
 * Panel Generator
 * AI-powered comic panel generation from prose beats
 */

import { getMageAgentClient } from '../../agents/MageAgentClient';
import {
  Beat,
  Moment,
  ComicPanel,
  ComicPage,
  GeneratedPanels,
  ComicStyle,
  PanelSize,
  ShotType,
  CameraAngle,
  ComicCharacter,
  Dialogue,
  SoundEffect,
  PanelComposition
} from './types';

export class PanelGenerator {
  private mageAgent = getMageAgentClient();

  /**
   * Generate comic panels from a narrative beat
   */
  async generatePanelsFromBeat(params: {
    beat: Beat;
    target_pages: number;
    style: ComicStyle;
  }): Promise<GeneratedPanels> {
    // Step 1: Identify key moments in the beat
    const moments = this.identifyKeyMoments(params.beat);

    // Step 2: Calculate panel count (typical: 5-7 panels per page)
    const targetPanels = params.target_pages * 6; // Average of 6 panels/page
    const selectedMoments = this.selectMoments(moments, targetPanels);

    // Step 3: Generate panels with AI composition
    const panels: ComicPanel[] = [];
    for (let i = 0; i < selectedMoments.length; i++) {
      const panel = await this.generatePanel(
        selectedMoments[i],
        params.style,
        i + 1
      );
      panels.push(panel);
    }

    // Step 4: Optimize page layout
    const pages = this.layoutPanels(panels, params.target_pages);

    return {
      pages,
      total_panels: panels.length,
      avg_panels_per_page: panels.length / params.target_pages,
      style: params.style
    };
  }

  /**
   * Identify key visual moments from narrative beat
   */
  private identifyKeyMoments(beat: Beat): Moment[] {
    const moments: Moment[] = [];

    // Use existing moments if provided
    if (beat.moments && beat.moments.length > 0) {
      return beat.moments;
    }

    // Otherwise, parse description to extract moments
    // This is a simplified version - in production, would use NLP
    const sentences = beat.description
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
      moments.push({
        description: sentence.trim(),
        characters: this.extractCharacters(sentence),
        action: this.extractAction(sentence),
        emotion: this.inferEmotion(sentence),
        importance: this.calculateImportance(sentence),
        dialogue: this.extractDialogue(sentence)
      });
    }

    return moments;
  }

  /**
   * Select moments to visualize based on target panel count
   */
  private selectMoments(moments: Moment[], targetCount: number): Moment[] {
    if (moments.length <= targetCount) {
      return moments;
    }

    // Sort by importance
    const sorted = [...moments].sort((a, b) => b.importance - a.importance);

    // Take most important moments
    const selected = sorted.slice(0, targetCount);

    // Re-sort by original order
    return selected.sort(
      (a, b) => moments.indexOf(a) - moments.indexOf(b)
    );
  }

  /**
   * Generate a comic panel with AI assistance
   */
  private async generatePanel(
    moment: Moment,
    style: ComicStyle,
    panelNumber: number
  ): Promise<ComicPanel> {
    try {
      // Use MageAgent for panel composition
      const aiComposition = await this.mageAgent.orchestrate({
        task: 'design comic panel composition',
        context: {
          description: moment.description,
          characters: moment.characters,
          action: moment.action,
          emotion: moment.emotion,
          style: style,
          panel_number: panelNumber
        },
        maxAgents: 2,
        timeout: 15000
      });

      // Parse AI response
      const composition = this.parseCompositionResponse(aiComposition.result);

      // Build panel
      const panel: ComicPanel = {
        number: panelNumber,
        size: this.determineSize(moment.importance),
        description: this.generatePanelDescription(moment, composition),
        artDirection: this.generateArtDirectionText(composition, style),
        composition: composition,
        characters: this.generateCharacters(moment, composition),
        location: this.inferLocation(moment.description),
        time: undefined,
        captions: moment.narration ? [moment.narration] : [],
        dialogue: this.generateDialogue(moment),
        sfx: this.identifySFX(moment)
      };

      return panel;
    } catch (error) {
      // Fallback to rule-based generation
      console.warn('AI panel generation failed, using fallback:', error);
      return this.generatePanelFallback(moment, style, panelNumber);
    }
  }

  /**
   * Parse AI composition response
   */
  private parseCompositionResponse(result: any): PanelComposition {
    // Extract composition from AI response
    const data = typeof result === 'string' ? JSON.parse(result) : result;

    return {
      shotType: this.normalizeShotType(data.shot_type || data.shotType || 'medium-shot'),
      angle: this.normalizeCameraAngle(data.angle || 'eye-level'),
      perspective: data.perspective || 'two-point',
      focalPoint: data.focal_point || data.focalPoint || { x: 0.5, y: 0.5 },
      lighting: data.lighting
        ? {
            type: data.lighting.type || 'natural',
            direction: data.lighting.direction || 45,
            intensity: data.lighting.intensity || 0.7
          }
        : undefined
    };
  }

  /**
   * Generate panel description combining moment and composition
   */
  private generatePanelDescription(
    moment: Moment,
    composition: PanelComposition
  ): string {
    const parts: string[] = [];

    // Add composition context
    parts.push(`${this.humanize(composition.shotType)} of`);

    // Add character context
    if (moment.characters.length > 0) {
      parts.push(moment.characters.join(' and '));
    }

    // Add action/description
    parts.push(moment.description);

    return parts.join(' ');
  }

  /**
   * Generate art direction text
   */
  private generateArtDirectionText(
    composition: PanelComposition,
    style: ComicStyle
  ): string {
    const directions: string[] = [];

    // Style-specific notes
    switch (style) {
      case 'manga':
        directions.push('Manga style with screentones and speed lines');
        break;
      case 'european':
        directions.push('European BD style with detailed backgrounds');
        break;
      case 'indie':
        directions.push('Indie/alternative style with experimental layouts');
        break;
      default:
        directions.push('Traditional American comic style');
    }

    // Composition notes
    directions.push(
      `${this.humanize(composition.shotType)}, ${this.humanize(composition.angle)}`
    );

    // Lighting
    if (composition.lighting) {
      directions.push(`${composition.lighting.type} lighting`);
    }

    return directions.join('. ');
  }

  /**
   * Generate character placements
   */
  private generateCharacters(
    moment: Moment,
    composition: PanelComposition
  ): ComicCharacter[] {
    return moment.characters.map((name, index) => ({
      name,
      expression: this.determineExpression(name, moment.emotion),
      pose: this.determinePose(name, moment.action),
      position: this.calculateCharacterPosition(index, moment.characters.length),
      facing: index % 2 === 0 ? 'right' : 'left' // Alternate for natural conversation
    }));
  }

  /**
   * Generate dialogue from moment
   */
  private generateDialogue(moment: Moment): Dialogue[] {
    if (!moment.dialogue || moment.dialogue.length === 0) {
      return [];
    }

    return moment.dialogue.map((text, index) => ({
      character: moment.characters[index % moment.characters.length] || 'Unknown',
      text: text,
      thought: this.isThought(text),
      whisper: this.isWhisper(text),
      shout: this.isShout(text),
      narration: false,
      offPanel: false
    }));
  }

  /**
   * Identify sound effects in moment
   */
  private identifySFX(moment: Moment): SoundEffect[] {
    const sfxPatterns = [
      { pattern: /\b(bang|boom|crash|smash|pow|zap|thud)\b/i, style: 'bold' as const },
      { pattern: /\b(whoosh|swish|swoosh)\b/i, style: 'curved' as const },
      { pattern: /\b(crack|snap|pop)\b/i, style: 'jagged' as const },
      { pattern: /\b(whisper|hush|shh)\b/i, style: 'whisper' as const }
    ];

    const sfx: SoundEffect[] = [];
    const text = moment.description.toLowerCase();

    for (const { pattern, style } of sfxPatterns) {
      const match = text.match(pattern);
      if (match) {
        sfx.push({
          text: match[1].toUpperCase(),
          style,
          position: { x: 0.5, y: 0.3 },
          size: 1.0
        });
      }
    }

    return sfx;
  }

  /**
   * Layout panels into pages
   */
  private layoutPanels(panels: ComicPanel[], targetPages: number): ComicPage[] {
    const pages: ComicPage[] = [];
    const panelsPerPage = Math.ceil(panels.length / targetPages);

    for (let i = 0; i < panels.length; i += panelsPerPage) {
      const pagePanels = panels.slice(i, i + panelsPerPage);
      pages.push({
        pageNumber: pages.length + 1,
        panels: pagePanels
      });
    }

    return pages;
  }

  /**
   * Fallback panel generation without AI
   */
  private generatePanelFallback(
    moment: Moment,
    style: ComicStyle,
    panelNumber: number
  ): ComicPanel {
    return {
      number: panelNumber,
      size: this.determineSize(moment.importance),
      description: moment.description,
      artDirection: `${this.humanize(style)} style. Standard composition.`,
      composition: {
        shotType: 'medium-shot',
        angle: 'eye-level',
        perspective: 'two-point',
        focalPoint: { x: 0.5, y: 0.5 }
      },
      characters: moment.characters.map((name, index) => ({
        name,
        expression: 'neutral',
        pose: 'standing',
        position: this.calculateCharacterPosition(index, moment.characters.length),
        facing: 'forward'
      })),
      location: this.inferLocation(moment.description),
      captions: moment.narration ? [moment.narration] : [],
      dialogue: this.generateDialogue(moment),
      sfx: this.identifySFX(moment)
    };
  }

  // Helper methods

  private determineSize(importance: number): PanelSize {
    if (importance >= 0.9) return 'full-page';
    if (importance >= 0.7) return 'large';
    if (importance >= 0.4) return 'medium';
    return 'small';
  }

  private determineExpression(character: string, emotion: string): string {
    const emotionMap: Record<string, string> = {
      happy: 'smiling',
      sad: 'frowning',
      angry: 'scowling',
      surprised: 'eyes wide',
      scared: 'fearful',
      neutral: 'neutral'
    };

    return emotionMap[emotion.toLowerCase()] || 'neutral';
  }

  private determinePose(character: string, action: string): string {
    if (action.includes('run') || action.includes('chase')) return 'running';
    if (action.includes('fight') || action.includes('punch')) return 'fighting stance';
    if (action.includes('sit')) return 'sitting';
    if (action.includes('fall')) return 'falling';
    if (action.includes('jump')) return 'jumping';
    return 'standing';
  }

  private calculateCharacterPosition(
    index: number,
    total: number
  ): { x: number; y: number } {
    const spacing = 1 / (total + 1);
    return {
      x: spacing * (index + 1),
      y: 0.5
    };
  }

  private calculateImportance(text: string): number {
    let importance = 0.5;

    // Action words increase importance
    if (/\b(explode|crash|reveal|discover|realize)\b/i.test(text)) {
      importance += 0.3;
    }

    // Emotional words increase importance
    if (/\b(love|hate|fear|joy|terror)\b/i.test(text)) {
      importance += 0.2;
    }

    // Length suggests importance
    if (text.length > 100) {
      importance += 0.1;
    }

    return Math.min(1.0, importance);
  }

  private extractCharacters(text: string): string[] {
    // Simplified - would use NER in production
    const properNouns = text.match(/\b[A-Z][a-z]+\b/g) || [];
    return [...new Set(properNouns)];
  }

  private extractAction(text: string): string {
    // Extract verbs - simplified version
    const actionWords = text.match(/\b(run|walk|fight|speak|look|grab|throw|jump)\w*\b/gi);
    return actionWords ? actionWords.join(', ') : 'standing';
  }

  private inferEmotion(text: string): string {
    const emotions = {
      happy: /\b(smile|laugh|joy|happy|glad)\b/i,
      sad: /\b(cry|tear|sad|sorrow|grief)\b/i,
      angry: /\b(angry|rage|furious|mad|hate)\b/i,
      scared: /\b(fear|afraid|terror|scared|panic)\b/i,
      surprised: /\b(surprise|shock|amaze|astonish)\b/i
    };

    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(text)) return emotion;
    }

    return 'neutral';
  }

  private extractDialogue(text: string): string[] | undefined {
    const matches = text.match(/"([^"]+)"/g);
    return matches?.map(m => m.slice(1, -1));
  }

  private inferLocation(text: string): string {
    const locations = [
      'office',
      'street',
      'home',
      'car',
      'restaurant',
      'park',
      'building',
      'room'
    ];

    for (const location of locations) {
      if (text.toLowerCase().includes(location)) {
        return location;
      }
    }

    return 'interior';
  }

  private isThought(text: string): boolean {
    return /\bthink|thought|wonder|imagine\b/i.test(text);
  }

  private isWhisper(text: string): boolean {
    return /\bwhisper|quietly|softly\b/i.test(text);
  }

  private isShout(text: string): boolean {
    return /\bshout|yell|scream|roar\b/i.test(text) || text.includes('!');
  }

  private normalizeShotType(type: string): ShotType {
    const normalized = type.toLowerCase().replace(/\s+/g, '-');
    const validTypes: ShotType[] = [
      'extreme-close-up',
      'close-up',
      'medium-shot',
      'full-shot',
      'long-shot',
      'establishing-shot',
      'over-shoulder',
      'point-of-view',
      'bird-eye',
      'worm-eye'
    ];

    return validTypes.includes(normalized as ShotType)
      ? (normalized as ShotType)
      : 'medium-shot';
  }

  private normalizeCameraAngle(angle: string): CameraAngle {
    const normalized = angle.toLowerCase().replace(/\s+/g, '-');
    const validAngles: CameraAngle[] = [
      'eye-level',
      'high-angle',
      'low-angle',
      'dutch-angle',
      'overhead',
      'ground-level'
    ];

    return validAngles.includes(normalized as CameraAngle)
      ? (normalized as CameraAngle)
      : 'eye-level';
  }

  private humanize(text: string): string {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
