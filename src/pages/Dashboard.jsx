import React, { createElement } from 'react';
import Sidebar2 from '../components/Sidebar2';
import { Routes,Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuItems, USER_ROLES } from '../Constants';
import { useNavigate } from 'react-router-dom';
import AdminTicketDetail from './AdminTicketDetail';
import TicketDetail from './TicketDetail'; // <--- NEW IMPORT for merchant ticket view

const Dashboard = () => {
  const {role, isAuthenticated, verified} = useAuth()
  const navigate = useNavigate();

  // Define which roles are exempt from the `verified` check (i.e., non-MERCHANT roles)
  const isKycExempt = role !== USER_ROLES.MERCHANT; 
  
  // A user needs verification if they are a Merchant AND not yet verified
  const needsKycVerification = !verified && !isKycExempt; // !verified && role === MERCHANT
  const admin = role === USER_ROLES.ADMIN;

  // Use useEffect for navigation guards
  React.useEffect(() => {
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }

    // 1. If the user needs verification (i.e., they are a Merchant and verified=0)
    if (needsKycVerification) {
         navigate('/verify');
         return;
    }
    
    // 2. If they are authenticated and either verified=1 OR they are KYC Exempt,
    // they fall through and the dashboard renders.

  }, [isAuthenticated, verified, navigate, role, needsKycVerification]);

  // CRUCIAL: Stop rendering the complex dashboard structure if authentication 
  // is pending or verification is required, preventing blank screens during redirect.
  if (!isAuthenticated || needsKycVerification) {
    return null; 
  }
  
  const generateRoutes = (items, admin) => {
    return items.flatMap((item, index) => {
      if ((item.admin && !admin) || (item.merchantOnly && admin)) {
        return [];
      }
      const routes = [
        <Route
          key={item.url || `route-${index}`}
          path={item.url}
          element={item.component ? createElement(item.component) : null}
        />
      ];
      if (item.dropDownOptions && item.dropDownOptions.length > 0) {
        routes.push(...generateRoutes(item.dropDownOptions, admin));
      }
      return routes;
    });
  };
return (
    <>
    <div className='h-[calc(100vh-80px)] flex font-inter bg-gray-200'>
      <Sidebar2 />
        <main className="flex-grow justify-center items-center overflow-y-auto">
          <Routes>
            {generateRoutes(menuItems, admin)}
            <Route path="admin/support/:id" element={<AdminTicketDetail />} />
            {/* FIX: Add the standard merchant ticket detail route */}
            <Route path="support/:id" element={<TicketDetail />} /> 
          </Routes>
        </main>

    </div>
    </>
  );
};

export default Dashboard;
