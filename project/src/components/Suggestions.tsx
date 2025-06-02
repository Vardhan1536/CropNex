import React from 'react';
import { X } from 'lucide-react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Agriculture Suggestions</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Recommended Crops */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Recommended Crops</h4>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Crop</th>
                  <th className="border p-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Groundnut', 'Drought-tolerant, suitable for sandy loam soils, good summer crop.'],
                  ['Sunflower', 'Drought-tolerant, thrives in well-drained soils, good summer crop.'],
                  ['Millets (Ragi, Jowar)', 'Hardy crops, adaptable to different soil types, drought-tolerant, suitable for the climate.'],
                  ['Pulses (Red gram, Green gram)', 'Nitrogen-fixing, improves soil health, relatively drought-tolerant.'],
                  ['Vegetables (Tomato, Brinjal, Okra)', 'Short duration crops, can be grown throughout the year with proper irrigation.'],
                  ['Mango', 'Thrives in warm, dry climate. Madanapalle is known for mango cultivation.'],
                  ['Citrus Fruits (Lime, Orange)', 'Suitable for well-drained soils, tolerate moderate drought.'],
                  ['Horticulture crops (Flowers, Roses)', 'Madanapalle\'s climate is favorable for flower cultivation, potential for export.'],
                ].map(([crop, reason], index) => (
                  <tr key={index}>
                    <td className="border p-2">{crop}</td>
                    <td className="border p-2">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cultivation Schedule */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Cultivation Schedule</h4>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Month</th>
                  <th className="border p-2 text-left">Crop</th>
                  <th className="border p-2 text-left">Activities</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['March', 'Groundnut, Sunflower, Vegetables', 'Land preparation, sowing, application of organic manure/fertilizers.'],
                  ['April', 'Groundnut, Sunflower, Vegetables', 'Irrigation, weeding, pest and disease management.'],
                  ['May', 'Groundnut, Sunflower, Vegetables', 'Irrigation, weeding, pest and disease management.'],
                  ['June', 'Millets, Pulses', 'Sowing, application of organic manure/fertilizers. Start of rainy season provides good moisture.'],
                  ['July', 'Millets, Pulses, Vegetables', 'Weeding, pest and disease management.'],
                  ['August', 'Millets, Pulses, Vegetables', 'Weeding, pest and disease management.'],
                  ['September', 'Vegetables, Horticultural crops', 'Sowing/planting, application of organic manure/fertilizers.'],
                  ['October', 'Vegetables, Horticultural crops', 'Irrigation, weeding, pest and disease management.'],
                  ['November', 'Vegetables, Horticultural crops', 'Irrigation, weeding, pest and disease management. Harvesting of Rabi crops.'],
                  ['December', 'Vegetables', 'Sowing/planting, application of organic manure/fertilizers.'],
                  ['January', 'Vegetables', 'Irrigation, weeding, pest and disease management.'],
                  ['February', 'Vegetables', 'Irrigation, weeding, pest and disease management. Prepare land for summer crops.'],
                ].map(([month, crop, activities], index) => (
                  <tr key={index}>
                    <td className="border p-2">{month}</td>
                    <td className="border p-2">{crop}</td>
                    <td className="border p-2">{activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strategies for Sustainable Agriculture */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Strategies for Sustainable Agriculture</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Water Conservation: Implement drip irrigation, rainwater harvesting, and water-efficient farming practices.</li>
              <li>Soil Health Management: Promote organic farming, use of compost, vermicompost, and crop rotation. Minimize tillage.</li>
              <li>Integrated Pest Management: Encourage biological control of pests, reduce reliance on chemical pesticides.</li>
              <li>Agroforestry: Integrate trees into farming systems for improved soil health, biodiversity, and microclimate regulation.</li>
              <li>Crop Diversification: Reduce reliance on monoculture, promote mixed cropping and intercropping.</li>
              <li>Capacity Building: Provide training to farmers on sustainable agricultural practices.</li>
              <li>Market Linkages: Support farmers with market access for their produce.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
