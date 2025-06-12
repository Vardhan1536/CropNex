import React from 'react';
import { Search } from 'lucide-react';
import { commodities, states, radiusOptions, regions } from '../constants/filterOptions';
import MarketTable from './MarketTable';
import MarketComparisonChart from  './MarketComparisonChart';

interface MarketSuggestion {
  market_name: string;
  suggested_average_price: number;
  original_average_price: number;
  price_advantage: number;
  distance_km: number;
}

const FilterSection = () => {
  const [selectedCommodity, setSelectedCommodity] = React.useState('');
  const [selectedMarket, setSelectedMarket] = React.useState('');
  const [selectedRadius, setSelectedRadius] = React.useState('');
  const [selectedState, setSelectedState] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [predictions, setPredictions] = React.useState<MarketSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  
  const handleSearch = async () => {
    if (!selectedCommodity || !selectedMarket || !selectedRadius || !startDate || !endDate) {
      alert('Please select all fields before searching.');
      return;
    }
    setIsLoading(true);
    setPredictions([]);

    // console.log({
    //   selectedCommodity,
    //   selectedMarket,
    //   selectedRadius,
    //   startDate,
    //   endDate,
    // });

    try{
      const response = await fetch(`https://cropnex.onrender.com/suggest`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commodity: selectedCommodity,
          market: selectedMarket,
          state : selectedState,
          radius: selectedRadius,
          start_date : startDate,
          end_date : endDate,

        }),
      })
      if (response.ok) {
        const data = await response.json();
        const predictions= data.suggestions;
        // const suggestions = data.predictions.Suggestions;

        // Handle both single object and array
        const formattedSuggestions = Array.isArray(predictions) ? predictions : [predictions];
        setPredictions(formattedSuggestions);
        setIsLoading(false);

      } else {
        alert('Failed to fetch forecast data. Please try again.');
        setIsLoading(false);
      }
    }
    catch (error) {
      console.error('Error fetching forecast data:', error);
      alert('An error occurred. Please try again later.');
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Commodity Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Commodity</label>
          <div className="relative">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500"
            >
              <option value="">Select Commodity</option>
              {commodities.map((commodity) => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Market Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Market</label>
          <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500"
            >
              <option value="">Select Current Market</option>
              {regions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
        </div>

        {/* Region Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Radius Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Search Radius</label>
          <div className="relative">
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500"
            >
              <option value="">Select Radius</option>
              {radiusOptions.map((radius) => (
                <option key={radius} value={radius}>{radius} km</option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date From</label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date To</label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>
        </div>

        {/* Search Button */}
          <div className="flex items-end col-span-1 md:col-span-3"> 
          <button
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center text-base"
            onClick={handleSearch}
            disabled={isLoading}
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'Searching...' : 'Search Suggestions'}
          </button>
        </div>
      </div>
      {/* Display Area for Table and Chart */}
      <div className="mt-8 space-y-8">
        {isLoading && <p className="text-center text-gray-600">Loading suggestions...</p>}
        
        {!isLoading && predictions.length > 0 && (
          <>
            <MarketComparisonChart suggestions={predictions} />
            <MarketTable Predictions={predictions} />
          </>
        )}
        {!isLoading && predictions.length === 0 && (selectedCommodity || selectedMarket) && ( // Show only if a search was attempted
          <p className="text-center text-gray-500">
            No market suggestions found for the selected criteria. Try adjusting your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
