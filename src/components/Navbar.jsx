import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// NavItem and navItems removed (unused)
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import WalletRechargeModal from "./WalletRechargeModal"; 
import { useWallet } from "../context/WalletContext";
import getAvailableRoles from "../services/roleServices/getAvailableRoles";
import changeRoleService from "../services/roleServices/changeRoleService";
import { toast } from "react-toastify";

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
  const { verified, isAuthenticated, logout, business_name, name, role } = useAuth()
  const { balance, refreshBalance } = useWallet();
  // isMenu and toggleMenu removed (unused)

  // Role switcher state
  const [availableRoles, setAvailableRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [switchingRoleId, setSwitchingRoleId] = useState(null)
  const roleDropdownDesktopRef = useRef(null)
  const roleDropdownMobileRef = useRef(null)

  const closeRechargeModal = () => {
    setShowRecharge(false);
  }

  // FIX: Added verified and refreshBalance to dependencies
  useEffect(()=>{
    if (!verified) return;
    refreshBalance();
  },[isAuthenticated, verified]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAvailableRoles([])
      setRoleMenuOpen(false)
      return;
    }

    let active = true
    const fetchRoles = async () => {
      try {
        setRolesLoading(true)
        const roles = await getAvailableRoles()
        if (!active) return
        setAvailableRoles(Array.isArray(roles) ? roles : [])
      } catch (e) {
        if (!active) return
        setAvailableRoles([])
      } finally {
        if (active) setRolesLoading(false)
      }
    }

    fetchRoles()
    return () => {
      active = false
    }
  }, [isAuthenticated])

  const shouldShowRoleSwitcher = useMemo(() => {
    return isAuthenticated && Array.isArray(availableRoles) && availableRoles.length > 1
  }, [isAuthenticated, availableRoles])

  useEffect(() => {
    if (!roleMenuOpen) return
    const onMouseDown = (e) => {
      const desktopEl = roleDropdownDesktopRef.current
      const mobileEl = roleDropdownMobileRef.current
      const clickedInsideDesktop = desktopEl?.contains?.(e.target)
      const clickedInsideMobile = mobileEl?.contains?.(e.target)
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setRoleMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [roleMenuOpen])

  const handleSwitchRole = async (nextRole) => {
    try {
      const nextUserRoleId = nextRole?.user_role_id
      if (!nextUserRoleId) throw new Error('Invalid role')
      if (switchingRoleId) return

      if (String(nextRole?.role || '').toUpperCase() === String(role || '').toUpperCase()) {
        setRoleMenuOpen(false)
        return
      }

      setSwitchingRoleId(nextUserRoleId)
      const newToken = await changeRoleService(nextUserRoleId)
      localStorage.setItem('token', newToken)
      setRoleMenuOpen(false)
      setMenuOpen(false)
      window.location.reload()
    } catch (e) {
      toast.error(e?.message || 'Failed to change role')
    } finally {
      setSwitchingRoleId(null)
    }
  }

  // scrollToTop removed (unused)

  const formatBusinessName = (name) => {
    if (!name) return '';
    return name.length > 20 ? name.slice(0, 20) + '...' : name;
  };

  const RoleDropdownMenu = ({ containerRef }) => {
    if (!shouldShowRoleSwitcher) return null
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          className="bg-white text-black flex items-center font-medium rounded-xl px-2 py-2 cursor-pointer max-w-xs truncate"
          onClick={() => setRoleMenuOpen((o) => !o)}
          disabled={rolesLoading}
          title={role ? `Current role: ${role}` : 'Switch role'}
        >
          <span className="truncate">{role ? `Role: ${role}` : 'Switch Role'}</span>
          <span className="ml-2">▾</span>
        </button>

        {roleMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
            {availableRoles.map((r) => {
              const isActive = String(r?.role || '').toUpperCase() === String(role || '').toUpperCase()
              const isBusy = switchingRoleId === r?.user_role_id
              return (
                <button
                  key={r?.user_role_id}
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 ${isActive ? 'bg-red-50 font-medium' : ''} ${(switchingRoleId && !isBusy) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => handleSwitchRole(r)}
                  disabled={Boolean(switchingRoleId) || isActive}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{r?.role}</span>
                    {isBusy ? <span className="text-xs text-gray-500">Switching…</span> : null}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

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
                <p>{`₹${balance}`}</p>
              </div>
              </>
            ):null}
            <div className="hidden md:flex space-x-4">
              <RoleDropdownMenu containerRef={roleDropdownDesktopRef} />
              <p
                className="bg-white text-black flex items-center font-medium rounded-xl px-2 py-2 cursor-pointer max-w-xs truncate"
                onClick={()=>navigate('/dashboard')}
                title={business_name || name}
              >
                {formatBusinessName(business_name || name)}
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

            {isAuthenticated ? (
              <RoleDropdownMenu containerRef={roleDropdownMobileRef} />
            ) : null}

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