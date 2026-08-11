import express from 'express';
import { requireCustomerAuth } from '../middleware/customerAuth.js';
import { getCustomerOrders, placeCustomerOrder } from '../controllers/customerOrders.js';

const router = express.Router();

// Customer order routes — require requireCustomerAuth
router.get('/', requireCustomerAuth, getCustomerOrders);
router.post('/', requireCustomerAuth, placeCustomerOrder);

export default router;
