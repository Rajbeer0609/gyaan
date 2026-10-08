import express from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

export default router;
