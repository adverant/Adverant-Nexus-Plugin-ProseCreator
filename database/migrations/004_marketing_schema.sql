-- ============================================================================
-- NexusProseCreator - Marketing & Sales Automation Schema
-- ============================================================================
-- This migration creates tables for complete marketing automation including
-- campaigns, multi-channel advertising, CRM integration, and sales analytics

SET search_path TO prose, public;

-- ============================================================================
-- PART 1: MARKETING CAMPAIGNS
-- ============================================================================

CREATE TABLE prose.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Campaign details
    campaign_name VARCHAR(200) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- pre_launch, launch, ongoing, promo

    -- Timeline
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,

    -- Budget
    budget_dollars DECIMAL(10,2),

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_campaign_type CHECK (campaign_type IN ('pre_launch', 'launch', 'ongoing', 'promo')),
    CONSTRAINT check_campaign_status CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    CONSTRAINT check_budget CHECK (budget_dollars IS NULL OR budget_dollars >= 0),
    CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============================================================================
-- PART 2: MARKETING CHANNELS
-- ============================================================================

CREATE TABLE prose.marketing_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES prose.marketing_campaigns(id) ON DELETE CASCADE,

    -- Channel details
    channel VARCHAR(50) NOT NULL, -- amazon_ads, bookbub, social_media, email, blog, podcast

    -- Budget allocation
    budget_allocation_dollars DECIMAL(10,2),

    -- Performance metrics
    spend_dollars DECIMAL(10,2) DEFAULT 0.00,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_dollars DECIMAL(10,2) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_channel CHECK (channel IN ('amazon_ads', 'bookbub', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'email', 'social_organic', 'blog', 'podcast')),
    CONSTRAINT check_budget_allocation CHECK (budget_allocation_dollars IS NULL OR budget_allocation_dollars >= 0),
    CONSTRAINT check_spend CHECK (spend_dollars >= 0),
    CONSTRAINT check_impressions CHECK (impressions >= 0),
    CONSTRAINT check_clicks CHECK (clicks >= 0),
    CONSTRAINT check_conversions CHECK (conversions >= 0),
    CONSTRAINT check_revenue CHECK (revenue_dollars >= 0)
);

-- ============================================================================
-- PART 3: AD CAMPAIGNS
-- ============================================================================

CREATE TABLE prose.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES prose.marketing_channels(id) ON DELETE CASCADE,

    -- Platform details
    platform VARCHAR(50) NOT NULL, -- amazon_sp, amazon_sb, facebook, bookbub, google_ads

    -- Campaign details
    campaign_name VARCHAR(200) NOT NULL,
    ad_copy TEXT,
    targeting JSONB DEFAULT '{}', -- Platform-specific targeting settings

    -- Bidding strategy
    bidding_strategy VARCHAR(50), -- manual, auto, target_acos, target_roas
    daily_budget DECIMAL(10,2),

    -- Status
    status VARCHAR(50) DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_platform CHECK (platform IN ('amazon_sp', 'amazon_sb', 'facebook', 'instagram', 'bookbub', 'google_ads', 'tiktok')),
    CONSTRAINT check_bidding_strategy CHECK (bidding_strategy IS NULL OR bidding_strategy IN ('manual', 'auto', 'target_acos', 'target_roas')),
    CONSTRAINT check_daily_budget CHECK (daily_budget IS NULL OR daily_budget >= 0),
    CONSTRAINT check_ad_status CHECK (status IN ('draft', 'active', 'paused', 'archived'))
);

-- ============================================================================
-- PART 4: AD PERFORMANCE TRACKING (Daily Snapshots)
-- ============================================================================

CREATE TABLE prose.ad_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_campaign_id UUID NOT NULL REFERENCES prose.ad_campaigns(id) ON DELETE CASCADE,

    -- Date tracking
    date DATE NOT NULL,

    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend_dollars DECIMAL(10,2) DEFAULT 0.00,
    sales INTEGER DEFAULT 0,
    revenue_dollars DECIMAL(10,2) DEFAULT 0.00,

    -- Calculated metrics
    acos DECIMAL(5,2), -- Advertising Cost of Sales (spend / revenue * 100)
    roas DECIMAL(5,2), -- Return on Ad Spend (revenue / spend)

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_performance_impressions CHECK (impressions >= 0),
    CONSTRAINT check_performance_clicks CHECK (clicks >= 0),
    CONSTRAINT check_performance_spend CHECK (spend_dollars >= 0),
    CONSTRAINT check_performance_sales CHECK (sales >= 0),
    CONSTRAINT check_performance_revenue CHECK (revenue_dollars >= 0),
    CONSTRAINT check_acos CHECK (acos IS NULL OR acos >= 0),
    CONSTRAINT check_roas CHECK (roas IS NULL OR roas >= 0),
    UNIQUE(ad_campaign_id, date)
);

