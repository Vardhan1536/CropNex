import Commodity from '../models/Commodity.js';

export const getAllCommodities = async (req, res) => {
  try {
    const commodities = await Commodity.find();
    res.json(commodities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommodityById = async (req, res) => {
  try {
    const commodity = await Commodity.findById(req.params.id);
    if (!commodity) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    res.json(commodity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCommodity = async (req, res) => {
  const commodity = new Commodity(req.body);
  try {
    const newCommodity = await commodity.save();
    res.status(201).json(newCommodity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCommodity = async (req, res) => {
  try {
    const commodity = await Commodity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!commodity) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    res.json(commodity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};