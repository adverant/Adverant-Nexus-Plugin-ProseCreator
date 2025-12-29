# Format-Specific Extensions

This module provides specialized formatting and optimization tools for different content types supported by NexusProseCreator.

## Supported Formats

### 1. Screenplay Formatting

Professional screenplay formatting following industry standards.

#### Features

- **Industry-Standard Formatting**
  - Courier 12pt font
  - Proper margins (1.5" left, 1" right, 1" top/bottom)
  - Scene headings (INT./EXT.)
  - Action lines
  - Character names and dialogue
  - Parentheticals
  - Transitions

- **Fountain Format Support**
  - Import/export Fountain markup
  - Plain-text screenplay format
  - Compatible with major screenwriting software

- **Final Draft Export**
  - Export to .fdx format (Final Draft XML)
  - Compatible with Final Draft software
  - HTML export with CSS styling

- **Screenplay Analysis**
  - Page count calculation (1 page = 1 minute rule)
  - Dialogue vs action ratio
  - Character appearances tracking
  - Location breakdown
  - Act structure analysis

#### Example Usage

```typescript
import { ScreenplayFormatter } from './screenplay';

const formatter = new ScreenplayFormatter();

const formatted = await formatter.formatScreenplay({
  project_id: 'abc123',
  title: 'The Great Adventure',
  author: 'Jane Doe',
  scenes: [
    {
      scene_number: 1,
      interior: true,
      location: 'COFFEE SHOP',
      time_of_day: 'DAY',
      action: [
        { text: 'JANE enters the busy coffee shop, scanning for a familiar face.' }
      ],
      dialogue: [
        {
          character: { text: 'JANE' },
          lines: [
            { text: 'Has anyone seen my laptop?' }
          ]
        }
      ]
    }
  ]
});

console.log(`Formatted screenplay: ${formatted.page_count} pages`);
```

#### API Endpoints

- `POST /formats/screenplay/format` - Format screenplay
- `POST /formats/screenplay/analyze` - Analyze screenplay structure
- `POST /formats/screenplay/export/fountain` - Export to Fountain
- `POST /formats/screenplay/export/finaldraft` - Export to Final Draft .fdx
- `POST /formats/screenplay/export/html` - Export to HTML
- `POST /formats/screenplay/import/fountain` - Import from Fountain

### 2. YouTube Script Optimization

Video script formatting optimized for YouTube content with engagement analysis.

#### Features

- **Script Structure**
  - Hook (0:00-0:30) - Critical first 30 seconds
  - Introduction (0:30-1:00)
  - Main Content (structured sections)
  - Call-to-Action (30-60 seconds)
  - Outro (15-30 seconds)

- **Hook Optimization**
  - Retention score prediction (0-100)
  - Multiple hook variations generation
  - A/B testing comparison
  - Best practice analysis
  - Engagement element detection

- **SEO Optimization**
  - Title optimization (60 char limit)
  - Description structure
  - Tag generation
  - Thumbnail concepts
  - Keyword analysis
  - CTR prediction

- **Timing Analysis**
  - Speaking rate calculation (WPM)
  - Section duration breakdown
  - Pacing analysis
  - Engagement distribution
  - Pattern interrupt tracking

- **Chapter Timestamps**
  - Auto-generated timestamps
  - YouTube description format
  - Optimized for navigation

#### Example Usage

```typescript
import { YouTubeScriptFormatter, HookOptimizer, SEOOptimizer } from './youtube';

// Format complete video script
const formatter = new YouTubeScriptFormatter();

const script = await formatter.formatVideoScript({
  project_id: 'xyz789',
  title: 'How to Master TypeScript in 30 Days',
  target_duration: 10, // minutes
  beats: [
    {
      id: '1',
      title: 'Hook',
      content: 'Did you know 90% of developers struggle with TypeScript? Here\'s how I mastered it in just 30 days...',
      type: 'hook',
      duration: 25,
      word_count: 20
    },
    // ... more beats
  ]
});

// Optimize hook
const hookOptimizer = new HookOptimizer();

const hookAnalysis = await hookOptimizer.optimizeHook(
  'Did you know 90% of developers struggle with TypeScript?'
);

console.log(`Hook retention score: ${hookAnalysis.retention_score}/100`);
console.log(`Suggestions:`, hookAnalysis.suggestions);

// Generate hook variations
const variations = await hookOptimizer.generateHookVariations(
  'Learn TypeScript the easy way',
  3
);

console.log('Top variations:', variations);

// Optimize for SEO
const seoOptimizer = new SEOOptimizer();

const seo = await seoOptimizer.optimizeForYouTube({
  title: 'Master TypeScript in 30 Days',
  description: 'Learn TypeScript from scratch',
  content: script.main_content.sections.map(s => s.content).join('\n')
});

console.log('Optimized title:', seo.title.optimized);
console.log('Tags:', seo.tags);
console.log('Estimated CTR:', seo.engagement_predictions.estimated_ctr);
```

#### API Endpoints

- `POST /formats/youtube/format` - Format video script
- `POST /formats/youtube/analyze-timing` - Analyze timing and pacing
- `POST /formats/youtube/optimize-hook` - Optimize hook for retention
- `POST /formats/youtube/hook-variations` - Generate hook variations
- `POST /formats/youtube/compare-hooks` - A/B test hooks
- `POST /formats/youtube/seo` - Optimize for YouTube SEO
- `GET /formats/youtube/best-practices` - Get best practices guide

## YouTube Best Practices

### Hook (First 30 Seconds)

The first 30 seconds are **critical** for viewer retention. YouTube's algorithm heavily weights retention in the first 30 seconds.

**Best Practices:**
- Start with a question to engage viewers
- Use surprising statistics or facts
- Address viewer pain points immediately
- Create curiosity gap to keep viewers watching
- Keep it under 30 seconds

**Hook Types:**
- **Question**: "Have you ever wondered why...?"
- **Statistic**: "90% of people don't know this..."
- **Story**: "Last week, I discovered something that changed everything..."
- **Problem**: "Struggling with X? Here's the solution..."
- **Curiosity**: "The secret nobody tells you about..."

### Title Optimization

- Keep titles under 60 characters (mobile display)
- Front-load keywords for SEO
- Include numbers when possible (increases CTR by 15-20%)
- Create curiosity gap without being clickbait
- Use emotional language

**Good Examples:**
- "7 TypeScript Tricks That Will 10x Your Productivity"
- "How I Mastered TypeScript in 30 Days (Complete Guide)"
- "TypeScript Tutorial: The Ultimate Beginner's Guide"

### Description Structure

1. **First 150 characters** - Visible without "show more"
   - Include primary keyword
   - State value proposition
   - Add CTA

2. **Body** - Detailed description
   - Expand on content
   - Include secondary keywords
   - Natural keyword density (2-3%)

3. **Timestamps** - Chapter markers
   - Every 1-2 minutes
   - Clear section titles
   - Improves navigation

4. **Links** - Relevant resources
   - Product links
   - Social media
   - Related videos

### Tags

- Use 15-20 tags (500 character limit)
- Mix of broad and specific tags
- Include target keyword variations
- Add trending related tags

### Engagement Strategy

- **Pattern Interrupts**: Every 2-3 minutes
  - Questions
  - Statistics
  - Stories
  - Visual changes

- **Engagement Prompts**: Every 60-90 seconds
  - "Let me know in comments"
  - "What do you think?"
  - "Share your experience"

- **Visual Variety**
  - B-roll footage
  - Graphics and animations
  - Screen recordings
  - Different camera angles

## Screenplay Industry Standards

### Formatting Rules

**Font**: Courier or Courier New, 12pt
**Page Margins**: 1.5" left, 1" right, 1" top, 1" bottom

**Element Positioning** (from left edge):
- Scene Heading: 1.5"
- Action: 1.5"
- Character Name: 3.7"
- Parenthetical: 3.1"
- Dialogue: 2.5"
- Transition: 6.0" (right-aligned)

**Element Widths**:
- Action: 6.0"
- Dialogue: 3.5"
- Parenthetical: 2.0"

### Page Count Rule

**1 page = approximately 1 minute of screen time**

- Feature film: 90-120 pages (90-120 minutes)
- TV episode (1 hour): 50-60 pages
- TV episode (30 min): 25-30 pages

### Scene Heading Format

```
INT. LOCATION - TIME
EXT. LOCATION - TIME
INT./EXT. LOCATION - TIME
```

Examples:
- `INT. COFFEE SHOP - DAY`
- `EXT. CITY STREET - NIGHT`
- `INT./EXT. CAR - CONTINUOUS`

### Character Extensions

- `(V.O.)` - Voice Over
- `(O.S.)` - Off Screen
- `(O.C.)` - Off Camera
- `(CONT'D)` - Continued (after interruption)

### Transitions

Common transitions (right-aligned, ALL CAPS):
- `CUT TO:`
- `FADE TO:`
- `DISSOLVE TO:`
- `MATCH CUT TO:`
- `SMASH CUT TO:`

## Architecture

```
formats/
├── screenplay/
│   ├── types.ts                 # TypeScript type definitions
│   ├── ScreenplayFormatter.ts   # Main formatting engine
│   ├── FountainConverter.ts     # Fountain format converter
│   ├── FinalDraftExporter.ts    # Final Draft .fdx exporter
│   └── index.ts                 # Module exports
│
├── youtube/
│   ├── types.ts                 # TypeScript type definitions
│   ├── YouTubeScriptFormatter.ts # Main script formatter
│   ├── HookOptimizer.ts         # Hook optimization engine
│   ├── SEOOptimizer.ts          # SEO optimization engine
│   └── index.ts                 # Module exports
│
├── index.ts                     # Main module exports
└── README.md                    # This file
```

## Testing

```bash
# Run format-specific tests
npm test -- formats

# Test screenplay formatting
npm test -- formats/screenplay

# Test YouTube optimization
npm test -- formats/youtube
```

## Contributing

When adding new format support:

1. Create new directory under `formats/`
2. Define types in `types.ts`
3. Implement formatter class
4. Add routes in `routes/formats.routes.ts`
5. Update main `index.ts` exports
6. Add documentation to this README
7. Write tests

## Performance

- Screenplay formatting: < 100ms for typical screenplay
- YouTube SEO optimization: < 500ms
- Hook optimization: < 200ms
- Fountain conversion: < 50ms

## Future Formats

Planned format support:
- Stage plays
- Comic book scripts
- Podcast scripts
- How-to guides
- Poetry collections

## References

### Screenplay
- [Screenplay Format Guide](https://www.scriptreaderpro.com/screenplay-format/)
- [Fountain Syntax Specification](https://fountain.io/syntax)
- [Final Draft FDX Format](https://www.finaldraft.com/)

### YouTube
- [YouTube Creator Academy](https://creatoracademy.youtube.com/)
- [YouTube SEO Best Practices](https://backlinko.com/youtube-seo)
- [Video Hook Optimization Research](https://tubularinsights.com/)
