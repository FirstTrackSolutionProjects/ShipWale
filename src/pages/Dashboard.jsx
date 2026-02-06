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
  const admin = role === USER_ROLES.ADMIN;
  const navigate = useNavigate();
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  if (!verified) {
    navigate('/verify');
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
