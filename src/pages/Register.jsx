import { Link } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserTag, faPhone, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import EmailOTPVerificationModal from '../components/Modals/EmailOTPVerificationModal';
import registerService from '../services/register';
import { toast } from 'react-toastify';
import { Box, Button, TextField } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    reg_email: "",
    reg_password: "",
    confirm_password: "",
    business_name: "",
    mobile: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated, login, verified, emailVerified } = useAuth();
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const navigate = useNavigate();

  const closeEmailModal = () => {
    setEmailModalOpen(false);
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let validationErrors = false;

    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      toast.error("Full name should contain alphabets only")
      validationErrors = true;
    }

    if (!/\S+@\S+\.\S+/.test(formData.reg_email)) {
      toast.error("Invalid email format")
      validationErrors = true;
    }

    if (formData.reg_password.length < 4) {
      toast.error("Password should be at least 4 characters")
      validationErrors = true;
    }

    if (formData.reg_password !== formData.confirm_password) {
      toast.error("Passwords do not match")
      validationErrors = true;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Mobile number should be exactly 10 digits")
      validationErrors = true;
    }

    return validationErrors;
  };

  useEffect(()=>{
    console.log("validation", isAuthenticated)
    if (isAuthenticated && verified){
      navigate("/dashboard")
    } else if (isAuthenticated && emailVerified){
      navigate("/verify")
    } else if (isAuthenticated){
      setEmailModalOpen(true);
    }
  },[isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error("Please accept Terms & Conditions");
      return;
    }
    
    const validationErrors = validate();
    if (!validationErrors) {
      try {
        const registerResponse = await registerService(formData)
        if (registerResponse?.success) {
          toast.success("User registered successfully!");
          await login(registerResponse?.token)
        } else {
          toast.error(registerResponse?.message || "Registration failed, please try again.");
        }
      } catch (err) {
        toast.error("Unexpected Error Occured");
      }
    } else {
      toast.error("Please check form format!");
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };
  return (
    <>
    {emailModalOpen && <EmailOTPVerificationModal open={emailModalOpen} onClose={closeEmailModal} />}
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-100 flex flex-col items-center justify-start px-4 py-10">

      {/* Top Image */}
      <div className="w-full max-w-md flex justify-center mb-6">
        <img
          src="/image/register.png"
          alt="Register"
          className="w-full h-full rounded-lg shadow-md"
        />
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Create Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Full Name"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaPhoneAlt className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Phone Number"
              required
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              required
              name="reg_email"
              value={formData.reg_email}
              onChange={handleChange}
              className="w-full focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              name="reg_password"
              value={formData.reg_password}
              onChange={handleChange}
              className="w-full focus:outline-none"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 ml-2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full focus:outline-none"
            />
             <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500 ml-2"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
          </div>

          {/* Business Name */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-red-500">
            <FaBuilding className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Business Name"
              required
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              className="w-full focus:outline-none"
            />
          </div>

          { /*Terms & conditions */}
          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 accent-red-600"
              />
              <p className="text-gray-600">
                I agree to the {" "}
                <Link to="/terms" className="text-red-600 underline">
                Terms and Conditions
                </Link>{" "}
                &{" "}
                <Link to="/privacy-policy" className="text-red-600 underline">
                Privacy Policy 
                </Link>
              </p>
          </div>

          <button
            type="submit"
            disabled={!acceptTerms}
            className={`w-full py-2 rounded-md font-semibold transition
              ${acceptTerms
                ? "bg-red-900 text-white hover:bg-red-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            REGISTER
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Register;