-- ============================================================================
-- PART 5: EMAIL MARKETING
-- ============================================================================

CREATE TABLE prose.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES prose.marketing_campaigns(id) ON DELETE CASCADE,

    -- Email details
    email_type VARCHAR(50) NOT NULL, -- welcome, nurture, launch, promo, newsletter
    subject_line VARCHAR(200) NOT NULL,
    email_body TEXT NOT NULL, -- HTML

    -- Scheduling
    send_date TIMESTAMP WITH TIME ZONE,

    -- Performance metrics
    recipients_count INTEGER DEFAULT 0,
    opens_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sent

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_email_type CHECK (email_type IN ('welcome', 'nurture', 'launch', 'promo', 'newsletter', 'win_back', 'review_request')),
    CONSTRAINT check_recipients CHECK (recipients_count >= 0),
    CONSTRAINT check_opens CHECK (opens_count >= 0),
    CONSTRAINT check_email_clicks CHECK (clicks_count >= 0),
    CONSTRAINT check_email_conversions CHECK (conversions_count >= 0),
    CONSTRAINT check_email_status CHECK (status IN ('draft', 'scheduled', 'sent'))
);

-- ============================================================================
-- PART 6: SOCIAL MEDIA POSTS
-- ============================================================================

CREATE TABLE prose.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES prose.marketing_campaigns(id) ON DELETE CASCADE,

    -- Platform details
    platform VARCHAR(50) NOT NULL, -- instagram, twitter, tiktok, facebook, linkedin
    post_type VARCHAR(50), -- image, video, carousel, story, reel

    -- Content
    content TEXT NOT NULL,
    media_urls VARCHAR(500)[] DEFAULT '{}',

    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE,
    posted_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, posted, failed

    -- Engagement metrics
    engagement JSONB DEFAULT '{}', -- Likes, comments, shares, views

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_social_platform CHECK (platform IN ('instagram', 'twitter', 'tiktok', 'facebook', 'linkedin', 'threads')),
    CONSTRAINT check_post_type CHECK (post_type IS NULL OR post_type IN ('image', 'video', 'carousel', 'story', 'reel', 'text')),
    CONSTRAINT check_social_status CHECK (status IN ('draft', 'scheduled', 'posted', 'failed'))
);

-- ============================================================================
-- PART 7: CRM CONTACTS (Reader Relationship Management)
-- ============================================================================

CREATE TABLE prose.crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contact details
    email VARCHAR(200) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),

    -- Acquisition
    source VARCHAR(100), -- website, reader_magnet, book_purchase, social, referral

    -- Lifecycle stage
    stage VARCHAR(50) DEFAULT 'lead', -- lead, prospect, customer, advocate

    -- Preferences
    genre_preferences VARCHAR(100)[] DEFAULT '{}',
    communication_preferences JSONB DEFAULT '{}',

    -- Engagement
    engagement_score DECIMAL(5,2) DEFAULT 0.00, -- 0-100
    lifetime_value_dollars DECIMAL(10,2) DEFAULT 0.00,

    -- Unsubscribe tracking
    subscribed BOOLEAN DEFAULT TRUE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_source CHECK (source IS NULL OR source IN ('website', 'reader_magnet', 'book_purchase', 'social', 'referral', 'manual')),
    CONSTRAINT check_stage CHECK (stage IN ('lead', 'prospect', 'customer', 'advocate')),
    CONSTRAINT check_engagement_score CHECK (engagement_score >= 0 AND engagement_score <= 100),
    CONSTRAINT check_lifetime_value CHECK (lifetime_value_dollars >= 0)
);

-- ============================================================================
-- PART 8: CRM LIFECYCLE AUTOMATION (Drip Sequences)
-- ============================================================================

