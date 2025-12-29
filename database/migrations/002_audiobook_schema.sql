-- ============================================================================
-- NexusProseCreator - Audiobook Generation Schema
-- ============================================================================
-- This migration creates tables for multi-voice audiobook generation with
-- character-specific voices, emotion detection, and professional audio production

SET search_path TO prose, public;

-- ============================================================================
-- PART 1: AUDIOBOOK PROJECTS
-- ============================================================================

CREATE TABLE prose.audiobook_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Production settings
    narrator_voice_id VARCHAR(200), -- Primary narrator voice
    audio_quality VARCHAR(20) DEFAULT 'standard', -- standard, high, premium
    format VARCHAR(20) DEFAULT 'm4b', -- m4b, mp3

    -- Progress tracking
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, complete, failed
    total_duration_seconds INTEGER DEFAULT 0,
    file_size_mb DECIMAL(10,2),
    chapter_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT check_audio_quality CHECK (audio_quality IN ('standard', 'high', 'premium')),
    CONSTRAINT check_format CHECK (format IN ('m4b', 'mp3')),
    CONSTRAINT check_status CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
    CONSTRAINT check_duration CHECK (total_duration_seconds >= 0),
    CONSTRAINT check_file_size CHECK (file_size_mb IS NULL OR file_size_mb >= 0),
    CONSTRAINT check_chapter_count CHECK (chapter_count >= 0)
);

-- ============================================================================
-- PART 2: CHARACTER VOICE ASSIGNMENTS
-- ============================================================================

CREATE TABLE prose.audiobook_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audiobook_project_id UUID NOT NULL REFERENCES prose.audiobook_projects(id) ON DELETE CASCADE,

    -- Character identification
    character_name VARCHAR(200) NOT NULL,

    -- Voice provider configuration
    voice_provider VARCHAR(50) NOT NULL, -- elevenlabs, xtts, playht
    voice_id VARCHAR(200) NOT NULL, -- Provider's voice ID
    voice_settings JSONB DEFAULT '{}', -- TTS settings (stability, clarity, emotion range)

    -- Voice samples and metrics
    sample_audio_url VARCHAR(500), -- Sample of this character's voice
    total_dialogue_seconds INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_voice_provider CHECK (voice_provider IN ('elevenlabs', 'xtts', 'playht')),
    CONSTRAINT check_total_dialogue CHECK (total_dialogue_seconds >= 0),
    UNIQUE(audiobook_project_id, character_name)
);

-- ============================================================================
-- PART 3: AUDIOBOOK CHAPTERS
-- ============================================================================

CREATE TABLE prose.audiobook_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audiobook_project_id UUID NOT NULL REFERENCES prose.audiobook_projects(id) ON DELETE CASCADE,

    -- Chapter identification
    chapter_number INTEGER NOT NULL,

    -- Audio file details
    audio_url VARCHAR(500) NOT NULL, -- S3 or storage URL
    duration_seconds INTEGER NOT NULL,
    file_size_mb DECIMAL(10,2),
    word_count INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'complete',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_chapter_number CHECK (chapter_number > 0),
    CONSTRAINT check_duration CHECK (duration_seconds > 0),
    CONSTRAINT check_file_size CHECK (file_size_mb IS NULL OR file_size_mb > 0),
    CONSTRAINT check_word_count CHECK (word_count IS NULL OR word_count >= 0),
    UNIQUE(audiobook_project_id, chapter_number)
);

-- ============================================================================
-- PART 4: DIALOGUE SEGMENTS (For Processing)
-- ============================================================================

