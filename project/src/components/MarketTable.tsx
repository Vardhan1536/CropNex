import React from 'react';

interface MarketTableProps {
  Predictions: MarketSuggestion[];
}

interface MarketSuggestion {
  market_name: string;
  suggested_average_price: number;
  original_average_price: number;
  price_advantage: number;
  distance_km: number;
}

const MarketTable: React.FC<MarketTableProps> = ({ Predictions }) => {
  if (!Predictions || Predictions.length === 0) {
    return <div className="p-4 text-gray-500">No suggestions available.</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance (km)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Area Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Other Area Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price Advantage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Predictions.map((prediction, index) => {
              const percentageChange = (
                ((prediction.suggested_average_price - prediction.original_average_price) /
                  prediction.original_average_price) *
                100
              ).toFixed(2);

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prediction.market_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prediction.distance_km}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{prediction.original_average_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{prediction.suggested_average_price}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      +percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {percentageChange}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{prediction.price_advantage}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketTable;
