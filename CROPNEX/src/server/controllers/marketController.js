import Market from '../models/Market.js';

export const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find().populate('commodities.commodity');
    res.json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id)
      .populate('commodities.commodity');
    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }
    res.json(market);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMarket = async (req, res) => {
  const market = new Market(req.body);
  try {
    const newMarket = await market.save();
    res.status(201).json(newMarket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMarket = async (req, res) => {
  try {
    const market = await Market.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }
    res.json(market);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};