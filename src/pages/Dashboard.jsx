import React, { createElement } from 'react';
import Sidebar2 from '../components/Sidebar2';
import { Routes,Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuItems } from '../Constants';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const {admin, isAuthenticated, verified} = useAuth()
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
    <div className='h-[calc(100vh-64px)] flex font-inter bg-gray-200'>
      <Sidebar2 />
        <main className="flex-grow justify-center items-center overflow-y-auto">
          <Routes>
            {generateRoutes(menuItems, admin)}
          </Routes>
        </main>

    </div>
    </>
  );
};

export default Dashboard;
