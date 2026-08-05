import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getOrders,
  getOrderById,
  updateOrder,
  addOrderNote,
} from '../controllers/orders.js';

const router = express.Router();

// GET /api/admin/orders
router.get('/', requireAuth, getOrders);

// GET /api/admin/orders/:id
router.get('/:id', requireAuth, getOrderById);

// PUT /api/admin/orders/:id (Update Status)
router.put('/:id', requireAuth, updateOrder);

// POST /api/admin/orders/:id/notes
router.post('/:id/notes', requireAuth, addOrderNote);

export default router;
