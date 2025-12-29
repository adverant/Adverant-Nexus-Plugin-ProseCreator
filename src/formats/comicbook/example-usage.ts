/**
 * Comic Book Format System - Example Usage
 */

import { ComicBookFormatter } from './ComicBookFormatter';
import { PanelGenerator } from './PanelGenerator';
import { DialogueBalloonPlacer } from './DialogueBalloonPlacer';
import { PanelLayoutOptimizer } from './PanelLayoutOptimizer';
import { ArtDirectionGenerator } from './ArtDirectionGenerator';
import { ComicPanel, Beat, ComicStyle } from './types';

async function exampleComicBookWorkflow() {
  console.log('=== Comic Book Format System Examples ===\n');

  // Example 1: Format existing comic script
  console.log('1. Formatting Comic Script');
  const formatter = new ComicBookFormatter();

  const sampleScript = await formatter.formatComicScript({
    project_id: 'project_123',
    title: 'The Last Guardian',
    issue_number: 1,
    writer: 'John Doe',
    artist: 'Jane Smith',
    pages: [
      {
        pageNumber: 1,
        panels: [
          {
            number: 1,
            size: 'large',
            description: 'Establishing shot of a dystopian city at sunset',
            artDirection: 'Wide angle, dramatic lighting from setting sun',
            composition: {
              shotType: 'establishing-shot',
              angle: 'eye-level',
              perspective: 'two-point',
              focalPoint: { x: 0.5, y: 0.4 }
            },
            characters: [],
            location: 'Neo-Tokyo skyline',
            time: 'Sunset',
            captions: ['The year is 2145. Humanity stands on the brink.'],
            dialogue: [],
            sfx: []
          },
          {
            number: 2,
            size: 'medium',
            description: 'Close-up of protagonist looking out window',
            artDirection: 'Close-up shot, backlighting from window',
            composition: {
              shotType: 'close-up',
              angle: 'eye-level',
              perspective: 'two-point',
              focalPoint: { x: 0.5, y: 0.5 }
            },
            characters: [
              {
                name: 'Alex',
                expression: 'determined',
                pose: 'standing',
                position: { x: 0.5, y: 0.5 },
                facing: 'left'
              }
            ],
            location: 'Alex\'s apartment',
            captions: [],
            dialogue: [
              {
                character: 'Alex',
                text: 'They said it couldn\'t be done. They were wrong.',
                thought: true,
                whisper: false,
                shout: false,
                narration: false,
                offPanel: false
              }
            ],
            sfx: []
          }
        ]
      }
    ]
  });

  console.log(`Script formatted:`);
  console.log(`- Total pages: ${sampleScript.total_pages}`);
  console.log(`- Total panels: ${sampleScript.total_panels}`);
  console.log(`- Word count: ${sampleScript.dialogue_word_count}`);
  console.log(`- Estimated art time: ${sampleScript.estimated_art_time_hours} hours\n`);

  // Export as text
  const textExport = formatter.exportAsText(sampleScript);
  console.log('Text export (first 500 chars):');
  console.log(textExport.substring(0, 500) + '...\n');

  // Example 2: Generate panels from narrative beat
  console.log('2. Generating Panels from Narrative Beat');
  const generator = new PanelGenerator();

  const narrativeBeat: Beat = {
    beat_number: 1,
    description: 'Alex discovers an ancient artifact hidden in the ruins. As they touch it, visions of the past flood their mind. Suddenly, guards burst through the door.',
    moments: [
      {
        description: 'Alex carefully brushes dust off a glowing artifact',
        characters: ['Alex'],
        action: 'examining artifact carefully',
        emotion: 'curious',
        importance: 0.7
      },
      {
        description: 'Artifact glows brightly, Alex\'s eyes widen in shock',
        characters: ['Alex'],
        action: 'touching artifact, experiencing visions',
        emotion: 'shocked',
        importance: 0.9,
        dialogue: ['Alex: What... what is this?']
      },
      {
        description: 'Guards kick down the door with weapons drawn',
        characters: ['Guard 1', 'Guard 2'],
        action: 'bursting through door',
        emotion: 'aggressive',
        importance: 0.8,
        dialogue: ['Guard 1: Freeze! Step away from the artifact!']
      }
    ],
    tone: 'tense',
    pacing: 'fast'
  };

  const generatedPanels = await generator.generatePanelsFromBeat({
    beat: narrativeBeat,
    target_pages: 1,
    style: 'traditional'
  });

  console.log(`Generated ${generatedPanels.total_panels} panels across ${generatedPanels.pages.length} page(s)`);
  console.log(`Average panels per page: ${generatedPanels.avg_panels_per_page.toFixed(1)}`);
  console.log(`Style: ${generatedPanels.style}\n`);

  // Example 3: Optimize balloon placement
  console.log('3. Optimizing Dialogue Balloon Placement');
  const balloonPlacer = new DialogueBalloonPlacer();

  const panelWithDialogue: ComicPanel = generatedPanels.pages[0].panels[1]; // Panel with dialogue

  const balloonLayout = await balloonPlacer.placeBalloons(panelWithDialogue);

  console.log(`Placed ${balloonLayout.balloons.length} speech balloons`);
  console.log(`Reading order optimized: ${balloonLayout.readingOrder.join(' → ')}`);
  console.log(`Estimated reading time: ${balloonLayout.estimatedReadingTime} seconds\n`);

  // Validate placement
  const validation = balloonPlacer.validatePlacement(balloonLayout);
  console.log(`Balloon placement valid: ${validation.valid}`);
  if (validation.issues.length > 0) {
    console.log(`Issues: ${validation.issues.join(', ')}`);
  }
  console.log();

  // Example 4: Optimize page layout
  console.log('4. Optimizing Page Layout');
  const layoutOptimizer = new PanelLayoutOptimizer();

  const allPanels = generatedPanels.pages.flatMap(page => page.panels);
  const optimizedPages = await layoutOptimizer.optimizePageLayout(allPanels);

  console.log(`Optimized into ${optimizedPages.length} page(s)`);
  for (const page of optimizedPages) {
    console.log(`  Page ${page.pageNumber}: ${page.panelCount} panels (${page.layoutType} layout)`);
  }
  console.log();

  // Calculate pacing
  const pacing = layoutOptimizer.calculatePacing(allPanels);
  console.log(`Overall pace: ${pacing.overallPace}`);
  if (pacing.recommendations.length > 0) {
    console.log(`Recommendations:`);
    for (const rec of pacing.recommendations) {
      console.log(`  - ${rec}`);
    }
  }
  console.log();

  // Example 5: Generate art direction
  console.log('5. Generating Art Direction');
  const artDirector = new ArtDirectionGenerator();

  const artDirection = await artDirector.generateArtDirection({
    panels: allPanels,
    style: 'traditional',
    genre: 'sci-fi',
    tone: 'dark'
  });

  console.log(`Overall mood: ${artDirection.overall_mood}`);
  console.log(`Color palette: ${artDirection.color_palette.slice(0, 3).join(', ')}...`);
  console.log(`Lighting: ${artDirection.lighting_notes.substring(0, 80)}...`);
  if (artDirection.reference_artists) {
    console.log(`Reference artists: ${artDirection.reference_artists.slice(0, 2).join(', ')}...`);
  }
  console.log();

  // Export art direction
  const artDirectionDoc = artDirector.exportArtDirection(artDirection);
  console.log('Art direction document (first 400 chars):');
  console.log(artDirectionDoc.substring(0, 400) + '...\n');

  console.log('=== Comic Book Examples Complete ===\n');
}

// Run examples if executed directly
if (require.main === module) {
  exampleComicBookWorkflow().catch(console.error);
}

export { exampleComicBookWorkflow };
