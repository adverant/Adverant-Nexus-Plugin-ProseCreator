/**
 * Art Direction Generator
 * Generates comprehensive art direction for comic book artists
 */

import { ComicPanel, ComicStyle, ArtDirection } from './types';

export class ArtDirectionGenerator {
  /**
   * Generate complete art direction for comic pages
   */
  async generateArtDirection(params: {
    panels: ComicPanel[];
    style: ComicStyle;
    genre: string;
    tone: string;
  }): Promise<ArtDirection> {
    const overallMood = this.determineOverallMood(params.panels, params.tone);
    const colorPalette = this.generateColorPalette(overallMood, params.style);
    const lightingNotes = this.generateLightingNotes(overallMood, params.genre);
    const referenceArtists = this.suggestReferenceArtists(params.style, params.genre);
    const specialTechniques = this.suggestTechniques(params.style, overallMood);
    const panelNotes = this.generatePanelSpecificNotes(params.panels);

    return {
      overall_mood: overallMood,
      color_palette: colorPalette,
      lighting_notes: lightingNotes,
      reference_artists: referenceArtists,
      special_techniques: specialTechniques,
      panel_specific_notes: panelNotes
    };
  }

  /**
   * Determine overall mood from panels
   */
  private determineOverallMood(panels: ComicPanel[], tone: string): string {
    // Analyze emotional content
    const emotions: Record<string, number> = {};

    for (const panel of panels) {
      const description = panel.description.toLowerCase();

      // Count emotional keywords
      if (/\b(dark|grim|scary|fear|terror)\b/.test(description)) {
        emotions['dark'] = (emotions['dark'] || 0) + 1;
      }
      if (/\b(bright|happy|joy|cheerful)\b/.test(description)) {
        emotions['bright'] = (emotions['bright'] || 0) + 1;
      }
      if (/\b(tense|suspense|anxious|nervous)\b/.test(description)) {
        emotions['tense'] = (emotions['tense'] || 0) + 1;
      }
      if (/\b(action|fight|chase|explosive)\b/.test(description)) {
        emotions['action'] = (emotions['action'] || 0) + 1;
      }
      if (/\b(mysterious|enigmatic|shadowy)\b/.test(description)) {
        emotions['mysterious'] = (emotions['mysterious'] || 0) + 1;
      }
    }

    // Find dominant emotion
    let dominantMood = tone || 'neutral';
    let maxCount = 0;

    for (const [mood, count] of Object.entries(emotions)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    }

    return this.describeMood(dominantMood);
  }

  /**
   * Describe mood in detail
   */
  private describeMood(mood: string): string {
    const moodDescriptions: Record<string, string> = {
      dark: 'Dark and foreboding atmosphere with heavy shadows and muted colors',
      bright: 'Bright and optimistic with vibrant colors and clear lighting',
      tense: 'Tense and suspenseful with dramatic lighting and sharp contrasts',
      action: 'Dynamic and energetic with motion lines and bold compositions',
      mysterious: 'Mysterious and atmospheric with strategic use of shadows',
      neutral: 'Balanced tone with standard lighting and natural colors'
    };

    return moodDescriptions[mood] || moodDescriptions['neutral'];
  }

