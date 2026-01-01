# ProseCreator Use Cases

Real-world creative writing workflows and novel production strategies.

---

## Use Case 1: Complete Novel from Premise to Publication

### Problem

Authors have great ideas but struggle to complete manuscripts. Writer's block, plot inconsistencies, and the sheer volume of words needed overwhelm most writers.

### Solution

End-to-end novel creation with AI-assisted planning, generation, and revision.

### Implementation

```typescript
import { NexusClient } from '@adverant/nexus-sdk';

class NovelProductionWorkflow {
  private prose;

  constructor(nexusClient: NexusClient) {
    this.prose = nexusClient.plugin('nexus-prosecreator');
  }

  async createNovelFromPremise(premise: NovelPremise) {
    // Step 1: Create project
    const project = await this.prose.projects.create({
      title: premise.title,
      genre: premise.genre,
      format: 'novel',
      targetWordCount: premise.targetWords || 80000,
      premise: premise.summary,
      settings: {
        tone: premise.tone,
        pacing: premise.pacing,
        perspective: premise.pov
      }
    });

    // Step 2: Generate comprehensive blueprint
    const blueprint = await this.prose.blueprints.project({
      projectId: project.projectId,
      depth: 'comprehensive',
      include: [
        'three_act_structure',
        'chapter_outlines',
        'character_arcs',
        'world_building',
        'subplot_threads',
        'theme_tracking'
      ]
    });

    // Step 3: Create detailed character profiles
    const characters = await this.createCharacters(project.projectId, blueprint.characters);

    // Step 4: Generate chapter-by-chapter
    const chapters = [];
    for (let i = 1; i <= blueprint.chapters.length; i++) {
      // Generate chapter blueprint first
      const chapterBlueprint = await this.prose.blueprints.chapter({
        projectId: project.projectId,
        chapterNumber: i,
        includeBeats: true
      });

      // Generate the actual chapter
      const chapter = await this.prose.generation.chapter({
        projectId: project.projectId,
        chapterNumber: i,
        options: {
          humanization: 'premium',
          streaming: false
        }
      });

      // Run continuity check after each chapter
      const continuity = await this.prose.analysis.continuity({
        projectId: project.projectId,
        chapters: [i]
      });

      chapters.push({
        number: i,
        wordCount: chapter.wordCount,
        continuityScore: continuity.continuityScore
      });

      console.log(`Chapter ${i} complete: ${chapter.wordCount} words, continuity: ${continuity.continuityScore}`);
    }

    // Step 5: Final analysis
    const finalAnalysis = await this.prose.analysis.comprehensive({
      projectId: project.projectId,
      include: ['continuity', 'plot_holes', 'pacing', 'character_consistency']
    });

    // Step 6: Export
    const exports = await this.prose.exports.create({
      projectId: project.projectId,
      formats: ['docx', 'epub', 'pdf'],
      includeMetadata: true,
      formatting: {
        chapterHeadings: true,
        sceneSeparators: '* * *',
        frontMatter: true
      }
    });

    return {
      project,
      chapters,
      totalWords: chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      finalAnalysis,
      exportUrls: exports.downloadUrls
    };
  }

  private async createCharacters(projectId: string, characterData: any[]) {
    return Promise.all(
      characterData.map(char =>
        this.prose.characters.create({
          projectId,
          name: char.name,
          role: char.role,
          traits: char.traits
        })
      )
    );
  }
}
```

### Business Impact

- **Faster manuscript completion** with AI assistance
- **Reduced plot inconsistencies** with continuous analysis
- **Consistent characters** throughout the story
- **Publication-ready manuscripts** with proper formatting

---

## Use Case 2: Series Bible and Multi-Book Management

### Problem

Writing a book series requires tracking complex continuity across multiple books—character development, world-building details, timeline events, and recurring plot threads.

### Solution

Living series bible with infinite memory and cross-book continuity tracking.

### Implementation

