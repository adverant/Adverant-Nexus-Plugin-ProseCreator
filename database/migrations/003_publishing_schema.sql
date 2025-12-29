-- ============================================================================
-- NexusProseCreator - Publishing Pipeline Schema
-- ============================================================================
-- This migration creates tables for complete publishing automation including
-- ISBN management, copyright registration, format conversion, and platform distribution

SET search_path TO prose, public;

-- ============================================================================
-- PART 1: PUBLISHING PROJECTS
-- ============================================================================

CREATE TABLE prose.publishing_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prose.projects(id) ON DELETE CASCADE,

    -- Publishing path
    publishing_path VARCHAR(50) NOT NULL, -- self_publishing, traditional, hybrid

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, published, rejected

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_publishing_path CHECK (publishing_path IN ('self_publishing', 'traditional', 'hybrid')),
    CONSTRAINT check_publishing_status CHECK (status IN ('draft', 'submitted', 'published', 'rejected'))
);

-- ============================================================================
-- PART 2: ISBN MANAGEMENT
-- ============================================================================

CREATE TABLE prose.isbns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- ISBN details
    isbn VARCHAR(13) NOT NULL UNIQUE,
    format VARCHAR(50) NOT NULL, -- print, ebook, audiobook

    -- Purchase tracking
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bowker_purchase_id VARCHAR(200),
    cost_dollars DECIMAL(10,2),

    CONSTRAINT check_isbn_length CHECK (LENGTH(isbn) = 13),
    CONSTRAINT check_isbn_format CHECK (format IN ('print', 'ebook', 'audiobook')),
    CONSTRAINT check_cost CHECK (cost_dollars IS NULL OR cost_dollars >= 0)
);

-- ============================================================================
-- PART 3: COPYRIGHT & LEGAL
-- ============================================================================

CREATE TABLE prose.copyright_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Registration details
    registration_number VARCHAR(100),
    application_date TIMESTAMP WITH TIME ZONE,
    approval_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected

    -- Documentation
    filing_receipt_url VARCHAR(500),
    certificate_url VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_copyright_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE prose.lccns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- LCCN details
    lccn VARCHAR(50) UNIQUE,
    application_date TIMESTAMP WITH TIME ZONE,
    approval_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_lccn_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- ============================================================================
-- PART 4: FORMAT CONVERSIONS
-- ============================================================================

CREATE TABLE prose.format_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Format details
    format VARCHAR(50) NOT NULL, -- epub, mobi, pdf_kdp, pdf_ingramspark, m4b, mp3, fdx, fountain

    -- File details
    file_url VARCHAR(500) NOT NULL,
    file_size_mb DECIMAL(10,2),
    page_count INTEGER, -- For print formats

    -- Validation
    validation_status VARCHAR(50) DEFAULT 'pending', -- pending, valid, invalid
    validation_errors JSONB DEFAULT '[]',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_format_type CHECK (format IN ('epub', 'mobi', 'pdf_kdp', 'pdf_ingramspark', 'm4b', 'mp3', 'fdx', 'fountain', 'docx', 'markdown')),
    CONSTRAINT check_file_size CHECK (file_size_mb IS NULL OR file_size_mb > 0),
    CONSTRAINT check_page_count CHECK (page_count IS NULL OR page_count > 0),
    CONSTRAINT check_validation_status CHECK (validation_status IN ('pending', 'valid', 'invalid'))
);

-- ============================================================================
-- PART 5: COVER DESIGNS
-- ============================================================================

CREATE TABLE prose.cover_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Design details
    variation_number INTEGER DEFAULT 1,
    image_generation_prompt TEXT,
    cover_type VARCHAR(50) NOT NULL, -- ebook, print_kdp, print_ingramspark, audiobook

    -- File details
    file_url VARCHAR(500) NOT NULL,
    is_selected BOOLEAN DEFAULT FALSE,

    -- AI generation tracking
    ai_provider VARCHAR(50), -- midjourney, dalle, stable_diffusion
    generation_cost DECIMAL(10,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_cover_type CHECK (cover_type IN ('ebook', 'print_kdp', 'print_ingramspark', 'audiobook')),
    CONSTRAINT check_ai_provider CHECK (ai_provider IS NULL OR ai_provider IN ('midjourney', 'dalle', 'stable_diffusion', 'manual')),
    CONSTRAINT check_generation_cost CHECK (generation_cost IS NULL OR generation_cost >= 0),
    CONSTRAINT check_variation_number CHECK (variation_number > 0)
);

-- ============================================================================
-- PART 6: METADATA OPTIMIZATION
-- ============================================================================

