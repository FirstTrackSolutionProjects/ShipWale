import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/tracking", label: "Tracking" },
    { to: "/price", label: "Pricing" },
   
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact Us" },
    { to: "/signin", label: "Sign In" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full  shadow-md bg-sky-200 z-50">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-20">

            {/* Logo with Circle */}
            <Link to="/" className="flex items-center">
              <div className="h-15 w-15 rounded-full overflow-hidden border-2 border-[#183B4E] flex items-center justify-center bg-white ">
                <img
                  src="/image/logo.png"
                  alt="Logo"
                  className="h-14 w-auto object-contain"
                  onClick={() => navigate('/')}
                />
              </div>
               <img src="/image/logotext.png"
                  alt="Logo Text"
                  className="h-27 w-auto object-contain"
                />
               
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 text-gray-800 font-medium">
              {links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`hover:text-blue-600 transition ${
                    pathname === item.to ? "font-semibold text-black" : "text-black"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Button */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-[#183B4E] text-white transform transition-transform duration-300 z-40
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setMenuOpen(false)}>
              <X size={30} />
            </button>
          </div>

          <div className="flex flex-col px-6 space-y-6 text-lg font-medium">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`hover:text-blue-300 transition ${
                  pathname === item.to ? "font-semibold text-white" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Push content below navbar */}
      <div className="pt-20" />
    </>
  );
};

export default Navbar;
