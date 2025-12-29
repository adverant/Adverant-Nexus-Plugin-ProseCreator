/**
 * Final Draft Exporter
 *
 * Exports screenplays to Final Draft .fdx format (XML-based)
 * Final Draft is the industry-standard screenwriting software
 */

import { Screenplay, Scene, Dialogue, Action, Transition } from './types';

export class FinalDraftExporter {
  /**
   * Export screenplay to Final Draft .fdx format
   */
  async exportToFinalDraft(screenplay: Screenplay): Promise<Buffer> {
    const fdx = this.generateFDX(screenplay);
    return Buffer.from(fdx, 'utf-8');
  }

  /**
   * Generate complete FDX XML document
   */
  private generateFDX(screenplay: Screenplay): string {
    let fdx = '<?xml version="1.0" encoding="UTF-8"?>\n';
    fdx += '<FinalDraft DocumentType="Script" Template="No" Version="3">\n';

    // Content section
    fdx += '  <Content>\n';
    fdx += this.generateTitlePage(screenplay);

    for (const scene of screenplay.scenes) {
      fdx += this.generateSceneXML(scene);
    }

    fdx += '  </Content>\n';

    // Metadata
    fdx += this.generateMetadata(screenplay);

    fdx += '</FinalDraft>\n';

    return fdx;
  }

  /**
   * Generate title page elements
   */
  private generateTitlePage(screenplay: Screenplay): string {
    let xml = '';
    const tp = screenplay.title_page;

    // Title
    xml += '    <Paragraph Type="Title">\n';
    xml += `      <Text>${this.escapeXML(tp.title)}</Text>\n`;
    xml += '    </Paragraph>\n';

    if (tp.subtitle) {
      xml += '    <Paragraph Type="Title">\n';
      xml += `      <Text>${this.escapeXML(tp.subtitle)}</Text>\n`;
      xml += '    </Paragraph>\n';
    }

    // Credit
    xml += '    <Paragraph Type="Author">\n';
    xml += '      <Text>Written by</Text>\n';
    xml += '    </Paragraph>\n';

    // Author
    xml += '    <Paragraph Type="Author">\n';
    xml += `      <Text>${this.escapeXML(tp.author)}</Text>\n`;
    xml += '    </Paragraph>\n';

    // Based on
    if (tp.based_on) {
      xml += '    <Paragraph Type="Source">\n';
      xml += `      <Text>${this.escapeXML(tp.based_on)}</Text>\n`;
      xml += '    </Paragraph>\n';
    }

    // Contact
    if (tp.contact) {
      xml += '    <Paragraph Type="Contact">\n';
      xml += `      <Text>${this.escapeXML(tp.contact)}</Text>\n`;
      xml += '    </Paragraph>\n';
    }

    // Draft date
    xml += '    <Paragraph Type="DraftDate">\n';
    xml += `      <Text>${this.escapeXML(tp.draft_date)}</Text>\n`;
    xml += '    </Paragraph>\n';

    // Copyright
    if (tp.copyright) {
      xml += '    <Paragraph Type="Copyright">\n';
      xml += `      <Text>${this.escapeXML(tp.copyright)}</Text>\n`;
      xml += '    </Paragraph>\n';
    }

    // Page break after title page
    xml += '    <Paragraph Type="Action">\n';
    xml += '      <Text></Text>\n';
    xml += '      <PageBreak />\n';
    xml += '    </Paragraph>\n';

    return xml;
  }

  /**
   * Generate XML for a single scene
   */
  private generateSceneXML(scene: Scene): string {
    let xml = '';

    // Scene heading
    xml += this.generateSceneHeading(scene);

    // Action lines
    for (const action of scene.action) {
      xml += this.generateAction(action);
    }

    // Dialogue
    for (const dialogue of scene.dialogue) {
      xml += this.generateDialogue(dialogue);
    }

    // Transition
    if (scene.transition) {
      xml += this.generateTransition(scene.transition);
    }

    return xml;
  }

