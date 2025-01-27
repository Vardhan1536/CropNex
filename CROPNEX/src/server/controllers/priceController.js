import Price from '../models/Price.js';

export const getPrices = async (req, res) => {
  try {
    const { commodityId, marketId, startDate, endDate } = req.query;
    const query = {};

    if (commodityId) query.commodity = commodityId;
    if (marketId) query.market = marketId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const prices = await Price.find(query)
      .populate('commodity')
      .populate('market')
      .sort({ date: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPrice = async (req, res) => {
  const price = new Price(req.body);
  try {
    const newPrice = await price.save();
    res.status(201).json(newPrice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPriceHistory = async (req, res) => {
  try {
    const { commodityId, marketId, days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const prices = await Price.find({
      commodity: commodityId,
      market: marketId,
      date: { $gte: startDate, $lte: endDate }
    })
    .sort({ date: 1 });

    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};