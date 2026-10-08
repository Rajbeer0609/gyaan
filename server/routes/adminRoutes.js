import express from 'express';
import {
  getDashboardStats,
  getCustomers,
  getAnalytics,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/analytics', getAnalytics);

export default router;
