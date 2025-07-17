import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Sprout, Menu } from 'lucide-react';

const Header = () => {
  // NEW: State to track if the page has been scrolled
  const [isScrolled, setIsScrolled] = useState(false);

  // NEW: Effect to add and remove a scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Set state to true if scrolled more than 10px, false otherwise
      setIsScrolled(window.scrollY > 10);
    };

    // Add event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // The empty array ensures this effect runs only once

  // NEW: Dynamically set class names based on the isScrolled state
  const headerClasses = isScrolled
    ? 'bg-white/10 backdrop-blur-lg' // Scrolled state
    : 'bg-white/10 backdrop-blur-lg'; // Top of page state

  const textClasses = isScrolled
    ? 'text-gray-800' // Scrolled state
    : 'text-white'; // Top of page state
  
  const navLinkClasses = isScrolled
    ? 'text-gray-800 hover:text-green-600' // Scrolled state
    : 'text-white hover:text-green-400'; // Top of page state

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerClasses}`}>
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-green-600" />
          {/* UPDATED: Text color is now dynamic */}
          <span className={`text-2xl font-bold ${textClasses}`}>CROPNEX</span>
        </div>

        <nav className="hidden md:flex space-x-8">
          {[
            { label: 'Home', path: '#home' },
            { label: 'About Us', path: '#about' },
            { label: 'Service', path: '#services' },
            { label: 'Contact Us', path: '#contact' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.path}
              // UPDATED: Nav link colors are now dynamic
              className={`transition-colors ${navLinkClasses}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button className={`md:hidden transition-colors ${textClasses}`}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;