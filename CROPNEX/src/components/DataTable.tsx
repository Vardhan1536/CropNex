import React from 'react';

interface DataTableProps {
  predictedPrices: number[]; // Required prop, assuming API sends an array of predicted prices
  market: string; // Default market
  region: string; // Default region
}

const DataTable: React.FC<DataTableProps> = ({ predictedPrices, market, region }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Predicted Price (₹)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {predictedPrices && predictedPrices.length > 0 ? (
              predictedPrices.map((price, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">Day {index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    ₹{price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{market}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{region}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
