/**
 * YouTube Video Script Format Type Definitions
 * Optimized for video content creation and SEO
 */

export interface ScriptBeat {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: 'hook' | 'intro' | 'main' | 'cta' | 'outro' | 'transition' | 'broll';
  duration: number; // seconds
  word_count: number;
  metadata: {
    visual_notes?: string;
    audio_notes?: string;
    graphics?: string[];
    broll_suggestions?: string[];
  };
}

export interface Hook {
  text: string;
  duration: number; // seconds (typically 15-30)
  type: 'question' | 'statistic' | 'story' | 'problem' | 'controversy' | 'curiosity_gap';
  retention_score: number; // 0-100
  engagement_elements: {
    has_question: boolean;
    has_statistic: boolean;
    has_story_element: boolean;
    addresses_pain_point: boolean;
    creates_curiosity: boolean;
    emotional_trigger: string | null;
  };
  suggestions: string[];
}

export interface Introduction {
  text: string;
  duration: number; // seconds (typically 30-60)
  elements: {
    value_proposition: string;
    credibility_statement?: string;
    preview_of_content: string;
    subscribe_cta?: boolean;
  };
}

export interface MainContent {
  sections: ContentSection[];
  total_duration: number;
  word_count: number;
}

export interface ContentSection {
  title: string;
  content: string;
  duration: number;
  timestamp: string; // HH:MM:SS
  key_points: string[];
  visual_elements?: string[];
  engagement_moments?: EngagementMoment[];
}

export interface EngagementMoment {
  type: 'question' | 'poll' | 'comment_prompt' | 'like_reminder' | 'share_prompt';
  text: string;
  timestamp: string;
  reason: string;
}

export interface CallToAction {
  text: string;
  duration: number; // seconds (typically 30-60)
  cta_type: 'subscribe' | 'like' | 'comment' | 'share' | 'link' | 'product' | 'course' | 'download';
  primary_action: string;
  secondary_action?: string;
  urgency_level: 'low' | 'medium' | 'high';
  value_proposition: string;
}

export interface Outro {
  text: string;
  duration: number; // seconds (typically 15-30)
  elements: {
    thank_you: boolean;
    next_video_tease?: string;
    subscribe_reminder: boolean;
    end_screen_elements: string[];
  };
}

export interface Timestamp {
  time: string; // HH:MM:SS format
  title: string;
  description?: string;
}

export interface FormattedVideoScript {
  metadata: {
    title: string;
    target_duration: number; // minutes
    actual_duration: number; // minutes
    word_count: number;
    estimated_speaking_rate: number; // words per minute
    format_version: string;
    created_at: Date;
  };

  hook: Hook;
  intro: Introduction;
  main_content: MainContent;
  cta: CallToAction;
  outro: Outro;

  timestamps: Timestamp[];
  engagement_strategy: EngagementStrategy;
  seo: YouTubeSEO;
}

export interface EngagementStrategy {
  pattern_interrupts: number; // How many times to break viewer's attention
  engagement_prompts: number; // Questions, polls, etc.
  retention_tactics: string[];
  recommended_graphics: string[];
  recommended_broll: string[];
}

export interface YouTubeSEO {
  title: OptimizedTitle;
  description: OptimizedDescription;
  tags: string[];
  thumbnail_concepts: ThumbnailConcept[];

  keyword_analysis: {
    primary_keyword: string;
    secondary_keywords: string[];
    search_volume_score: number; // 0-100
    competition_score: number; // 0-100
    keyword_placement: {
      in_title: boolean;
      in_first_sentence: boolean;
      in_description: boolean;
      in_tags: boolean;
    };
  };

  engagement_predictions: {
    estimated_ctr: number; // Click-through rate 0-100
    estimated_retention: RetentionCurve;
    estimated_engagement_rate: number; // 0-100
  };
}

export interface OptimizedTitle {
  original: string;
  optimized: string;
  character_count: number;
  keyword_score: number; // 0-100
  curiosity_score: number; // 0-100
  emotional_score: number; // 0-100
  variations: TitleVariation[];
  recommendations: string[];
}

