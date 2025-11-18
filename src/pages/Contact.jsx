import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
} from "react-icons/fa";

const Contact = () => {
  return (
    <div className="bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center">

        {/* Top Illustration */}
        <img
          src="/image/contact.jpeg"
          alt="Customer Support"
          className="w-full h-auto rounded-xl mb-6"
        />

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-lg">
          We're here to help! Whether you have questions about delivery, pricing,
          or services — feel free to reach out anytime.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

          {/* Contact Form */}
          <form className="w-full bg-white shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Send us a Message
            </h2>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Your Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Your Phone
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Your Message
              </label>
              <textarea
                rows="4"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Write your message"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-900 text-white font-semibold py-2 rounded hover:bg-red-700 transition"
            >
              SUBMIT
            </button>
          </form>

          {/* Contact Information Box */}
          <div className="bg-red-900 text-white rounded-lg p-6 space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

            <p className="flex items-start gap-3 text-sm">
              <FaMapMarkerAlt size={18} className="mt-1" />
              Ramdev Nagar, Phalodi, Jodhpur,<br />
              Rajasthan - 342301
            </p>

            <p className="flex items-center gap-3 text-sm">
              <FaPhoneAlt size={16} />
              +91 9983800788
            </p>

            <p className="flex items-center gap-3 text-sm">
              <FaEnvelope size={16} />
              info@shipwale.com
            </p>

            <p className="flex items-center gap-3 text-sm">
              <FaClock size={16} />
              Mon - Sat: 9:00 AM to 6:00 PM
            </p>

            {/* ✅ WhatsApp Contact */}
            <p
              className="flex items-center gap-3 text-sm cursor-pointer"
              onClick={() =>
                window.open(
                  "https://api.whatsapp.com/send?phone=919983800788&text=Hello%2C%20I%20need%20help%20with%20shipment%20tracking.",
                  "_blank"
                )
              }
            >
              <FaWhatsapp size={18} className="text-green-400" />
              WhatsApp: +91 9983800788
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
