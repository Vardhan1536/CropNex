import React from 'react';

interface DataTableProps {
  predictedPrices: number[];
  market: string;
  region: string;
  start_date: string; // Expecting start_date from props
  end_date: string; // Not used in current rendering logic, but was in your interface
}

const DataTable: React.FC<DataTableProps> = ({ predictedPrices, market, region, start_date }) => {
  // Calculate approximate height for 5 rows + header.
  // Assuming each row is roughly 50-60px high and header is ~40px.
  // 5 rows * 60px/row + 40px header = 340px. Adjust this value as needed based on your styling.
  const maxHeightForFiveRows = '350px'; // Example max height

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <h3 className="text-xl font-semibold p-4 border-b border-gray-200">
        Price Prediction Details
      </h3>
      {/* Apply max-height and overflow-y-auto to this container */}
      <div
        className="overflow-x-auto mt-0" // Removed mt-4 if header is inside this div now
        style={{
          maxHeight: predictedPrices && predictedPrices.length > 5 ? maxHeightForFiveRows : 'none',
          overflowY: predictedPrices && predictedPrices.length > 5 ? 'auto' : 'visible',
        }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10"> {/* Make header sticky */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
              predictedPrices.map((price, index) => {
                const date = new Date(start_date); // Use start_date from props
                date.setDate(date.getDate() + index);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const formattedDate = `${day}-${month}-${year}`;

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      ₹{price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{market}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{region}</td>
                  </tr>
                );
              })
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