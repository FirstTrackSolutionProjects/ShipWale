import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Signin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        
        {/* Image */}
        <div className="w-full flex justify-center mb-4">
          <img
            src="/image/signin.png"
            alt="Sign In"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        {/* Form */}
        <form className="space-y-4">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              className="w-full focus:outline-none"
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Password"
              className="w-full focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            SIGN IN
          </button>
        </form>

        {/* Forgot Password */}
        <p className="text-right text-sm text-gray-600 mt-2 cursor-pointer hover:text-blue-700">
          Forgot Password?
        </p>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="w-full h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Create Account */}
        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