  /**
   * Generate scene heading paragraph
   */
  private generateSceneHeading(scene: Scene): string {
    const intExt = scene.interior ? 'INT.' : 'EXT.';
    const location = scene.location.toUpperCase();
    const timeOfDay = scene.time_of_day.toUpperCase();
    const heading = `${intExt} ${location} - ${timeOfDay}`;

    let xml = '    <Paragraph Type="Scene Heading"';

    if (scene.scene_number) {
      xml += ` Number="${scene.scene_number}"`;
    }

    xml += '>\n';
    xml += `      <Text>${this.escapeXML(heading)}</Text>\n`;
    xml += '    </Paragraph>\n';

    return xml;
  }

  /**
   * Generate action paragraph
   */
  private generateAction(action: Action): string {
    let xml = '    <Paragraph Type="Action">\n';
    xml += `      <Text>${this.escapeXML(action.text)}</Text>\n`;
    xml += '    </Paragraph>\n';
    return xml;
  }

  /**
   * Generate dialogue paragraphs
   */
  private generateDialogue(dialogue: Dialogue): string {
    let xml = '';

    // Character name
    let characterText = dialogue.character.text.toUpperCase();
    if (dialogue.character.extension) {
      characterText += ` (${dialogue.character.extension})`;
    }

    xml += '    <Paragraph Type="Character"';
    if (dialogue.dualDialogue) {
      xml += ' DualDialogue="Left"'; // or "Right" for second character
    }
    xml += '>\n';
    xml += `      <Text>${this.escapeXML(characterText)}</Text>\n`;
    xml += '    </Paragraph>\n';

    // Parenthetical
    if (dialogue.parenthetical) {
      xml += '    <Paragraph Type="Parenthetical">\n';
      xml += `      <Text>(${this.escapeXML(dialogue.parenthetical.text)})</Text>\n`;
      xml += '    </Paragraph>\n';
    }

    // Dialogue lines
    for (const line of dialogue.lines) {
      xml += '    <Paragraph Type="Dialogue"';
      if (dialogue.dualDialogue) {
        xml += ' DualDialogue="Left"';
      }
      xml += '>\n';
      xml += `      <Text>${this.escapeXML(line.text)}</Text>\n`;
      xml += '    </Paragraph>\n';
    }

    return xml;
  }

  /**
   * Generate transition paragraph
   */
  private generateTransition(transition: Transition): string {
    let xml = '    <Paragraph Type="Transition">\n';
    xml += `      <Text>${this.escapeXML(transition.text)}</Text>\n`;
    xml += '    </Paragraph>\n';
    return xml;
  }

  /**
   * Generate metadata section
   */
  private generateMetadata(screenplay: Screenplay): string {
    let xml = '  <TitlePage>\n';
    xml += `    <Title>${this.escapeXML(screenplay.title)}</Title>\n`;
    xml += `    <Author>${this.escapeXML(screenplay.author)}</Author>\n`;

    if (screenplay.metadata.genre) {
      xml += `    <Genre>${this.escapeXML(screenplay.metadata.genre)}</Genre>\n`;
    }

    if (screenplay.metadata.logline) {
      xml += `    <Logline>${this.escapeXML(screenplay.metadata.logline)}</Logline>\n`;
    }

    xml += '  </TitlePage>\n';

    xml += '  <ElementSettings>\n';
    xml += this.generateElementSettings();
    xml += '  </ElementSettings>\n';

    return xml;
  }

  /**
   * Generate element settings (formatting rules)
   */
  private generateElementSettings(): string {
    let xml = '';

    const elements = [
      { type: 'Scene Heading', fontStyle: 'AllCaps+Bold' },
      { type: 'Action', fontStyle: 'Regular' },
      { type: 'Character', fontStyle: 'AllCaps' },
      { type: 'Dialogue', fontStyle: 'Regular' },
      { type: 'Parenthetical', fontStyle: 'Regular' },
      { type: 'Transition', fontStyle: 'AllCaps' }
    ];

    for (const element of elements) {
      xml += `    <ElementSettings Type="${element.type}">\n`;
      xml += '      <FontSpec>\n';
      xml += '        <Font>Courier Final Draft</Font>\n';
      xml += '        <Size>12</Size>\n';
      xml += `        <Style>${element.fontStyle}</Style>\n`;
      xml += '      </FontSpec>\n';
      xml += '    </ElementSettings>\n';
    }

    return xml;
  }

