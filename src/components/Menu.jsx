import  { useState, useEffect} from 'react';
import { navItems } from '../Constants';
import NavItem from './NavItem';
import { useAuth } from "../context/AuthContext"
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
const Menu = ({spaceTheme, setSpaceTheme} ) => {
  const [isMenu,setIsMenu] = useState(false)
  const location = useLocation();
  const {login , logout} = useAuth();
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const toggleMenu = () => {
  setIsMenu(!isMenu);
  }
  useEffect(() => {
    const loginStatus = async () => {
      const token = localStorage.getItem('token');
      if(token) {
        const decoded = jwtDecode(token);
        setUsername(decoded.business_name);
      }
    }
    loginStatus();
  },[login, logout])
  useEffect(() => {
    const loginStatus = async () => {
      const token = localStorage.getItem('token');
      if(token) {
        const decoded = jwtDecode(token);
        setUsername(decoded.business_name);
      }
    }
    loginStatus();
  },[])

  return (
    <>
      {
        location.pathname=='/'?<div className='flex items-center p-5'>
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '35px',
          height: '20px',
          marginRight: '10px',
        }}>
          <input 
            type="checkbox" 
            checked={spaceTheme} 
            onChange={() => {setSpaceTheme((prev)=>{localStorage.setItem('theme', !prev?'space':'non-space'); return !prev }); }} 
            style={{ display: 'none' }} // Hides the default checkbox
          />
          <span style={{
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: spaceTheme ? 'blue' : 'gray',
            borderRadius: '30px',
            cursor: 'pointer',
            transition: '0.4s',
          }}></span>
          <span style={{
            position: 'absolute',
            zIndex : 2,
            content: '""',
            height: '12px',
            width: '12px',
            left: spaceTheme ? '20px' : '2px',
            bottom: '4px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: '0.4s',
          }}></span>
        </label>
      </div> : null
      }
      <div className={`fixed block md:hidden top-0 right-0 ${isMenu?"md:w-96 w-full":"w-0"} h-full transition-all duration-300 ease-in-out z-50 overflow-hidden`}>
      
      <button onClick={toggleMenu} className={`fixed block md:hidden z-50 top-3 right-4 px-4 py-2 bg-red-600 text-white font-bold rounded-md`}>
        {isMenu ? 'X' : '☰'}
      </button>
      
      <div className="flex flex-col justify-center p-4 space-y-6 bg-white text-black h-screen items-center">
        <img src="/logo.webp" alt="" className='w-48' />
        {username && (
          <div className="h-16 flex text-2xl space-x-3 items-center">
            <div className="flex flex-col justify-center space-y-1">
              <p className='w-full max-w-72 whitespace-nowrap overflow-hidden text-ellipsis  font-medium rounded-xl px-2 py-2'
                 onClick={()=>navigate('/dashboard')}
              >
              {username}
            </p>
            </div>
          </div>
        )}
        {navItems.map((item, index) =>(
          <div onClick={item.isDropdown?()=>{}:()=>toggleMenu()} className='w-full text-3xl text-medium text-center'>
            <NavItem key={index} name={item.name} url={item.url} isDropdown={item.isDropdown} options={item.options} toggleMenu={toggleMenu}  />
          </div>
        ))}
        {username && (
          <div className="h-16 flex text-3xl space-x-3 items-center">
            <div className="flex flex-col justify-center">
            <p
                className=" text-red-400 flex items-center justify-center font-medium rounded-xl px-2"
                onClick={() => {
                  logout();
                  setUsername(null);
                  navigate("/");
                }}
              >
                Logout
              </p>
              
            </div>
          </div>
        )}
      </div>
    </div>
     
    </>
  );
};

export default Menu;