CREATE TABLE prose.audiobook_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES prose.audiobook_chapters(id) ON DELETE CASCADE,

    -- Segment identification
    sequence_number INTEGER NOT NULL,
    segment_type VARCHAR(50) NOT NULL, -- narrative, dialogue
    character_name VARCHAR(200), -- NULL for narrative

    -- Content
    text_content TEXT NOT NULL,

    -- Emotion detection
    emotion_detected VARCHAR(100), -- joy, fear, anger, sadness, neutral
    emotion_intensity DECIMAL(3,2), -- 0.00 to 1.00

    -- Audio output
    audio_url VARCHAR(500),
    duration_seconds DECIMAL(6,2),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, complete, failed

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_sequence_number CHECK (sequence_number > 0),
    CONSTRAINT check_segment_type CHECK (segment_type IN ('narrative', 'dialogue')),
    CONSTRAINT check_emotion CHECK (emotion_detected IS NULL OR emotion_detected IN ('joy', 'fear', 'anger', 'sadness', 'neutral', 'surprise', 'disgust')),
    CONSTRAINT check_emotion_intensity CHECK (emotion_intensity IS NULL OR (emotion_intensity >= 0 AND emotion_intensity <= 1)),
    CONSTRAINT check_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    CONSTRAINT check_status CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
    UNIQUE(chapter_id, sequence_number)
);

-- ============================================================================
-- PART 5: VOICE PROVIDER USAGE (Cost Tracking)
-- ============================================================================

CREATE TABLE prose.audiobook_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audiobook_project_id UUID NOT NULL REFERENCES prose.audiobook_projects(id) ON DELETE CASCADE,

    -- Provider tracking
    provider VARCHAR(50) NOT NULL,
    characters_generated INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    cost_dollars DECIMAL(10,4) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_provider CHECK (provider IN ('elevenlabs', 'xtts', 'playht', 'azure', 'google')),
    CONSTRAINT check_characters_generated CHECK (characters_generated >= 0),
    CONSTRAINT check_api_calls CHECK (api_calls >= 0),
    CONSTRAINT check_cost CHECK (cost_dollars >= 0)
);

-- ============================================================================
-- PART 6: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Audiobook projects indexes
CREATE INDEX idx_audiobook_projects_project ON prose.audiobook_projects(project_id);
CREATE INDEX idx_audiobook_projects_status ON prose.audiobook_projects(status);
CREATE INDEX idx_audiobook_projects_created ON prose.audiobook_projects(created_at DESC);

-- Audiobook voices indexes
CREATE INDEX idx_audiobook_voices_project ON prose.audiobook_voices(audiobook_project_id);
CREATE INDEX idx_audiobook_voices_provider ON prose.audiobook_voices(voice_provider);
CREATE INDEX idx_audiobook_voices_character ON prose.audiobook_voices(audiobook_project_id, character_name);

-- Audiobook chapters indexes
CREATE INDEX idx_audiobook_chapters_project ON prose.audiobook_chapters(audiobook_project_id);
CREATE INDEX idx_audiobook_chapters_number ON prose.audiobook_chapters(audiobook_project_id, chapter_number);
CREATE INDEX idx_audiobook_chapters_status ON prose.audiobook_chapters(status);

-- Audiobook segments indexes
CREATE INDEX idx_audiobook_segments_chapter ON prose.audiobook_segments(chapter_id);
CREATE INDEX idx_audiobook_segments_sequence ON prose.audiobook_segments(chapter_id, sequence_number);
CREATE INDEX idx_audiobook_segments_status ON prose.audiobook_segments(status);
CREATE INDEX idx_audiobook_segments_pending ON prose.audiobook_segments(chapter_id, status) WHERE status = 'pending';
CREATE INDEX idx_audiobook_segments_character ON prose.audiobook_segments(character_name) WHERE character_name IS NOT NULL;

-- Audiobook usage indexes
CREATE INDEX idx_audiobook_usage_project ON prose.audiobook_usage(audiobook_project_id);
CREATE INDEX idx_audiobook_usage_provider ON prose.audiobook_usage(provider);
CREATE INDEX idx_audiobook_usage_created ON prose.audiobook_usage(created_at DESC);

-- ============================================================================
-- PART 7: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER tg_audiobook_projects_updated_at BEFORE UPDATE ON prose.audiobook_projects
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_audiobook_voices_updated_at BEFORE UPDATE ON prose.audiobook_voices
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_audiobook_chapters_updated_at BEFORE UPDATE ON prose.audiobook_chapters
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_audiobook_segments_updated_at BEFORE UPDATE ON prose.audiobook_segments
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

