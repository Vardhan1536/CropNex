import React, { useState } from 'react';
import { Search } from 'lucide-react';
import DataTable from './DataTable';
import PriceChart from './PriceChart';

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
      defaultValue="" // Set a default value for better UX
    >
      <option value="" disabled>Select {label}</option> {/* Make placeholder disabled */}
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
  // Assuming '2024-12-19' is the fixed start date for predictions that the chart/table will use.
  const [apiStartDate, setApiStartDate] = useState<string>('2024-12-19');
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const API_BASE_URL = import.meta.env.REACT_APP_API_URL;

  const calculateDateDifference = (start: string, end: string): number => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handlePredict = async () => {
    if (!commodity || !market || !state || !endDate) {
      alert('Please select all fields including end date before predicting.');
      return;
    }
    setIsLoading(true);
    setForecastData(null); // Clear previous data

    // This is the fixed start date from which 'num_days' is calculated for the API.
    // It's also assumed to be the start date for the chart/table via `apiStartDate`.
    const fixedStartDateForApiCalc = '2024-12-19';
    setApiStartDate(fixedStartDateForApiCalc); // Explicitly set if it could ever change, though it's fixed here.

    const daysDifference = calculateDateDifference(fixedStartDateForApiCalc, endDate);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: state,
          market: market,
          commodity: commodity,
          num_days: daysDifference,
        }),
      });

      const data = await response.json(); // Try to parse JSON regardless of response.ok for error messages

      if (response.ok) {
        console.log("API Prediction data:", data.prediction);
        setForecastData(data.prediction || []); // Ensure it's an array, even if API returns null for prediction
      } else {
        alert(`Failed to fetch forecast data: ${data.detail || response.statusText}`);
        setForecastData(null);
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      alert('An error occurred while fetching forecast data. Please try again later.');
      setForecastData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine what message to show based on forecastData and isLoading
  let dataDisplayMessage = null;
  if (isLoading) {
    dataDisplayMessage = <p className="text-gray-600 text-center py-8 text-lg">Loading predictions...</p>;
  } else if (forecastData === null) {
    dataDisplayMessage = (
      <p className="text-gray-600 text-center py-8 text-lg">
        Select commodity, market, state, and end date, then click "Predict Prices" to see the forecast.
      </p>
    );
  } else if (forecastData.length === 0) {
    dataDisplayMessage = (
      <p className="text-gray-600 text-center py-8 text-lg">
        No prediction data returned for the selected criteria.
      </p>
    );
  }
  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-lg"> {/* Main container div */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FilterSelect
          label="State"
          options={['Andhra Pradesh', 'Telangana']}
          onChange={setState}
        />
        <FilterSelect
          label="Market Location"
          options={['Kurnool', 'Madanapalle', 'Hyderabad', 'Mangalagiri', 'Alur', 'Pattikonda']}
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
            Select End Date (Start date for prediction is fixed: 2024-12-19)
          </label>
          <input
            type="date"
            min="2024-12-19"
            className="w-full md:w-auto p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
          // onClick={handleSearchMarkets} // You would need a separate handler for this
        >
          <Search className="h-5 w-5" />
          <span>Search Markets</span>
        </button>
        <button
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
          onClick={handlePredict}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? 'Predicting...' : 'Predict Prices'}
        </button>
      </div>

      {/* Consolidated section for displaying PriceChart, DataTable, or messages */}
      <div className="mt-12 space-y-8">
        {forecastData && forecastData.length > 0 && apiStartDate ? (
          <>
            <DataTable
              predictedPrices={forecastData}
              market={market}
              region={state}
              end_date={endDate} // Pass end_date if needed for DataTable
            />
             <PriceChart
              predictedPrices={forecastData}
              startDate={apiStartDate}
            />
          </>
        ) : (
          dataDisplayMessage 
        )}
      </div>
    </div> 
  );
};

export default CommodityFilter;