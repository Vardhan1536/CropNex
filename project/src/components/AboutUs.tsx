import React from 'react';

const AboutUs = () => {
  return (
    <section id='about' className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">About Us</h2>
        <div className="max-w-4xl mx-auto bg-white p-12 rounded-xl shadow-lg">
          <p className="text-2xl leading-relaxed text-gray-700 text-center">
            CROPNEX is revolutionizing agricultural trading by bringing together
            <span className="text-green-600 font-semibold"> advanced AI technology </span>
            and real-time market data. We're dedicated to empowering farmers and stakeholders with
            <span className="text-green-600 font-semibold"> data-driven insights </span>
            that help make informed decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;