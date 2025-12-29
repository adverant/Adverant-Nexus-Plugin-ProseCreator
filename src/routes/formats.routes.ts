/**
 * Format-Specific Routes
 *
 * API endpoints for screenplay and YouTube script formatting
 */

import { Router, Request, Response } from 'express';
import { ScreenplayFormatter, FountainConverter, FinalDraftExporter } from '../formats/screenplay';
import { YouTubeScriptFormatter, HookOptimizer, SEOOptimizer } from '../formats/youtube';
import { logger } from '../utils/logger';

const router = Router();

// Initialize formatters
const screenplayFormatter = new ScreenplayFormatter();
const fountainConverter = new FountainConverter();
const finalDraftExporter = new FinalDraftExporter();
const youtubeFormatter = new YouTubeScriptFormatter();
const hookOptimizer = new HookOptimizer();
const seoOptimizer = new SEOOptimizer();

// ============================================================================
// Screenplay Routes
// ============================================================================

/**
 * POST /formats/screenplay/format
 * Format screenplay with industry-standard formatting
 */
router.post('/screenplay/format', async (req: Request, res: Response) => {
  try {
    const { project_id, title, author, scenes, options } = req.body;

    if (!title || !author || !scenes) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title, author, and scenes are required'
        }
      });
    }

    const formatted = await screenplayFormatter.formatScreenplay({
      project_id,
      title,
      author,
      scenes,
      options
    });

    logger.info('Screenplay formatted successfully', { project_id, title });

    res.json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    logger.error('Error formatting screenplay', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'FORMATTING_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/screenplay/analyze
 * Analyze screenplay structure and content
 */
router.post('/screenplay/analyze', async (req: Request, res: Response) => {
  try {
    const { screenplay } = req.body;

    if (!screenplay) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SCREENPLAY',
          message: 'Screenplay object is required'
        }
      });
    }

    const analysis = await screenplayFormatter.analyzeScreenplay(screenplay);

    logger.info('Screenplay analyzed successfully');

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    logger.error('Error analyzing screenplay', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/screenplay/export/fountain
 * Export screenplay to Fountain markup format
 */
router.post('/screenplay/export/fountain', async (req: Request, res: Response) => {
  try {
    const { screenplay } = req.body;

    if (!screenplay) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SCREENPLAY',
          message: 'Screenplay object is required'
        }
      });
    }

    const fountain = fountainConverter.toFountain(screenplay);

    logger.info('Screenplay exported to Fountain format');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${screenplay.title}.fountain"`);
    res.send(fountain);
  } catch (error: any) {
    logger.error('Error exporting to Fountain', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/screenplay/import/fountain
 * Import screenplay from Fountain markup format
 */
router.post('/screenplay/import/fountain', async (req: Request, res: Response) => {
  try {
    const { fountain } = req.body;

    if (!fountain) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FOUNTAIN',
          message: 'Fountain markup is required'
        }
      });
    }

    const screenplay = fountainConverter.fromFountain(fountain);

    logger.info('Screenplay imported from Fountain format');

    res.json({
      success: true,
      data: screenplay
    });
  } catch (error: any) {
    logger.error('Error importing from Fountain', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'IMPORT_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/screenplay/export/finaldraft
 * Export screenplay to Final Draft .fdx format
 */
router.post('/screenplay/export/finaldraft', async (req: Request, res: Response) => {
  try {
    const { screenplay } = req.body;

    if (!screenplay) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SCREENPLAY',
          message: 'Screenplay object is required'
        }
      });
    }

    const fdx = await finalDraftExporter.exportToFinalDraft(screenplay);

    logger.info('Screenplay exported to Final Draft format');

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${screenplay.title}.fdx"`);
    res.send(fdx);
  } catch (error: any) {
    logger.error('Error exporting to Final Draft', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/screenplay/export/html
 * Export screenplay to formatted HTML
 */
router.post('/screenplay/export/html', async (req: Request, res: Response) => {
  try {
    const { screenplay } = req.body;

    if (!screenplay) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SCREENPLAY',
          message: 'Screenplay object is required'
        }
      });
    }

    const html = await finalDraftExporter.exportToHTML(screenplay);

    logger.info('Screenplay exported to HTML format');

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    logger.error('Error exporting to HTML', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: error.message
      }
    });
  }
});

// ============================================================================
// YouTube Script Routes
// ============================================================================

/**
 * POST /formats/youtube/format
 * Format video script for YouTube with timing and engagement analysis
 */
