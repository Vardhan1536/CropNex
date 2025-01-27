import React from 'react';
import { Sprout, Menu } from 'lucide-react';


const Header = () => {
  return (
    <header className="absolute w-full z-10">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-white">CROPNEX</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          {[
            { label: 'Home', path: 'src\components\Header.tsx' },
            { label: 'About Us', path: 'src\components\AboutUs.tsx' },
            { label: 'Service', path: 'src\components\CommodityFilter.tsx' },
            { label: 'Contact Us', path: 'src\components\Footer.tsx' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.path}
              className="text-white hover:text-green-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        
        <button className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;


