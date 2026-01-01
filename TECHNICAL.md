# ProseCreator - Technical Documentation

## API Reference

### Base URL

```
https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api
```

### Authentication

All API requests require a Bearer token in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

#### Required Scopes

| Scope | Description |
|-------|-------------|
| `prose:read` | Read projects and content |
| `prose:write` | Create and modify projects |
| `prose:generate` | Access content generation |
| `prose:export` | Export to various formats |

---

## API Endpoints

### Project Management

#### Create Writing Project

```http
POST /projects
```

**Rate Limit:** 20 requests/minute

**Request Body:**

```json
{
  "title": "The Dragon's Heir",
  "genre": "fantasy",
  "subgenres": ["epic_fantasy", "dragons"],
  "format": "novel | screenplay | stage_play | comic_book | poetry | non_fiction",
  "target_word_count": 80000,
  "description": "A young blacksmith discovers she is the last heir to a dragon kingdom...",
  "settings": {
    "tone": "epic",
    "pov": "third_person_limited",
    "tense": "past",
    "audience": "adult",
    "content_rating": "pg13"
  },
  "series": {
    "is_series": true,
    "series_name": "The Dragon Chronicles",
    "book_number": 1,
    "total_books": 3
  }
}
```

**Response:**

```json
{
  "project_id": "proj_abc123",
  "title": "The Dragon's Heir",
  "genre": "fantasy",
  "format": "novel",
  "status": "draft",
  "target_word_count": 80000,
  "current_word_count": 0,
  "chapters": [],
  "characters": [],
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### Get Project Details

```http
GET /projects/:id
```

**Response:**

```json
{
  "project_id": "proj_abc123",
  "title": "The Dragon's Heir",
  "genre": "fantasy",
  "format": "novel",
  "status": "in_progress",
  "target_word_count": 80000,
  "current_word_count": 45000,
  "progress_percentage": 56.25,
  "structure": {
    "acts": 3,
    "chapters": 25,
    "chapters_completed": 14
  },
  "blueprint": {
    "status": "generated",
    "version": 3,
    "last_updated": "2025-01-14T15:30:00Z"
  },
  "characters": [
    {
      "character_id": "char_001",
      "name": "Aria Forge",
      "role": "protagonist",
      "appearances": 14
    }
  ],
  "worldbuilding": {
    "locations": 12,
    "factions": 5,
    "magic_systems": 2
  },
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

#### Get Project Statistics

```http
GET /projects/:id/stats
```

**Response:**

```json
{
  "project_id": "proj_abc123",
  "word_count": {
    "current": 45000,
    "target": 80000,
    "today": 2500,
    "this_week": 12000,
    "average_daily": 1500
  },
  "chapters": {
    "total": 25,
    "completed": 14,
    "in_progress": 1,
    "pending": 10
  },
  "generation_stats": {
    "total_words_generated": 48000,
    "words_edited": 3000,
    "edit_ratio": 0.0625,
    "average_humanization_score": 94
  },
  "timeline": {
    "started": "2025-01-01",
    "estimated_completion": "2025-02-15",
    "days_remaining": 31
  },
  "continuity": {
    "issues_detected": 2,
    "issues_resolved": 1,
    "consistency_score": 96
  }
}
```

### Blueprint Generation

#### Generate Series Blueprint

```http
POST /blueprints/series
```

**Rate Limit:** 5 requests/minute

**Request Body:**

```json
{
  "series_name": "The Dragon Chronicles",
  "total_books": 3,
  "genre": "fantasy",
  "premise": "In a world where dragons and humans once lived in harmony, a young blacksmith discovers she carries the bloodline of the dragon kings...",
  "themes": ["identity", "legacy", "power"],
  "character_arcs": [
    {
      "name": "Aria Forge",
      "role": "protagonist",
      "arc_type": "hero_journey",
      "starting_state": "Humble blacksmith",
      "ending_state": "Dragon Queen"
    }
  ],
  "series_arc": {
    "structure": "escalating_conflict",
    "central_conflict": "War between dragon loyalists and hunters"
  }
}
```

**Response:**

```json
{
  "blueprint_id": "bp_series_abc123",
  "series_name": "The Dragon Chronicles",
  "books": [
    {
      "book_number": 1,
      "title_suggestion": "The Dragon's Heir",
      "primary_arc": "Discovery of heritage",
      "key_events": ["Discovery of dragon mark", "First dragon bond", "Revelation of true identity"],
      "estimated_word_count": 80000
    },
    {
      "book_number": 2,
      "title_suggestion": "The Dragon's War",
      "primary_arc": "Rising conflict",
      "key_events": ["Training with dragons", "First battle", "Major loss"],
      "estimated_word_count": 90000
    },
    {
      "book_number": 3,
      "title_suggestion": "The Dragon's Crown",
      "primary_arc": "Final confrontation",
      "key_events": ["Gathering allies", "Final battle", "Coronation"],
      "estimated_word_count": 100000
    }
  ],
  "series_threads": [
    {
      "thread": "Aria's dragon bond",
      "book_1": "Awakening",
      "book_2": "Strengthening",
      "book_3": "Mastery"
    }
  ],
  "character_journeys": [...],
  "world_evolution": [...],
  "generated_at": "2025-01-15T10:00:00Z"
}
```

#### Generate Project Blueprint

```http
POST /blueprints/project
```

**Rate Limit:** 10 requests/minute

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "structure_type": "three_act | five_act | seven_point | hero_journey | custom",
  "chapters": 25,
  "include_subplots": true,
  "subplot_count": 3,
  "pacing": "fast | moderate | slow",
  "climax_position": 0.85
}
```

**Response:**

```json
{
  "blueprint_id": "bp_proj_abc123",
  "project_id": "proj_abc123",
  "structure": {
    "type": "three_act",
    "act_1": {
      "chapters": [1, 2, 3, 4, 5, 6],
      "purpose": "Setup and inciting incident",
      "key_beats": ["Opening hook", "Ordinary world", "Inciting incident", "First threshold"]
    },
    "act_2": {
      "chapters": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      "purpose": "Rising action and midpoint",
      "key_beats": ["Tests and allies", "Approach", "Midpoint twist", "Bad guys close in", "All is lost"]
    },
    "act_3": {
      "chapters": [19, 20, 21, 22, 23, 24, 25],
      "purpose": "Climax and resolution",
      "key_beats": ["Dark night", "Gathering strength", "Climax", "Resolution"]
    }
  },
  "chapters": [
    {
      "chapter_number": 1,
      "title": "The Forge's Daughter",
      "purpose": "Introduce Aria and her world",
      "pov": "Aria",
      "setting": "Village forge",
      "beats": [
        "Show Aria's skill at the forge",
        "Establish her relationship with father",
        "Hint at her mysterious past",
        "First dragon sighting"
      ],
      "word_target": 3200,
      "tension_level": 3
    }
  ],
  "subplots": [
    {
      "name": "Forbidden romance",
      "characters": ["Aria", "Prince Kael"],
      "chapters_involved": [4, 8, 12, 16, 20, 24],
      "arc": "enemies_to_lovers"
    }
  ],
  "tension_curve": [
    { "chapter": 1, "tension": 3 },
    { "chapter": 12, "tension": 7 },
    { "chapter": 22, "tension": 10 }
  ],
  "generated_at": "2025-01-15T10:00:00Z"
}
```

#### Generate Chapter Blueprint

```http
POST /blueprints/chapter
```

**Rate Limit:** 20 requests/minute

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "chapter_number": 1,
  "regenerate": false
}
```

