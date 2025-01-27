import express from 'express';
import {
  getPrices,
  createPrice,
  getPriceHistory
} from '../controllers/priceController.js';

const router = express.Router();

router.get('/', getPrices);
router.get('/history', getPriceHistory);
router.post('/', createPrice);

export default router;