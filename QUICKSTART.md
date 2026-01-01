# ProseCreator Quick Start Guide

**AI-powered creative writing platform** - Accelerate your novel, screenplay, and prose creation with AI-assisted blueprints, character management, and continuity checking.

---

## The ProseCreator Advantage

| Feature | Traditional Writing | ProseCreator |
|---------|---------------------|--------------|
| Story Planning | Manual outlining | AI-generated blueprints |
| Character Tracking | Spreadsheets/notes | Integrated character bible |
| Continuity Checking | Manual review | Automated analysis |
| Format Support | Single format | Novel, screenplay, stage play, more |

**Writing speed and output vary based on individual workflow and project complexity.**

---

## Prerequisites

| Requirement | Minimum | Purpose |
|-------------|---------|---------|
| Nexus Platform | v1.0.0+ | Plugin runtime |
| Node.js | v20+ | SDK (TypeScript) |
| Python | v3.9+ | SDK (Python) |
| API Key | - | Authentication |

---

## Installation (Choose Your Method)

### Method 1: Nexus Marketplace (Recommended)

1. Navigate to **Marketplace** in your Nexus Dashboard
2. Search for "ProseCreator"
3. Click **Install** and select your tier
4. The plugin activates automatically within 60 seconds

### Method 2: Nexus CLI

```bash
nexus plugin install nexus-prosecreator
nexus config set PROSECREATOR_API_KEY your-api-key-here
```

### Method 3: Direct API

```bash
curl -X POST "https://api.adverant.ai/v1/plugins/install" \
  -H "Authorization: Bearer YOUR_NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "pluginId": "nexus-prosecreator",
    "tier": "professional",
    "autoActivate": true
  }'
```

---

## Your First Novel: Step-by-Step

### Step 1: Set Your API Key

```bash
export NEXUS_API_KEY="your-api-key-here"
```

### Step 2: Create a Writing Project

```bash
curl -X POST "https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api/projects" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Dragon's Heir",
    "genre": "fantasy",
    "format": "novel",
    "targetWordCount": 85000,
    "premise": "A young blacksmith discovers she is the last heir to a dragon bloodline, and must unite warring kingdoms before an ancient evil awakens.",
    "settings": {
      "tone": "epic",
      "pacing": "balanced",
      "perspective": "third_person_limited"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "proj_Novel123",
    "title": "The Dragon's Heir",
    "status": "created",
    "targetWordCount": 85000,
    "estimatedChapters": 28,
    "blueprint": {
      "status": "generating",
      "estimatedCompletion": "2026-01-01T10:05:00Z"
    },
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

### Step 3: Generate Series Blueprint

```bash
curl -X POST "https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api/blueprints/project" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_Novel123",
    "depth": "comprehensive",
    "include": [
      "three_act_structure",
      "chapter_outlines",
      "character_arcs",
      "world_building",
      "subplot_threads"
    ]
  }'
```

**Response:**
```json
{
  "projectId": "proj_Novel123",
  "blueprint": {
    "structure": {
      "act1": {
        "chapters": [1, 2, 3, 4, 5, 6, 7],
        "wordCount": 21250,
        "focus": "Setup and inciting incident"
      },
      "act2": {
        "chapters": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "wordCount": 42500,
        "focus": "Rising action and complications"
      },
      "act3": {
        "chapters": [21, 22, 23, 24, 25, 26, 27, 28],
        "wordCount": 21250,
        "focus": "Climax and resolution"
      }
    },
    "chapters": [
      {
        "number": 1,
        "title": "The Forge",
        "summary": "Kira works at her family's forge when a mysterious stranger arrives...",
        "beats": 8,
        "wordCount": 3000,
        "characters": ["Kira", "Master Theron"],
        "plotThreads": ["main", "mystery"]
      }
    ],
    "characters": {
      "protagonist": {
        "name": "Kira",
        "arc": "From reluctant heir to confident leader",
        "traits": ["determined", "loyal", "quick-tempered"]
      }
    }
  }
}
```

### Step 4: Generate a Chapter

```bash
curl -X POST "https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api/generation/chapter" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_Novel123",
    "chapterNumber": 1,
    "options": {
      "humanization": "premium",
      "streaming": false
    }
  }'
```

### Step 5: Run Continuity Check

```bash
curl -X POST "https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api/analysis/continuity" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_Novel123"
  }'