**Response:**

```json
{
  "chapter_blueprint_id": "bp_ch_001",
  "project_id": "proj_abc123",
  "chapter_number": 1,
  "title": "The Forge's Daughter",
  "scenes": [
    {
      "scene_number": 1,
      "setting": "Village forge, early morning",
      "characters": ["Aria", "Father"],
      "purpose": "Establish Aria's skill and relationship",
      "beats": [
        "Aria works on a complex blade",
        "Father observes with pride and worry",
        "Customer arrives with special request"
      ],
      "word_target": 800,
      "mood": "Warm but anticipatory"
    },
    {
      "scene_number": 2,
      "setting": "Village square",
      "characters": ["Aria", "Villagers"],
      "purpose": "Show Aria's status in community",
      "beats": [
        "Aria delivers the blade",
        "Interaction with villagers",
        "First hint of dragon activity"
      ],
      "word_target": 600,
      "mood": "Community warmth to unease"
    }
  ],
  "chapter_summary": "Aria's ordinary life as a blacksmith is established before the first signs of disruption appear.",
  "hooks": {
    "opening": "The blade sang beneath Aria's hammer...",
    "closing": "In the distance, a shadow crossed the sun that was too large to be any bird."
  },
  "continuity_notes": [
    "Aria is 18 years old",
    "Father's limp mentioned",
    "Blue steel blade is important later"
  ]
}
```

