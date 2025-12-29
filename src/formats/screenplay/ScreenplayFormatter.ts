/**
 * Screenplay Formatter - Industry Standard Formatting
 *
 * Implements professional screenplay formatting standards:
 * - Courier 12pt font
 * - Proper margins and spacing
 * - Scene headings, action, dialogue formatting
 * - 1 page = approximately 1 minute of screen time
 */

import {
  Screenplay,
  Scene,
  FormattedScreenplay,
  FormattedScene,
  SceneHeading,
  Action,
  Dialogue,
  Transition,
  ScreenplayStyle,
  TitlePage,
  ScreenplayAnalysis,
  ScreenplayFormattingOptions
} from './types';

export class ScreenplayFormatter {
  private readonly DEFAULT_FONT = 'Courier';
  private readonly DEFAULT_FONT_SIZE = 12;

  // Industry-standard margins (in inches)
  private readonly MARGINS = {
    left: 1.5,
    right: 1.0,
    top: 1.0,
    bottom: 1.0
  };

  // Element positioning (from left edge in inches)
  private readonly POSITIONS = {
    sceneHeading: 1.5,
    action: 1.5,
    character: 3.7,
    parenthetical: 3.1,
    dialogue: 2.5,
    transition: 6.0
  };

  // Element widths (in inches)
  private readonly WIDTHS = {
    action: 6.0,
    dialogue: 3.5,
    parenthetical: 2.0
  };

  /**
   * Format a complete screenplay with industry-standard formatting
   */
  async formatScreenplay(params: {
    project_id: string;
    title: string;
    author: string;
    scenes: Scene[];
    options?: Partial<ScreenplayFormattingOptions>;
  }): Promise<FormattedScreenplay> {
    const options = this.getDefaultOptions(params.options);

    // Format title page
    const titlePage = this.formatTitlePage({
      title: params.title,
      author: params.author,
      draft_date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    });

    // Format all scenes
    const formattedScenes = params.scenes.map(scene => this.formatScene(scene, options));

    // Calculate metadata
    const pageCount = this.calculatePageCount(params.scenes);
    const readingTime = this.calculateReadingTime(params.scenes);

    return {
      title_page: titlePage,
      scenes: formattedScenes,
      page_count: pageCount,
      reading_time: readingTime,
      metadata: {
        format: 'html',
        version: '1.0.0',
        created_at: new Date()
      }
    };
  }

  /**
   * Format a single scene with proper screenplay formatting
   */
  private formatScene(scene: Scene, options: ScreenplayFormattingOptions): FormattedScene {
    return {
      heading: this.formatSceneHeading(scene),
      action: this.formatActionLines(scene.action),
      dialogue: scene.dialogue.map(d => this.formatDialogue(d)),
      transition: scene.transition ? this.formatTransition(scene.transition) : undefined
    };
  }

  /**
   * Format scene heading (e.g., INT. COFFEE SHOP - DAY)
   */
  private formatSceneHeading(scene: Scene): SceneHeading {
    const intExt = scene.interior ? 'INT.' : 'EXT.';
    const location = scene.location.toUpperCase();
    const timeOfDay = scene.time_of_day.toUpperCase();

    return {
      text: `${intExt} ${location} - ${timeOfDay}`,
      number: scene.scene_number,
      intExt,
      location,
      timeOfDay,
      style: {
        font: this.DEFAULT_FONT,
        size: this.DEFAULT_FONT_SIZE,
        bold: true,
        marginLeft: `${this.POSITIONS.sceneHeading}in`,
        textTransform: 'uppercase'
      }
    };
  }

  /**
   * Format action lines (scene description)
   */
  private formatActionLines(actions: Action[]): Action[] {
    return actions.map(action => ({
      text: action.text,
      style: {
        font: this.DEFAULT_FONT,
        size: this.DEFAULT_FONT_SIZE,
        marginLeft: `${this.POSITIONS.action}in`,
        maxWidth: `${this.WIDTHS.action}in`
      }
    }));
  }

  /**
   * Format dialogue with character name, parenthetical, and lines
   */
  private formatDialogue(dialogue: Dialogue): Dialogue {
    // Format character name
    const character = {
      text: dialogue.character.text.toUpperCase(),
      style: {
        font: this.DEFAULT_FONT,
        size: this.DEFAULT_FONT_SIZE,
        marginLeft: `${this.POSITIONS.character}in`,
        textTransform: 'uppercase' as const
      },
      extension: dialogue.character.extension
    };

    // Format parenthetical (if exists)
    const parenthetical = dialogue.parenthetical ? {
      text: `(${dialogue.parenthetical.text.toLowerCase()})`,
      style: {
        font: this.DEFAULT_FONT,
        size: this.DEFAULT_FONT_SIZE,
        marginLeft: `${this.POSITIONS.parenthetical}in`
      }
    } : undefined;

    // Format dialogue lines
    const lines = dialogue.lines.map(line => ({
      text: line.text,
      style: {
        font: this.DEFAULT_FONT,
        size: this.DEFAULT_FONT_SIZE,
        marginLeft: `${this.POSITIONS.dialogue}in`,
        maxWidth: `${this.WIDTHS.dialogue}in`
      }
    }));

    return {
      character,
      parenthetical,
      lines,
      dualDialogue: dialogue.dualDialogue
    };
  }

