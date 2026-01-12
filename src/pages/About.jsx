import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Truck, Star } from "lucide-react";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-6 flex justify-center">
      
      <motion.div
        className="max-w-5xl bg-white shadow-xl rounded-2xl p-10 border border-gray-200"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
       <img
          src="/image/about.jpg"
          alt="About"
          className="w-full max-w-2xl h-auto mx-auto mb-6 rounded-xl shadow-md"
        />

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
          About <span className="text-blue-600">Shipwale</span>
        </h1>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed text-lg text-justify">
          Shipwale, a proud brand of <span className="font-semibold">Black Eagle</span>,
          is a trusted domestic courier and logistics service provider committed
          to delivering speed, safety, and satisfaction across India. Founded on
          <span className="font-semibold"> 2nd February 2022</span>, Shipwale was born with a simple vision —
          to make every delivery reliable, affordable, and hassle-free for individuals and businesses alike.
        </p>

        <p className="text-gray-600 leading-relaxed text-lg text-justify mt-4">
          At Shipwale, we believe every parcel carries not just goods, but emotions,
          trust, and commitments. Our dedicated team and strong delivery network ensure
          that every shipment reaches its destination on time, every time.
        </p>

        <p className="text-gray-600 leading-relaxed text-lg text-justify mt-4">
          Backed by the experience and efficiency of <span className="font-semibold">Black Eagle</span>,
          Shipwale combines modern technology, professional service, and customer-first values
          to redefine domestic courier delivery.
        </p>

        {/* Highlight */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-5 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-blue-700">
            “We don’t just deliver parcels — we deliver smiles.”
          </h2>
        </div>

        {/* Mission & Vision */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-blue-600 mb-3">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            To deliver parcels with speed, security, and reliability, ensuring customer
            satisfaction at every step of the journey.
          </p>

          <h2 className="text-2xl font-bold text-yellow-600 mt-8 mb-3">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            To become one of India’s most trusted and innovative courier brands,
            connecting people and businesses seamlessly through efficient logistics solutions.
          </p>
        </div>

        {/* Core Values */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Our Core Values</h2>

          <ul className="space-y-2 text-gray-700 text-lg">
            <li><span className="font-semibold">✅ Reliability:</span> Every shipment is handled with care and commitment.</li>
            <li><span className="font-semibold">✅ Integrity:</span> Honest and transparent service at all times.</li>
            <li><span className="font-semibold">✅ Speed:</span> Delivering on time, every time.</li>
            <li><span className="font-semibold">✅ Customer Focus:</span> Building lasting relationships through satisfaction and trust.</li>
            <li><span className="font-semibold">✅ Innovation:</span> Adapting technology to improve delivery experiences.</li>
          </ul>
        </div>

        {/* Why Choose Us */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">Why Choose Shipwale?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <CheckCircle className="text-green-600" /> Nationwide domestic courier network
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Shield className="text-blue-600" /> Affordable & transparent pricing
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Truck className="text-orange-600" /> Door-to-door pickup & delivery
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Star className="text-yellow-500" /> Real-time shipment tracking
            </div>
          </div>

          <p className="text-gray-700 mt-4 text-lg text-center">
            ✅ Professional and friendly support team
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
