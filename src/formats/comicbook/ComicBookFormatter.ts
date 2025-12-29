/**
 * Comic Book Script Formatter
 * Industry-standard comic script formatting
 */

import {
  ComicPanel,
  ComicPage,
  FormattedComicScript,
  FormattedComicPage,
  FormattedPanel,
  Dialogue,
  PanelSize
} from './types';

export class ComicBookFormatter {
  /**
   * Format complete comic script with cover page and all pages
   */
  async formatComicScript(params: {
    project_id: string;
    title: string;
    issue_number: number;
    writer: string;
    artist?: string;
    pages: ComicPage[];
  }): Promise<FormattedComicScript> {
    const formatted: FormattedComicScript = {
      cover: this.formatCoverPage(
        params.title,
        params.issue_number,
        params.writer,
        params.artist
      ),
      pages: params.pages.map((page, i) =>
        this.formatPage(page, i + 1)
      ),
      total_pages: params.pages.length,
      total_panels: this.countTotalPanels(params.pages),
      dialogue_word_count: this.countDialogue(params.pages),
      estimated_art_time_hours: this.estimateArtTime(params.pages)
    };

    return formatted;
  }

  /**
   * Format cover page information
   */
  private formatCoverPage(
    title: string,
    issueNumber: number,
    writer: string,
    artist?: string
  ): FormattedComicScript['cover'] {
    return {
      title,
      issue_number: issueNumber,
      writer,
      artist: artist || 'TBD',
      date: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Format a single page
   */
  private formatPage(page: ComicPage, pageNumber: number): FormattedComicPage {
    const panelCount = page.panels.length;

    return {
      page_number: pageNumber,
      panel_count: panelCount,
      layout_suggestion: page.layoutSuggestion || this.suggestLayout(panelCount),
      panels: page.panels.map((panel, i) =>
        this.formatPanel(panel, pageNumber, i + 1)
      )
    };
  }

  /**
   * Format individual panel with all details
   */
  private formatPanel(
    panel: ComicPanel,
    pageNumber: number,
    panelNumber: number
  ): FormattedPanel {
    return {
      number: panelNumber,
      size: panel.size || 'medium',
      description: panel.description,
      art_direction: this.generateArtDirection(panel),
      composition: panel.composition,
      characters: panel.characters,
      location: panel.location,
      time: panel.time,
      captions: panel.captions || [],
      dialogue: panel.dialogue,
      sfx: panel.sfx || []
    };
  }

  /**
   * Generate comprehensive art direction for panel
   */
  private generateArtDirection(panel: ComicPanel): string {
    const directions: string[] = [];

    // Shot type and angle
    directions.push(
      `${this.humanizeEnum(panel.composition.shotType)} shot, ${this.humanizeEnum(panel.composition.angle)} angle`
    );

    // Perspective
    if (panel.composition.perspective) {
      directions.push(`${panel.composition.perspective} perspective`);
    }

    // Lighting
    if (panel.composition.lighting) {
      directions.push(
        `${this.humanizeEnum(panel.composition.lighting.type)} lighting from ${panel.composition.lighting.direction}°`
      );
    }

    // Character positioning
    if (panel.characters.length > 0) {
      const charDescriptions = panel.characters.map(char =>
        `${char.name} ${char.pose} (${char.facing}-facing)`
      );
      directions.push(`Characters: ${charDescriptions.join(', ')}`);
    }

    // Focal point
    if (panel.composition.focalPoint) {
      directions.push(
        `Focus on ${Math.round(panel.composition.focalPoint.x * 100)}%, ${Math.round(panel.composition.focalPoint.y * 100)}% of frame`
      );
    }

    // Panel-specific notes
    if (panel.borderStyle && panel.borderStyle !== 'standard') {
      directions.push(`${this.humanizeEnum(panel.borderStyle)} border`);
    }

    if (panel.bleedType && panel.bleedType !== 'none') {
      directions.push(`${this.humanizeEnum(panel.bleedType)} bleed`);
    }

    return directions.join('. ');
  }

  /**
   * Suggest optimal panel layout for page based on panel count
   */
  private suggestLayout(panelCount: number): string {
    const layouts: Record<number, string> = {
      1: 'Full-page splash panel',
      2: 'Horizontal split (2 rows) or vertical split (2 columns)',
      3: 'Tier system: 1 large panel top, 2 smaller bottom',
      4: '2x2 grid or tier system',
      5: 'Tier system: 2 top, 3 bottom or staggered layout',
      6: '2x3 grid (classic comic page) or 3x2 tier system',
      7: 'Staggered layout with varying panel sizes',
      8: '2x4 grid or complex staggered layout',
      9: '3x3 grid or tiered layout with emphasis panels'
    };

    return layouts[panelCount] || `Custom layout with ${panelCount} panels - varies sizes for pacing`;
  }

  /**
   * Count total panels across all pages
   */
  private countTotalPanels(pages: ComicPage[]): number {
    return pages.reduce((total, page) => total + page.panels.length, 0);
  }

  /**
   * Count total dialogue words across all pages
   */
  private countDialogue(pages: ComicPage[]): number {
    let totalWords = 0;

    for (const page of pages) {
      for (const panel of page.panels) {
        // Count dialogue
        for (const dialogue of panel.dialogue) {
          totalWords += this.countWords(dialogue.text);
        }

        // Count captions
        for (const caption of panel.captions || []) {
          totalWords += this.countWords(caption);
        }
      }
    }

    return totalWords;
  }

  /**
   * Estimate art time based on page complexity
   */
  private estimateArtTime(pages: ComicPage[]): number {
    let totalHours = 0;

    for (const page of pages) {
      // Base time per page: 4 hours
      let pageHours = 4;

      // Add time based on panel count
      pageHours += page.panels.length * 0.5;

      // Add time for character complexity
      const totalCharacters = page.panels.reduce(
        (sum, panel) => sum + panel.characters.length,
        0
      );
      pageHours += totalCharacters * 0.25;

      // Add time for detailed backgrounds
      const detailedPanels = page.panels.filter(
        panel =>
          panel.composition.shotType === 'establishing-shot' ||
          panel.size === 'full-page' ||
          panel.size === 'double-page-spread'
      ).length;
      pageHours += detailedPanels * 1;

      totalHours += pageHours;
    }

    return Math.round(totalHours * 10) / 10;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Convert enum value to human-readable string
   */
  private humanizeEnum(value: string): string {
    return value
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Export script as plain text (industry format)
   */
  exportAsText(script: FormattedComicScript): string {
    const lines: string[] = [];

    // Cover page
    lines.push('═══════════════════════════════════════════════');
    lines.push(`  ${script.cover.title.toUpperCase()}`);
    lines.push(`  ISSUE #${script.cover.issue_number}`);
    lines.push('');
    lines.push(`  Written by: ${script.cover.writer}`);
    if (script.cover.artist) {
      lines.push(`  Art by: ${script.cover.artist}`);
    }
    lines.push(`  Date: ${script.cover.date}`);
    lines.push('═══════════════════════════════════════════════');
    lines.push('');
    lines.push(`Total Pages: ${script.total_pages}`);
    lines.push(`Total Panels: ${script.total_panels}`);
    lines.push(`Dialogue Word Count: ${script.dialogue_word_count}`);
    lines.push(`Estimated Art Time: ${script.estimated_art_time_hours} hours`);
    lines.push('');
    lines.push('═══════════════════════════════════════════════');
    lines.push('');

    // Pages
    for (const page of script.pages) {
      lines.push('');
      lines.push(`PAGE ${page.page_number} (${page.panel_count} PANELS)`);
      lines.push(`Layout: ${page.layout_suggestion}`);
      lines.push('─────────────────────────────────────────────');
      lines.push('');

      for (const panel of page.panels) {
        lines.push(`PANEL ${page.page_number}.${panel.number} [${panel.size.toUpperCase()}]`);
        lines.push('');
        lines.push(`DESCRIPTION:`);
        lines.push(panel.description);
        lines.push('');
        lines.push(`ART DIRECTION:`);
        lines.push(panel.art_direction);
        lines.push('');

        // Location and time
        if (panel.location) {
          lines.push(`LOCATION: ${panel.location}`);
        }
        if (panel.time) {
          lines.push(`TIME: ${panel.time}`);
        }

        // Captions
        if (panel.captions.length > 0) {
          lines.push('');
          for (const caption of panel.captions) {
            lines.push(`CAPTION: ${caption}`);
          }
        }

        // Dialogue
        if (panel.dialogue.length > 0) {
          lines.push('');
          for (const dialogue of panel.dialogue) {
            const prefix = dialogue.thought
              ? 'THOUGHT'
              : dialogue.whisper
              ? 'WHISPER'
              : dialogue.shout
              ? 'SHOUT'
              : dialogue.narration
              ? 'NARRATION'
              : 'DIALOGUE';

            const offPanel = dialogue.offPanel ? ' (OFF-PANEL)' : '';
            lines.push(`${dialogue.character} ${prefix}${offPanel}:`);
            lines.push(`  "${dialogue.text}"`);
          }
        }

        // Sound effects
        if (panel.sfx.length > 0) {
          lines.push('');
          for (const sfx of panel.sfx) {
            lines.push(`SFX: ${sfx.text} [${sfx.style}]`);
          }
        }

        lines.push('');
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export script as JSON
   */
  exportAsJSON(script: FormattedComicScript): string {
    return JSON.stringify(script, null, 2);
  }

  /**
   * Validate script completeness
   */
  validateScript(script: FormattedComicScript): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!script.cover.title) {
      errors.push('Missing title');
    }
    if (!script.cover.writer) {
      errors.push('Missing writer');
    }
    if (script.pages.length === 0) {
      errors.push('No pages in script');
    }

    // Check page continuity
    for (let i = 0; i < script.pages.length; i++) {
      const page = script.pages[i];
      if (page.page_number !== i + 1) {
        errors.push(`Page numbering issue at page ${i + 1}`);
      }

      // Check panels
      if (page.panels.length === 0) {
        warnings.push(`Page ${page.page_number} has no panels`);
      }

      for (const panel of page.panels) {
        if (!panel.description) {
          warnings.push(`Panel ${page.page_number}.${panel.number} missing description`);
        }
        if (panel.dialogue.length === 0 && panel.captions.length === 0) {
          warnings.push(`Panel ${page.page_number}.${panel.number} has no text (silent panel)`);
        }
      }
    }

    // Check pacing
    if (script.total_panels / script.total_pages < 4) {
      warnings.push('Low panel density - may feel slow paced');
    }
    if (script.total_panels / script.total_pages > 8) {
      warnings.push('High panel density - may feel rushed');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
