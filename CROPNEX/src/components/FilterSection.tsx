import React from 'react';
import { Calendar, ChevronDown, Search } from 'lucide-react';
import { commodities, regions, radiusOptions } from '../constants/filterOptions';

export function FilterSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Commodity</label>
          <div className="relative">
            <select className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
              <option value="">Select Commodity</option>
              {commodities.map((commodity) => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Market</label>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"
            placeholder="Current Market"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Region/Block</label>
          <div className="relative">
            <select className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Search Radius</label>
          <div className="relative">
            <select className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500">
              <option value="">Select Radius</option>
              {radiusOptions.map((radius) => (
                <option key={radius} value={radius}>{radius} km</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date From</label>
          <div className="relative">
            <input
              type="date"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date To</label>
          <div className="relative">
            <input
              type="date"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-end">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center">
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}