router.post('/youtube/format', async (req: Request, res: Response) => {
  try {
    const { project_id, title, target_duration, beats, options } = req.body;

    if (!title || !target_duration || !beats) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title, target_duration, and beats are required'
        }
      });
    }

    const formatted = await youtubeFormatter.formatVideoScript({
      project_id,
      title,
      target_duration,
      beats,
      options
    });

    logger.info('YouTube script formatted successfully', { project_id, title });

    res.json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    logger.error('Error formatting YouTube script', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'FORMATTING_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/youtube/analyze-timing
 * Analyze script timing and pacing
 */
router.post('/youtube/analyze-timing', async (req: Request, res: Response) => {
  try {
    const { beats, options } = req.body;

    if (!beats) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_BEATS',
          message: 'Script beats are required'
        }
      });
    }

    const analysis = await youtubeFormatter.analyzeScriptTiming(beats, options || {});

    logger.info('YouTube script timing analyzed successfully');

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    logger.error('Error analyzing script timing', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/youtube/optimize-hook
 * Optimize video hook (first 30 seconds) for maximum retention
 */
router.post('/youtube/optimize-hook', async (req: Request, res: Response) => {
  try {
    const { hook } = req.body;

    if (!hook) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HOOK',
          message: 'Hook text is required'
        }
      });
    }

    const optimized = await hookOptimizer.optimizeHook(hook);

    logger.info('Hook optimized successfully');

    res.json({
      success: true,
      data: optimized
    });
  } catch (error: any) {
    logger.error('Error optimizing hook', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'OPTIMIZATION_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/youtube/hook-variations
 * Generate multiple hook variations with different approaches
 */
router.post('/youtube/hook-variations', async (req: Request, res: Response) => {
  try {
    const { hook, count = 3 } = req.body;

    if (!hook) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HOOK',
          message: 'Hook text is required'
        }
      });
    }

    const variations = await hookOptimizer.generateHookVariations(hook, count);

    logger.info('Hook variations generated', { count: variations.length });

    res.json({
      success: true,
      data: variations
    });
  } catch (error: any) {
    logger.error('Error generating hook variations', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/youtube/compare-hooks
 * A/B test two hook variations
 */
router.post('/youtube/compare-hooks', async (req: Request, res: Response) => {
  try {
    const { hookA, hookB } = req.body;

    if (!hookA || !hookB) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HOOKS',
          message: 'Both hookA and hookB are required'
        }
      });
    }

    const comparison = await hookOptimizer.compareHooks(hookA, hookB);

    logger.info('Hooks compared successfully');

    res.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    logger.error('Error comparing hooks', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPARISON_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * POST /formats/youtube/seo
 * Optimize video for YouTube SEO (title, description, tags)
 */
router.post('/youtube/seo', async (req: Request, res: Response) => {
  try {
    const { title, description, content, target_keywords } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title and content are required'
        }
      });
    }

    const seo = await seoOptimizer.optimizeForYouTube({
      title,
      description: description || '',
      content,
      target_keywords
    });

    logger.info('YouTube SEO optimization complete');

    res.json({
      success: true,
      data: seo
    });
  } catch (error: any) {
    logger.error('Error optimizing YouTube SEO', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'SEO_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * GET /formats/youtube/best-practices
 * Get YouTube video script best practices
 */
router.get('/youtube/best-practices', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      hook: {
        max_duration: 30,
        description: 'First 30 seconds are critical for retention',
        best_practices: [
          'Start with a question to engage viewers',
          'Use surprising statistics or facts',
          'Address viewer pain points immediately',
          'Create curiosity gap to keep viewers watching',
          'Keep it under 30 seconds'
        ]
      },
      introduction: {
        target_duration: '30-60 seconds',
        elements: [
          'State value proposition clearly',
          'Establish credibility',
          'Preview what\'s coming',
          'Ask viewers to subscribe'
        ]
      },
      main_content: {
        percentage: '70-80%',
        best_practices: [
          'Break into clear sections with timestamps',
          'Use pattern interrupts every 2-3 minutes',
          'Include engagement prompts',
          'Add visual variety with B-roll',
          'Keep pacing dynamic'
        ]
      },
      cta: {
        target_duration: '30-60 seconds',
        best_practices: [
          'Be specific about desired action',
          'Explain the value/benefit',
          'Create urgency when appropriate',
          'Make it easy to take action'
        ]
      },
      outro: {
        target_duration: '15-30 seconds',
        elements: [
          'Thank viewers for watching',
          'Tease next video',
          'Remind to subscribe',
          'End screen elements'
        ]
      },
      general: {
        speaking_rate: '150 words per minute',
        engagement_frequency: 'Every 60-90 seconds',
        optimal_length: '8-12 minutes for most content',
        thumbnail_importance: 'Critical for CTR - test multiple versions'
      }
    }
  });
});

export default router;