  /**
   * Format transition (e.g., CUT TO:, FADE TO:)
   */
  private formatTransition(transition: Transition): Transition {
    return {
      text: transition.text.toUpperCase(),
      type: transition.type,
      style: {
        font: this.DEFAULT_FONT,
        size: this.DEFAULT_FONT_SIZE,
        marginLeft: `${this.POSITIONS.transition}in`,
        textTransform: 'uppercase',
        textAlign: 'right'
      }
    };
  }

  /**
   * Format title page with standard layout
   */
  private formatTitlePage(titlePage: TitlePage): string {
    let html = '<div class="title-page">\n';

    // Title (centered, 1/3 down the page)
    html += '  <div class="title-section" style="text-align: center; margin-top: 33vh;">\n';
    html += `    <h1 style="font-family: Courier; font-size: 12pt; text-transform: uppercase;">${titlePage.title}</h1>\n`;

    if (titlePage.subtitle) {
      html += `    <p style="font-family: Courier; font-size: 12pt;">${titlePage.subtitle}</p>\n`;
    }

    html += '  </div>\n';

    // Author (centered, below title)
    html += '  <div class="author-section" style="text-align: center; margin-top: 2em;">\n';
    html += `    <p style="font-family: Courier; font-size: 12pt;">Written by</p>\n`;
    html += `    <p style="font-family: Courier; font-size: 12pt; font-weight: bold;">${titlePage.author}</p>\n`;
    html += '  </div>\n';

    // Based on (if applicable)
    if (titlePage.based_on) {
      html += '  <div class="based-on-section" style="text-align: center; margin-top: 1em;">\n';
      html += `    <p style="font-family: Courier; font-size: 12pt; font-style: italic;">${titlePage.based_on}</p>\n`;
      html += '  </div>\n';
    }

    // Contact info (bottom left)
    if (titlePage.contact) {
      html += '  <div class="contact-section" style="position: absolute; bottom: 1in; left: 1.5in;">\n';
      html += `    <p style="font-family: Courier; font-size: 12pt;">${titlePage.contact.replace(/\n/g, '<br>')}</p>\n`;
      html += '  </div>\n';
    }

    // Draft info (bottom right)
    html += '  <div class="draft-section" style="position: absolute; bottom: 1in; right: 1in; text-align: right;">\n';
    if (titlePage.draft_number) {
      html += `    <p style="font-family: Courier; font-size: 12pt;">${titlePage.draft_number}</p>\n`;
    }
    html += `    <p style="font-family: Courier; font-size: 12pt;">${titlePage.draft_date}</p>\n`;
    if (titlePage.copyright) {
      html += `    <p style="font-family: Courier; font-size: 12pt;">${titlePage.copyright}</p>\n`;
    }
    html += '  </div>\n';

    html += '</div>\n';

    return html;
  }

  /**
   * Calculate page count (1 page ≈ 1 minute of screen time)
   *
   * Industry standard: 55 lines per page at 12pt Courier
   */
  private calculatePageCount(scenes: Scene[]): number {
    let totalLines = 0;

    for (const scene of scenes) {
      // Scene heading: 2 lines (heading + blank)
      totalLines += 2;

      // Action lines
      for (const action of scene.action) {
        const lines = this.estimateLines(action.text, this.WIDTHS.action * 10); // chars per line
        totalLines += lines + 1; // +1 for spacing
      }

      // Dialogue
      for (const dialogue of scene.dialogue) {
        totalLines += 1; // Character name

        if (dialogue.parenthetical) {
          totalLines += 1; // Parenthetical
        }

        for (const line of dialogue.lines) {
          const lines = this.estimateLines(line.text, this.WIDTHS.dialogue * 10);
          totalLines += lines;
        }

        totalLines += 1; // Spacing after dialogue
      }

      // Transition
      if (scene.transition) {
        totalLines += 2;
      }
    }

    // Convert lines to pages (55 lines per page)
    return Math.ceil(totalLines / 55);
  }

  /**
   * Calculate reading time in minutes
   */
  private calculateReadingTime(scenes: Scene[]): number {
    // Industry standard: 1 page = 1 minute
    return this.calculatePageCount(scenes);
  }

  /**
   * Estimate number of lines for a given text width
   */
  private estimateLines(text: string, charsPerLine: number): number {
    return Math.ceil(text.length / charsPerLine);
  }

