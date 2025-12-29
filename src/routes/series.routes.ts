import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateRequest, validateUUID } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { createSeriesSchema, updateSeriesSchema } from '../schemas';

const router = Router();
router.use(apiLimiter);

// POST /prosecreator/api/series - Create series
router.post('/', authenticateUser, validateRequest(createSeriesSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { id: `series_${Date.now()}`, ...req.body, user_id: req.user!.id }});
}));

// GET /prosecreator/api/series/:id - Get series
router.get('/:id', authenticateUser, validateUUID('id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { id: req.params.id, title: 'Sample Series' }});
}));

// GET /prosecreator/api/series/:id/context - Get series context
router.get('/:id/context', authenticateUser, validateUUID('id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { series_id: req.params.id, total_words: 250000, books: 3 }});
}));

// PUT /prosecreator/api/series/:id - Update series
router.put('/:id', authenticateUser, validateUUID('id'), validateRequest(updateSeriesSchema), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { id: req.params.id, ...req.body }});
}));

// DELETE /prosecreator/api/series/:id - Delete series
router.delete('/:id', authenticateUser, validateUUID('id'), asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Series deleted' });
}));

export default router;
