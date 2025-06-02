import React from 'react';
import { LineChart, ShoppingCart, Tags, Database } from 'lucide-react';

const features = [
  {
    icon: LineChart,
    title: 'Price Prediction',
    description: 'AI-powered price forecasting for agricultural commodities'
  },
  {
    icon: ShoppingCart,
    title: 'Buying Options',
    description: 'Find the best places to buy your commodities'
  },
  {
    icon: Tags,
    title: 'Selling Options',
    description: 'Locate fair and best buyers to get the best returns'
  },
  {
    icon: Database,
    title: 'Data Sets',
    description: 'Explore raw market data for analysis'
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">JUST A CLICK AWAY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;