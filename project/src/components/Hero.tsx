import React from 'react';

const Hero = () => {
  return (
    <div 
      className="relative h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            UNLOCK TOMORROW'S PRICES TODAY
          </h1>
          <p className="text-2xl md:text-3xl text-gray-200">
            AI-powered agricultural commodity price predictions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;