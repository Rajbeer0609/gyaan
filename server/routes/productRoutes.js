import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/related/:id', getRelatedProducts);
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);

// Admin-only endpoints
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
