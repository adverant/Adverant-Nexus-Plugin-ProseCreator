/**
 * Poetry Analysis System - Example Usage
 */

import { PoetryAnalyzer } from './PoetryAnalyzer';
import { MeterDetector } from './MeterDetector';
import { RhymeSchemeAnalyzer } from './RhymeSchemeAnalyzer';
import { SyllableCounter } from './SyllableCounter';

async function examplePoetryWorkflow() {
  console.log('=== Poetry Analysis System Examples ===\n');

  // Example 1: Analyze a Shakespearean sonnet
  console.log('1. Analyzing Shakespearean Sonnet');
  const analyzer = new PoetryAnalyzer();

  const shakespeareanSonnet = `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate.
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimmed;
And every fair from fair sometime declines,
By chance, or nature's changing course untrimmed;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st,
Nor shall death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st.
So long as men can breathe or eyes can see,
So long lives this, and this gives life to thee.`;

  const sonnetAnalysis = await analyzer.analyzePoem(shakespeareanSonnet);

  console.log(`Form detected: ${sonnetAnalysis.form.type} (${(sonnetAnalysis.form.confidence * 100).toFixed(0)}% confidence)`);
  console.log(`Total lines: ${sonnetAnalysis.totalLines}`);
  console.log(`Meter: ${sonnetAnalysis.meter.name} (${(sonnetAnalysis.meter.confidence * 100).toFixed(0)}% consistent)`);
  console.log(`Rhyme scheme: ${sonnetAnalysis.rhymeScheme.scheme}`);
  console.log(`Perfect rhymes: ${sonnetAnalysis.rhymeScheme.perfectRhymes}`);
  console.log(`Rhythm score: ${(sonnetAnalysis.rhythmScore * 100).toFixed(1)}%`);
  console.log(`Technical score: ${sonnetAnalysis.technicalScore.toFixed(1)}/100`);
  console.log(`Artistic score: ${sonnetAnalysis.artisticScore.toFixed(1)}/100`);
  console.log(`Overall score: ${sonnetAnalysis.overallScore.toFixed(1)}/100\n`);

  console.log('Literary devices found:');
  for (const device of sonnetAnalysis.literaryDevices.slice(0, 3)) {
    console.log(`  Line ${device.line + 1}: ${device.device} - ${device.explanation}`);
  }
  console.log();

  console.log('Themes identified:', sonnetAnalysis.themes.join(', '));
  console.log();

  if (sonnetAnalysis.suggestions.length > 0) {
    console.log('Suggestions:');
    for (const suggestion of sonnetAnalysis.suggestions) {
      console.log(`  [${suggestion.priority}] ${suggestion.description}`);
    }
    console.log();
  }

  // Example 2: Analyze a haiku
  console.log('2. Analyzing Haiku');
  const haiku = `An old silent pond
A frog jumps into the pond
Splash! Silence again.`;

  const haikuAnalysis = await analyzer.analyzePoem(haiku);

  console.log(`Form detected: ${haikuAnalysis.form.type} (${(haikuAnalysis.form.confidence * 100).toFixed(0)}% confidence)`);
  console.log(`Line syllables: ${haikuAnalysis.lineLengths.join('-')}`);
  console.log(`Requirements met: ${haikuAnalysis.form.requirements.met.join(', ')}`);
  console.log(`Overall score: ${haikuAnalysis.overallScore.toFixed(1)}/100\n`);

  // Example 3: Detect meter in specific lines
  console.log('3. Detecting Meter in Lines');
  const meterDetector = new MeterDetector();

  const lines = [
    'To be or not to be, that is the question',
    'The curfew tolls the knell of parting day',
    'Once upon a midnight dreary, while I pondered weak and weary'
  ];

  for (const line of lines) {
    const meter = await meterDetector.detectMeter(line);
    console.log(`"${line}"`);
    console.log(`  Meter: ${meter.name} (${(meter.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`  Feet: ${meter.feet}`);
    if (meter.variations.length > 0) {
      console.log(`  Variations: ${meter.variations.length} metrical substitutions`);
    }
    console.log();
  }

  // Example 4: Analyze rhyme scheme
  console.log('4. Analyzing Rhyme Scheme');
  const rhymeAnalyzer = new RhymeSchemeAnalyzer();

  const poemLines = [
    'Roses are red',
    'Violets are blue',
    'Sugar is sweet',
    'And so are you'
  ];

  const rhymeScheme = await rhymeAnalyzer.analyzeRhymeScheme(poemLines);

  console.log(`Rhyme scheme: ${rhymeScheme.scheme}`);
  console.log(`Perfect rhymes: ${rhymeScheme.perfectRhymes}`);
  console.log(`Slant rhymes: ${rhymeScheme.slantRhymes}`);
  console.log(`Quality score: ${(rhymeScheme.qualityScore * 100).toFixed(1)}%\n`);

  console.log('Rhyme groups:');
  for (const group of rhymeScheme.groups) {
    console.log(`  ${group.letter}: ${group.words.join(', ')} (${group.quality})`);
  }
  console.log();

  // Validate rhyme scheme
  const rhymeValidation = rhymeAnalyzer.validateRhymeScheme(rhymeScheme);
  console.log(`Rhyme scheme valid: ${rhymeValidation.valid}`);
  if (rhymeValidation.issues.length > 0) {
    console.log('Issues:', rhymeValidation.issues.join(', '));
  }
  if (rhymeValidation.suggestions.length > 0) {
    console.log('Suggestions:', rhymeValidation.suggestions.join(', '));
  }
  console.log();

  // Example 5: Count syllables
  console.log('5. Syllable Counting');
  const syllableCounter = new SyllableCounter();

  const testWords = [
    'poetry',
    'beautiful',
    'computer',
    'fire',
    'chocolate',
    'throughout'
  ];

  console.log('Word syllable counts:');
  for (const word of testWords) {
    const result = syllableCounter.countSyllables(word);
    console.log(`  ${word}: ${result.syllables} syllables (${result.method}, ${(result.confidence * 100).toFixed(0)}% confidence)`);
    if (result.breakdown) {
      console.log(`    Breakdown: ${result.breakdown.join('-')}`);
    }
  }
  console.log();

  // Example 6: Analyze free verse poetry
  console.log('6. Analyzing Free Verse');
  const freeVerse = `I wandered lonely as a cloud
That floats on high o'er vales and hills
When all at once I saw a crowd
A host of golden daffodils`;

  const freeVerseAnalysis = await analyzer.analyzePoem(freeVerse);

  console.log(`Form: ${freeVerseAnalysis.form.type}`);
  console.log(`Meter: ${freeVerseAnalysis.meter.name}`);
  console.log(`Rhyme scheme: ${freeVerseAnalysis.rhymeScheme.scheme}`);
  console.log(`Emotional arc: ${freeVerseAnalysis.emotionalArc.overallTone}`);
  if (freeVerseAnalysis.emotionalArc.climax) {
    console.log(`Emotional climax: Line ${freeVerseAnalysis.emotionalArc.climax.line + 1}`);
  }
  console.log();

  console.log('Imagery detected:');
  for (const image of freeVerseAnalysis.imagery.slice(0, 3)) {
    console.log(`  - ${image}`);
  }
  console.log();

  console.log('=== Poetry Analysis Examples Complete ===\n');
}

// Run examples if executed directly
if (require.main === module) {
  examplePoetryWorkflow().catch(console.error);
}

export { examplePoetryWorkflow };
