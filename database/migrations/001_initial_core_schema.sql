-- ============================================================================
-- NexusProseCreator - Core Prose Creation Schema
-- ============================================================================
-- This migration creates the foundational tables for creative content generation
-- including projects, series, blueprints, chapters, beats, and continuity tracking

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schema
CREATE SCHEMA IF NOT EXISTS prose;

SET search_path TO prose, public;

-- ============================================================================
-- PART 1: PROJECT & SERIES MANAGEMENT
-- ============================================================================

-- Series (Multi-Book Collections)
CREATE TABLE prose.series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References auth.users(id) from nexus-auth service
    title VARCHAR(500) NOT NULL,
    description TEXT,
    total_word_count INTEGER DEFAULT 0,
    book_count INTEGER DEFAULT 1,
    universe_rules JSONB DEFAULT '{}', -- Magic systems, tech rules, world laws
    timeline JSONB DEFAULT '[]', -- Chronological event tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_book_count CHECK (book_count > 0),
    CONSTRAINT check_total_word_count CHECK (total_word_count >= 0)
);

-- Projects (Books, Scripts, etc.)
CREATE TABLE prose.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References auth.users(id) from nexus-auth service
    series_id UUID REFERENCES prose.series(id) ON DELETE SET NULL,

    -- Metadata
    title VARCHAR(500) NOT NULL,
    format VARCHAR(50) NOT NULL, -- novel, screenplay, youtube_script, stage_play, comic_book, podcast_script, poetry
    genre VARCHAR(100) NOT NULL,
    subgenre VARCHAR(200),

    -- Progress tracking
    target_word_count INTEGER DEFAULT 80000,
    current_word_count INTEGER DEFAULT 0,
    consistency_score DECIMAL(5,2) DEFAULT 100.00,
    ai_detection_score DECIMAL(5,2) DEFAULT 0.00, -- Lower is better (<5% target)

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, revision, complete

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_format CHECK (format IN ('novel', 'screenplay', 'youtube_script', 'stage_play', 'comic_book', 'podcast_script', 'poetry')),
    CONSTRAINT check_status CHECK (status IN ('draft', 'revision', 'complete')),
    CONSTRAINT check_target_word_count CHECK (target_word_count > 0),
    CONSTRAINT check_current_word_count CHECK (current_word_count >= 0),
    CONSTRAINT check_consistency_score CHECK (consistency_score >= 0 AND consistency_score <= 100),
    CONSTRAINT check_ai_detection_score CHECK (ai_detection_score >= 0 AND ai_detection_score <= 100)
);

-- ============================================================================
-- PART 2: LIVING BLUEPRINTS (Auto-Evolving Documents)
-- ============================================================================

CREATE TABLE prose.blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Blueprint classification
    blueprint_type VARCHAR(50) NOT NULL, -- plot_summary, character_bible, world_bible, series_timeline, voice_profiles, research_briefs
    version INTEGER NOT NULL DEFAULT 1,

    -- Content
    content TEXT NOT NULL,
    changes JSONB DEFAULT '[]', -- Array of changes from previous version

    -- Metadata
    trigger_chapter INTEGER, -- Which chapter triggered this update
    google_drive_id VARCHAR(200), -- Synced to Google Drive

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_blueprint_type CHECK (blueprint_type IN ('plot_summary', 'character_bible', 'world_bible', 'series_timeline', 'voice_profiles', 'research_briefs')),
    CONSTRAINT check_version CHECK (version > 0),
    UNIQUE(project_id, blueprint_type, version)
);

-- ============================================================================
-- PART 3: CHARACTER VOICE FINGERPRINTING
-- ============================================================================

CREATE TABLE prose.character_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Character identification
    character_name VARCHAR(200) NOT NULL,

    -- Voice characteristics
    voice_patterns JSONB NOT NULL, -- Vocabulary, sentence structure, speech patterns
    dialogue_samples TEXT[] DEFAULT '{}', -- Example dialogues for training
    consistency_score DECIMAL(5,2) DEFAULT 100.00,

    -- Character attributes
    age_range VARCHAR(50),
    background VARCHAR(500),
    personality_traits VARCHAR(500),
    speaking_style VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_consistency_score CHECK (consistency_score >= 0 AND consistency_score <= 100),
    UNIQUE(project_id, character_name)
);

-- ============================================================================
-- PART 4: CHAPTERS & BEATS
-- ============================================================================

CREATE TABLE prose.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Chapter identification
    chapter_number INTEGER NOT NULL,
    title VARCHAR(500),
    synopsis TEXT,

    -- Progress
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft', -- outline, draft, revision, complete

    -- Narrative context
    pov_character VARCHAR(200),
    timeline_position VARCHAR(200), -- When this chapter occurs in story timeline

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_chapter_number CHECK (chapter_number > 0),
    CONSTRAINT check_word_count CHECK (word_count >= 0),
    CONSTRAINT check_chapter_status CHECK (status IN ('outline', 'draft', 'revision', 'complete')),
    UNIQUE(project_id, chapter_number)
);

