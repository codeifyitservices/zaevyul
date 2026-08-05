import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/settings.js';

const router = express.Router();

// GET /api/admin/settings
router.get('/', requireAuth, getSettings);

// PUT /api/admin/settings
router.put('/', requireAuth, requireRole(['super_admin', 'admin']), updateSettings);

export default router;