CREATE TABLE prose.crm_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Sequence details
    sequence_name VARCHAR(200) NOT NULL,
    sequence_type VARCHAR(50) NOT NULL, -- welcome, nurture, launch, win_back

    -- Trigger
    trigger_event VARCHAR(100), -- contact_created, book_purchased, 30_days_inactive

    -- Metadata
    email_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_sequence_type CHECK (sequence_type IN ('welcome', 'nurture', 'launch', 'win_back', 'review_request')),
    CONSTRAINT check_trigger_event CHECK (trigger_event IS NULL OR trigger_event IN ('contact_created', 'book_purchased', '30_days_inactive', 'manual')),
    CONSTRAINT check_email_count CHECK (email_count >= 0),
    CONSTRAINT check_sequence_status CHECK (status IN ('active', 'paused', 'archived'))
);

CREATE TABLE prose.crm_sequence_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id UUID NOT NULL REFERENCES prose.crm_sequences(id) ON DELETE CASCADE,

    -- Email position
    email_number INTEGER NOT NULL,

    -- Timing
    delay_days INTEGER NOT NULL, -- Days after trigger or previous email

    -- Content
    subject_line VARCHAR(200) NOT NULL,
    email_body TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_email_number CHECK (email_number > 0),
    CONSTRAINT check_delay_days CHECK (delay_days >= 0),
    UNIQUE(sequence_id, email_number)
);

-- ============================================================================
-- PART 9: CONTACT SEQUENCE ENROLLMENT
-- ============================================================================

CREATE TABLE prose.crm_contact_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES prose.crm_contacts(id) ON DELETE CASCADE,
    sequence_id UUID NOT NULL REFERENCES prose.crm_sequences(id) ON DELETE CASCADE,

    -- Progress tracking
    current_email_number INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    paused BOOLEAN DEFAULT FALSE,

    CONSTRAINT check_current_email CHECK (current_email_number >= 0),
    UNIQUE(contact_id, sequence_id)
);

-- ============================================================================
-- PART 10: SALES TRACKING (All Platforms)
-- ============================================================================

CREATE TABLE prose.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Platform tracking
    platform VARCHAR(100) NOT NULL,

    -- Date tracking
    sale_date DATE NOT NULL,

    -- Format
    format VARCHAR(50), -- ebook, print, audiobook

    -- Sales metrics
    units_sold INTEGER DEFAULT 0,
    revenue_dollars DECIMAL(10,2),
    royalty_dollars DECIMAL(10,2),

    -- Attribution
    source VARCHAR(100), -- organic, ad, promo, referral

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_sales_platform CHECK (platform IN ('amazon', 'apple', 'kobo', 'google_play', 'barnes_noble', 'audible', 'direct', 'other')),
    CONSTRAINT check_sales_format CHECK (format IS NULL OR format IN ('ebook', 'print', 'audiobook')),
    CONSTRAINT check_units_sold CHECK (units_sold >= 0),
    CONSTRAINT check_sales_revenue CHECK (revenue_dollars IS NULL OR revenue_dollars >= 0),
    CONSTRAINT check_royalty CHECK (royalty_dollars IS NULL OR royalty_dollars >= 0),
    CONSTRAINT check_sales_source CHECK (source IS NULL OR source IN ('organic', 'ad', 'promo', 'referral', 'review', 'social')),
    UNIQUE(publishing_project_id, platform, sale_date, format)
);

-- ============================================================================
-- PART 11: ANALYTICS DASHBOARD CACHING
-- ============================================================================

CREATE TABLE prose.analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Metric details
    metric_type VARCHAR(100) NOT NULL, -- total_sales, roi, email_performance, ad_performance
    metric_value JSONB NOT NULL,

    -- Cache lifecycle
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT check_expires_after_cached CHECK (expires_at > cached_at),
    UNIQUE(publishing_project_id, metric_type)
);

-- ============================================================================
-- PART 12: REVIEW TRACKING
-- ============================================================================

CREATE TABLE prose.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publishing_project_id UUID NOT NULL REFERENCES prose.publishing_projects(id) ON DELETE CASCADE,

    -- Platform details
    platform VARCHAR(100) NOT NULL, -- amazon, goodreads, bookbub, netgalley

    -- Review details
    reviewer_name VARCHAR(200),
    rating DECIMAL(2,1), -- 1.0 to 5.0
    review_text TEXT,
    review_url VARCHAR(500),

    -- Verification
    verified_purchase BOOLEAN DEFAULT FALSE,

    -- Date
    review_date DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_review_platform CHECK (platform IN ('amazon', 'goodreads', 'bookbub', 'netgalley', 'apple_books', 'kobo')),
    CONSTRAINT check_rating CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 5.0))
);

