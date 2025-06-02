import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell, // For custom bar colors
} from 'recharts';

interface MarketSuggestion {
  market_name: string;
  suggested_average_price: number;
  original_average_price?: number;
  price_advantage?: number;
  distance_km?: number;
}

interface MarketComparisonChartProps {
  suggestions: MarketSuggestion[];
  useDynamicBarColors?: boolean; // New prop to control bar coloring
}

const MarketComparisonChart: React.FC<MarketComparisonChartProps> = ({
  suggestions,
  useDynamicBarColors = false, // Default to single color
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold mb-4">Market Price Comparison</h3>
        <p className="text-gray-500">No market suggestion data available to display the chart.</p>
      </div>
    );
  }

  const chartData = suggestions.map(suggestion => ({
    name: suggestion.market_name,
    price: suggestion.suggested_average_price,
    // originalPrice: suggestion.original_average_price // For potential second bar
  }));

  const DYNAMIC_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];
  const DEFAULT_BAR_COLOR = '#16a34a';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold mb-4">Market Price Comparison (Suggested Average Price)</h3>
      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20, // Increased bottom margin for potentially rotated X-axis labels
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={chartData.length > 5 ? -30 : 0} // Rotate labels if many bars
              textAnchor={chartData.length > 5 ? "end" : "middle"}
              interval={0} // Show all labels
              height={chartData.length > 5 ? 70 : 30} // Adjust height for rotated labels
            />
            <YAxis
              label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft', offset: 0, dy: 40 }}
              tickFormatter={(tick) => `₹${tick.toLocaleString()}`} // Added toLocaleString for better number formatting
              width={80} // Give Y-axis some width for the label
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                // `name` is the `name` prop of the <Bar> component ("Suggested Avg. Price")
                // `props.payload` contains the full data object for this bar (e.g., { name: "Market A", price: 123 })
                return [`₹${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
              }}
              labelFormatter={(label: string) => {
                // `label` here is the value from the XAxis dataKey (market name)
                return `Market: ${label}`;
              }}
              cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} // Add a cursor hover effect
            />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              dataKey="price" 
              name="Suggested Avg. Price" 
              fill={useDynamicBarColors ? undefined : DEFAULT_BAR_COLOR} // Use default or let Cells define
              barSize={Math.min(50, 400 / chartData.length)} // Dynamic bar size, max 50px
            >
              {useDynamicBarColors && chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DYNAMIC_COLORS[index % DYNAMIC_COLORS.length]} />
              ))}
            </Bar>
            {/* Example for a second bar series:
            {chartData[0]?.originalPrice !== undefined && ( // Check if originalPrice data exists
              <Bar dataKey="originalPrice" name="Original Avg. Price" fill="#8884d8" barSize={30}>
                 {useDynamicBarColors && chartData.map((entry, index) => (
                  <Cell key={`cell-orig-${index}`} fill={ANOTHER_COLOR_PALETTE[index % ANOTHER_COLOR_PALETTE.length]} />
                ))}
              </Bar>
            )}
            */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketComparisonChart;