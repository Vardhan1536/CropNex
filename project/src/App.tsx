import React from 'react';

// Importing components from both versions
import Header from './components/Header';
import Hero from './components/Hero';
import CommodityGallery from './components/CommodityGallery';
import Features from './components/Features';
import CommodityFilter from './components/CommodityFilter';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import { PageTitle } from './components/PageTitle';
import  FilterSection  from './components/FilterSection';
// import  MarketTable  from './components/MarketTable';
// import { SellingChart } from './components/MarketComparisonChart';
import { TipsSection } from './components/TipsSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Hero />
      <div className="container mx-auto px-4 py-12 space-y-20">
        {/* Section 1: Commodity Gallery and Features */}
        <CommodityGallery />
        <Features />

        {/* Section 2: Filter, Table, Chart */}
        <section className="space-y-8">
          <h2 className="text-4xl font-bold text-center">Filter By</h2>
          <CommodityFilter />
        </section>

        {/* Section 3: Additional Insights */}
        <PageTitle />
        <FilterSection />
        {/* <SellingChart /> */}
        <TipsSection />

        {/* Section 4: Get Suggestions
        <section className="space-y-8">
          <h2 className="text-4xl font-bold text-center">Get Instant Suggestions</h2>
          <Suggestions/>
        </section> */}

        {/* Section 5: About Us */}
        <AboutUs />
      </div>
      <Footer />
    </div>
  );
}

export default App;