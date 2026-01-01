# ProseCreator Architecture

Technical architecture and system design for AI-powered creative writing.

---

## System Overview

```mermaid
flowchart TB
    subgraph Client Layer
        A[Nexus Dashboard] --> B[API Gateway]
        C[SDK Clients] --> B
        D[WebSocket Client] --> E[Streaming Server]
    end

    subgraph ProseCreator Service
        B --> F[REST API Layer]
        E --> G[Generation Engine]
        F --> H[Project Manager]
        F --> I[Blueprint Engine]
        F --> G
        F --> J[Analysis Engine]
        F --> K[Export Engine]
    end

    subgraph AI Services
        G --> L[MageAgent Orchestrator]
        I --> L
        J --> L
        L --> M[LLM Pool]
    end

    subgraph Knowledge Layer
        H --> N[GraphRAG]
        G --> N
        J --> N
    end

    subgraph Data Layer
        H --> O[(PostgreSQL)]
        G --> O
        I --> O
        K --> P[(File Storage)]
    end
```

---

## Core Components

### 1. REST API Layer

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/prosecreator/api/projects` | POST | Create new writing project |
| `/prosecreator/api/projects/:id` | GET | Get project details |
| `/prosecreator/api/blueprints/series` | POST | Generate series blueprint |
| `/prosecreator/api/blueprints/project` | POST | Generate project blueprint |
| `/prosecreator/api/blueprints/chapter` | POST | Generate chapter blueprint |
| `/prosecreator/api/generation/beat` | POST | Generate single beat |
| `/prosecreator/api/generation/chapter` | POST | Generate full chapter |
| `/prosecreator/api/characters` | POST | Create character |
| `/prosecreator/api/characters/:project_id` | GET | List project characters |
| `/prosecreator/api/research` | POST | Generate research brief |
| `/prosecreator/api/analysis/continuity` | POST | Run continuity check |
| `/prosecreator/api/analysis/plot-holes` | POST | Detect plot holes |

### 2. Project Manager

Handles project lifecycle and metadata.

**Capabilities:**
- Project creation and configuration
- Series management and linking
- Word count tracking
- Export history

### 3. Blueprint Engine

Generates story structures at multiple levels.

**Blueprint Types:**
- Series blueprints (multi-book arcs)
- Project blueprints (single book structure)
- Chapter blueprints (scene-level detail)
- Beat blueprints (moment-by-moment)

### 4. Generation Engine

AI-powered content generation with humanization.

**Features:**
- Multi-model generation pipeline
- Real-time streaming via WebSocket
- Humanization post-processing
- Style consistency enforcement

### 5. Analysis Engine

Continuous quality and consistency checks.

**Capabilities:**
- Continuity verification
- Plot hole detection
- Pacing analysis
- Character consistency
- Dialogue voice matching

### 6. Export Engine

Multi-format manuscript export.

**Formats:**
- DOCX (Microsoft Word)
- EPUB (eBooks)
- PDF (Print-ready)
- FDX (Final Draft for screenplays)
- Fountain (Plain text screenplay)
- Markdown

---

## Generation Pipeline

```mermaid
flowchart TB
    subgraph Input
        A[Generation Request] --> B[Load Context]
        B --> C[Retrieve Memory]
        C --> D[Build Prompt]
    end

    subgraph Generation
        D --> E[MageAgent Orchestrator]
        E --> F[Primary LLM]
        F --> G[Raw Output]
    end

    subgraph Post-Processing
        G --> H[Humanization Engine]
        H --> I[Style Consistency]
        I --> J[Continuity Check]
        J --> K[Final Output]
    end

    subgraph Storage
        K --> L[Save to Project]
        K --> M[Update GraphRAG]
        K --> N[Stream to Client]
    end
```

---

## Living Blueprint Architecture

```mermaid
flowchart TB
    subgraph Blueprint Hierarchy
        A[Series Blueprint] --> B[Book Blueprint]
        B --> C[Act Blueprint]
        C --> D[Chapter Blueprint]
        D --> E[Scene Blueprint]
        E --> F[Beat Blueprint]
    end

    subgraph Evolution
        G[New Content Generated] --> H[Blueprint Update Trigger]
        H --> I{Requires Update?}
        I -->|Yes| J[Propagate Changes]
        I -->|No| K[Keep Current]
        J --> L[Update Parent Levels]
        L --> M[Notify Downstream]
    end

    subgraph Consistency
        N[Continuity Engine] --> O[Validate Blueprint]
        O --> P[Flag Conflicts]
        P --> Q[Suggest Resolutions]
    end
