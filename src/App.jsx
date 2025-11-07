import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home'
import About from './pages/About'
import Contect from './pages/Contact'
import Register from './pages/Register'
import Signin from './pages/Signin'
import Tracking from './pages/Tracking'
import Pricing from './pages/Pricing'
import Blog from './pages/Blog'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Faq from './pages/Faq'
import Footer from './components/Footer'
import RefundCancel from './pages/RefundCancel'
import Navbar from './components/Navbar'

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};



const App = () => {
  return (
    <>
    <ScrollToTop />
    <Navbar />
      
      <div className="min-h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/price" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/refund-cancel" element={<RefundCancel />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
      <Footer />
      </div>
    </>
  );
};

export default App
