import React, { useState } from 'react';
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
  const [startDate, setStartDate] = useState('');
  const [forecastData, setForecastData] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePredict = async () => {
    if (!commodity || !market || !state || !endDate) {
      setMessage('Please select all fields including the end date before predicting.');
      return;
    }
    setIsLoading(true);
    setForecastData(null);
    setMessage('');

    const today = new Date().toISOString().split('T')[0];
    const startDatedefault = startDate.trim() === '' ? today : startDate;
    if (new Date(startDatedefault) > new Date(endDate)) {
      alert("End date must be after start date.");
      setIsLoading(false);
      return;
    }

    // https://cropnex.onrender.com/predict
    try {
      const response = await fetch(`http://127.0.0.1:8000/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: state,
          market: market,
          commodity: commodity,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.prediction && Array.isArray(data.prediction) && data.prediction[0]?.message) {
          setMessage(data.prediction[0].message); 
          setForecastData(null);
        } else if (data.prediction) {
          // This is the success case with actual data
          setForecastData(data.prediction);
          setMessage(''); 
        } else {
          setMessage('Received an unexpected response format from the server.');
          setForecastData(null);
        }
      } else {
        const errorDetail = data.detail || response.statusText;
        setMessage(`Failed to fetch forecast data: ${errorDetail}`);
        setForecastData(null);
      }} catch (error) {
      console.error('Error fetching forecast data:', error);
      setMessage('An error occurred while fetching data. Please check the console and try again.');
      setForecastData(null);
    } finally {
      setIsLoading(false);
    }
  };


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
          options={['Kurnool', 'Madanapalli','Alur', 'Pattikonda','Vayalapadu', 'Kalikiri','Kuppam', 'Punganur', 'Palamaner','Bowenpally','Gudimalkapur','L B Nagar','Hyderabad (F&V)','Mahboob Manison','Mulakalacheruvu']}
          onChange={setMarket}
        />
        <FilterSelect
          label="Commodity"
          options={[
            'Potato','Bitter gourd','Onion', 'Tomato', 'Dry Chillies'
          ]}
          onChange={setCommodity}
        />
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-6">
        {/* Start Date */}
        <div className="w-full">
          <label
            htmlFor="start-date" 
            className="block text-lg font-medium text-gray-800 mb-2"
          >
            Select Start Date
          </label>
          <input
            id="start-date" 
            type="date"
            className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="w-full">
          <label
            htmlFor="end-date" 
            className="block text-lg font-medium text-gray-800 mb-2"
          >
            Select End Date
          </label>
          <input
            id="end-date" // <-- Accessibility Fix
            type="date"
            className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-10 flex flex md:flex-row  items-center ">
        <button
          className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
          onClick={handlePredict}
          disabled={isLoading} 
        >
          {isLoading ? 'Predicting...' : 'Predict Prices'}
        </button>
      </div>

      {/* Consolidated section for displaying PriceChart, DataTable, or messages */}
      <div className="mt-12 space-y-8">
        {isLoading && (
          <p className="text-gray-600 text-center py-8 text-lg">Loading predictions...</p>
        )}

        {/* Priority 1: Show the error/info message if it exists */}
        {!isLoading && message && (
          <p className="text-red-600 text-center py-8 text-lg font-semibold">{message}</p>
        )}

        {/* Priority 2: Show data if it exists AND there is NO message */}
        {!isLoading && !message && forecastData && forecastData.length > 0 && (
          <>
            <DataTable
              predictedPrices={forecastData}
              market={market}
              region={state}
              start_date={startDate || new Date().toISOString().split('T')[0]}
              end_date={endDate}
            />
            <PriceChart
              predictedPrices={forecastData}
              startDate={startDate || new Date().toISOString().split('T')[0]}
            />
          </>
        )}

        {/* Priority 3: Fallback to initial prompt if no loading, no message, and no data */}
        {!isLoading && !message && !forecastData && (
          <p className="text-gray-600 text-center py-8 text-lg">
            Select commodity, market, state, and end date, then click "Predict Prices" to see the forecast.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommodityFilter;