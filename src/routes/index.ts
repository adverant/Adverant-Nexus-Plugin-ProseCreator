import { Router } from 'express';
import projectsRoutes from './projects.routes';
import seriesRoutes from './series.routes';
import blueprintsRoutes from './blueprints.routes';
import generationRoutes from './generation.routes';
import charactersRoutes from './characters.routes';
import researchRoutes from './research.routes';
import analysisRoutes from './analysis.routes';
import healthRoutes from './health.routes';
import formatsRoutes from './formats.routes';

const router = Router();

// Mount all route modules
router.use('/projects', projectsRoutes);
router.use('/series', seriesRoutes);
router.use('/blueprints', blueprintsRoutes);
router.use('/generation', generationRoutes);
router.use('/characters', charactersRoutes);
router.use('/research', researchRoutes);
router.use('/analysis', analysisRoutes);
router.use('/health', healthRoutes);
router.use('/formats', formatsRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NexusProseCreator API v1.0.0',
    endpoints: {
      projects: '/prosecreator/api/projects',
      series: '/prosecreator/api/series',
      blueprints: '/prosecreator/api/blueprints',
      generation: '/prosecreator/api/generation',
      characters: '/prosecreator/api/characters',
      research: '/prosecreator/api/research',
      analysis: '/prosecreator/api/analysis',
      health: '/prosecreator/api/health',
      formats: '/prosecreator/api/formats'
    },
    format_support: {
      screenplay: {
        format: '/prosecreator/api/formats/screenplay/format',
        analyze: '/prosecreator/api/formats/screenplay/analyze',
        export_fountain: '/prosecreator/api/formats/screenplay/export/fountain',
        export_finaldraft: '/prosecreator/api/formats/screenplay/export/finaldraft',
        export_html: '/prosecreator/api/formats/screenplay/export/html',
        import_fountain: '/prosecreator/api/formats/screenplay/import/fountain'
      },
      youtube: {
        format: '/prosecreator/api/formats/youtube/format',
        analyze_timing: '/prosecreator/api/formats/youtube/analyze-timing',
        optimize_hook: '/prosecreator/api/formats/youtube/optimize-hook',
        hook_variations: '/prosecreator/api/formats/youtube/hook-variations',
        compare_hooks: '/prosecreator/api/formats/youtube/compare-hooks',
        seo: '/prosecreator/api/formats/youtube/seo',
        best_practices: '/prosecreator/api/formats/youtube/best-practices'
      }
    },
    documentation: 'https://docs.api.adverant.ai'
  });
});

export default router;
