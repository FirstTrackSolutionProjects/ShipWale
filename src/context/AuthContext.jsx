import React, { createContext, useState, useEffect, useContext } from 'react';
import validateToken from '../services/validateToken';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState({isAuthenticated: false});

  const login = async (token) => {
    localStorage.setItem('token', token);
    await isAuthenticated()
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({isAuthenticated: false});
    navigate('/login');
  };


  const isAuthenticated = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const decoded = await validateToken();
        setAuthState({isAuthenticated: true, email: decoded.email, verified: decoded.verified, name : decoded.name, id : decoded.id, business_name: decoded.business_name, role: decoded.role, phone: decoded.phone});
        return true;
    } catch (error) {
      console.log(error);
      toast.error(error)
      return false;
    }
  };

  useEffect(() => {
    isAuthenticated()
  }, []);
  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
