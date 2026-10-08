import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin-only order routes
router.get('/admin/all', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
