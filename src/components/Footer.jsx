import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Logo + Company Info */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-14 w-14 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
              <img
                src="/image/logo2.png"
                alt="Shipwale Logo"
                className="h-10 object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold flex items-center">
                <span className="text-white">Ship</span>
                <span className="ml-1 bg-gradient-to-r from-gray-200 via-yellow-400 to-gray-200 text-transparent bg-clip-text">
                  Wale
                </span>
              </h1>

          </div>
          <p className="text-gray-300">
            Delivering excellence in logistics across PAN India.
            Fast, secure and trusted delivery solutions.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-yellow-400">FAQs</Link></li>
            <li><Link to="/about" className="hover:text-yellow-400">About Us</Link></li>
            <li><Link to="/tracking"
            className="hover:text-yellow-400">Tracking</Link>
            </li>
            <li><Link to="/price" className="hover:text-yellow-400">Pricing</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-400">Contact Us</Link></li>
            <li><Link to="/policy" className="hover:text-yellow-400">Privacy & Policy</Link></li>
            <li><Link to="/terms" className="hover:text-yellow-400">Terms of Use</Link></li>
            <li><Link to="/refund-cancel" className="hover:text-yellow-400">Refund & Cancellation</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
          <div className="flex items-center gap-2">
            <MapPin size={16} /> 
            <p className="text-gray-300 text-sm"> Ramdev Nagar Phalodi, Jodhpur,
            Rajasthan, 342301
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Mail size={16} />
            <p className="text-gray-300 text-sm">info@shipwale.com</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Phone size={16} />
            <p className="text-gray-300 text-sm">+91 9983800788</p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Services</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>E-Commerce Delivery</li>
            <li>Pickup & Drop</li>
            <li>Packaging Solutions</li>
            <li>Domestic Courier Services</li>
          </ul>

          { /* Social Media Icons Placeholder */}
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-yellow-400"> <FaFacebookF /></a>
            <a href="#" className="hover:text-yellow-400"><FaTwitter /></a>
            <a href="#" className="hover:text-yellow-400"> <FaInstagram /></a>
            <a href="#" className="hover:text-yellow-400">    <FaLinkedinIn /></a>
            <a href="#"
              className="hover:text-yellow-400">  <FaYoutube /></a>
          </div>


          
        </div>

      </div>

      {/* Bottom Note */}
      <div className="text-center mt-10 text-sm border-t border-gray-600 pt-4 text-gray-400">
        © 2025 Shipwale | Developed by First Track Solution Technologies. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