CREATE TABLE prose.book_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Basic metadata
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    series_name VARCHAR(500),
    series_number INTEGER,

    -- Description & keywords
    description TEXT NOT NULL, -- HTML formatted
    keywords VARCHAR(100)[] DEFAULT '{}', -- Array of 7 keywords
    categories VARCHAR(200)[] DEFAULT '{}', -- Array of category paths
    bisac_codes VARCHAR(20)[] DEFAULT '{}', -- Industry standard codes

    -- Author information
    author_bio TEXT,

    -- Publishing details
    language VARCHAR(10) DEFAULT 'en',
    publication_date DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_series_number CHECK (series_number IS NULL OR series_number > 0),
    CONSTRAINT check_language CHECK (LENGTH(language) >= 2)
);

-- ============================================================================
-- PART 7: PLATFORM SUBMISSIONS
-- ============================================================================

CREATE TABLE prose.platform_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Platform details
    platform VARCHAR(100) NOT NULL, -- amazon_kdp, ingramspark, draft2digital, findaway, apple_books, kobo, google_play
    submission_type VARCHAR(50), -- ebook, print, audiobook

    -- Submission tracking
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, live, rejected

    -- Platform identifiers
    platform_id VARCHAR(200), -- Platform's internal ID (ASIN, etc.)
    platform_url VARCHAR(500), -- Link to book on platform

    -- Error tracking
    error_message TEXT,

    -- Pricing & distribution
    pricing JSONB DEFAULT '{}', -- { "USD": 9.99, "GBP": 7.99, etc. }
    territories VARCHAR(50)[] DEFAULT '{}', -- Distribution territories
    royalty_rate DECIMAL(5,2), -- Percentage

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_platform CHECK (platform IN ('amazon_kdp', 'ingramspark', 'draft2digital', 'findaway', 'apple_books', 'kobo', 'google_play', 'barnes_noble')),
    CONSTRAINT check_submission_type CHECK (submission_type IN ('ebook', 'print', 'audiobook')),
    CONSTRAINT check_platform_status CHECK (status IN ('pending', 'approved', 'live', 'rejected')),
    CONSTRAINT check_royalty_rate CHECK (royalty_rate IS NULL OR (royalty_rate >= 0 AND royalty_rate <= 100))
);

-- ============================================================================
-- PART 8: TRADITIONAL PUBLISHING TRACK
-- ============================================================================

CREATE TABLE prose.agent_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Agent details
    agent_name VARCHAR(200) NOT NULL,
    agency_name VARCHAR(200) NOT NULL,
    agent_email VARCHAR(200) NOT NULL,

    -- Submission details
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    query_letter TEXT NOT NULL,
    synopsis_pages INTEGER, -- 1, 3, or 5
    sample_chapters INTEGER, -- Number of chapters sent

    -- Response tracking
    response_date TIMESTAMP WITH TIME ZONE,
    response_type VARCHAR(50), -- rejection, request_full, offer, no_response
    response_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_synopsis_pages CHECK (synopsis_pages IS NULL OR synopsis_pages IN (1, 3, 5)),
    CONSTRAINT check_sample_chapters CHECK (sample_chapters IS NULL OR sample_chapters > 0),
    CONSTRAINT check_response_type CHECK (response_type IS NULL OR response_type IN ('rejection', 'request_full', 'offer', 'no_response'))
);

-- ============================================================================
-- PART 9: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Publishing projects indexes
CREATE INDEX idx_publishing_projects_project ON prose.publishing_projects(project_id);
CREATE INDEX idx_publishing_projects_path ON prose.publishing_projects(publishing_path);
CREATE INDEX idx_publishing_projects_status ON prose.publishing_projects(status);

-- ISBNs indexes
CREATE INDEX idx_isbns_publishing ON prose.isbns(publishing_project_id);
CREATE INDEX idx_isbns_format ON prose.isbns(format);
CREATE INDEX idx_isbns_isbn ON prose.isbns(isbn);

-- Copyright registrations indexes
CREATE INDEX idx_copyright_publishing ON prose.copyright_registrations(publishing_project_id);
CREATE INDEX idx_copyright_status ON prose.copyright_registrations(status);

-- LCCNs indexes
CREATE INDEX idx_lccns_publishing ON prose.lccns(publishing_project_id);
CREATE INDEX idx_lccns_status ON prose.lccns(status);

-- Format outputs indexes
CREATE INDEX idx_format_outputs_publishing ON prose.format_outputs(publishing_project_id);
CREATE INDEX idx_format_outputs_format ON prose.format_outputs(format);
CREATE INDEX idx_format_outputs_validation ON prose.format_outputs(validation_status);

