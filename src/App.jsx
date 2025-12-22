import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
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
import { ToastContainer } from 'react-toastify';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};



const App = () => {
  const { pathname } = useLocation();
  return (
    <>
    <ScrollToTop />
    <Navbar />
    <ToastContainer />
      
      <div className="min-h-[calc(100vh-80px)] w-full overflow-hidden bg-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/price" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/refund-cancel" element={<RefundCancel />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
      { (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/tracking')) ? null : <Footer /> }
      </div>
    </>
  );
};

export default App