  /**
   * Generate color palette based on mood and style
   */
  private generateColorPalette(mood: string, style: ComicStyle): string[] {
    const palettes: Record<string, Record<ComicStyle, string[]>> = {
      dark: {
        traditional: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'],
        manga: ['#000000', '#2d2d2d', '#4a4a4a', '#666666', '#ffffff'],
        european: ['#1c1c1c', '#3a3a3a', '#5a5a5a', '#7a7a7a', '#9a9a9a'],
        indie: ['#0d0d0d', '#2a2a2a', '#474747', '#646464', '#818181'],
        web_comic: ['#121212', '#242424', '#363636', '#484848', '#5a5a5a']
      },
      bright: {
        traditional: ['#f7b731', '#5352ed', '#ff6348', '#70a1ff', '#7bed9f'],
        manga: ['#ffffff', '#f5f5f5', '#e0e0e0', '#cccccc', '#b8b8b8'],
        european: ['#ffd700', '#ff6347', '#4169e1', '#32cd32', '#ff1493'],
        indie: ['#ffeb3b', '#ff5722', '#2196f3', '#4caf50', '#e91e63'],
        web_comic: ['#ffcc00', '#ff3366', '#3399ff', '#66cc33', '#ff6699']
      },
      tense: {
        traditional: ['#2c3e50', '#e74c3c', '#34495e', '#c0392b', '#7f8c8d'],
        manga: ['#1a1a1a', '#b71c1c', '#424242', '#d32f2f', '#757575'],
        european: ['#263238', '#d32f2f', '#37474f', '#f44336', '#607d8b'],
        indie: ['#212121', '#c62828', '#424242', '#e53935', '#616161'],
        web_comic: ['#1e1e1e', '#cc0000', '#3a3a3a', '#ff0000', '#5a5a5a']
      },
      action: {
        traditional: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94'],
        manga: ['#000000', '#ffffff', '#ff0000', '#0000ff', '#ffff00'],
        european: ['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6'],
        indie: ['#ff5252', '#448aff', '#ffeb3b', '#69f0ae', '#e040fb'],
        web_comic: ['#ff4444', '#44aaff', '#ffdd44', '#44ff88', '#dd44ff']
      },
      mysterious: {
        traditional: ['#2c2c54', '#40407a', '#706fd3', '#474787', '#aaa69d'],
        manga: ['#0d0d0d', '#1a1a1a', '#2d2d2d', '#404040', '#595959'],
        european: ['#1b1b2f', '#162447', '#1f4068', '#1b1b2f', '#e43f5a'],
        indie: ['#0f0f23', '#1a1a3e', '#252558', '#303073', '#3b3b8e'],
        web_comic: ['#121230', '#1e1e46', '#2a2a5c', '#363672', '#424288']
      }
    };

    const moodKey = mood.split(' ')[0].toLowerCase() as keyof typeof palettes;
    const defaultPalette = ['#000000', '#333333', '#666666', '#999999', '#cccccc'];

    return palettes[moodKey]?.[style] || defaultPalette;
  }

  /**
   * Generate lighting notes
   */
  private generateLightingNotes(mood: string, genre: string): string {
    const notes: string[] = [];

    // Mood-based lighting
    if (mood.includes('dark')) {
      notes.push('Use high contrast with deep shadows');
      notes.push('Rim lighting to separate figures from backgrounds');
      notes.push('Minimal fill light to maintain atmosphere');
    } else if (mood.includes('bright')) {
      notes.push('Use bright, even lighting');
      notes.push('Soft shadows for depth without drama');
      notes.push('Clear visibility of all elements');
    } else if (mood.includes('tense')) {
      notes.push('Dramatic side lighting or backlighting');
      notes.push('Strong shadows to create tension');
      notes.push('Use light to guide eye to focal points');
    } else if (mood.includes('action')) {
      notes.push('Dynamic lighting with motion blur');
      notes.push('Use lighting to emphasize speed and impact');
      notes.push('Varied lighting angles for visual interest');
    } else if (mood.includes('mysterious')) {
      notes.push('Pools of light surrounded by darkness');
      notes.push('Obscure details to maintain mystery');
      notes.push('Use shadows to hide and reveal strategically');
    }

    // Genre-specific additions
    if (genre.toLowerCase().includes('noir')) {
      notes.push('Film noir style: harsh shadows, venetian blind effects');
    } else if (genre.toLowerCase().includes('horror')) {
      notes.push('Under-lighting for unsettling effect');
    } else if (genre.toLowerCase().includes('superhero')) {
      notes.push('Heroic lighting: uplighting, dramatic poses');
    }

    return notes.join('. ');
  }

  /**
   * Suggest reference artists based on style and genre
   */
  private suggestReferenceArtists(style: ComicStyle, genre: string): string[] {
    const artists: Partial<Record<ComicStyle, string[]>> = {
      traditional: [
        'Jack Kirby (dynamic action)',
        'Frank Miller (noir atmosphere)',
        'Jim Lee (detailed linework)',
        'Alex Ross (photorealistic rendering)'
      ],
      manga: [
        'Takehiko Inoue (realistic detail)',
        'Kentaro Miura (intricate backgrounds)',
        'Naoki Urasawa (character expressions)',
        'Akira Toriyama (dynamic composition)'
      ],
      european: [
        'Moebius (imaginative detail)',
        'Enki Bilal (atmospheric color)',
        'Hugo Pratt (expressive linework)',
        'Milo Manara (fluid forms)'
      ],
      indie: [
        'Chris Ware (minimalist precision)',
        'Craig Thompson (emotional expression)',
        'Adrian Tomine (subtle observation)',
        'Daniel Clowes (distinctive style)'
      ]
    };

    return artists[style] || [
      'Study multiple artists for style synthesis',
      'Develop unique visual voice'
    ];
  }

