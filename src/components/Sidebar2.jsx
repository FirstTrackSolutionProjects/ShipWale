import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import FontAwesome icons
import { menuItems } from '../Constants'; // Import sidebar items
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SidebarItem from './SidebarItem.jsx';
import WalletRechargeModal from './WalletRechargeModal.jsx';
const Sidebar2 = () => {
  const {admin, logout} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  const closeRechargeModal = () => {
    setShowRecharge(false);
  }
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(()=>{
    if (location.pathname=="/dashboard/logout") logout()
  },[navigate])

  const sidebarItems = menuItems
  return (
    <>
    {showRecharge ? <WalletRechargeModal onClose={closeRechargeModal} /> : null}
    <div>
      {/* Menu button (Icon) - visible only below md screens */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 absolute text-gray-700  z-40"
      >
        {isOpen?<FaTimes className="h-7 w-7 text-white" /> : <FaBars className="h-8 w-6" />}
      </button>

       {/* Sidebar for md screen */}
       <div className="min-w-[250px]  md:block hidden  h-full relative bg-black overflow-y-auto overflow-x-hidden">
      <ul className="p-2">
        {sidebarItems.map((item) => {
          if ((item.admin && !admin) || (item.merchantOnly && admin)) {
            return;
          }
          return(<SidebarItem item={item} setShowRecharge={setShowRecharge}/>)
        })}
      </ul>
      </div>
       {/* Sidebar for beloe md screen */}
       <div
        className={`relative ${isOpen?'w-[300px]': 'w-0'} block md:hidden  h-full  bg-black overflow-y-auto overflow-x-hidden`}
      >
        {/* Close button (Icon) */}
        <ul className="p-4 pt-12">
        {sidebarItems.map((item) => {
          if ((item.admin && !admin) || (item.merchantOnly && admin)) {
            return;
          }
          return(<SidebarItem item={item} setShowRecharge={setShowRecharge} toggleSidebar={toggleSidebar} />)
        })}
      </ul>
        </div>
    </div>
    </>
  );
};

export default Sidebar2;
