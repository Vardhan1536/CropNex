import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CommodityGallery from './components/CommodityGallery';
import Features from './components/Features';
import CommodityFilter from './components/CommodityFilter';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import { PageTitle } from './components/PageTitle';
import  FilterSection  from './components/FilterSection';
import { TipsSection } from './components/TipsSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Hero />
      <div className="container mx-auto px-4 py-12 space-y-20">
        <CommodityGallery />
        <Features />
        <section className="space-y-8">
          <h2 className="text-4xl font-bold text-center">Filter By</h2>
          <CommodityFilter />
        </section>
        <PageTitle />
        <FilterSection />
        <TipsSection />
        <AboutUs />
      </div>
      <Footer />
    </div>
  );
}

export default App;