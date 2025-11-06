import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-start px-4 py-10">

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

        <form className="space-y-4">

          {/* Full Name */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaPhoneAlt className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              className="w-full focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Password"
              className="w-full focus:outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full focus:outline-none"
            />
          </div>

          {/* Business Name */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <FaBuilding className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Business Name"
              className="w-full focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            REGISTER
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-red-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
