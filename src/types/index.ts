// Core type definitions for NexusProseCreator API

export interface User {
  id: string;
  email: string;
  name?: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'studio';
  created_at: Date;
  updated_at: Date;
}

export interface Series {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  planned_books: number;
  premise: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export type ProjectFormat =
  | 'novel'
  | 'screenplay'
  | 'youtube_script'
  | 'stage_play'
  | 'comic_book'
  | 'poetry'
  | 'podcast_script'
  | 'how_to_guide'
  | 'fanfiction';

export type ProjectStatus = 'planning' | 'outlining' | 'writing' | 'editing' | 'completed' | 'archived';

export interface Project {
  id: string;
  series_id?: string;
  user_id: string;
  title: string;
  format: ProjectFormat;
  genre: string;
  sub_genre?: string;
  target_word_count: number;
  current_word_count: number;
  premise: string;
  status: ProjectStatus;
  ai_detection_score?: number;
  consistency_score?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Blueprint {
  id: string;
  project_id: string;
  type: 'series' | 'project' | 'chapter' | 'beat';
  content: string;
  version: number;
  parent_blueprint_id?: string;
  metadata: {
    chapter_number?: number;
    beat_number?: number;
    word_count_target?: number;
    plot_threads?: string[];
    characters_involved?: string[];
    location?: string;
    time_period?: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CharacterProfile {
  name: string;
  age?: number;
  gender?: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  physical_description?: string;
  personality_traits?: string[];
  backstory?: string;
  motivation?: string;
  arc?: string;
  relationships?: Array<{
    character_name: string;
    relationship_type: string;
    description: string;
  }>;
  voice_profile?: {
    vocabulary_level: string;
    sentence_complexity: string;
    common_phrases: string[];
    dialect?: string;
  };
  first_appearance?: {
    chapter_number: number;
    beat_number: number;
  };
  last_appearance?: {
    chapter_number: number;
    beat_number: number;
  };
}

export interface CharacterBible {
  id: string;
  project_id: string;
  character_name: string;
  profile: CharacterProfile;
  appearances: Array<{
    chapter_number: number;
    beat_number: number;
    scene_summary: string;
    character_state: string;
  }>;
  evolution_log: Array<{
    timestamp: Date;
    change_type: string;
    description: string;
    chapter_number: number;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface ResearchBrief {
  id: string;
  project_id: string;
  topic: string;
  context: string;
  research_content: string;
  sources?: string[];
  confidence_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface GenerationJob {
  id: string;
  project_id: string;
  job_type: 'beat' | 'chapter' | 'book';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  chapter_number?: number;
  beat_number?: number;
  result?: {
    content: string;
    word_count: number;
    metadata: any;
  };
  error?: string;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
}

export interface ContinuityIssue {
  type: 'plot_hole' | 'character_inconsistency' | 'timeline_error' | 'location_error' | 'fact_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    chapter_number: number;
    beat_number?: number;
  };
  suggested_fix?: string;
}

export interface AnalysisResult {
  id: string;
  project_id: string;
  analysis_type: 'continuity' | 'plot_holes' | 'character_consistency' | 'ai_detection' | 'style';
  results: {
    score?: number;
    issues?: ContinuityIssue[];
    insights?: string[];
    recommendations?: string[];
  };
  created_at: Date;
}

export interface ProjectStats {
  project_id: string;
  current_word_count: number;
  target_word_count: number;
  chapters_completed: number;
  chapters_planned: number;
  consistency_score: number;
  ai_detection_score: number;
  characters_count: number;
  unique_locations: number;
  plot_threads_active: number;
  plot_threads_resolved: number;
  estimated_completion_date?: Date;
  writing_velocity: {
    words_per_day: number;
    last_30_days: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface GenerationProgressMessage {
  type: 'generation_started' | 'generation_progress' | 'generation_complete' | 'generation_error';
  data: {
    project_id: string;
    chapter_number: number;
    beat_number?: number;
    progress?: {
      stage: string;
      progress: number;
      current_word_count?: number;
      estimated_completion?: number;
    };
    result?: {
      content: string;
      word_count: number;
      metadata: any;
    };
    error?: string;
  };
}

export interface BlueprintUpdateMessage {
  type: 'blueprint_updated';
  data: {
    project_id: string;
    blueprint_type: 'series' | 'project' | 'chapter' | 'beat';
    blueprint_id: string;
    changes: string[];
  };
}
