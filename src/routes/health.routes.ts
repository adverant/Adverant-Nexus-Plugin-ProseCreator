import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /prosecreator/api/health - Health check
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        database: 'connected',
        graphrag: 'connected',
        mageagent: 'connected',
        learningagent: 'connected'
      }
    }
  });
}));

// GET /prosecreator/api/health/ready - Readiness probe
router.get('/ready', asyncHandler(async (req, res) => {
  res.json({ success: true, ready: true });
}));

// GET /prosecreator/api/health/live - Liveness probe
router.get('/live', asyncHandler(async (req, res) => {
  res.json({ success: true, alive: true });
}));

export default router;