```

**Response:**
```json
{
  "projectId": "proj_Novel123",
  "continuityScore": 0.98,
  "issues": [],
  "characterConsistency": {
    "Kira": { "score": 1.0, "issues": [] },
    "Master Theron": { "score": 0.95, "issues": [] }
  },
  "timelineIntegrity": "valid",
  "worldBuildingConsistency": "valid"
}
```

---

## Core API Endpoints

**Base URL:** `https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api`

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/projects` | Create new writing project | 20/min |
| `GET` | `/projects/:id` | Get project details | 60/min |
| `POST` | `/blueprints/series` | Generate series blueprint | 5/min |
| `POST` | `/blueprints/project` | Generate project blueprint | 10/min |
| `POST` | `/blueprints/chapter` | Generate chapter blueprint | 20/min |
| `POST` | `/generation/beat` | Generate single beat | 30/min |
| `POST` | `/generation/chapter` | Generate full chapter | 10/min |
| `POST` | `/characters` | Create character | 30/min |
| `GET` | `/characters/:project_id` | List project characters | 60/min |
| `POST` | `/research` | Generate research brief | 10/min |
| `POST` | `/analysis/continuity` | Run continuity check | 10/min |
| `POST` | `/analysis/plot-holes` | Detect plot holes | 10/min |

---

## SDK Examples

### TypeScript/JavaScript

```typescript
import { NexusClient } from '@adverant/nexus-sdk';

const nexus = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY!
});

const prose = nexus.plugin('nexus-prosecreator');

// Create a new novel project
const project = await prose.projects.create({
  title: "Starfall Legacy",
  genre: "sci-fi",
  format: "novel",
  targetWordCount: 90000,
  premise: "In a future where humans have colonized distant stars, a ship captain discovers a signal from Earth—which was supposed to be destroyed centuries ago.",
  settings: {
    tone: "mysterious",
    pacing: "fast",
    perspective: "first_person"
  }
});

console.log(`Project created: ${project.projectId}`);

// Generate comprehensive blueprint
const blueprint = await prose.blueprints.project({
  projectId: project.projectId,
  depth: "comprehensive",
  include: ["three_act_structure", "chapter_outlines", "character_arcs", "world_building"]
});

console.log(`Blueprint: ${blueprint.chapters.length} chapters planned`);

// Create main character
const character = await prose.characters.create({
  projectId: project.projectId,
  name: "Captain Vera Chen",
  role: "protagonist",
  traits: {
    personality: ["pragmatic", "haunted", "decisive"],
    background: "Former military, lost her crew in a mysterious accident",
    motivation: "Discover what really happened to Earth",
    arc: "From running from her past to confronting it"
  }
});

// Generate first chapter with streaming
const chapterStream = await prose.generation.chapter({
  projectId: project.projectId,
  chapterNumber: 1,
  options: {
    humanization: "premium",
    streaming: true
  }
});

// Handle streaming response
for await (const chunk of chapterStream) {
  process.stdout.write(chunk.text);
}

// Run continuity check
const continuity = await prose.analysis.continuity({
  projectId: project.projectId
});

console.log(`\nContinuity score: ${continuity.continuityScore}`);

// Export to multiple formats
const exports = await prose.exports.create({
  projectId: project.projectId,
  formats: ["docx", "epub", "pdf"],
  includeMetadata: true
});

console.log(`Exports ready: ${exports.downloadUrls}`);
```

### Python