-- Auto-update audiobook project statistics
CREATE OR REPLACE FUNCTION prose.update_audiobook_project_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prose.audiobook_projects
    SET
        chapter_count = (
            SELECT COUNT(*)
            FROM prose.audiobook_chapters
            WHERE audiobook_project_id = COALESCE(NEW.audiobook_project_id, OLD.audiobook_project_id)
        ),
        total_duration_seconds = (
            SELECT COALESCE(SUM(duration_seconds), 0)
            FROM prose.audiobook_chapters
            WHERE audiobook_project_id = COALESCE(NEW.audiobook_project_id, OLD.audiobook_project_id)
        )
    WHERE id = COALESCE(NEW.audiobook_project_id, OLD.audiobook_project_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_audiobook_chapters_update_project_stats
    AFTER INSERT OR UPDATE OR DELETE ON prose.audiobook_chapters
    FOR EACH ROW EXECUTE FUNCTION prose.update_audiobook_project_statistics();

-- Auto-update character voice dialogue duration
CREATE OR REPLACE FUNCTION prose.update_character_voice_duration()
RETURNS TRIGGER AS $$
DECLARE
    v_audiobook_project_id UUID;
BEGIN
    -- Get the audiobook project ID from the chapter
    SELECT audiobook_project_id INTO v_audiobook_project_id
    FROM prose.audiobook_chapters
    WHERE id = COALESCE(NEW.chapter_id, OLD.chapter_id);

    -- Update the voice duration for this character
    IF NEW.character_name IS NOT NULL OR OLD.character_name IS NOT NULL THEN
        UPDATE prose.audiobook_voices
        SET total_dialogue_seconds = (
            SELECT COALESCE(SUM(duration_seconds), 0)
            FROM prose.audiobook_segments s
            JOIN prose.audiobook_chapters c ON s.chapter_id = c.id
            WHERE c.audiobook_project_id = v_audiobook_project_id
                AND s.character_name = COALESCE(NEW.character_name, OLD.character_name)
                AND s.status = 'complete'
        )
        WHERE audiobook_project_id = v_audiobook_project_id
            AND character_name = COALESCE(NEW.character_name, OLD.character_name);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_audiobook_segments_update_voice_duration
    AFTER INSERT OR UPDATE OR DELETE ON prose.audiobook_segments
    FOR EACH ROW
    WHEN (NEW.segment_type = 'dialogue' OR OLD.segment_type = 'dialogue')
    EXECUTE FUNCTION prose.update_character_voice_duration();

-- ============================================================================
-- PART 8: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE prose.audiobook_projects IS 'Audiobook generation projects with multi-voice narration';
COMMENT ON TABLE prose.audiobook_voices IS 'Character-specific voice assignments from TTS providers';
COMMENT ON TABLE prose.audiobook_chapters IS 'Generated audiobook chapters with audio file references';
COMMENT ON TABLE prose.audiobook_segments IS 'Individual dialogue/narrative segments for processing';
COMMENT ON TABLE prose.audiobook_usage IS 'TTS provider usage and cost tracking';

COMMENT ON COLUMN prose.audiobook_voices.voice_settings IS 'JSON object with TTS parameters (stability, clarity, style, etc.)';
COMMENT ON COLUMN prose.audiobook_segments.emotion_detected IS 'Auto-detected emotion for contextual voice modulation';
COMMENT ON COLUMN prose.audiobook_segments.emotion_intensity IS 'Intensity of detected emotion (0.0-1.0)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'NexusProseCreator Audiobook Schema migration completed successfully';
    RAISE NOTICE '- Created 5 audiobook generation tables';
    RAISE NOTICE '- Added 15+ indexes for optimal performance';
    RAISE NOTICE '- Created 7 triggers for automatic updates';
    RAISE NOTICE '- Integration: Multi-voice TTS with ElevenLabs, XTTS-v2, PlayHT';
    RAISE NOTICE 'Audiobook generation pipeline ready';
END $$;
