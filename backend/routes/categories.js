import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.js';

const router = express.Router();

// GET /api/admin/categories
router.get('/', requireAuth, getCategories);

// POST /api/admin/categories
router.post('/', requireAuth, requireRole(['super_admin', 'admin']), createCategory);

// GET /api/admin/categories/:id
router.get('/:id', requireAuth, getCategoryById);

// PUT /api/admin/categories/:id
router.put('/:id', requireAuth, requireRole(['super_admin', 'admin']), updateCategory);

// DELETE /api/admin/categories/:id
router.delete('/:id', requireAuth, requireRole(['super_admin', 'admin']), deleteCategory);

export default router;