-- Cover designs indexes
CREATE INDEX idx_cover_designs_publishing ON prose.cover_designs(publishing_project_id);
CREATE INDEX idx_cover_designs_type ON prose.cover_designs(cover_type);
CREATE INDEX idx_cover_designs_selected ON prose.cover_designs(publishing_project_id, is_selected) WHERE is_selected = TRUE;

-- Book metadata indexes
CREATE INDEX idx_metadata_publishing ON prose.book_metadata(publishing_project_id);
CREATE INDEX idx_metadata_publication_date ON prose.book_metadata(publication_date) WHERE publication_date IS NOT NULL;

-- Platform submissions indexes
CREATE INDEX idx_platform_submissions_publishing ON prose.platform_submissions(publishing_project_id);
CREATE INDEX idx_platform_submissions_platform ON prose.platform_submissions(platform);
CREATE INDEX idx_platform_submissions_status ON prose.platform_submissions(status);
CREATE INDEX idx_platform_submissions_live ON prose.platform_submissions(publishing_project_id, status) WHERE status = 'live';

-- Agent submissions indexes
CREATE INDEX idx_agent_submissions_publishing ON prose.agent_submissions(publishing_project_id);
CREATE INDEX idx_agent_submissions_date ON prose.agent_submissions(submission_date DESC);
CREATE INDEX idx_agent_submissions_response ON prose.agent_submissions(response_type) WHERE response_type IS NOT NULL;

-- ============================================================================
-- PART 10: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER tg_publishing_projects_updated_at BEFORE UPDATE ON prose.publishing_projects
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_copyright_updated_at BEFORE UPDATE ON prose.copyright_registrations
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_lccns_updated_at BEFORE UPDATE ON prose.lccns
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_format_outputs_updated_at BEFORE UPDATE ON prose.format_outputs
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_cover_designs_updated_at BEFORE UPDATE ON prose.cover_designs
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_book_metadata_updated_at BEFORE UPDATE ON prose.book_metadata
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_platform_submissions_updated_at BEFORE UPDATE ON prose.platform_submissions
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_agent_submissions_updated_at BEFORE UPDATE ON prose.agent_submissions
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

-- Ensure only one cover is selected per type
CREATE OR REPLACE FUNCTION prose.ensure_single_selected_cover()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_selected = TRUE THEN
        UPDATE prose.cover_designs
        SET is_selected = FALSE
        WHERE publishing_project_id = NEW.publishing_project_id
            AND cover_type = NEW.cover_type
            AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_cover_designs_single_selection
    BEFORE UPDATE ON prose.cover_designs
    FOR EACH ROW
    WHEN (NEW.is_selected = TRUE)
    EXECUTE FUNCTION prose.ensure_single_selected_cover();

-- ============================================================================
-- PART 11: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE prose.publishing_projects IS 'Publishing project tracking for self-publishing or traditional paths';
COMMENT ON TABLE prose.isbns IS 'ISBN registration and management via Bowker API';
COMMENT ON TABLE prose.copyright_registrations IS 'Copyright registration tracking via copyright.gov';
COMMENT ON TABLE prose.lccns IS 'Library of Congress Control Number assignments';
COMMENT ON TABLE prose.format_outputs IS 'Format conversions (EPUB, MOBI, PDF, etc.) with validation';
COMMENT ON TABLE prose.cover_designs IS 'AI-generated cover designs with A/B testing variations';
COMMENT ON TABLE prose.book_metadata IS 'SEO-optimized metadata (keywords, categories, description)';
COMMENT ON TABLE prose.platform_submissions IS 'Platform distribution tracking (Amazon KDP, IngramSpark, etc.)';
COMMENT ON TABLE prose.agent_submissions IS 'Literary agent submission tracking for traditional publishing';

COMMENT ON COLUMN prose.book_metadata.description IS 'HTML-formatted book description for platforms';
COMMENT ON COLUMN prose.book_metadata.keywords IS 'Array of 7 SEO keywords (Amazon limit)';
COMMENT ON COLUMN prose.book_metadata.categories IS 'Array of BISAC category paths';
COMMENT ON COLUMN prose.platform_submissions.pricing IS 'JSON object with currency: price mappings';
COMMENT ON COLUMN prose.platform_submissions.territories IS 'Array of distribution territory codes';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'NexusProseCreator Publishing Pipeline Schema migration completed successfully';
    RAISE NOTICE '- Created 9 publishing automation tables';
    RAISE NOTICE '- Added 25+ indexes for optimal performance';
    RAISE NOTICE '- Created 9 triggers for automatic updates';
    RAISE NOTICE '- Integration: Bowker API (ISBN), copyright.gov, platform APIs';
    RAISE NOTICE 'Complete publishing pipeline ready';
END $$;