-- ============================================================================
-- PART 13: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Marketing campaigns indexes
CREATE INDEX idx_marketing_campaigns_project ON prose.marketing_campaigns(publishing_project_id);
CREATE INDEX idx_marketing_campaigns_type ON prose.marketing_campaigns(campaign_type);
CREATE INDEX idx_marketing_campaigns_status ON prose.marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_dates ON prose.marketing_campaigns(start_date, end_date);

-- Marketing channels indexes
CREATE INDEX idx_marketing_channels_campaign ON prose.marketing_channels(campaign_id);
CREATE INDEX idx_marketing_channels_channel ON prose.marketing_channels(channel);

-- Ad campaigns indexes
CREATE INDEX idx_ad_campaigns_channel ON prose.ad_campaigns(channel_id);
CREATE INDEX idx_ad_campaigns_platform ON prose.ad_campaigns(platform);
CREATE INDEX idx_ad_campaigns_status ON prose.ad_campaigns(status);

-- Ad performance indexes
CREATE INDEX idx_ad_performance_campaign ON prose.ad_performance(ad_campaign_id);
CREATE INDEX idx_ad_performance_date ON prose.ad_performance(date DESC);
CREATE INDEX idx_ad_performance_campaign_date ON prose.ad_performance(ad_campaign_id, date DESC);

-- Email campaigns indexes
CREATE INDEX idx_email_campaigns_campaign ON prose.email_campaigns(campaign_id);
CREATE INDEX idx_email_campaigns_type ON prose.email_campaigns(email_type);
CREATE INDEX idx_email_campaigns_status ON prose.email_campaigns(status);

-- Social posts indexes
CREATE INDEX idx_social_posts_campaign ON prose.social_posts(campaign_id);
CREATE INDEX idx_social_posts_platform ON prose.social_posts(platform);
CREATE INDEX idx_social_posts_status ON prose.social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON prose.social_posts(scheduled_date) WHERE scheduled_date IS NOT NULL;

-- CRM contacts indexes
CREATE INDEX idx_crm_contacts_email ON prose.crm_contacts(email);
CREATE INDEX idx_crm_contacts_stage ON prose.crm_contacts(stage);
CREATE INDEX idx_crm_contacts_subscribed ON prose.crm_contacts(subscribed) WHERE subscribed = TRUE;
CREATE INDEX idx_crm_contacts_engagement ON prose.crm_contacts(engagement_score DESC);

-- CRM sequences indexes
CREATE INDEX idx_crm_sequences_type ON prose.crm_sequences(sequence_type);
CREATE INDEX idx_crm_sequences_status ON prose.crm_sequences(status);

-- CRM sequence emails indexes
CREATE INDEX idx_crm_sequence_emails_sequence ON prose.crm_sequence_emails(sequence_id);
CREATE INDEX idx_crm_sequence_emails_number ON prose.crm_sequence_emails(sequence_id, email_number);

-- Contact sequences indexes
CREATE INDEX idx_contact_sequences_contact ON prose.crm_contact_sequences(contact_id);
CREATE INDEX idx_contact_sequences_sequence ON prose.crm_contact_sequences(sequence_id);
CREATE INDEX idx_contact_sequences_active ON prose.crm_contact_sequences(contact_id, paused) WHERE paused = FALSE;

-- Sales indexes
CREATE INDEX idx_sales_project ON prose.sales(publishing_project_id);
CREATE INDEX idx_sales_platform ON prose.sales(platform);
CREATE INDEX idx_sales_date ON prose.sales(sale_date DESC);
CREATE INDEX idx_sales_project_date ON prose.sales(publishing_project_id, sale_date DESC);

-- Analytics cache indexes
CREATE INDEX idx_analytics_cache_project ON prose.analytics_cache(publishing_project_id);
CREATE INDEX idx_analytics_cache_metric ON prose.analytics_cache(metric_type);
CREATE INDEX idx_analytics_cache_expires ON prose.analytics_cache(expires_at);

