import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateRequest, validateUUID } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { createCharacterSchema, updateCharacterSchema } from '../schemas';

const router = Router();
router.use(apiLimiter);

// POST /prosecreator/api/characters - Create character
router.post('/', authenticateUser, validateRequest(createCharacterSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { id: `char_${Date.now()}`, ...req.body }});
}));

// GET /prosecreator/api/characters/:project_id - List characters
router.get('/:project_id', authenticateUser, validateUUID('project_id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));

// GET /prosecreator/api/characters/:project_id/:name - Get character
router.get('/:project_id/:name', authenticateUser, validateUUID('project_id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { project_id: req.params.project_id, character_name: req.params.name }});
}));

// PUT /prosecreator/api/characters/:project_id/:name - Update character
router.put('/:project_id/:name', authenticateUser, validateUUID('project_id'), validateRequest(updateCharacterSchema), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { character_name: req.params.name, ...req.body }});
}));

// GET /prosecreator/api/characters/:project_id/:name/appearances - Get appearances
router.get('/:project_id/:name/appearances', authenticateUser, validateUUID('project_id'), asyncHandler(async (req, res) => {
  res.json({ success: true, data: { character_name: req.params.name, appearances: [] }});
}));

// DELETE /prosecreator/api/characters/:project_id/:name - Delete character
router.delete('/:project_id/:name', authenticateUser, validateUUID('project_id'), asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Character deleted' });
}));

export default router;
