import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/image/beauty.jpeg",
    title: "Cosmetic Products",
    description:
      "Enhance your natural beauty with our skin-friendly, high-performance cosmetics — perfect for every look.",
  },
  {
    image: "/image/electronic.jpeg",
    title: "Consumer Electronics",
    description:
      "Experience the future of technology with our premium electronics — smart, sleek, and built for everyday life.",
  },
  {
    image: "/image/healthcare.jpeg",
    title: "Healthcare & Pharma",
    description:
      "Empowering healthier lives with accessible, affordable, and trusted healthcare solutions.",
  },
  {
    image: "/image/spareparts.jpg",
    title: "Automotive & Spare Parts",
    description:
      "Reliable logistics support for automotive parts, ensuring fast, safe, and damage-free transportation across locations.",
  },
  {
    image: "/image/manufacturing.jpeg",
    title: "Industrial & Manufacturing Goods",
    description:
      "Moving heavy-duty industrial and manufacturing products with precision, safety, and on-time delivery assurance.",
  },
];

const IndustryExpertise = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => handleNext(), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      className="py-16 px-5 flex flex-col items-center"
      style={{
        background: "linear-gradient(to bottom right, #F1F5F9, #D8E6FF)",
      }}
    >
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">
          <span className="text-blue-700">Industry</span>{" "}
          <span className="text-yellow-500">Expertise</span>
        </h2>
        <div className="h-1 w-32 bg-blue-600 mx-auto mt-2"></div>
      </div>

      {/* CARD */}
      <div className="relative max-w-5xl w-full bg-white shadow-lg rounded-xl overflow-hidden flex flex-col lg:flex-row">
        {/* IMAGE */}
        <div className="w-full lg:w-1/2 h-[300px] md:h-[350px] lg:h-auto">
          <img
            src={slides[index].image}
            alt={slides[index].title}
            className="w-full h-full object-cover transition-all duration-700"
          />
        </div>

        {/* TEXT */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-center text-center lg:text-left">
          <h3 className="text-2xl md:text-3xl font-semibold text-yellow-500 mb-3">
            {slides[index].title}
          </h3>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            {slides[index].description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndustryExpertise;
