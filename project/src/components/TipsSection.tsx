import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function TipsSection() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3 mt-0.5" />
        <div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Market Insights</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• Wheat prices expected to rise by 12% in Central Market next week</li>
            <li>• Best selling window: Thursday to Saturday</li>
            <li>• Consider North Market for better profit margins (15% higher)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}