import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CROPNEX</h3>
            <p className="text-gray-400">
              Empowering agriculture through data-driven insights and predictions.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Service', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Team Optimuz</h4>
            <ul className="text-gray-400 space-y-2">
              <li><a href='https://www.linkedin.com/in/tanmayi-kona-ab1248252' target='blank' >Tanmayi Kona</a></li>
              <li><a href='https://www.linkedin.com/in/karthikmanuru' target='blank' >Karthik Manuru</a></li>
              <li><a href='https://www.linkedin.com/in/diwakar-swarna' target='blank' >Diwakar Swarna</a></li>
              <li><a href='https://www.linkedin.com/in/nandakishore-kalavathula-314307278' target='blank'>Nanda Kishore Kalavathula</a></li>
              <li><a href='https://www.linkedin.com/in/gude-maruthi-kumar-16005b2b8' target='blank' >Maruthi Kumar Gude</a></li>
              <li><a href='https://www.linkedin.com/in/vardhan1536' target='blank' >Balavardhan Tummalacherla</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2024 CROPNEX. All rights reserved.</p>
          <div className="mt-2">
            <a href="#" className="hover:text-white">Terms & Conditions</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

