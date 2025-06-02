import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  predictedPrices: number[] | null;
  startDate: string; // ISO string format like 'YYYY-MM-DD'
  // You could also pass num_days if easier: numDays: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ predictedPrices, startDate }) => {
  // Function to generate dates and format data for the chart
  const formatChartData = (prices: number[] | null, startDt: string) => {
    if (!prices || prices.length === 0 || !startDt) {
      return [];
    }

    const chartData = prices.map((price, index) => {
      const currentDate = new Date(startDt);
      currentDate.setDate(currentDate.getDate() + index); // Add 'index' days to the start date
      return {
        // Format date for display (e.g., 'Dec 20', 'Mon', '20/12')
        // For simplicity, using 'MM/DD' format. Adjust as needed.
        date: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
        // Or use a library like date-fns for more robust formatting:
        // date: format(currentDate, 'MMM d'), // Example: 'Dec 20'
        price: price,
      };
    });
    return chartData;
  };

  const chartData = formatChartData(predictedPrices, startDate);

  if (!predictedPrices || predictedPrices.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-xl font-semibold mb-4">Price Trends</h3>
        <p className="text-gray-500">No prediction data available to display the chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Price Trends</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}> {/* Use the formatted chartData */}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" /> {/* 'date' now holds the formatted date string */}
            <YAxis 
              domain={['auto', 'auto']} // Or set a specific domain if needed
              tickFormatter={(tick) => `₹${tick}`} // Format Y-axis ticks
            />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']} // Format tooltip value
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              name="Predicted Price" // Add a name for the legend
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: '#16a34a', r: 4 }} // Slightly larger dot
              activeDot={{ r: 6 }} // Dot on hover
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* You can make these insights dynamic later if needed */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          • General market insights can be displayed here.
        </p>
        <p className="text-yellow-800 mt-2">
          • These are based on the predicted trends shown above.
        </p>
      </div>
    </div>
  );
};

export default PriceChart;