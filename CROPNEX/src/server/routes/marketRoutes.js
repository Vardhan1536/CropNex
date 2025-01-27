import express from 'express';
import {
  getAllMarkets,
  getMarketById,
  createMarket,
  updateMarket
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/', getAllMarkets);
router.get('/:id', getMarketById);
router.post('/', createMarket);
router.put('/:id', updateMarket);

export default router;