  /**
   * Suggest special techniques
   */
  private suggestTechniques(style: ComicStyle, mood: string): string[] {
    const techniques: string[] = [];

    // Style-specific techniques
    switch (style) {
      case 'manga':
        techniques.push('Screentones for shading and texture');
        techniques.push('Speed lines for motion and impact');
        techniques.push('Minimal backgrounds with detailed characters');
        break;
      case 'european':
        techniques.push('Detailed, atmospheric backgrounds');
        techniques.push('Watercolor or gouache-style coloring');
        techniques.push('Ligne claire (clear line) technique');
        break;
      case 'indie':
        techniques.push('Experimental panel layouts');
        techniques.push('Mixed media textures');
        techniques.push('Non-traditional storytelling approaches');
        break;
      case 'web_comic':
        techniques.push('Optimized for screen reading');
        techniques.push('Bold colors for digital display');
        techniques.push('Infinite canvas possibilities');
        break;
      default:
        techniques.push('Cross-hatching for shading');
        techniques.push('Ben-Day dots for color effects');
        techniques.push('Dynamic inking with varied line weights');
    }

    // Mood-specific additions
    if (mood.includes('action')) {
      techniques.push('Motion blur and impact effects');
      techniques.push('Radial speed lines for emphasis');
    }

    if (mood.includes('mysterious')) {
      techniques.push('Heavy use of blacks and negative space');
      techniques.push('Atmospheric perspective');
    }

    return techniques;
  }

  /**
   * Generate panel-specific art notes
   */
  private generatePanelSpecificNotes(panels: ComicPanel[]): Record<number, string> {
    const notes: Record<number, string> = {};

    for (const panel of panels) {
      const panelNotes: string[] = [];

      // Composition notes
      if (panel.composition.shotType === 'establishing-shot') {
        panelNotes.push('Establish location clearly with detailed background');
      } else if (panel.composition.shotType === 'close-up') {
        panelNotes.push('Focus on facial expression, minimize background detail');
      } else if (panel.composition.shotType === 'extreme-close-up') {
        panelNotes.push('Extreme detail on single element (eye, hand, object)');
      }

      // Angle notes
      if (panel.composition.angle === 'low-angle') {
        panelNotes.push('Low angle to make subject appear powerful/threatening');
      } else if (panel.composition.angle === 'high-angle') {
        panelNotes.push('High angle to make subject appear vulnerable/weak');
      } else if (panel.composition.angle === 'dutch-angle') {
        panelNotes.push('Dutch angle for disorientation/unease');
      }

      // Character count
      if (panel.characters.length > 3) {
        panelNotes.push(`${panel.characters.length} characters - ensure clear composition`);
      }

      // SFX notes
      if (panel.sfx && panel.sfx.length > 0) {
        panelNotes.push(`Sound effects: ${panel.sfx.map(s => s.text).join(', ')}`);
      }

      // Lighting notes
      if (panel.composition.lighting) {
        panelNotes.push(
          `${panel.composition.lighting.type} lighting at ${panel.composition.lighting.direction}°`
        );
      }

      if (panelNotes.length > 0) {
        notes[panel.number] = panelNotes.join('. ');
      }
    }

    return notes;
  }

  /**
   * Export art direction as formatted document
   */
  exportArtDirection(artDirection: ArtDirection): string {
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════');
    lines.push('           ART DIRECTION GUIDE');
    lines.push('═══════════════════════════════════════════════');
    lines.push('');

    // Overall mood
    lines.push('OVERALL MOOD:');
    lines.push(artDirection.overall_mood);
    lines.push('');

    // Color palette
    lines.push('COLOR PALETTE:');
    for (const color of artDirection.color_palette) {
      lines.push(`  ${color} ▇▇▇`);
    }
    lines.push('');

    // Lighting
    lines.push('LIGHTING NOTES:');
    lines.push(artDirection.lighting_notes);
    lines.push('');

    // Reference artists
    if (artDirection.reference_artists && artDirection.reference_artists.length > 0) {
      lines.push('REFERENCE ARTISTS:');
      for (const artist of artDirection.reference_artists) {
        lines.push(`  - ${artist}`);
      }
      lines.push('');
    }

    // Techniques
    if (artDirection.special_techniques && artDirection.special_techniques.length > 0) {
      lines.push('SPECIAL TECHNIQUES:');
      for (const technique of artDirection.special_techniques) {
        lines.push(`  - ${technique}`);
      }
      lines.push('');
    }

    // Panel-specific notes
    if (Object.keys(artDirection.panel_specific_notes).length > 0) {
      lines.push('PANEL-SPECIFIC NOTES:');
      lines.push('─────────────────────────────────────────────');
      for (const [panelNum, note] of Object.entries(artDirection.panel_specific_notes)) {
        lines.push(`Panel ${panelNum}: ${note}`);
        lines.push('');
      }
    }

    lines.push('═══════════════════════════════════════════════');

    return lines.join('\n');
  }
}