```python
class SeriesManagement:
    def __init__(self, nexus_client):
        self.prose = nexus_client.plugin("nexus-prosecreator")

    async def create_series(self, series_config: dict):
        # Create series-level project
        series = await self.prose.series.create(
            name=series_config["name"],
            genre=series_config["genre"],
            planned_books=series_config["book_count"],
            premise=series_config["series_premise"],
            settings={
                "world": series_config["world_name"],
                "timeline_span": series_config["timeline"]
            }
        )

        # Generate series blueprint
        series_blueprint = await self.prose.blueprints.series(
            series_id=series.series_id,
            include=[
                "series_arc",
                "book_summaries",
                "character_journeys",
                "world_evolution",
                "recurring_threads"
            ]
        )

        # Create series bible
        bible = await self.prose.series.create_bible(
            series_id=series.series_id,
            sections=[
                "world_rules",
                "magic_system",
                "geography",
                "history",
                "cultures",
                "characters",
                "timeline"
            ]
        )

        return {
            "series": series,
            "blueprint": series_blueprint,
            "bible": bible
        }

    async def add_book_to_series(self, series_id: str, book_config: dict):
        # Create book within series context
        book = await self.prose.projects.create(
            series_id=series_id,
            title=book_config["title"],
            book_number=book_config["number"],
            premise=book_config["premise"],
            inherit_world=True,  # Pull from series bible
            inherit_characters=True  # Maintain character continuity
        )

        # Generate book blueprint that respects series continuity
        blueprint = await self.prose.blueprints.project(
            project_id=book.project_id,
            series_aware=True,
            check_continuity=True
        )

        return {
            "book": book,
            "blueprint": blueprint,
            "continuity_warnings": blueprint.series_continuity_notes
        }

    async def check_series_continuity(self, series_id: str):
        return await self.prose.analysis.series_continuity(
            series_id=series_id,
            include=[
                "character_consistency",
                "timeline_integrity",
                "world_rule_violations",
                "plot_thread_tracking",
                "foreshadowing_payoff"
            ]
        )

    async def get_character_journey(self, series_id: str, character_name: str):
        return await self.prose.characters.journey(
            series_id=series_id,
            character_name=character_name,
            include=[
                "appearances",
                "arc_progression",
                "relationship_changes",
                "key_moments",
                "growth_metrics"
            ]
        )

    async def update_series_bible(self, series_id: str, new_content: dict):
        # Update bible and propagate changes
        return await self.prose.series.update_bible(
            series_id=series_id,
            updates=new_content,
            apply_to_existing_books=True,
            flag_conflicts=True
        )
```

### Business Impact

- **Perfect continuity** across unlimited books
- **Living series bible** that evolves with the story
- **Character journeys** tracked automatically
- **Reduced revision time** by catching continuity issues early

---

## Use Case 3: Screenplay and Stage Play Writing

### Problem

Screenwriting requires specialized formatting, tight dialogue, and visual storytelling that differs significantly from prose. Most authors struggle with the transition.

### Solution

AI-powered screenplay generation with industry-standard formatting and dialogue optimization.

### Implementation

```typescript
class ScreenplayProduction {
  private prose;

  constructor(nexusClient: NexusClient) {
    this.prose = nexusClient.plugin('nexus-prosecreator');
  }

  async createScreenplay(screenplayConfig: ScreenplayConfig) {
    // Create screenplay project
    const project = await this.prose.projects.create({
      title: screenplayConfig.title,
      genre: screenplayConfig.genre,
      format: 'screenplay',
      targetWordCount: 25000, // ~120 pages
      premise: screenplayConfig.logline,
      settings: {
        tone: screenplayConfig.tone,
        pacing: 'tight',
        perspective: 'present_tense'
      }
    });

    // Generate screenplay structure
    const blueprint = await this.prose.blueprints.project({
      projectId: project.projectId,
      format: 'screenplay',
      include: [
        'three_act_structure',
        'scene_list',
        'character_introductions',
        'set_pieces',
        'dialogue_notes',
        'visual_motifs'
      ]
    });

    // Create detailed character profiles with voice notes
    const characters = await Promise.all(
      screenplayConfig.characters.map(char =>
        this.prose.characters.create({
          projectId: project.projectId,
          name: char.name.toUpperCase(), // Screenplay format
          role: char.role,
          traits: {
            personality: char.personality,
            background: char.background,
            motivation: char.motivation,
            voice: char.dialogueStyle, // Critical for screenplays
            physicalDescription: char.appearance
          }
        })
      )
    );

    return {
      project,
      blueprint,
      characters,
      estimatedPages: blueprint.estimatedPages,
      sceneCount: blueprint.scenes.length
    };
  }

  async generateScene(projectId: string, sceneNumber: number) {
    // Generate scene blueprint
    const sceneBlueprint = await this.prose.blueprints.scene({
      projectId,
      sceneNumber,
      include: ['beats', 'dialogue_cues', 'visual_moments', 'subtext']
    });

    // Generate the scene
    const scene = await this.prose.generation.scene({
      projectId,
      sceneNumber,
      options: {
        humanization: 'premium',
        formatScreenplay: true,
        includeParentheticals: true,
        actionLineStyle: 'punchy' // Short, visual action lines
      }
    });

    return {
      scene,
      slugline: scene.slugline,
      pageCount: scene.estimatedPages,
      dialogueRatio: scene.dialoguePercentage
    };
  }

  async analyzeDialogue(projectId: string) {
    return await this.prose.analysis.dialogue({
      projectId,
      include: [
        'voice_distinctiveness',
        'subtext_analysis',
        'on_the_nose_detection',
        'dialogue_pacing',
        'character_voice_consistency'
      ]
    });
  }

  async exportScreenplay(projectId: string) {
    return await this.prose.exports.create({
      projectId,
      formats: ['fdx', 'pdf', 'fountain'],
      formatting: {
        standard: 'hollywood',
        titlePage: true,
        sceneNumbers: true,
        revisionMarks: false
      }
    });
  }
}
```

