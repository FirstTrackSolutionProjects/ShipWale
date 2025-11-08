import React, { useState} from "react";
import { FaMapMarkedAlt, FaRupeeSign, FaTruck, FaSearchLocation, FaHeadset } from "react-icons/fa";

const features = [
  {
    icon: <FaMapMarkedAlt className="text-blue-700 text-4xl mb-4" />,
    title: "Nationwide Domestic Network",
    description: "Connecting every corner of India with fast and reliable delivery.",
    bg: "bg-gradient-to-b from-red-100 to-red-50 hover:from-red-200 hover:to-red-100",
  },
  {
    icon: <FaRupeeSign className="text-purple-700 text-4xl mb-4" />,
    title: "Affordable & Transparent Pricing",
    description: "Lowest rates with no hidden charges.",
    bg: "bg-gradient-to-b from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100",
  },
  {
    icon: <FaTruck className="text-[#7C4585] text-4xl mb-4" />,
    title: "Door-to-Door Pickup & Delivery",
    description: "Convenience and comfort right at your doorstep.",
    bg: "bg-gradient-to-b from-[#f3e8f9] to-[#faf3fd] hover:from-[#ecdaf4] hover:to-[#f5e6fb]",
  },
  {
    icon: <FaSearchLocation className="text-yellow-700 text-4xl mb-4" />,
    title: "Real-Time Tracking",
    description: "Track your parcel anytime with live status updates.",
    bg: "bg-gradient-to-b from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100",
  },
  {
    icon: <FaHeadset className="text-green-600 text-4xl mb-4" />,
    title: "Friendly Support Team",
    description: "Dedicated assistance whenever you need help.",
    bg: "bg-gradient-to-b from-green-100 to-green-50 hover:from-green-200 hover:to-green-100",
  },
];

const Choosus = () => {
  // const [showMore, setShowMore] = useState(false);

  // const visibleFeatures = showMore ? features : features.slice(0, 4);
  return (
    <div className="bg-gradient-to-br from-teal-200 via-gray-200 to-white py-14 px-6">

      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-14">
          Why Choose Shipwale?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bg} rounded-2xl shadow-md p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              {feature.icon}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

         {/* View More / View Less Button */}
        {/* <button
          onClick={() => setShowMore(!showMore)}
          className="mt-10 px-6 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-700 hover:text-white transition"
        >
          {showMore ? "View Less" : "View More"}
        </button> */}
      </div>
    </div>
  );
};

export default Choosus;
