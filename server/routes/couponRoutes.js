import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// Public / Authenticated coupon validation
router.post('/validate', protect, validateCoupon);

// Admin-only endpoints
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