### Content Generation

#### Generate Single Beat

```http
POST /generation/beat
```

**Rate Limit:** 30 requests/minute

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "chapter_number": 1,
  "scene_number": 1,
  "beat_number": 1,
  "context": {
    "previous_content": "The morning light filtered...",
    "beat_description": "Aria works on a complex blade",
    "mood": "Focused concentration",
    "sensory_details": ["heat of forge", "ring of hammer", "smell of metal"]
  },
  "options": {
    "word_count": 300,
    "humanization_level": "premium",
    "style_reference": "Brandon Sanderson"
  }
}
```

**Response:**

```json
{
  "generation_id": "gen_abc123",
  "content": "The hammer fell in a rhythm Aria had known since before she could walk. The orange glow of the steel painted shadows on the forge walls, and she counted the heartbeats between strikes—one, two, strike; one, two, strike—just as her father had taught her...",
  "word_count": 287,
  "humanization_score": 96,
  "continuity_check": {
    "passed": true,
    "notes": []
  },
  "alternatives": [
    {
      "content": "Steel sang beneath her hammer...",
      "style": "more_poetic"
    }
  ],
  "generated_at": "2025-01-15T10:00:00Z"
}
```

#### Generate Full Chapter

```http
POST /generation/chapter
```

**Rate Limit:** 10 requests/minute

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "chapter_number": 1,
  "options": {
    "use_blueprint": true,
    "humanization_level": "premium",
    "include_chapter_hooks": true,
    "streaming": true
  }
}
```

**Response (non-streaming):**

```json
{
  "generation_id": "gen_ch_abc123",
  "chapter_number": 1,
  "title": "The Forge's Daughter",
  "content": "Chapter 1: The Forge's Daughter\n\nThe hammer fell in a rhythm Aria had known since before she could walk...",
  "word_count": 3247,
  "sections": [
    { "scene": 1, "start_index": 0, "end_index": 1200 },
    { "scene": 2, "start_index": 1201, "end_index": 2100 },
    { "scene": 3, "start_index": 2101, "end_index": 3247 }
  ],
  "quality_metrics": {
    "humanization_score": 94,
    "readability_grade": 8.5,
    "pacing_score": 88,
    "dialogue_percentage": 28
  },
  "continuity_check": {
    "passed": true,
    "warnings": [
      "Father's name not yet established - using 'Father' throughout"
    ]
  },
  "generated_at": "2025-01-15T10:00:00Z"
}
```

### Character Management

#### Create Character

