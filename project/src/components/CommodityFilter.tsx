import React, { useState } from 'react';
import DataTable from './DataTable';
import PriceChart from './PriceChart';
import MessageModal from './MessageModal';

interface PredictionResult {
  data: number[];
  market: string;
  state: string;
  startDate: string;
  endDate: string;
}

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
      defaultValue=""
    >
      <option value="" disabled>Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const CommodityFilter = () => {
  // --- Form State (updates in real-time) ---
  const [commodity, setCommodity] = useState('');
  const [market, setMarket] = useState('');
  const [state, setState] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState('');

  // --- Display State (only updates on successful API call) ---
  // --- SOLUTION 2: Replace forecastData with predictionResult ---
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'info' | 'error'>('info');

  const handlePredict = async () => {
    if (!commodity || !market || !state || !endDate) {
      setMessage('Please select all fields including the end date before predicting.');
      setModalType('error');
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    // --- SOLUTION 3: Clear the old result object ---
    setPredictionResult(null); 
    setMessage('');

    const today = new Date().toISOString().split('T')[0];
    const startDatedefault = startDate.trim() === '' ? today : startDate;

    if (new Date(startDatedefault) > new Date(endDate)) {
      setMessage("End date must be after start date.");
      setModalType('error');
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://cropnex.onrender.com/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state, market, commodity,
          start_date: startDatedefault,
          end_date: endDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.prediction && Array.isArray(data.prediction) && data.prediction[0]?.message) {
          setMessage(data.prediction[0].message); 
          setModalType('info');
          setIsModalOpen(true);
        } else if (data.prediction) {
          // --- SOLUTION 4: Set the entire result object on success ---
          // This captures the form state at the moment of the API call.
          setPredictionResult({
            data: data.prediction,
            market: market,
            state: state,
            startDate: startDatedefault,
            endDate: endDate,
          });
          setMessage(''); 
        } else {
          setMessage('Received an unexpected response format from the server.');
          setModalType('error');
          setIsModalOpen(true);
        }
      } else {
        const errorDetail = data.detail || response.statusText;
        setMessage(`Failed to fetch forecast data: ${errorDetail}`);
        setModalType('error');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      setMessage('An error occurred while fetching data. Please check the console and try again.');
      setModalType('error');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
      {/* ... (Your form elements remain unchanged) ... */}
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
        <div className="w-full">
          <label htmlFor="start-date" className="block text-lg font-medium text-gray-800 mb-2">Select Start Date</label>
          <input
            id="start-date" type="date"
            className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
            value={startDate} onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="w-full">
          <label htmlFor="end-date" className="block text-lg font-medium text-gray-800 mb-2">Select End Date</label>
          <input
            id="end-date" type="date"
            className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-gray-700"
            value={endDate} onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-10 flex flex md:flex-row  items-center ">
        <button
          className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
          onClick={handlePredict} disabled={isLoading} 
        >
          {isLoading ? 'Predicting...' : 'Predict Prices'}
        </button>
      </div>

      <div className="mt-6 space-y-8">
        {isLoading && (
          <p className="text-gray-600 text-center py-8 text-lg">Loading predictions... This might take a bit longer than usual, Please Wait</p>
        )}

        {/* --- SOLUTION 5: Update rendering logic to use the new state object --- */}
        {!isLoading && predictionResult && (
          <>
            <DataTable
              predictedPrices={predictionResult.data}
              market={predictionResult.market}
              region={predictionResult.state}
              start_date={predictionResult.startDate}
              end_date={predictionResult.endDate}
            />
            <PriceChart
              predictedPrices={predictionResult.data}
              startDate={predictionResult.startDate}
            />
          </>
        )}

        {!isLoading && !predictionResult && (
          <p className="text-gray-600 text-center py-8 text-lg">
            Select commodity, market, state, and end date, then click "Predict Prices" to see the forecast.
          </p>
        )}
      </div>

      <MessageModal 
        isOpen={isModalOpen}
        message={message}
        onClose={handleCloseModal}
        type={modalType}
      />
    </div>
  );
};

export default CommodityFilter;