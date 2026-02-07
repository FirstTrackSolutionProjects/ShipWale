import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../Constants'; // ADDED: Import USER_ROLES
import EmailOTPVerificationModal from '../components/Modals/EmailOTPVerificationModal'
import { toast } from 'react-toastify';
import loginService from '../services/login'
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signin = () => {
  const { isAuthenticated, emailVerified, login, verified } = useAuth();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(USER_ROLES.MERCHANT); // Role state
  
  // ⭐ ADDED
  const [rememberMe, setRememberMe] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const closeEmailModal = () => {
    setEmailModalOpen(false);
  }

  useEffect(()=>{
    if (isAuthenticated && verified){
      navigate('/dashboard')
    } else if(isAuthenticated && emailVerified){
      navigate('/verify')
    } else if (isAuthenticated && !emailVerified){
      setEmailModalOpen(true)
    }
  },[isAuthenticated, verified, emailVerified, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        email,
        password,
        role, // Send selected role
        
        // ⭐ SEND REMEMBER ME VALUE (optional)
        rememberMe  
      }

      const loginResponse = await loginService(formData)

      if (loginResponse.success) {
        login(loginResponse.token, rememberMe); // ⭐ PASS IT TO AUTH CONTEXT
        toast.success("Login Successfull")
      } else {
        toast.error(loginResponse.message)
      }
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <>
    {emailModalOpen && <EmailOTPVerificationModal open={emailModalOpen} onClose={closeEmailModal} />}
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        
        <div className="w-full flex justify-center mb-4">
          <img
            src="/image/signin.png"
            alt="Sign In"
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full focus:outline-none"
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-500 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Role Selection (New) */}
          <div className="flex flex-col border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <label htmlFor="role-select" className="text-gray-500 text-sm mb-1">Sign In As:</label>
            <select
              id="role-select"
              required
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full focus:outline-none border-none bg-transparent"
            >
              <option value={USER_ROLES.ADMIN}>Admin</option>
              <option value={USER_ROLES.MERCHANT}>Merchant</option>
              <option value={USER_ROLES.SUBMERCHANT}>Sub-merchant</option>
              <option value={USER_ROLES.MERCHANT_EMPLOYEE}>Merchant Employee</option>
              <option value={USER_ROLES.ADMIN_EMPLOYEE}>Admin Employee</option>
            </select>
          </div>

          {/* ⭐ REMEMBER ME CHECKBOX */}
          <div className="flex items-center justify-between -mt-2">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2"
              />
              Remember me for 30 days
            </label>

            <p
              className="text-sm text-gray-600 cursor-pointer hover:text-red-700"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </p>
          </div>

          <button
            type="submit"
            disabled={!email || !password}
            className="w-full bg-red-900 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition"
          >
            SIGN IN
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="w-full h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
    {showForgotPassword ? <ForgotPasswordModal onClose={()=>setShowForgotPassword(false)} /> : null}
    </>
  );
};

export default Signin;
