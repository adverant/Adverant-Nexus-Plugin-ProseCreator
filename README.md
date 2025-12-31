
<h1 align="center">ProseCreator</h1>

<p align="center">
  <strong>AI-Powered Novel & Prose Generation</strong>
</p>

<p align="center">
  <a href="https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/actions"><img src="https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/workflows/CI/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://marketplace.adverant.ai/plugins/prosecreator"><img src="https://img.shields.io/badge/Nexus-Marketplace-purple.svg" alt="Nexus Marketplace"></a>
  <a href="https://discord.gg/adverant"><img src="https://img.shields.io/discord/123456789?color=7289da&label=Discord" alt="Discord"></a>
</p>

<p align="center">
  <a href="#features">Features</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#use-cases">Use Cases</a> |
  <a href="#pricing">Pricing</a> |
  <a href="#documentation">Documentation</a>
</p>

---

## Write Your Best-Selling Novel with AI

**ProseCreator** is an award-winning Nexus Marketplace plugin that helps authors write fiction, non-fiction, and creative content at unprecedented speed and quality. Whether you're crafting your first novel or your fiftieth, ProseCreator's multi-agent AI system ensures every page captivates your readers.

### Why Authors Choose ProseCreator

- **Write 10x Faster**: Complete a 100,000-word novel in weeks, not years
- **Undetectable AI**: 15+ humanization techniques ensure your prose reads naturally
- **Living Blueprints**: Self-evolving story documents that grow with your narrative
- **Infinite Memory**: Never lose track of character details, plot threads, or world-building
- **Multi-Format Export**: Novels, screenplays, stage plays, comic scripts, and more

---

## Features

### Multi-Format Creative Writing

ProseCreator supports an extensive range of creative formats:

| Format | Description |
|--------|-------------|
| **Novel** | Full-length fiction with chapters, scenes, and beats |
| **Screenplay** | Industry-standard format for film and TV |
| **Stage Play** | Theater-ready scripts with stage directions |
| **Comic Book** | Panel descriptions and dialogue for graphic novels |
| **YouTube Script** | Video scripts with visual cues and timing |
| **Poetry Collection** | Poems with various structures and styles |
| **Non-Fiction** | Structured chapters with research integration |

### Living Blueprint System

Your story evolves, and so does ProseCreator:

- **Self-Evolving Documents**: Blueprints update automatically as you write
- **Character Bible Integration**: Characters grow and change throughout your story
- **Plot Thread Tracking**: Never drop a subplot or create continuity errors
- **World-Building Repository**: Maintain consistent settings across your entire series

### Infinite Memory Architecture

Powered by GraphRAG technology:

- **Neo4j Knowledge Graph**: Rich relationships between story elements
- **Qdrant Vector Search**: Find relevant context across millions of words
- **Cross-Series Continuity**: Write connected series with perfect consistency
- **Research Integration**: Incorporate research directly into your narrative

### Undetectable AI Content

15+ humanization techniques ensure your prose is indistinguishable from human-written content:

- Stylistic variation and voice consistency
- Natural pacing and rhythm
- Authentic dialogue patterns
- Genre-appropriate conventions
- AI detection bypass (passes Originality.ai, GPTZero, etc.)

### Real-Time Streaming

Watch your story come to life:

- WebSocket-based streaming for instant feedback
- Chapter-by-chapter or beat-by-beat generation
- Progress tracking for long-form content
- Interrupt and redirect generation in real-time

---

## Quick Start

### Installation

```bash
# Via Nexus Marketplace (Recommended)
nexus plugin install nexus-prosecreator

# Or via API
curl -X POST "https://api.adverant.ai/plugins/nexus-prosecreator/install" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Create Your First Novel

```bash
# Create a new project
curl -X POST "https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api/projects" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Dragon's Heir",
    "genre": "fantasy",
    "format": "novel",
    "target_word_count": 80000,
    "description": "A young blacksmith discovers she is the last heir to a dragon kingdom..."
  }'
```

### Generate Your Blueprint

```bash
# Generate series and project blueprints
curl -X POST "https://api.adverant.ai/proxy/nexus-prosecreator/prosecreator/api/blueprints/project" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-id",
    "structure_type": "three_act",
    "chapters": 25
  }'
```

### Start Writing

```javascript
// Connect via WebSocket for real-time streaming
const ws = new WebSocket('wss://api.adverant.ai/proxy/nexus-prosecreator/ws');