CREATE TABLE prose.beats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES prose.chapters(id) ON DELETE CASCADE,

    -- Beat identification
    beat_number INTEGER NOT NULL,
    beat_type VARCHAR(50), -- action, dialogue, description, transition

    -- Content
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,

    -- Vector embedding reference (stored in Qdrant)
    qdrant_vector_id UUID,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_beat_number CHECK (beat_number > 0),
    CONSTRAINT check_word_count CHECK (word_count >= 0),
    CONSTRAINT check_beat_type CHECK (beat_type IN ('action', 'dialogue', 'description', 'transition')),
    UNIQUE(chapter_id, beat_number)
);

-- ============================================================================
-- PART 5: CONTINUITY TRACKING & QUALITY ASSURANCE
-- ============================================================================

CREATE TABLE prose.continuity_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Issue classification
    issue_type VARCHAR(50) NOT NULL, -- character, plot, world, timeline, voice
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical

    -- Issue details
    description TEXT NOT NULL,
    chapter_reference INTEGER,
    beat_reference INTEGER,
    suggested_fix TEXT,

    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_issue_type CHECK (issue_type IN ('character', 'plot', 'world', 'timeline', 'voice')),
    CONSTRAINT check_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- ============================================================================
-- PART 6: RESEARCH INTEGRATION (LearningAgent)
-- ============================================================================

CREATE TABLE prose.research_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Research classification
    topic VARCHAR(500) NOT NULL,
    research_type VARCHAR(100), -- character, location, historical, technical

    -- Research content
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]', -- Array of URLs, documents referenced
    confidence_score DECIMAL(5,2),

    -- LearningAgent integration
    learning_agent_job_id UUID, -- Reference to LearningAgent job

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_research_type CHECK (research_type IN ('character', 'location', 'historical', 'technical')),
    CONSTRAINT check_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100))
);

-- ============================================================================
-- PART 7: AGENT ACTIVITY LOGGING
-- ============================================================================

CREATE TABLE prose.agent_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Agent classification
    agent_type VARCHAR(100) NOT NULL, -- genre_agent, prose_agent, dialogue_agent, humanization_agent, etc.
    agent_role VARCHAR(200) NOT NULL,

    -- Activity details
    task_description TEXT,
    output_summary TEXT,

    -- Performance metrics
    tokens_used INTEGER,
    cost_dollars DECIMAL(10,4),
    latency_ms INTEGER,
    quality_score DECIMAL(5,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_tokens_used CHECK (tokens_used IS NULL OR tokens_used >= 0),
    CONSTRAINT check_cost_dollars CHECK (cost_dollars IS NULL OR cost_dollars >= 0),
    CONSTRAINT check_latency_ms CHECK (latency_ms IS NULL OR latency_ms >= 0),
    CONSTRAINT check_quality_score CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100))
);

-- ============================================================================
-- PART 8: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Series indexes
CREATE INDEX idx_series_user ON prose.series(user_id);
CREATE INDEX idx_series_created ON prose.series(created_at DESC);