### Business Impact

- **Industry-standard formatting** without specialized software
- **Dialogue optimization** for authentic character voices
- **Visual storytelling guidance** through action line suggestions
- **Multiple export formats** (Final Draft, PDF, Fountain)

---

## Use Case 4: Research-Integrated Non-Fiction

### Problem

Non-fiction requires extensive research, proper citations, and maintaining factual accuracy while remaining engaging. Authors spend more time researching than writing.

### Solution

AI research assistant with source integration and fact-checking.

### Implementation

```python
class NonFictionProduction:
    def __init__(self, nexus_client):
        self.prose = nexus_client.plugin("nexus-prosecreator")

    async def create_nonfiction_project(self, config: dict):
        # Create non-fiction project
        project = await self.prose.projects.create(
            title=config["title"],
            genre="non_fiction",
            format="non_fiction",
            target_word_count=config["target_words"],
            premise=config["thesis"],
            settings={
                "tone": config["tone"],
                "audience": config["target_audience"],
                "style": config["writing_style"]
            }
        )

        # Generate research brief
        research = await self.prose.research.generate(
            project_id=project.project_id,
            topics=config["key_topics"],
            depth="comprehensive",
            include=[
                "key_facts",
                "expert_quotes",
                "statistics",
                "case_studies",
                "counterarguments"
            ]
        )

        # Create book structure
        outline = await self.prose.blueprints.project(
            project_id=project.project_id,
            format="non_fiction",
            include=[
                "chapter_structure",
                "argument_flow",
                "evidence_placement",
                "transition_points",
                "call_to_action"
            ]
        )

        return {
            "project": project,
            "research": research,
            "outline": outline
        }

    async def generate_chapter_with_research(self, project_id: str, chapter_number: int):
        # Get relevant research for this chapter
        chapter_research = await self.prose.research.for_chapter(
            project_id=project_id,
            chapter_number=chapter_number,
            include_citations=True
        )

        # Generate chapter
        chapter = await self.prose.generation.chapter(
            project_id=project_id,
            chapter_number=chapter_number,
            options={
                "humanization": "premium",
                "integrate_research": True,
                "citation_style": "chicago",  # or apa, mla
                "fact_check": True
            }
        )

        # Verify factual accuracy
        fact_check = await self.prose.analysis.fact_check(
            project_id=project_id,
            chapter_number=chapter_number
        )

        return {
            "chapter": chapter,
            "citations": chapter.citations,
            "fact_check_results": fact_check,
            "confidence_score": fact_check.overall_confidence
        }

    async def add_custom_research(self, project_id: str, research_data: dict):
        # Add author's own research/sources
        return await self.prose.research.add_source(
            project_id=project_id,
            source_type=research_data["type"],  # book, article, interview
            title=research_data["title"],
            author=research_data["author"],
            content=research_data["relevant_content"],
            citation_info=research_data["citation"]
        )

    async def generate_bibliography(self, project_id: str, style: str = "chicago"):
        return await self.prose.exports.bibliography(
            project_id=project_id,
            style=style,
            include_footnotes=True,
            include_endnotes=True
        )
```

### Business Impact

- **Reduced research time** with AI-assisted research briefs
- **Automatic citations** in multiple formats
- **Fact-checking integration** catches errors before publication
- **Maintains engaging tone** while being accurate

---