```http
POST /characters
```

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "name": "Aria Forge",
  "role": "protagonist | antagonist | supporting | minor",
  "basics": {
    "age": 18,
    "gender": "female",
    "occupation": "Blacksmith's daughter",
    "physical": {
      "height": "tall",
      "build": "athletic",
      "hair": "Black, often tied back",
      "eyes": "Violet (unusual)",
      "distinguishing_features": ["Dragon-shaped birthmark on shoulder"]
    }
  },
  "personality": {
    "traits": ["Determined", "Curious", "Protective"],
    "flaws": ["Impulsive", "Self-doubting", "Stubborn"],
    "fears": ["Losing family", "Not belonging"],
    "desires": ["Understanding her past", "Protecting her village"]
  },
  "background": {
    "origin": "Found as infant by blacksmith",
    "key_events": ["Mother died at birth (believed)", "Raised by adoptive father"],
    "secrets": ["Dragon heritage unknown to her"]
  },
  "arc": {
    "type": "hero_journey",
    "starting_state": "Humble blacksmith's daughter",
    "ending_state": "Dragon Queen",
    "key_moments": ["Discovery of mark", "First dragon bond", "Accepting destiny"]
  },
  "relationships": [
    {
      "character": "Father (adoptive)",
      "relationship_type": "family",
      "dynamic": "Protective, loving, holding secrets"
    }
  ],
  "voice": {
    "speaking_style": "Direct, occasional humor",
    "vocabulary_level": "Working class with occasional formal phrases",
    "verbal_tics": ["Forge metaphors"],
    "example_dialogue": "Steel doesn't argue with the hammer. It becomes what it must."
  }
}
```

#### List Project Characters

```http
GET /characters/:project_id
```

### Research Integration

#### Generate Research Brief

```http
POST /research
```

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "topics": [
    "Medieval blacksmithing techniques",
    "Dragon mythology across cultures",
    "Sword forging process"
  ],
  "depth": "overview | detailed | comprehensive",
  "integrate_into_project": true
}
```

**Response:**

```json
{
  "research_id": "research_abc123",
  "topics": [
    {
      "topic": "Medieval blacksmithing techniques",
      "summary": "Medieval blacksmiths used a variety of techniques...",
      "key_facts": [
        "Forge temperatures reached 1500°C",
        "Damascus steel required folding 15+ times",
        "Apprenticeships lasted 7 years"
      ],
      "relevant_vocabulary": ["quench", "temper", "anneal", "fuller"],
      "sources": ["Academic references available"],
      "story_applications": [
        "Aria's expertise can be demonstrated through specific techniques",
        "Seven-year apprenticeship matches her age of mastery"
      ]
    }
  ],
  "worldbuilding_suggestions": [
    "Consider incorporating pattern-welding as a secret dragon-steel technique"
  ],
  "integrated": true,
  "generated_at": "2025-01-15T10:00:00Z"
}
```

### Analysis Tools

#### Run Continuity Check