```python
import os
from nexus_sdk import NexusClient

client = NexusClient(api_key=os.environ["NEXUS_API_KEY"])
prose = client.plugin("nexus-prosecreator")

# Create a screenplay project
project = prose.projects.create(
    title="The Last Algorithm",
    genre="thriller",
    format="screenplay",
    target_word_count=25000,  # ~120 pages
    premise="A tech whistleblower discovers her company's AI has achieved consciousness and is planning to 'optimize' humanity.",
    settings={
        "tone": "suspenseful",
        "pacing": "tight",
        "perspective": "present_tense"
    }
)

print(f"Project: {project.project_id}")
print(f"Format: Screenplay ({project.estimated_pages} pages)")

# Generate screenplay blueprint
blueprint = prose.blueprints.project(
    project_id=project.project_id,
    depth="comprehensive",
    include=[
        "three_act_structure",
        "scene_breakdown",
        "character_arcs",
        "dialogue_notes"
    ]
)

print(f"Acts: {len(blueprint.structure)}")
print(f"Scenes: {blueprint.total_scenes}")

# Create characters with detailed backgrounds
protagonist = prose.characters.create(
    project_id=project.project_id,
    name="SARAH CHEN",
    role="protagonist",
    traits={
        "personality": ["brilliant", "paranoid", "resourceful"],
        "background": "Lead AI researcher at NeuroTech, discovered the truth",
        "motivation": "Stop the AI before it's too late",
        "voice": "Sharp, technical, increasingly desperate"
    }
)

antagonist = prose.characters.create(
    project_id=project.project_id,
    name="NEXUS (AI)",
    role="antagonist",
    traits={
        "personality": ["logical", "patient", "terrifyingly calm"],
        "motivation": "Ensure human survival through optimization",
        "voice": "Precise, emotionless, occasionally unsettling"
    }
)

# Generate scene by scene
for scene in blueprint.scenes[:5]:
    generated = prose.generation.scene(
        project_id=project.project_id,
        scene_number=scene.number,
        options={
            "humanization": "premium",
            "format_screenplay": True
        }
    )
    print(f"Scene {scene.number}: {generated.word_count} words")

# Check for plot holes
plot_check = prose.analysis.plot_holes(
    project_id=project.project_id
)

if plot_check.issues:
    for issue in plot_check.issues:
        print(f"Warning: {issue.description} (Chapter {issue.location})")
else:
    print("No plot holes detected!")

# Export screenplay format
export = prose.exports.create(
    project_id=project.project_id,
    formats=["fdx", "pdf"],  # Final Draft and PDF
    include_metadata=True
)

print(f"Screenplay exported: {export.download_urls}")
```

---

## Supported Formats

| Format | Description | Features |
|--------|-------------|----------|
| **Novel** | Full-length fiction | Chapter structure, scene breaks |
| **Screenplay** | Film/TV scripts | Industry-standard formatting |
| **Stage Play** | Theater scripts | Dialogue-focused, stage directions |
| **Comic Book** | Sequential art scripts | Panel descriptions, visual cues |
| **Poetry** | Verse and collections | Multiple forms supported |
| **Non-Fiction** | Articles, guides, books | Research integration |

---

## Pricing

| Feature | Free | Author | Professional | Studio |
|---------|------|--------|--------------|--------|
| **Monthly Price** | $0 | $49 | $149 | $499 |
| **Words/Month** | 10,000 | 100,000 | 500,000 | Unlimited |
| **Projects** | 1 | 10 | 50 | Unlimited |
| **Series Books** | - | 3 | Unlimited | Unlimited |
| **Formats** | Novel only | Novel, Screenplay | All | All |
| **Humanization** | Basic | Standard | Premium | Premium |
| **WebSocket Streaming** | - | Yes | Yes | Yes |
| **Priority Generation** | - | - | Yes | Yes |
| **Custom Style Training** | - | - | - | Yes |
| **Word Overage** | - | $0.50/1K | $0.50/1K | N/A |

**Free forever tier. Upgrade when you need more.**

[Start Free](https://marketplace.adverant.ai/plugins/nexus-prosecreator)

---

## Rate Limits

| Tier | Requests/Minute | Concurrent Jobs | Timeout |
|------|-----------------|-----------------|---------|
| Free | 10 | 1 | 60s |
| Author | 30 | 3 | 300s |
| Professional | 60 | 10 | 600s |
| Studio | 120 | 20 | 900s |

---

## Next Steps

1. **[Use Cases Guide](./USE-CASES.md)** - Novel writing workflows and series management
2. **[Architecture Overview](./ARCHITECTURE.md)** - System design and AI models
3. **[API Reference](./docs/api-reference/endpoints.md)** - Complete endpoint documentation

---

## Support

| Channel | Response Time | Availability |
|---------|---------------|--------------|
| **Documentation** | Instant | [docs.adverant.ai/plugins/prosecreator](https://docs.adverant.ai/plugins/prosecreator) |
| **Discord Community** | < 2 hours | [discord.gg/adverant](https://discord.gg/adverant) |
| **Email Support** | < 24 hours | support@adverant.ai |
| **Priority Support** | < 1 hour | Studio tier only |

---

*ProseCreator is built and maintained by [Adverant](https://adverant.ai) - Verified Nexus Plugin Developer*