```

---

## Infinite Memory System

```mermaid
flowchart TB
    subgraph Memory Layers
        A[Short-term: Current Chapter] --> B[Medium-term: Current Book]
        B --> C[Long-term: Series Bible]
        C --> D[Permanent: World Rules]
    end

    subgraph GraphRAG Integration
        E[New Content] --> F[Entity Extraction]
        F --> G[Relationship Mapping]
        G --> H[Knowledge Graph Update]
        H --> I[Embedding Generation]
    end

    subgraph Retrieval
        J[Generation Context] --> K[Query Knowledge Graph]
        K --> L[Semantic Search]
        L --> M[Relevance Ranking]
        M --> N[Context Assembly]
    end
```

---

## Character Management System

```mermaid
erDiagram
    PROJECTS ||--o{ CHARACTERS : contains
    CHARACTERS ||--o{ CHARACTER_APPEARANCES : has
    CHARACTERS ||--o{ CHARACTER_RELATIONSHIPS : participates
    CHARACTERS ||--o{ CHARACTER_ARCS : evolves
    SERIES ||--o{ PROJECTS : contains
    SERIES ||--o{ SERIES_CHARACTERS : tracks

    CHARACTERS {
        uuid character_id PK
        uuid project_id FK
        string name
        string role
        jsonb traits
        jsonb voice
        text background
        text motivation
        timestamp created_at
    }

    CHARACTER_APPEARANCES {
        uuid appearance_id PK
        uuid character_id FK
        integer chapter_number
        integer scene_number
        text context
        jsonb state_changes
    }

    CHARACTER_RELATIONSHIPS {
        uuid relationship_id PK
        uuid character_a FK
        uuid character_b FK
        string relationship_type
        text description
        integer chapter_introduced
        jsonb evolution
    }

    CHARACTER_ARCS {
        uuid arc_id PK
        uuid character_id FK
        string arc_type
        text starting_state
        text ending_state
        jsonb milestones
        decimal progress
    }

    SERIES_CHARACTERS {
        uuid series_char_id PK
        uuid series_id FK
        uuid character_id FK
        integer introduced_book
        boolean recurring
        jsonb cross_book_notes
    }
```

---

## Data Model

```mermaid
erDiagram
    SERIES ||--o{ PROJECTS : contains
    PROJECTS ||--o{ CHAPTERS : contains
    PROJECTS ||--o{ CHARACTERS : has
    PROJECTS ||--o{ BLUEPRINTS : uses
    CHAPTERS ||--o{ SCENES : contains
    CHAPTERS ||--o{ GENERATION_HISTORY : tracks

    SERIES {
        uuid series_id PK
        string name
        string genre
        integer planned_books
        text premise
        jsonb world_bible
        timestamp created_at
    }

    PROJECTS {
        uuid project_id PK
        uuid series_id FK
        string title
        string genre
        string format
        string status
        integer target_word_count
        integer current_word_count
        text premise
        jsonb settings
        timestamp created_at
    }

    BLUEPRINTS {
        uuid blueprint_id PK
        uuid project_id FK
        string level
        integer reference_number
        jsonb structure
        jsonb metadata
        boolean is_current
        timestamp created_at
    }

    CHAPTERS {
        uuid chapter_id PK
        uuid project_id FK
        integer chapter_number
        string title
        text content
        integer word_count
        string status
        decimal continuity_score
        timestamp generated_at
    }

    SCENES {
        uuid scene_id PK
        uuid chapter_id FK
        integer scene_number
        text content
        jsonb beat_structure
        array characters_present
    }

    GENERATION_HISTORY {
        uuid history_id PK
        uuid chapter_id FK
        integer version
        text content
        jsonb generation_params
        string model_used
        timestamp generated_at
    }
```

---

## Humanization Engine

```mermaid
flowchart TB
    subgraph Input
        A[Raw AI Output] --> B[Pattern Detection]
    end

    subgraph Analysis
        B --> C[AI Fingerprint Score]
        C --> D{Score > Threshold?}
    end

    subgraph Humanization
        D -->|Yes| E[Style Transformation]
        E --> F[Sentence Restructuring]
        F --> G[Vocabulary Variation]
        G --> H[Rhythm Adjustment]
        H --> I[Voice Consistency]
    end

    subgraph Output
        D -->|No| J[Pass Through]
        I --> K[Final Score Check]
        K --> L{Passes?}
        L -->|No| E
        L -->|Yes| M[Humanized Output]
        J --> M
    end
```

---

## Multi-Format Export

```mermaid
flowchart TB
    subgraph Source
        A[Project Content] --> B[Format Router]
    end

    subgraph Formatters
        B -->|Novel| C[Prose Formatter]
        B -->|Screenplay| D[Screenplay Formatter]
        B -->|Stage Play| E[Play Formatter]
        B -->|Non-Fiction| F[Document Formatter]
    end

    subgraph Outputs
        C --> G[DOCX]
        C --> H[EPUB]
        C --> I[PDF]
        D --> J[FDX]
        D --> K[Fountain]
        D --> L[PDF Screenplay]
        E --> M[PDF Play]
        F --> N[DOCX + Citations]
    end

    subgraph Metadata
        O[Title Page] --> P[All Formats]
        Q[Table of Contents] --> P
        R[Chapter Headings] --> P
    end
```

---

## Security Model

### Authentication
- Bearer token via Nexus API Gateway
- WebSocket token authentication for streaming
- Rate limiting per tier

### Authorization
- Project-level access control
- Series-level permissions
- Export access management

### Data Protection
- Content encrypted at rest
- Secure streaming connections (WSS)
- No training on user content

---

## Deployment Architecture

### Kubernetes Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-prosecreator
  namespace: nexus-plugins
spec:
  replicas: 5
  selector:
    matchLabels:
      app: nexus-prosecreator
  template:
    spec:
      containers:
      - name: prosecreator-api
        image: adverant/nexus-prosecreator:1.0.0
        ports:
        - containerPort: 8080
        - containerPort: 8081  # WebSocket
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /prosecreator/api/health/live
            port: 8080
        readinessProbe:
          httpGet:
            path: /prosecreator/api/health/ready
            port: 8080
```

### Resource Allocation

| Component | CPU | Memory | Storage |
|-----------|-----|--------|---------|
| API Server | 1000m-2000m | 2Gi-4Gi | - |
| Generation Worker | 2000m-4000m | 4Gi-8Gi | 20Gi |
| Streaming Server | 500m-1000m | 1Gi-2Gi | - |
| Export Worker | 500m-1000m | 1Gi-2Gi | 50Gi |

---

## Performance

### Generation Capacity

| Tier | Words/Hour | Concurrent Jobs | Stream Quality |
|------|------------|-----------------|----------------|
| Free | 2,500 | 1 | - |
| Author | 10,000 | 3 | Standard |
| Professional | 25,000 | 10 | High |
| Studio | 50,000+ | 20 | Premium |

### Latency Targets

| Operation | Target |
|-----------|--------|
| Project Creation | < 2s |
| Blueprint Generation | < 30s |
| Chapter Generation (avg) | 60-120s |
| Beat Generation | < 10s |
| Continuity Check | < 15s |
| Export (per format) | < 30s |

---

## Monitoring

### Metrics (Prometheus)

```
# Generation metrics
prosecreator_words_generated_total
prosecreator_chapters_generated_total
prosecreator_generation_duration_seconds

# Quality metrics
prosecreator_humanization_score
prosecreator_continuity_score
prosecreator_regeneration_rate

# Streaming metrics
prosecreator_active_streams
prosecreator_stream_latency_ms
```

### Alerting

| Alert | Condition | Severity |
|-------|-----------|----------|
| Generation Failure | >5% failure rate | Critical |
| Humanization Below Threshold | Score < 0.85 | Warning |
| Stream Latency High | > 500ms | Warning |
| Queue Backup | > 100 pending | Warning |

---

## Next Steps

- [Quick Start Guide](./QUICKSTART.md) - Get started quickly
- [Use Cases](./USE-CASES.md) - Creative writing workflows
- [API Reference](./docs/api-reference/endpoints.md) - Complete docs

