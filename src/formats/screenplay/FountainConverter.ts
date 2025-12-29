/**
 * Fountain Converter
 *
 * Converts between Screenplay objects and Fountain markup format
 * Fountain is a plain-text markup language for screenplays
 * Spec: https://fountain.io/syntax
 */

import {
  Screenplay,
  Scene,
  Dialogue,
  FountainElement,
  FountainMetadata,
  TitlePage
} from './types';

export class FountainConverter {
  /**
   * Convert Screenplay to Fountain markup
   */
  toFountain(screenplay: Screenplay): string {
    let fountain = '';

    // Add title page metadata
    fountain += this.formatTitlePageMetadata(screenplay.title_page);
    fountain += '\n\n';

    // Add scenes
    for (const scene of screenplay.scenes) {
      fountain += this.sceneToFountain(scene);
      fountain += '\n';
    }

    return fountain.trim();
  }

  /**
   * Parse Fountain markup to Screenplay object
   */
  fromFountain(fountain: string): Screenplay {
    const lines = fountain.split('\n');
    const metadata = this.extractMetadata(lines);
    const scenes: Scene[] = [];

    let currentScene: Partial<Scene> | null = null;
    let currentDialogue: Partial<Dialogue> | null = null;
    let lineNumber = 0;

    // Skip metadata section
    while (lineNumber < lines.length && (lines[lineNumber].startsWith('Title:') ||
           lines[lineNumber].startsWith('Credit:') ||
           lines[lineNumber].startsWith('Author:') ||
           lines[lineNumber].startsWith('Draft date:') ||
           lines[lineNumber].startsWith('Contact:') ||
           lines[lineNumber].trim() === '')) {
      lineNumber++;
    }

    while (lineNumber < lines.length) {
      const line = lines[lineNumber];
      const trimmed = line.trim();

      if (trimmed === '') {
        // Blank line - end current dialogue if any
        if (currentDialogue) {
          currentScene!.dialogue!.push(currentDialogue as Dialogue);
          currentDialogue = null;
        }
        lineNumber++;
        continue;
      }

      // Scene heading
      if (this.isSceneHeading(trimmed)) {
        // Save previous scene
        if (currentScene) {
          scenes.push(currentScene as Scene);
        }

        // Start new scene
        currentScene = this.parseSceneHeading(trimmed, scenes.length + 1);
        currentScene.action = [];
        currentScene.dialogue = [];

        lineNumber++;
        continue;
      }

      // Character name (dialogue cue)
      if (this.isCharacterName(trimmed) && !currentDialogue) {
        currentDialogue = this.parseCharacterName(trimmed);
        currentDialogue.lines = [];
        lineNumber++;
        continue;
      }

      // Parenthetical
      if (this.isParenthetical(trimmed) && currentDialogue) {
        currentDialogue.parenthetical = {
          text: trimmed.replace(/^\(|\)$/g, ''),
          style: {
            font: 'Courier',
            size: 12,
            marginLeft: '3.1in'
          }
        };
        lineNumber++;
        continue;
      }

      // Dialogue line
      if (currentDialogue) {
        currentDialogue.lines!.push({
          text: trimmed,
          style: {
            font: 'Courier',
            size: 12,
            marginLeft: '2.5in',
            maxWidth: '3.5in'
          }
        });
        lineNumber++;
        continue;
      }

      // Transition
      if (this.isTransition(trimmed)) {
        if (currentScene) {
          currentScene.transition = {
            text: trimmed,
            type: trimmed as any,
            style: {
              font: 'Courier',
              size: 12,
              marginLeft: '6.0in',
              textTransform: 'uppercase',
              textAlign: 'right'
            }
          };
        }
        lineNumber++;
        continue;
      }

      // Action line (default)
      if (currentScene) {
        currentScene.action!.push({
          text: trimmed,
          style: {
            font: 'Courier',
            size: 12,
            marginLeft: '1.5in',
            maxWidth: '6.0in'
          }
        });
      }

      lineNumber++;
    }

    // Save last scene
    if (currentScene) {
      if (currentDialogue) {
        currentScene.dialogue!.push(currentDialogue as Dialogue);
      }
      scenes.push(currentScene as Scene);
    }

    return {
      title: metadata.title || 'Untitled',
      author: metadata.author || 'Unknown',
      title_page: {
        title: metadata.title || 'Untitled',
        author: metadata.author || 'Unknown',
        draft_date: metadata.draft_date || new Date().toLocaleDateString()
      },
      scenes,
      metadata: {
        genre: '',
        page_count: this.estimatePageCount(scenes),
        scene_count: scenes.length,
        estimated_runtime: this.estimatePageCount(scenes),
        created_at: new Date(),
        updated_at: new Date()
      }
    };
  }

  /**
   * Convert a single scene to Fountain format
   */
  private sceneToFountain(scene: Scene): string {
    let fountain = '';

    // Scene heading
    const intExt = scene.interior ? 'INT.' : 'EXT.';
    fountain += `${intExt} ${scene.location.toUpperCase()} - ${scene.time_of_day.toUpperCase()}\n\n`;

    // Action lines
    for (const action of scene.action) {
      fountain += `${action.text}\n\n`;
    }

    // Dialogue
    for (const dialogue of scene.dialogue) {
      // Character name
      let characterLine = dialogue.character.text.toUpperCase();
      if (dialogue.character.extension) {
        characterLine += ` (${dialogue.character.extension})`;
      }
      fountain += `${characterLine}\n`;

      // Parenthetical
      if (dialogue.parenthetical) {
        fountain += `(${dialogue.parenthetical.text})\n`;
      }

      // Dialogue lines
      for (const line of dialogue.lines) {
        fountain += `${line.text}\n`;
      }

      fountain += '\n';
    }

    // Transition
    if (scene.transition) {
      fountain += `${scene.transition.text}\n\n`;
    }

    return fountain;
  }