## Use Case 5: Rapid Series Production

### Problem

Indie authors need to publish frequently to maintain visibility and income. Writing 6-12 books per year manually is nearly impossible.

### Solution

Streamlined production pipeline for rapid series creation.

### Implementation

```typescript
class RapidSeriesProduction {
  private prose;

  constructor(nexusClient: NexusClient) {
    this.prose = nexusClient.plugin('nexus-prosecreator');
  }

  async createProductionPipeline(seriesConfig: SeriesConfig) {
    // Create series with all books planned
    const series = await this.prose.series.create({
      name: seriesConfig.name,
      genre: seriesConfig.genre,
      plannedBooks: seriesConfig.bookCount,
      premise: seriesConfig.premise,
      settings: {
        targetWordsPerBook: seriesConfig.wordsPerBook || 50000,
        releaseSchedule: 'monthly'
      }
    });

    // Generate complete series blueprint
    const seriesBlueprint = await this.prose.blueprints.series({
      seriesId: series.seriesId,
      depth: 'comprehensive',
      include: [
        'individual_book_premises',
        'series_arc',
        'character_introductions_per_book',
        'cliffhangers',
        'recurring_elements'
      ]
    });

    // Create all book projects
    const bookProjects = await Promise.all(
      seriesBlueprint.books.map((book, index) =>
        this.prose.projects.create({
          seriesId: series.seriesId,
          title: book.title,
          bookNumber: index + 1,
          premise: book.premise,
          inheritWorld: true,
          inheritCharacters: true
        })
      )
    );

    return {
      series,
      blueprint: seriesBlueprint,
      books: bookProjects,
      estimatedTotalWords: bookProjects.length * seriesConfig.wordsPerBook
    };
  }

  async produceBook(projectId: string, options: ProductionOptions = {}) {
    const startTime = Date.now();

    // Generate book blueprint
    const blueprint = await this.prose.blueprints.project({
      projectId,
      seriesAware: true,
      depth: 'full'
    });

    // Generate all chapters
    const chapters = [];
    for (let i = 1; i <= blueprint.chapters.length; i++) {
      const chapter = await this.prose.generation.chapter({
        projectId,
        chapterNumber: i,
        options: {
          humanization: options.humanization || 'premium',
          streaming: false
        }
      });
      chapters.push(chapter);

      if (options.progressCallback) {
        options.progressCallback({
          chapter: i,
          total: blueprint.chapters.length,
          wordCount: chapter.wordCount
        });
      }
    }

    // Final continuity check
    const continuity = await this.prose.analysis.continuity({
      projectId,
      seriesAware: true
    });

    // Export
    const exports = await this.prose.exports.create({
      projectId,
      formats: options.formats || ['docx', 'epub'],
      includeMetadata: true
    });

    return {
      projectId,
      totalWords: chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      chapters: chapters.length,
      continuityScore: continuity.continuityScore,
      exports: exports.downloadUrls,
      productionTime: Date.now() - startTime
    };
  }

  async batchProduceSeries(seriesId: string, startBook: number = 1, endBook?: number) {
    const series = await this.prose.series.get({ seriesId });
    const books = series.books.slice(startBook - 1, endBook);

    const results = [];
    for (const book of books) {
      const result = await this.produceBook(book.projectId, {
        humanization: 'premium'
      });
      results.push(result);

      console.log(`Book ${book.bookNumber} complete: ${result.totalWords} words in ${result.productionTime}ms`);
    }

    return {
      seriesId,
      booksProduced: results.length,
      totalWords: results.reduce((sum, r) => sum + r.totalWords, 0),
      exports: results.map(r => r.exports)
    };
  }
}
```

### Business Impact

- **Increased book output** with AI-assisted production
- **Consistent quality** across all books
- **Series continuity** maintained automatically
- **Scalable publishing workflow** with predictable output

---

## Integration with Nexus Ecosystem

| Plugin | Integration |
|--------|-------------|
| **Audiobook** | Direct manuscript-to-audio pipeline |
| **BookMarketing** | Automatic marketing content generation |
| **FileProcess** | Multi-format export (EPUB, MOBI, PDF) |
| **GraphRAG** | Infinite memory for complex series |

---

## Next Steps

- [Architecture Overview](./ARCHITECTURE.md) - System design and AI models
- [API Reference](./docs/api-reference/endpoints.md) - Complete endpoint docs
- [Support](https://discord.gg/adverant) - Discord community