  /**
   * Escape special XML characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Export screenplay to PDF (requires external renderer)
   */
  async exportToPDF(screenplay: Screenplay): Promise<Buffer> {
    // This would integrate with a PDF rendering library
    // For now, return FDX format which can be opened in Final Draft and exported to PDF
    return this.exportToFinalDraft(screenplay);
  }

  /**
   * Export screenplay to HTML with proper formatting
   */
  async exportToHTML(screenplay: Screenplay): Promise<string> {
    let html = '<!DOCTYPE html>\n';
    html += '<html lang="en">\n';
    html += '<head>\n';
    html += '  <meta charset="UTF-8">\n';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += `  <title>${screenplay.title}</title>\n`;
    html += '  <style>\n';
    html += this.getHTMLStyles();
    html += '  </style>\n';
    html += '</head>\n';
    html += '<body>\n';

    // Title page
    html += '  <div class="title-page">\n';
    html += `    <h1>${screenplay.title_page.title}</h1>\n`;
    if (screenplay.title_page.subtitle) {
      html += `    <p class="subtitle">${screenplay.title_page.subtitle}</p>\n`;
    }
    html += '    <p class="credit">Written by</p>\n';
    html += `    <p class="author">${screenplay.title_page.author}</p>\n`;
    if (screenplay.title_page.based_on) {
      html += `    <p class="based-on">${screenplay.title_page.based_on}</p>\n`;
    }
    html += '  </div>\n';

    // Scenes
    html += '  <div class="screenplay">\n';
    for (const scene of screenplay.scenes) {
      html += this.generateSceneHTML(scene);
    }
    html += '  </div>\n';

    html += '</body>\n';
    html += '</html>\n';

    return html;
  }

  /**
   * Generate HTML for a single scene
   */
  private generateSceneHTML(scene: Scene): string {
    let html = '    <div class="scene">\n';

    // Scene heading
    const intExt = scene.interior ? 'INT.' : 'EXT.';
    html += `      <p class="scene-heading">${intExt} ${scene.location.toUpperCase()} - ${scene.time_of_day.toUpperCase()}</p>\n`;

    // Action
    for (const action of scene.action) {
      html += `      <p class="action">${this.escapeHTML(action.text)}</p>\n`;
    }

    // Dialogue
    for (const dialogue of scene.dialogue) {
      let characterText = dialogue.character.text.toUpperCase();
      if (dialogue.character.extension) {
        characterText += ` (${dialogue.character.extension})`;
      }
      html += `      <p class="character">${characterText}</p>\n`;

      if (dialogue.parenthetical) {
        html += `      <p class="parenthetical">(${dialogue.parenthetical.text})</p>\n`;
      }

      for (const line of dialogue.lines) {
        html += `      <p class="dialogue">${this.escapeHTML(line.text)}</p>\n`;
      }
    }

    // Transition
    if (scene.transition) {
      html += `      <p class="transition">${scene.transition.text}</p>\n`;
    }

    html += '    </div>\n';
    return html;
  }

  /**
   * Get CSS styles for HTML export
   */
  private getHTMLStyles(): string {
    return `
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1.5;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in 1.5in 1in 1in;
    }

    .title-page {
      text-align: center;
      margin-top: 33vh;
      page-break-after: always;
    }

    .title-page h1 {
      text-transform: uppercase;
      margin-bottom: 2em;
    }

    .title-page .author {
      font-weight: bold;
    }

    .scene {
      margin-bottom: 1.5em;
    }

    .scene-heading {
      font-weight: bold;
      text-transform: uppercase;
      margin: 1.5em 0 0.5em 0;
    }

    .action {
      margin: 0.5em 0;
      max-width: 6in;
    }

    .character {
      text-transform: uppercase;
      margin: 1em 0 0 2.2in;
    }

    .parenthetical {
      margin: 0 0 0 1.6in;
      max-width: 2in;
    }

    .dialogue {
      margin: 0 0 0 1in;
      max-width: 3.5in;
    }

    .transition {
      text-transform: uppercase;
      text-align: right;
      margin: 1em 0;
    }
    `;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