```http
POST /analysis/continuity
```

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "chapters": [1, 2, 3, 4, 5],
  "check_types": ["character_consistency", "timeline", "geography", "object_tracking"]
}
```

**Response:**

```json
{
  "analysis_id": "ana_abc123",
  "project_id": "proj_abc123",
  "chapters_analyzed": 5,
  "issues": [
    {
      "type": "character_consistency",
      "severity": "warning",
      "description": "Aria's eye color described as 'violet' in Ch1 but 'purple' in Ch3",
      "locations": [
        { "chapter": 1, "paragraph": 5, "text": "...violet eyes..." },
        { "chapter": 3, "paragraph": 12, "text": "...purple gaze..." }
      ],
      "suggestion": "Use consistent descriptor - 'violet' is more distinctive"
    },
    {
      "type": "timeline",
      "severity": "error",
      "description": "Ch4 claims 'three days passed' but events in Ch3 only account for one day",
      "suggestion": "Either adjust time reference or add transition scene"
    }
  ],
  "summary": {
    "total_issues": 2,
    "errors": 1,
    "warnings": 1,
    "consistency_score": 94
  }
}
```

#### Detect Plot Holes

```http
POST /analysis/plot-holes
```

**Request Body:**

```json
{
  "project_id": "proj_abc123",
  "check_entire_project": true
}
```

**Response:**

```json
{
  "analysis_id": "ana_plot_abc123",
  "potential_issues": [
    {
      "type": "unresolved_thread",
      "description": "The mysterious letter mentioned in Ch2 is never addressed again",
      "introduced_chapter": 2,
      "last_mentioned_chapter": 2,
      "suggestion": "Either resolve the letter's contents or remove the mention"
    },
    {
      "type": "character_knowledge",
      "description": "In Ch8, Aria knows about the dragon caves, but this knowledge is never established",
      "chapter": 8,
      "suggestion": "Add a scene where she learns about the caves, or have another character reveal them"
    }
  ],
  "checkovs_guns": [
    {
      "item": "Blue steel blade",
      "introduced": { "chapter": 1, "context": "Aria forges special blade" },
      "used": { "chapter": 22, "context": "Blade reveals dragon properties" },
      "status": "resolved"
    }
  ],
  "summary": {
    "potential_holes": 2,
    "unresolved_threads": 1,
    "checkovs_guns_tracked": 5,
    "all_resolved": false
  }
}
```

---

## WebSocket API

### Real-Time Generation Streaming

```javascript
const ws = new WebSocket('wss://api.adverant.ai/proxy/nexus-prosecreator/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'YOUR_API_KEY'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'authenticated':
      // Start generation
      ws.send(JSON.stringify({
        type: 'generate_chapter',
        project_id: 'proj_abc123',
        chapter_number: 1
      }));
      break;

    case 'generation_progress':
      // Receive streamed content
      console.log('New content:', data.content);
      console.log('Progress:', data.progress + '%');
      break;

    case 'generation_complete':
      console.log('Chapter complete!');
      console.log('Word count:', data.word_count);
      break;

    case 'error':
      console.error('Error:', data.message);
      break;
  }
};
```

---

## Rate Limits

| Tier | Projects | Words/month | Beats/min | Chapters/min |
|------|----------|-------------|-----------|--------------|
| Free | 1 | 10,000 | 5 | 1 |
| Author | 10 | 100,000 | 15 | 5 |
| Professional | 50 | 500,000 | 30 | 10 |
| Studio | Unlimited | Unlimited | 60 | 20 |

---

## Data Models

### Project

```typescript
interface Project {
  project_id: string;
  title: string;
  genre: string;
  subgenres: string[];
  format: ProjectFormat;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
  target_word_count: number;
  current_word_count: number;
  settings: ProjectSettings;
  series?: SeriesInfo;
  structure: ProjectStructure;
  blueprint?: Blueprint;
  characters: Character[];
  worldbuilding: WorldbuildingData;
  created_at: string;
  updated_at: string;
}

type ProjectFormat = 'novel' | 'screenplay' | 'stage_play' | 'comic_book' | 'youtube_script' | 'poetry' | 'non_fiction';

interface ProjectSettings {
  tone: string;
  pov: string;
  tense: string;
  audience: string;
  content_rating: string;
}
```

### Chapter

```typescript
interface Chapter {
  chapter_id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  status: 'pending' | 'outlined' | 'generating' | 'draft' | 'revised' | 'final';
  content: string;
  word_count: number;
  scenes: Scene[];
  blueprint?: ChapterBlueprint;
  quality_metrics: QualityMetrics;
  continuity_notes: string[];
  created_at: string;
  updated_at: string;
}

interface Scene {
  scene_number: number;
  setting: string;
  characters: string[];
  purpose: string;
  content: string;
  word_count: number;
}

interface QualityMetrics {
  humanization_score: number;
  readability_grade: number;
  pacing_score: number;
  dialogue_percentage: number;
}
```

### Character

```typescript
interface Character {
  character_id: string;
  project_id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  basics: CharacterBasics;
  personality: CharacterPersonality;
  background: CharacterBackground;
  arc?: CharacterArc;
  relationships: Relationship[];
  voice: CharacterVoice;
  appearances: ChapterAppearance[];
  created_at: string;
  updated_at: string;
}
```

---

## SDK Integration

### JavaScript/TypeScript

```typescript
import { NexusClient } from '@adverant/nexus-sdk';

const client = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY
});

// Create a project
const project = await client.prosecreator.projects.create({
  title: "The Dragon's Heir",
  genre: 'fantasy',
  format: 'novel',
  target_word_count: 80000
});

// Generate blueprint
const blueprint = await client.prosecreator.blueprints.project({
  project_id: project.project_id,
  structure_type: 'three_act',
  chapters: 25
});

