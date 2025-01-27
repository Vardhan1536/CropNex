import express from 'express';
import {
  getAllCommodities,
  getCommodityById,
  createCommodity,
  updateCommodity
} from '../controllers/commodityController.js';

const router = express.Router();

router.get('/', getAllCommodities);
router.get('/:id', getCommodityById);
router.post('/', createCommodity);
router.put('/:id', updateCommodity);

export default router;