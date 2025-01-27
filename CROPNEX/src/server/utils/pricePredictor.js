export const predictPrice = async (commodityId, marketId, daysAhead = 7) => {
  try {
    // Simple linear regression for price prediction
    // In a production environment, this would be replaced with a more sophisticated ML model
    const historicalPrices = await Price.find({
      commodity: commodityId,
      market: marketId
    })
    .sort({ date: -1 })
    .limit(30);

    if (historicalPrices.length < 2) {
      return null;
    }

    const prices = historicalPrices.map(p => p.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const trend = (prices[0] - prices[prices.length - 1]) / prices.length;

    return avg + (trend * daysAhead);
  } catch (error) {
    console.error('Price prediction error:', error);
    return null;
  }
};