export interface TitleVariation {
  text: string;
  score: number;
  reasoning: string;
}

export interface OptimizedDescription {
  original: string;
  optimized: string;
  character_count: number;
  keyword_density: number; // percentage
  cta_count: number;
  link_count: number;
  timestamp_included: boolean;
  structure: {
    first_paragraph: string; // First 150 chars (visible without "show more")
    body: string;
    timestamps: string;
    links: string;
    social_media: string;
  };
}

export interface ThumbnailConcept {
  concept: string;
  elements: {
    text_overlay?: string;
    primary_visual: string;
    emotion: 'curiosity' | 'excitement' | 'shock' | 'happiness' | 'concern' | 'neutral';
    color_scheme: string[];
    composition: string;
  };
  score: number; // 0-100 predicted CTR
  reasoning: string;
}

export interface RetentionCurve {
  predicted_retention: Array<{
    timestamp: number; // seconds
    retention_percentage: number; // 0-100
    reason?: string;
  }>;

  critical_moments: Array<{
    timestamp: number;
    type: 'drop_risk' | 'engagement_peak';
    description: string;
    recommendation: string;
  }>;

  overall_retention_score: number; // 0-100
  average_view_duration: number; // seconds
}

export interface HookAnalysis {
  current_text: string;
  word_count: number;
  estimated_duration: number;

  // Best practice checks
  checks: {
    has_question: boolean;
    has_statistic: boolean;
    has_story_hook: boolean;
    addresses_viewer_pain: boolean;
    creates_curiosity_gap: boolean;
    too_long: boolean;
    too_vague: boolean;
    has_emotional_trigger: boolean;
  };

  retention_score: number; // 0-100
  suggestions: HookSuggestion[];
}

export interface HookSuggestion {
  type: 'rewrite' | 'add_element' | 'remove_element' | 'reorder';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  reasoning: string;
  example?: string;
}

export interface VideoScriptFormattingOptions {
  speaking_rate: number; // words per minute (default: 150)
  include_timestamps: boolean;
  include_visual_notes: boolean;
  include_broll_suggestions: boolean;
  optimize_for_shorts: boolean; // YouTube Shorts specific optimizations
  target_audience: 'general' | 'professional' | 'educational' | 'entertainment';
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
}

export interface ScriptTimingAnalysis {
  total_duration: number; // seconds
  section_breakdown: Array<{
    section: string;
    duration: number;
    percentage: number;
  }>;

  pacing_analysis: {
    words_per_minute: number;
    recommended_wpm: number;
    pacing_issues: Array<{
      timestamp: number;
      issue: 'too_fast' | 'too_slow' | 'monotonous';
      recommendation: string;
    }>;
  };

  engagement_distribution: {
    pattern_interrupts_per_minute: number;
    engagement_prompts_per_minute: number;
    visual_changes_per_minute: number;
  };
}

// YouTube Shorts specific types (< 60 seconds)
export interface YouTubeShortsScript {
  hook: string; // First 3 seconds - CRITICAL
  main_content: string; // 45-50 seconds
  cta: string; // Last 5-7 seconds

  optimization: {
    vertical_format: boolean;
    text_overlays: string[];
    trending_sounds?: string[];
    hashtags: string[];
    estimated_retention: number; // 0-100
  };
}

export interface KeywordResearch {
  keyword: string;
  search_volume: number;
  competition: 'low' | 'medium' | 'high';
  difficulty_score: number; // 0-100
  relevance_score: number; // 0-100
  trending: boolean;
  related_keywords: string[];
}

export interface ContentOptimization {
  current_score: number; // 0-100
  seo_score: number; // 0-100
  engagement_score: number; // 0-100
  retention_score: number; // 0-100

  improvements: Array<{
    category: 'seo' | 'engagement' | 'retention' | 'structure';
    improvement: string;
    impact: 'high' | 'medium' | 'low';
    implementation: string;
  }>;
}

export type VideoLength = 'short' | 'medium' | 'long' | 'very_long';
export type VideoPurpose = 'educational' | 'entertainment' | 'tutorial' | 'vlog' | 'review' | 'commentary';
export type AudienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