  /**
   * Format title page metadata in Fountain format
   */
  private formatTitlePageMetadata(titlePage: TitlePage): string {
    let metadata = '';

    metadata += `Title: ${titlePage.title}\n`;

    if (titlePage.subtitle) {
      metadata += `    ${titlePage.subtitle}\n`;
    }

    metadata += `Credit: Written by\n`;
    metadata += `Author: ${titlePage.author}\n`;

    if (titlePage.based_on) {
      metadata += `Source: ${titlePage.based_on}\n`;
    }

    metadata += `Draft date: ${titlePage.draft_date}\n`;

    if (titlePage.contact) {
      metadata += `Contact:\n`;
      const contactLines = titlePage.contact.split('\n');
      for (const line of contactLines) {
        metadata += `    ${line}\n`;
      }
    }

    if (titlePage.copyright) {
      metadata += `Copyright: ${titlePage.copyright}\n`;
    }

    return metadata;
  }

  /**
   * Extract metadata from Fountain document
   */
  private extractMetadata(lines: string[]): FountainMetadata {
    const metadata: FountainMetadata = {};

    for (const line of lines) {
      if (line.startsWith('Title:')) {
        metadata.title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Credit:')) {
        metadata.credit = line.replace('Credit:', '').trim();
      } else if (line.startsWith('Author:')) {
        metadata.author = line.replace('Author:', '').trim();
      } else if (line.startsWith('Source:')) {
        metadata.source = line.replace('Source:', '').trim();
      } else if (line.startsWith('Draft date:')) {
        metadata.draft_date = line.replace('Draft date:', '').trim();
      } else if (line.startsWith('Contact:')) {
        metadata.contact = line.replace('Contact:', '').trim();
      } else if (line.trim() !== '' && !line.startsWith('Title:') &&
                 !line.startsWith('Credit:') && !line.startsWith('Author:') &&
                 !line.startsWith('Source:') && !line.startsWith('Draft date:') &&
                 !line.startsWith('Contact:')) {
        break; // End of metadata section
      }
    }

    return metadata;
  }

  /**
   * Check if line is a scene heading
   */
  private isSceneHeading(line: string): boolean {
    const sceneHeadingPattern = /^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|I\/E)\s+/i;
    return sceneHeadingPattern.test(line);
  }

  /**
   * Check if line is a character name (dialogue cue)
   */
  private isCharacterName(line: string): boolean {
    // Character names are ALL CAPS and not scene headings or transitions
    return line === line.toUpperCase() &&
           !this.isSceneHeading(line) &&
           !this.isTransition(line) &&
           line.length > 0 &&
           line.length < 50; // Reasonable character name length
  }

  /**
   * Check if line is a parenthetical
   */
  private isParenthetical(line: string): boolean {
    return line.startsWith('(') && line.endsWith(')');
  }

  /**
   * Check if line is a transition
   */
  private isTransition(line: string): boolean {
    return line.endsWith(':') &&
           (line.includes('TO:') ||
            line === 'FADE IN:' ||
            line === 'FADE OUT.' ||
            line === 'CUT TO BLACK.');
  }

  /**
   * Parse scene heading line
   */
  private parseSceneHeading(line: string, sceneNumber: number): Partial<Scene> {
    const parts = line.split('-').map(p => p.trim());
    const locationPart = parts[0];
    const timeOfDay = parts[1] || 'DAY';

    const intExtMatch = locationPart.match(/^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|I\/E)\s+(.+)/i);

    if (!intExtMatch) {
      return {
        scene_number: sceneNumber,
        interior: true,
        location: locationPart,
        time_of_day: timeOfDay
      };
    }

    const intExt = intExtMatch[1].toUpperCase();
    const location = intExtMatch[2];

    return {
      scene_number: sceneNumber,
      interior: intExt.startsWith('INT'),
      location,
      time_of_day: timeOfDay
    };
  }

  /**
   * Parse character name line
   */
  private parseCharacterName(line: string): Partial<Dialogue> {
    // Check for extension (V.O.), (O.S.), etc.
    const extensionMatch = line.match(/^(.+?)\s+\((.+?)\)$/);

    if (extensionMatch) {
      return {
        character: {
          text: extensionMatch[1].trim(),
          extension: extensionMatch[2].trim(),
          style: {
            font: 'Courier',
            size: 12,
            marginLeft: '3.7in',
            textTransform: 'uppercase'
          }
        }
      };
    }

    return {
      character: {
        text: line.trim(),
        style: {
          font: 'Courier',
          size: 12,
          marginLeft: '3.7in',
          textTransform: 'uppercase'
        }
      }
    };
  }

  /**
   * Estimate page count from scenes
   */
  private estimatePageCount(scenes: Scene[]): number {
    let totalLines = 0;

    for (const scene of scenes) {
      totalLines += 2; // Scene heading

      for (const action of scene.action || []) {
        totalLines += Math.ceil(action.text.length / 60) + 1;
      }

      for (const dialogue of scene.dialogue || []) {
        totalLines += 1; // Character name
        if (dialogue.parenthetical) totalLines += 1;
        for (const line of dialogue.lines) {
          totalLines += Math.ceil(line.text.length / 35);
        }
        totalLines += 1; // Spacing
      }

      if (scene.transition) totalLines += 2;
    }

    return Math.ceil(totalLines / 55);
  }
}
