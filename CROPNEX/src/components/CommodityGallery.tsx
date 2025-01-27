import React from 'react';

const images = [
  
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c',
  'https://images.unsplash.com/photo-1515942400420-2b98fed1f515',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d'
].map(url => `${url}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`);

const CommodityGallery = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-4 text-gray-800">
          ANY COMMODITY
        </h2>
        <h3 className="text-4xl font-bold text-center mb-12 text-gray-600">
          ANY TIME
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={image}
                alt={`Commodity ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <h2 className="text-5xl font-bold text-center mt-16 text-gray-800">
          JUST A CLICK AWAY
        </h2>
      </div>
    </section>
  );
};

export default CommodityGallery;