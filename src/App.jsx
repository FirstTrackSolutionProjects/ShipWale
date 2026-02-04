import React, { useEffect } from 'react';
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
// REMOVED: import TicketRaise from './pages/TicketRaise'

// --- NEW IMPORTS ---
import FloatingAssistant from './components/FloatingAssistant'; // NEW IMPORT
// --- END NEW IMPORTS ---

// --- EXISTING IMPORTS FOR PHASE 1 ---
import Support from './pages/Support'
import TicketDetail from './pages/TicketDetail'
// --- END EXISTING IMPORTS ---

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
        
        {/* REMOVED: Old /ticket Route */}
        {/* <Route path="/ticket" element={<TicketRaise />} /> */}
        
        {/* --- EXISTING USER SUPPORT ROUTES (PHASE 1) --- */}
        {/* REMOVE: These routes bypass the dashboard layout, causing sidebar disappearance */}
        {/* <Route path="/support" element={<Support />} /> */} 
        {/* <Route path="/support/:id" element={<TicketDetail />} /> */} 
        {/* --- END USER SUPPORT ROUTES --- */}
        
        <Route path="/faq" element={<Faq />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
      
      {/* --- ADD FLOATING ASSISTANT HERE --- */}
      <FloatingAssistant />

      {
        // NOTE: Removed '/ticket' from this conditional check
        (pathname.startsWith('/dashboard') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/tracking'))
        ? null 
        : <Footer />
        }

      </div>
    </>
  );
};

export default App