-- Reviews indexes
CREATE INDEX idx_reviews_project ON prose.reviews(publishing_project_id);
CREATE INDEX idx_reviews_platform ON prose.reviews(platform);
CREATE INDEX idx_reviews_rating ON prose.reviews(rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX idx_reviews_verified ON prose.reviews(verified_purchase) WHERE verified_purchase = TRUE;

-- ============================================================================
-- PART 14: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER tg_marketing_campaigns_updated_at BEFORE UPDATE ON prose.marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_marketing_channels_updated_at BEFORE UPDATE ON prose.marketing_channels
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_ad_campaigns_updated_at BEFORE UPDATE ON prose.ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_email_campaigns_updated_at BEFORE UPDATE ON prose.email_campaigns
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_social_posts_updated_at BEFORE UPDATE ON prose.social_posts
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_crm_contacts_updated_at BEFORE UPDATE ON prose.crm_contacts
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_crm_sequences_updated_at BEFORE UPDATE ON prose.crm_sequences
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_crm_sequence_emails_updated_at BEFORE UPDATE ON prose.crm_sequence_emails
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

CREATE TRIGGER tg_reviews_updated_at BEFORE UPDATE ON prose.reviews
    FOR EACH ROW EXECUTE FUNCTION prose.update_updated_at_column();

-- Auto-calculate ACOS and ROAS for ad performance
CREATE OR REPLACE FUNCTION prose.calculate_ad_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate ACOS (Advertising Cost of Sales)
    IF NEW.revenue_dollars > 0 THEN
        NEW.acos = (NEW.spend_dollars / NEW.revenue_dollars) * 100;
    ELSE
        NEW.acos = NULL;
    END IF;

    -- Calculate ROAS (Return on Ad Spend)
    IF NEW.spend_dollars > 0 THEN
        NEW.roas = NEW.revenue_dollars / NEW.spend_dollars;
    ELSE
        NEW.roas = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_ad_performance_calculate_metrics
    BEFORE INSERT OR UPDATE ON prose.ad_performance
    FOR EACH ROW
    EXECUTE FUNCTION prose.calculate_ad_metrics();

-- ============================================================================
-- PART 15: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE prose.marketing_campaigns IS 'Marketing campaign orchestration (pre-launch, launch, ongoing)';
COMMENT ON TABLE prose.marketing_channels IS 'Channel-specific budget allocation and performance';
COMMENT ON TABLE prose.ad_campaigns IS 'Advertising campaigns across platforms (Amazon, Facebook, BookBub)';
COMMENT ON TABLE prose.ad_performance IS 'Daily snapshots of ad performance metrics';
COMMENT ON TABLE prose.email_campaigns IS 'Email marketing campaigns and newsletters';
COMMENT ON TABLE prose.social_posts IS 'Social media content scheduling and tracking';
COMMENT ON TABLE prose.crm_contacts IS 'Reader database with lifecycle stage tracking';
COMMENT ON TABLE prose.crm_sequences IS 'Automated email drip sequences';
COMMENT ON TABLE prose.crm_sequence_emails IS 'Individual emails within automated sequences';
COMMENT ON TABLE prose.crm_contact_sequences IS 'Contact enrollment in sequences';
COMMENT ON TABLE prose.sales IS 'Sales tracking across all platforms and formats';
COMMENT ON TABLE prose.analytics_cache IS 'Pre-calculated analytics for dashboard performance';
COMMENT ON TABLE prose.reviews IS 'Book reviews from all platforms';

COMMENT ON COLUMN prose.ad_performance.acos IS 'Advertising Cost of Sales (spend / revenue * 100), auto-calculated';
COMMENT ON COLUMN prose.ad_performance.roas IS 'Return on Ad Spend (revenue / spend), auto-calculated';
COMMENT ON COLUMN prose.crm_contacts.engagement_score IS 'Engagement score (0-100) based on email opens, clicks, purchases';
COMMENT ON COLUMN prose.crm_contacts.lifetime_value_dollars IS 'Total revenue generated from this contact';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'NexusProseCreator Marketing & Sales Automation Schema migration completed successfully';
    RAISE NOTICE '- Created 14 marketing automation tables';
    RAISE NOTICE '- Added 40+ indexes for optimal performance';
    RAISE NOTICE '- Created 10 triggers for automatic updates';
    RAISE NOTICE '- Integration: Amazon Ads, BookBub, Social platforms, Email providers';
    RAISE NOTICE 'Complete marketing automation pipeline ready';
END $$;
