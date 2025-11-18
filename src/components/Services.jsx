import React from 'react';
import { Truck, MapPin, ShieldCheck, Warehouse } from "lucide-react";

function Services() {
  const services = [
    {
      title: "Supply Chain Optimization",
      desc: "Enhance efficiency across your supply chain with smart analytics and expert planning.",
      icon: <Truck className="w-10 h-10 text-red-600" />,
      bg: "bg-red-50 hover:bg-red-100"
    },
    {
      title: "Real-Time Tracking",
      desc: "Monitor shipments using GPS & IoT for complete visibility and faster deliveries.",
      icon: <MapPin className="w-10 h-10 text-red-600" />,
      bg: "bg-red-50 hover:bg-red-100"
    },
    {
      title: "Customs & Compliance",
      desc: "Automated compliance checks & global customs documentation handled easily.",
      icon: <ShieldCheck className="w-10 h-10 text-yellow-600" />,
      bg: "bg-yellow-50 hover:bg-yellow-100"
    },
    {
      title: "Warehouse Solutions",
      desc: "Maximize storage and streamline order fulfillment with smart warehouse management.",
      icon: <Warehouse className="w-10 h-10 text-purple-600" />,
      bg: "bg-purple-50 hover:bg-purple-100"
    },
  ];

  return (
   <div className="bg-gradient-to-r from-teal-200 via-red-200 to-white py-16 px-6 md:px-16 lg:px-24">

      <h2 className="text-4xl font-bold text-center mb-14 text-gray-800">
        Our Services
      </h2>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <div
            key={index}
            className={`${service.bg} transition-all duration-300 shadow-md hover:shadow-xl rounded-2xl p-7 text-center transform hover:-translate-y-1`}
          >
            <div className="flex justify-center mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {service.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