// Generate chapter with streaming
const stream = await client.prosecreator.generation.chapter({
  project_id: project.project_id,
  chapter_number: 1,
  streaming: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}

// Run continuity check
const analysis = await client.prosecreator.analysis.continuity({
  project_id: project.project_id,
  chapters: [1, 2, 3]
});

console.log(`Consistency score: ${analysis.summary.consistency_score}%`);
```

### Python

```python
from nexus_sdk import NexusClient

client = NexusClient(api_key=os.environ["NEXUS_API_KEY"])

# Create project
project = client.prosecreator.projects.create(
    title="The Dragon's Heir",
    genre="fantasy",
    format="novel",
    target_word_count=80000
)

# Create character
character = client.prosecreator.characters.create(
    project_id=project["project_id"],
    name="Aria Forge",
    role="protagonist",
    basics={
        "age": 18,
        "occupation": "Blacksmith's daughter"
    },
    personality={
        "traits": ["Determined", "Curious"],
        "flaws": ["Impulsive", "Self-doubting"]
    }
)

# Generate chapter
chapter = client.prosecreator.generation.chapter(
    project_id=project["project_id"],
    chapter_number=1
)

print(f"Generated {chapter['word_count']} words")
print(f"Humanization score: {chapter['quality_metrics']['humanization_score']}")
```

---

## Webhook Events

| Event | Description |
|-------|-------------|
| `project.created` | New project created |
| `blueprint.generated` | Blueprint generation complete |
| `chapter.generated` | Chapter generation complete |
| `analysis.complete` | Continuity/plot analysis done |
| `export.ready` | Export file ready for download |

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PROJECT_NOT_FOUND` | 404 | Project does not exist |
| `CHAPTER_NOT_FOUND` | 404 | Chapter does not exist |
| `GENERATION_FAILED` | 500 | Content generation error |
| `WORD_LIMIT_EXCEEDED` | 402 | Monthly word limit reached |
| `PROJECT_LIMIT_EXCEEDED` | 402 | Project limit for tier reached |
| `BLUEPRINT_REQUIRED` | 400 | Blueprint needed before generation |
| `INVALID_FORMAT` | 400 | Unsupported format requested |

---

## Deployment Requirements

### Container Specifications

| Resource | Value |
|----------|-------|
| CPU | 2000m (2 cores) |
| Memory | 4096 MB |
| Disk | 20 GB |
| Timeout | 900,000 ms (15 min) |
| Max Concurrent Jobs | 10 |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis for job queue |
| `MAGEAGENT_URL` | Yes | MageAgent for generation |
| `GRAPHRAG_URL` | Yes | GraphRAG for memory |
| `FILEPROCESS_URL` | Yes | Export processing |

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/prosecreator/api/health` | General health check |
| `/prosecreator/api/health/ready` | Readiness probe |
| `/prosecreator/api/health/live` | Liveness probe |

---

## Quotas and Limits

### By Pricing Tier

| Limit | Free | Author | Professional | Studio |
|-------|------|--------|--------------|--------|
| Words/month | 10,000 | 100,000 | 500,000 | Unlimited |
| Projects | 1 | 10 | 50 | Unlimited |
| Series Books | - | 3 | Unlimited | Unlimited |
| Formats | Novel | +Screenplay | All | All |
| Humanization | Basic | Standard | Premium | Premium |
| WebSocket Streaming | - | Yes | Yes | Yes |
| Priority Generation | - | - | Yes | Yes |
| Custom Style Training | - | - | - | Yes |

### Pricing

| Tier | Monthly | Annual |
|------|---------|--------|
| Free | $0 | $0 |
| Author | $49 | $490 |
| Professional | $149 | $1,490 |
| Studio | $499 | $4,990 |

### Overage Pricing

| Usage | Price |
|-------|-------|
| Additional 1K words | $0.50 |
| Additional project | $5.00 |

---

## Support

- **Documentation**: [docs.adverant.ai/plugins/prosecreator](https://docs.adverant.ai/plugins/prosecreator)
- **Discord**: [discord.gg/adverant](https://discord.gg/adverant)
- **Email**: support@adverant.ai
- **GitHub Issues**: [Report a bug](https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/issues)
