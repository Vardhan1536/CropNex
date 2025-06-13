import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { commodities, states, radiusOptions, regions } from '../constants/filterOptions';
import MarketTable from './MarketTable';
import MarketComparisonChart from './MarketComparisonChart';
import MessageModal from './MessageModal'; // 1. Import the modal

interface MarketSuggestion {
  market_name: string;
  suggested_average_price: number;
  original_average_price: number;
  price_advantage: number;
  distance_km: number;
}

const FilterSection = () => {
  // --- Form State ---
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedRadius, setSelectedRadius] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // --- Display State (frozen on successful API call) ---
  const [suggestionResult, setSuggestionResult] = useState<MarketSuggestion[] | null>(null);

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'info' | 'error'>('info');

  const handleSearch = async () => {
    // 2. Replace alerts with the modal
    if (!selectedCommodity || !selectedMarket || !selectedRadius || !startDate || !endDate) {
      setMessage('Please select all fields before searching for suggestions.');
      setModalType('error');
      setIsModalOpen(true);
      return;
    }
    
    setIsLoading(true);
    setSuggestionResult(null); // Clear previous results
    setMessage('');

    try {
      const response = await fetch(`https://cropnex.onrender.com/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedCommodity,
          market: selectedMarket,
          state: selectedState,
          radius: selectedRadius,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const suggestionsPayload = data.suggestions;

        if (Array.isArray(suggestionsPayload) && suggestionsPayload.length > 0 && suggestionsPayload[0].message) {
          // Case: Backend returns an informational message
          setMessage(suggestionsPayload[0].message);
          setModalType('info');
          setIsModalOpen(true);
        } else if (Array.isArray(suggestionsPayload)) {
          // Case: Success with actual data
          setSuggestionResult(suggestionsPayload);
        } else {
          // Case: Unexpected data format
          setMessage('Received an unexpected response format from the server.');
          setModalType('error');
          setIsModalOpen(true);
        }
      } else {
        // Case: HTTP error (4xx, 5xx)
        const errorMessage = data.detail || 'Failed to fetch suggestion data. Please try again.';
        setMessage(errorMessage);
        setModalType('error');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching suggestion data:', error);
      setMessage('An error occurred. Please check the console and try again later.');
      setModalType('error');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Add a handler to close the modal
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 relative"> {/* Add relative positioning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ... (All your form selects and inputs remain the same) ... */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Commodity</label>
          <div className="relative">
            <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)} className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
              <option value="">Select Commodity</option>
              {commodities.map((commodity) => (<option key={commodity} value={commodity}>{commodity}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Market</label>
          <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)} className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
            <option value="">Select Current Market</option>
            {regions.map((state) => (<option key={state} value={state}>{state}</option>))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <div className="relative">
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
              <option value="">Select State</option>
              {states.map((state) => (<option key={state} value={state}>{state}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Search Radius</label>
          <div className="relative">
            <select value={selectedRadius} onChange={(e) => setSelectedRadius(e.target.value)} className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
              <option value="">Select Radius</option>
              {radiusOptions.map((radius) => (<option key={radius} value={radius}>{radius} km</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date From</label>
          <div className="relative">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"/>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date To</label>
          <div className="relative">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"/>
          </div>
        </div>
        <div className="flex items-end col-span-1 md:col-span-3">
          <button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center text-base" onClick={handleSearch} disabled={isLoading}>
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'Searching...' : 'Search Suggestions'}
          </button>
        </div>
      </div>

      {/* --- 4. Updated Display Area --- */}
      <div className="mt-8 space-y-8">
        {isLoading && <p className="text-center text-gray-600">Loading suggestions...</p>}

        {/* Show data if it exists */}
        {!isLoading && suggestionResult && suggestionResult.length > 0 && (
          <>
            <MarketComparisonChart suggestions={suggestionResult} />
            <MarketTable Predictions={suggestionResult} />
          </>
        )}

        {/* Fallback to initial prompt */}
        {!isLoading && !suggestionResult && (
          <p className="text-center text-gray-500">
            Fill out the form and click "Search Suggestions" to find better market opportunities.
          </p>
        )}
      </div>

      {/* --- 5. Render the modal component --- */}
      <MessageModal 
        isOpen={isModalOpen}
        message={message}
        onClose={handleCloseModal}
        type={modalType}
      />
    </div>
  );
};

export default FilterSection;