ws.send(JSON.stringify({
  type: 'generate_chapter',
  project_id: 'your-project-id',
  chapter_number: 1
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'generation_progress') {
    console.log('Writing:', data.content);
  }
};
```

---

## Use Cases

### For Indie Authors

#### 1. Complete Your Novel Faster
Write the book you've always dreamed of without the years of grinding. ProseCreator helps you maintain momentum and overcome writer's block.

#### 2. Series Consistency
Writing a 10-book series? ProseCreator remembers every detail from book 1 when you're writing book 10. No more continuity errors.

#### 3. Multi-Format Publishing
Adapt your novel into a screenplay, comic script, or stage play with a single click. Reach new audiences in new formats.

### For Publishing Houses

#### 4. Scale Content Production
Produce more titles without sacrificing quality. ProseCreator helps your authors write faster while maintaining their unique voice.

#### 5. Genre Expansion
Let authors experiment with new genres using genre-specific templates and conventions built into ProseCreator.

### For Screenwriters

#### 6. Novel-to-Screenplay Adaptation
Transform your novel into a properly formatted screenplay, maintaining the essence while adapting for the screen.

#### 7. TV Series Bibles
Create comprehensive series bibles with character arcs, episode summaries, and world-building details.

### For Content Creators

#### 8. YouTube Script Generation
Create engaging video scripts with proper pacing, hooks, and call-to-actions optimized for viewer retention.

#### 9. Podcast Narratives
Write fiction podcast episodes with proper audio drama formatting and sound effect cues.

---

## Architecture

```
+------------------------------------------------------------------+
|                      ProseCreator Plugin                          |
+------------------------------------------------------------------+
|  +----------------+  +--------------+  +----------------------+  |
|  | Living        |  |  Multi-Agent |  | Infinite Memory      |  |
|  | Blueprint     |  |  Generation  |  | (GraphRAG)           |  |
|  | System        |  |  Engine      |  |                      |  |
|  +-------+-------+  +------+-------+  +----------+-----------+  |
|          |                 |                     |               |
|          v                 v                     v               |
|  +-----------------------------------------------------------+  |
|  |                 Content Generation Pipeline                 |  |
|  |  +----------+ +----------+ +----------+ +----------+       |  |
|  |  | Research | | Outline  | | Beat     | | Humanize |       |  |
|  |  | Agent    | | Agent    | | Writer   | | Agent    |       |  |
|  |  +----------+ +----------+ +----------+ +----------+       |  |
|  +-----------------------------------------------------------+  |
|          |                                                       |
|          v                                                       |
|  +-----------------------------------------------------------+  |
|  |                    Output Formats                           |  |
|  |      Novel | Screenplay | Stage Play | Comic | Poetry       |  |
|  +-----------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    Nexus Core Services                            |
|  +----------+  +----------+  +----------+  +----------+          |
|  |MageAgent |  | GraphRAG |  |FileProc  |  | Billing  |          |
|  | (AI)     |  | (Memory) |  |(Export)  |  |(Usage)   |          |
|  +----------+  +----------+  +----------+  +----------+          |
+------------------------------------------------------------------+
```

---

## Pricing

| Feature | Free | Author | Professional | Studio |
|---------|------|--------|--------------|--------|
| **Price** | $0/mo | $49/mo | $149/mo | $499/mo |
| **Words/month** | 10,000 | 100,000 | 500,000 | Unlimited |
| **Projects** | 1 | 10 | 50 | Unlimited |
| **Formats** | Novel only | +Screenplay | All formats | All formats |
| **Series Support** | - | 3 books | Unlimited | Unlimited |
| **WebSocket Streaming** | - | Yes | Yes | Yes |
| **Humanization Level** | Basic | Standard | Premium | Premium |
| **Priority Generation** | - | - | Yes | Yes |
| **Custom Style Training** | - | - | - | Yes |
| **White-Label Export** | - | - | - | Yes |

[View on Nexus Marketplace](https://marketplace.adverant.ai/plugins/prosecreator)

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects` | Create new writing project |
| `GET` | `/projects/:id` | Get project details |
| `GET` | `/projects/:id/stats` | Get project statistics |
| `POST` | `/blueprints/series` | Generate series blueprint |
| `POST` | `/blueprints/project` | Generate project blueprint |
| `POST` | `/blueprints/chapter` | Generate chapter blueprint |
| `POST` | `/generation/beat` | Generate single beat |
| `POST` | `/generation/chapter` | Generate full chapter |
| `POST` | `/characters` | Create character |
| `GET` | `/characters/:project_id` | List characters |
| `POST` | `/research` | Generate research brief |
| `POST` | `/analysis/continuity` | Check continuity |
| `POST` | `/analysis/plot-holes` | Detect plot holes |

Full API documentation: [docs/api-reference/endpoints.md](docs/api-reference/endpoints.md)

---

## Documentation

- [Installation Guide](docs/getting-started/installation.md)
- [Configuration](docs/getting-started/configuration.md)
- [Quick Start](docs/getting-started/quickstart.md)
- [API Reference](docs/api-reference/endpoints.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Use Cases](docs/use-cases/)

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator.git
cd Adverant-Nexus-Plugin-ProseCreator

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

---

## Community & Support

- **Documentation**: [docs.adverant.ai/plugins/prosecreator](https://docs.adverant.ai/plugins/prosecreator)
- **Discord**: [discord.gg/adverant](https://discord.gg/adverant)
- **Email**: support@adverant.ai
- **GitHub Issues**: [Report a bug](https://github.com/adverant/Adverant-Nexus-Plugin-ProseCreator/issues)

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with care by <a href="https://adverant.ai">Adverant</a></strong>
</p>

<p align="center">
  <a href="https://adverant.ai">Website</a> |
  <a href="https://docs.adverant.ai">Docs</a> |
  <a href="https://marketplace.adverant.ai">Marketplace</a> |
  <a href="https://twitter.com/adverant">Twitter</a>
</p>
