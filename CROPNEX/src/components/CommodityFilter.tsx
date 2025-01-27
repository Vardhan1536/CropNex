import React, { useState } from 'react';
import { Search } from 'lucide-react';
import DataTable from './DataTable';

const FilterSelect = ({
  label,
  options,
  onChange,
}: {
  label: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div className="w-full">
    <label className="block text-lg font-medium text-gray-800 mb-2">{label}</label>
    <select
      className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const CommodityFilter = () => {
  const [commodity, setCommodity] = useState('');
  const [market, setMarket] = useState('');
  const [state, setState] = useState('');
  const [endDate, setEndDate] = useState('');
  const [forecastData, setForecastData] = useState<number[] | null>(null);

  const startDate = '2024-12-19'; // Fixed start date

  const calculateDateDifference = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Convert ms to days
  };

  const handlePredict = async () => {
    if (!commodity || !market || !state || !endDate) {
      alert('Please select all fields including end date before predicting.');
      return;
    }

    const daysDifference = calculateDateDifference(startDate, endDate);

    try {
      const response = await fetch('http://localhost:3000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: state,
          market: market,
          commodity: commodity,
          // startDate: startDate,
          // endDate: endDate,
          // daysDifference: daysDifference, // Pass the difference in days
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Log the response for debugging
        setForecastData(data.forecasted_prices);
      } else {
        alert('Failed to fetch forecast data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FilterSelect
          label="State"
          options={['Andhra Pradesh', 'Telangana']}
          onChange={setState}
        />
        <FilterSelect
          label="Market Location"
          options={['Kurnool', 'Madanapalle', 'Hyderabad', 'Mangalagiri', 'Alur']}
          onChange={setMarket}
        />
        <FilterSelect
          label="Commodity"
          options={[
            'Wheat', 'Rice', 'Corn', 'Soybean', 'Atta', 'Gram', 'Tur', 'Urad', 'Moong', 'Masur',
            'Groundnut oil', 'Mustard oil', 'Vanaspati', 'Soya oil', 'Sunflower oil', 'Palm oil',
            'Onion', 'Tomato', 'Sugar', 'Gur', 'Milk', 'Tea', 'Salt',
          ]}
          onChange={setCommodity}
        />
      </div>
      <div className="mt-8">
        <div className="w-full">
          <label className="block text-lg font-medium text-gray-800 mb-2">
            Select End Date (Start date is fixed: 19-12-2024)
          </label>
          <input
            type="date"
            min="2024-12-19" // Ensure end date is not earlier than start date
            className="p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button
          className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
        >
          <Search className="h-5 w-5" />
          <span>Search Markets</span>
        </button>
        <button
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
          onClick={handlePredict}
        >
          Predict
        </button>
      </div>
      <div className="mt-8">
        {forecastData ? (
          <DataTable
            predictedPrices={forecastData}
            market={market}
            region={state}
          />
        ) : (
          <p className="text-gray-600 text-center">
            Select any commodity, market, state, and end date to predict prices.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommodityFilter;
