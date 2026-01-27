import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// NavItem and navItems removed (unused)
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import WalletRechargeModal from "./WalletRechargeModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// FIX: Import the required solid icon for Font Awesome
import { faHouse } from '@fortawesome/free-solid-svg-icons'; 
import { useWallet } from "../context/WalletContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/tracking", label: "Tracking", dashboard: true },
    // { to: "/price", label: "Pricing", dashboard: true },
   
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact Us" }
  ];
  const navigate = useNavigate();
  const [showRecharge, setShowRecharge] = useState(false)
  const {verified, isAuthenticated, logout, business_name} = useAuth()
  const { balance, refreshBalance } = useWallet();
  // isMenu and toggleMenu removed (unused)

  const closeRechargeModal = () => {
    setShowRecharge(false);
  }

  // FIX: Added verified and refreshBalance to dependencies
  useEffect(()=>{
    if (!verified) return;
    refreshBalance();
  },[isAuthenticated, verified, refreshBalance]) 

  // scrollToTop removed (unused)

  const formatBusinessName = (name) => {
    if (!name) return '';
    return name.length > 20 ? name.slice(0, 20) + '...' : name;
  };
  return (
    <>
      <nav className="fixed top-0 left-0 w-full shadow-md bg-black z-10">

        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-20">

            {/* Logo with Circle */}
            <Link to="/" className="flex items-center">
              <div className="h-16 w-16 bg-white rounded-full overflow-hidden border-2 border-[#183B4E] flex items-center justify-center">
                <img
                  src="/image/logo2.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain cursor-pointer"
                  onClick={() => navigate('/')}
                />
              </div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="text-white ml-2">Ship</span>
                <span className="ml-1 bg-linear-to-r from-gray-200 via-yellow-400 to-gray-200 text-transparent bg-clip-text">
                  Wale
                </span>
              </h1>

               
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 text-yellow-800 font-medium items-center">
              {links.map((item) => {
                // Hides links if currently on a dashboard route
                if (pathname.startsWith('/dashboard')) return null; 
                return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`hover:text-red-600 transition ${
                    pathname === item.to ? "font-semibold text-yellow-500" : "text-yellow-500"
                  }`}
                >
                  {item.label}
                </Link>
              )})}
            </div>
            {isAuthenticated && (
          <div className="h-16 flex space-x-3 items-center">
            {verified? (<>
              <div onClick={()=>setShowRecharge(true)} className={`relative bg-blue-600 ${balance < 250 ? "text-red-400" : "text-green-400"} flex items-center font-medium rounded-tl-xl rounded-br-xl px-3 min-w-14 py-2 cursor-pointer border-l-4 border-t-4 border-red-900`}>
              {balance < 250 && <p className="absolute -mt-5 top-0 right-0.5 text-red-400 text-3xl">!</p>}
                {/* FIX: Use imported faHouse object */}
                <p><FontAwesomeIcon icon={faHouse} className="mr-1" />{`₹${balance}`}</p>
              </div>
              </>
            ):null}
            <div className="hidden md:flex space-x-4">
              <p
                className="bg-white text-black flex items-center font-medium rounded-xl px-2 py-2 cursor-pointer max-w-xs truncate"
                onClick={()=>navigate('/dashboard')}
                title={business_name}
              >
                {formatBusinessName(business_name)}
              </p>
              <p
                className="bg-red-400 text-white flex items-center font-medium rounded-xl px-2 py-2 cursor-pointer"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </p>
            </div>
          </div>
        )}

            {/* Mobile Button */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {/* Added text-white class for visibility on black background */}
                {menuOpen ? <X size={28} className="text-white" /> : <Menu size={28} className="text-white" />}
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
            {isAuthenticated && (
              <p
                className="text-sky-950 text-xl font-bold bg-[rgba(255,255,255,0.6)] px-5 py-2 rounded-xl max-w-56 truncate"
                onClick={()=>navigate('/dashboard')}
                title={business_name}
              >
                {formatBusinessName(business_name)}
              </p>
            )}
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`hover:text-red-300 transition ${
                  pathname === item.to ? "font-semibold text-white" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* FIX: changed setIsMenu(false) to setMenuOpen(false) */}
            {isAuthenticated && <p className="text-red-600 text-xl pt-4 font-bold" onClick={()=>{logout(); setMenuOpen(false)}}>Logout</p>}
          </div>
        </div>
      </nav>

      {/* Push content below navbar */}
      <div className="pt-20" />
      {showRecharge && <WalletRechargeModal onClose={closeRechargeModal} />}
    </>
  );
};

export default Navbar;