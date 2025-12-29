import { z } from 'zod';

// Series schemas
export const createSeriesSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    genre: z.string().min(1).max(100),
    planned_books: z.number().int().min(1).max(100),
    premise: z.string().min(10)
  })
});

export const updateSeriesSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    genre: z.string().min(1).max(100).optional(),
    planned_books: z.number().int().min(1).max(100).optional(),
    premise: z.string().min(10).optional(),
    status: z.enum(['planning', 'active', 'completed', 'archived']).optional()
  })
});

// Project schemas
export const createProjectSchema = z.object({
  body: z.object({
    series_id: z.string().uuid().optional(),
    title: z.string().min(1).max(500),
    format: z.enum([
      'novel',
      'screenplay',
      'youtube_script',
      'stage_play',
      'comic_book',
      'poetry',
      'podcast_script',
      'how_to_guide',
      'fanfiction'
    ]),
    genre: z.string().min(1).max(100),
    sub_genre: z.string().max(100).optional(),
    target_word_count: z.number().int().min(1000).max(500000),
    premise: z.string().min(10)
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    format: z.enum([
      'novel',
      'screenplay',
      'youtube_script',
      'stage_play',
      'comic_book',
      'poetry',
      'podcast_script',
      'how_to_guide',
      'fanfiction'
    ]).optional(),
    genre: z.string().min(1).max(100).optional(),
    sub_genre: z.string().max(100).optional(),
    target_word_count: z.number().int().min(1000).max(500000).optional(),
    premise: z.string().min(10).optional(),
    status: z.enum(['planning', 'outlining', 'writing', 'editing', 'completed', 'archived']).optional()
  })
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    series_id: z.string().uuid().optional(),
    format: z.string().optional(),
    status: z.string().optional(),
    genre: z.string().optional()
  })
});

// Blueprint schemas
export const generateSeriesBlueprintSchema = z.object({
  body: z.object({
    series_id: z.string().uuid(),
    depth: z.enum(['overview', 'standard', 'detailed']).default('standard')
  })
});

export const generateProjectBlueprintSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    depth: z.enum(['overview', 'standard', 'detailed']).default('standard'),
    include_research: z.boolean().default(true)
  })
});

export const generateChapterBlueprintSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    chapter_number: z.number().int().min(1),
    parent_blueprint_id: z.string().uuid().optional()
  })
});

export const evolveBlueprintSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    chapter_number: z.number().int().min(1),
    trigger_reason: z.string().optional()
  })
});

// Generation schemas
export const generateBeatSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    chapter_number: z.number().int().min(1),
    beat_number: z.number().int().min(1),
    blueprint_id: z.string().uuid(),
    stream: z.boolean().default(true)
  })
});

export const generateChapterSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    chapter_number: z.number().int().min(1),
    blueprint_id: z.string().uuid(),
    stream: z.boolean().default(true),
    auto_evolve_blueprint: z.boolean().default(true)
  })
});

export const regenerateBeatSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    chapter_number: z.number().int().min(1),
    beat_number: z.number().int().min(1),
    corrections: z.array(z.string()).min(1),
    preserve_character_consistency: z.boolean().default(true)
  })
});

// Character schemas
export const createCharacterSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    character_name: z.string().min(1).max(200),
    initial_profile: z.object({
      age: z.number().int().min(0).max(200).optional(),
      gender: z.string().max(50).optional(),
      role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']),
      physical_description: z.string().optional(),
      personality_traits: z.array(z.string()).optional(),
      backstory: z.string().optional(),
      motivation: z.string().optional()
    }).optional()
  })
});

export const updateCharacterSchema = z.object({
  body: z.object({
    profile: z.object({
      age: z.number().int().min(0).max(200).optional(),
      gender: z.string().max(50).optional(),
      role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
      physical_description: z.string().optional(),
      personality_traits: z.array(z.string()).optional(),
      backstory: z.string().optional(),
      motivation: z.string().optional(),
      arc: z.string().optional(),
      voice_profile: z.object({
        vocabulary_level: z.string(),
        sentence_complexity: z.string(),
        common_phrases: z.array(z.string()),
        dialect: z.string().optional()
      }).optional()
    })
  })
});

// Research schemas
export const createResearchBriefSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    topic: z.string().min(1).max(500),
    context: z.string().min(10),
    depth: z.enum(['quick', 'standard', 'deep']).default('standard')
  })
});

// Analysis schemas
export const analyzeContinu itySchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    chapter_range: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
    check_types: z.array(z.enum([
      'plot_holes',
      'character_inconsistency',
      'timeline_errors',
      'location_errors',
      'fact_errors'
    ])).default(['plot_holes', 'character_inconsistency', 'timeline_errors'])
  })
});

export const analyzePlotHolesSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    severity_threshold: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
  })
});

export const analyzeCharacterConsistencySchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    character_name: z.string().min(1).max(200),
    aspects: z.array(z.enum([
      'voice',
      'behavior',
      'appearance',
      'relationships',
      'knowledge',
      'timeline'
    ])).default(['voice', 'behavior', 'appearance'])
  })
});

export const analyzeStyleSchema = z.object({
  body: z.object({
    sample_text: z.string().min(100),
    analysis_depth: z.enum(['quick', 'standard', 'deep']).default('standard')
  })
});

// Validation helper
export type ValidatedRequest<T extends z.ZodTypeAny> = {
  body: z.infer<T>['body'];
  query: z.infer<T>['query'];
  params: z.infer<T>['params'];
};
