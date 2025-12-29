import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateRequest, validateUUID } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { createResearchBriefSchema } from '../schemas';

const router = Router();
router.use(apiLimiter);

// POST /prosecreator/api/research - Generate research brief
router.post('/', authenticateUser, validateRequest(createResearchBriefSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { id: `research_${Date.now()}`, ...req.body, confidence_score: 0.85 }});
}));

// GET /prosecreator/api/research/:project_id - List research briefs
router.get('/:project_id', authenticateUser, validateUUID('project_id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));

// GET /prosecreator/api/research/brief/:id - Get specific research brief
router.get('/brief/:id', authenticateUser, validateUUID('id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { id: req.params.id, topic: 'Sample Topic', research_content: 'Research details...' }});
}));

// DELETE /prosecreator/api/research/:id - Delete research brief
router.delete('/:id', authenticateUser, validateUUID('id'), asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Research brief deleted' });
}));

export default router;