  /**
   * Analyze screenplay structure and content
   */
  async analyzeScreenplay(screenplay: Screenplay): Promise<ScreenplayAnalysis> {
    const scenes = screenplay.scenes;
    const pageCount = screenplay.metadata.page_count;

    // Calculate dialogue vs action ratio
    let dialogueCount = 0;
    let actionCount = 0;

    for (const scene of scenes) {
      dialogueCount += scene.dialogue.reduce((sum, d) => sum + d.lines.length, 0);
      actionCount += scene.action.length;
    }

    const totalElements = dialogueCount + actionCount;
    const dialoguePercentage = (dialogueCount / totalElements) * 100;
    const actionPercentage = (actionCount / totalElements) * 100;

    // Calculate average scene length
    const averageSceneLength = pageCount / scenes.length;

    // Act structure (industry standard: 25% / 50% / 25%)
    const act1End = Math.floor(pageCount * 0.25);
    const act2End = Math.floor(pageCount * 0.75);

    let currentPage = 0;
    let act1Scenes = 0;
    let act2Scenes = 0;
    let act3Scenes = 0;

    for (const scene of scenes) {
      const scenePages = this.estimateScenePages(scene);
      currentPage += scenePages;

      if (currentPage <= act1End) {
        act1Scenes++;
      } else if (currentPage <= act2End) {
        act2Scenes++;
      } else {
        act3Scenes++;
      }
    }

    // Character appearances
    const characterMap = new Map<string, { dialogue_count: number; scene_count: number }>();

    for (const scene of scenes) {
      const sceneCharacters = new Set<string>();

      for (const dialogue of scene.dialogue) {
        const charName = dialogue.character.text.toUpperCase();
        sceneCharacters.add(charName);

        if (!characterMap.has(charName)) {
          characterMap.set(charName, { dialogue_count: 0, scene_count: 0 });
        }

        characterMap.get(charName)!.dialogue_count += dialogue.lines.length;
      }

      for (const char of sceneCharacters) {
        characterMap.get(char)!.scene_count++;
      }
    }

    // Location breakdown
    const locationMap = new Map<string, { int_ext: 'INT.' | 'EXT.'; scene_count: number }>();

    for (const scene of scenes) {
      const key = `${scene.location}_${scene.interior ? 'INT' : 'EXT'}`;

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          int_ext: scene.interior ? 'INT.' : 'EXT.',
          scene_count: 0
        });
      }

      locationMap.get(key)!.scene_count++;
    }

    return {
      page_count: pageCount,
      scene_count: scenes.length,
      dialogue_percentage: dialoguePercentage,
      action_percentage: actionPercentage,
      average_scene_length: averageSceneLength,
      estimated_runtime: pageCount, // 1 page = 1 minute
      act_structure: {
        act_1: { page_start: 1, page_end: act1End, scene_count: act1Scenes },
        act_2: { page_start: act1End + 1, page_end: act2End, scene_count: act2Scenes },
        act_3: { page_start: act2End + 1, page_end: pageCount, scene_count: act3Scenes }
      },
      character_appearances: Array.from(characterMap.entries()).map(([character, data]) => ({
        character,
        ...data
      })).sort((a, b) => b.dialogue_count - a.dialogue_count),
      location_breakdown: Array.from(locationMap.entries()).map(([location, data]) => ({
        location: location.replace(/_INT$|_EXT$/, ''),
        ...data
      })).sort((a, b) => b.scene_count - a.scene_count)
    };
  }

  /**
   * Estimate pages for a single scene
   */
  private estimateScenePages(scene: Scene): number {
    let lines = 2; // Scene heading

    for (const action of scene.action) {
      lines += this.estimateLines(action.text, this.WIDTHS.action * 10) + 1;
    }

    for (const dialogue of scene.dialogue) {
      lines += 1; // Character
      if (dialogue.parenthetical) lines += 1;
      for (const line of dialogue.lines) {
        lines += this.estimateLines(line.text, this.WIDTHS.dialogue * 10);
      }
      lines += 1; // Spacing
    }

    if (scene.transition) lines += 2;

    return lines / 55;
  }

  /**
   * Get default formatting options
   */
  private getDefaultOptions(options?: Partial<ScreenplayFormattingOptions>): ScreenplayFormattingOptions {
    return {
      font: options?.font || this.DEFAULT_FONT,
      fontSize: options?.fontSize || this.DEFAULT_FONT_SIZE,
      pageSize: options?.pageSize || 'US Letter',
      sceneNumbers: options?.sceneNumbers ?? true,
      revisionMarks: options?.revisionMarks ?? false,
      watermark: options?.watermark,
      headerText: options?.headerText,
      footerText: options?.footerText
    };
  }
}
