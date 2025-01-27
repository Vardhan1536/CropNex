import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mon', price: 2300 },
  { date: 'Tue', price: 2450 },
  { date: 'Wed', price: 2400 },
  { date: 'Thu', price: 2600 },
  { date: 'Fri', price: 2550 },
  { date: 'Sat', price: 2700 },
  { date: 'Sun', price: 2800 },
];

export function SellingChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold mb-4">Price Trends</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#16a34a" 
              strokeWidth={2}
              dot={{ fill: '#16a34a' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}