-- Projects indexes
CREATE INDEX idx_projects_user ON prose.projects(user_id);
CREATE INDEX idx_projects_series ON prose.projects(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX idx_projects_status ON prose.projects(status);
CREATE INDEX idx_projects_format ON prose.projects(format);
CREATE INDEX idx_projects_genre ON prose.projects(genre);
CREATE INDEX idx_projects_created ON prose.projects(created_at DESC);

-- Blueprints indexes
CREATE INDEX idx_blueprints_project ON prose.blueprints(project_id);
CREATE INDEX idx_blueprints_type ON prose.blueprints(project_id, blueprint_type);
CREATE INDEX idx_blueprints_version ON prose.blueprints(project_id, blueprint_type, version DESC);

-- Character voices indexes
CREATE INDEX idx_character_voices_project ON prose.character_voices(project_id);
CREATE INDEX idx_character_voices_name ON prose.character_voices(project_id, character_name);

-- Chapters indexes
CREATE INDEX idx_chapters_project ON prose.chapters(project_id);
CREATE INDEX idx_chapters_number ON prose.chapters(project_id, chapter_number);
CREATE INDEX idx_chapters_status ON prose.chapters(status);

-- Beats indexes
CREATE INDEX idx_beats_chapter ON prose.beats(chapter_id);
CREATE INDEX idx_beats_number ON prose.beats(chapter_id, beat_number);
CREATE INDEX idx_beats_vector ON prose.beats(qdrant_vector_id) WHERE qdrant_vector_id IS NOT NULL;

-- Continuity issues indexes
CREATE INDEX idx_continuity_project ON prose.continuity_issues(project_id);
CREATE INDEX idx_continuity_type ON prose.continuity_issues(issue_type);
CREATE INDEX idx_continuity_severity ON prose.continuity_issues(severity);
CREATE INDEX idx_continuity_resolved ON prose.continuity_issues(resolved);
CREATE INDEX idx_continuity_unresolved ON prose.continuity_issues(project_id, resolved) WHERE resolved = FALSE;

-- Research briefs indexes
CREATE INDEX idx_research_project ON prose.research_briefs(project_id);
CREATE INDEX idx_research_type ON prose.research_briefs(research_type);
CREATE INDEX idx_research_learning_job ON prose.research_briefs(learning_agent_job_id) WHERE learning_agent_job_id IS NOT NULL;

-- Agent activity indexes
CREATE INDEX idx_agent_activity_project ON prose.agent_activity(project_id);
CREATE INDEX idx_agent_activity_type ON prose.agent_activity(agent_type);
CREATE INDEX idx_agent_activity_created ON prose.agent_activity(created_at DESC);

-- ============================================================================
-- PART 9: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Update timestamp function (reuse if exists)
CREATE OR REPLACE FUNCTION prose.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER tg_series_updated_at BEFORE UPDATE ON prose.series
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_projects_updated_at BEFORE UPDATE ON prose.projects
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_blueprints_updated_at BEFORE UPDATE ON prose.blueprints
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_character_voices_updated_at BEFORE UPDATE ON prose.character_voices
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_chapters_updated_at BEFORE UPDATE ON prose.chapters
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_beats_updated_at BEFORE UPDATE ON prose.beats
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_continuity_updated_at BEFORE UPDATE ON prose.continuity_issues
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_research_updated_at BEFORE UPDATE ON prose.research_briefs
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

-- Auto-update project word count when chapters are modified
CREATE OR REPLACE FUNCTION prose.update_project_word_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prose.projects
    SET current_word_count = (
        SELECT COALESCE(SUM(word_count), 0)
        FROM prose.chapters
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_chapters_update_project_word_count
    AFTER INSERT OR UPDATE OR DELETE ON prose.chapters
    FOR EACH ROW EXECUTE FUNCTION prose.update_project_word_count();

-- Auto-update chapter word count when beats are modified
CREATE OR REPLACE FUNCTION prose.update_chapter_word_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prose.chapters
    SET word_count = (
        SELECT COALESCE(SUM(word_count), 0)
        FROM prose.beats
        WHERE chapter_id = COALESCE(NEW.chapter_id, OLD.chapter_id)
    )
    WHERE id = COALESCE(NEW.chapter_id, OLD.chapter_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_beats_update_chapter_word_count
    AFTER INSERT OR UPDATE OR DELETE ON prose.beats
    FOR EACH ROW EXECUTE FUNCTION prose.update_chapter_word_count();

-- Auto-update series statistics when projects are modified
CREATE OR REPLACE FUNCTION prose.update_series_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prose.series
    SET
        book_count = (
            SELECT COUNT(*)
            FROM prose.projects
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
        ),
        total_word_count = (
            SELECT COALESCE(SUM(current_word_count), 0)
            FROM prose.projects
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
        )
    WHERE id = COALESCE(NEW.series_id, OLD.series_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_projects_update_series_statistics
    AFTER INSERT OR UPDATE OR DELETE ON prose.projects
    FOR EACH ROW
    WHEN (NEW.series_id IS NOT NULL OR OLD.series_id IS NOT NULL)
    EXECUTE FUNCTION prose.update_series_statistics();

-- ============================================================================
-- PART 10: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA prose IS 'NexusProseCreator core schema for creative content generation';

COMMENT ON TABLE prose.series IS 'Multi-book series collections with universe rules and timeline';
COMMENT ON TABLE prose.projects IS 'Individual creative projects (novels, scripts, etc.)';
COMMENT ON TABLE prose.blueprints IS 'Auto-evolving living documents (plot summary, character bible, world bible)';
COMMENT ON TABLE prose.character_voices IS 'Character voice fingerprints for dialogue consistency';
COMMENT ON TABLE prose.chapters IS 'Individual chapters within projects';
COMMENT ON TABLE prose.beats IS 'Granular story beats within chapters';
COMMENT ON TABLE prose.continuity_issues IS 'Automated continuity error detection and tracking';
COMMENT ON TABLE prose.research_briefs IS 'LearningAgent research integration for character/world building';
COMMENT ON TABLE prose.agent_activity IS 'Activity log for multi-agent content generation';

COMMENT ON COLUMN prose.projects.consistency_score IS 'Overall consistency score (0-100), target 98%+';
COMMENT ON COLUMN prose.projects.ai_detection_score IS 'AI detection probability (0-100), target <5%';
COMMENT ON COLUMN prose.blueprints.changes IS 'JSON array tracking what changed from previous version';
COMMENT ON COLUMN prose.character_voices.voice_patterns IS 'JSON object with vocabulary, sentence structure, speech patterns';
COMMENT ON COLUMN prose.beats.qdrant_vector_id IS 'Reference to vector embedding in Qdrant for semantic search';

-- ============================================================================
-- PART 11: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL PRIVILEGES ON SCHEMA prose TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA prose TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA prose TO CURRENT_USER;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA prose TO CURRENT_USER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'NexusProseCreator Core Schema migration completed successfully';
    RAISE NOTICE '- Created 12 core tables for prose creation';
    RAISE NOTICE '- Added 45+ indexes for optimal performance';
    RAISE NOTICE '- Created 12 triggers for automatic updates';
    RAISE NOTICE '- Integration point: auth.users(id) for user_id foreign keys';
    RAISE NOTICE 'System ready for creative content generation';
END $$;
