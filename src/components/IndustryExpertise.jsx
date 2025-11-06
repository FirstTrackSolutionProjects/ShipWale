import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/image/q7.png",
    title: "Cosmetic Products",
    description:
      "Enhance your natural beauty with our skin-friendly, high-performance cosmetics — perfect for every look.",
  },
  {
    image: "/image/q15.png",
    title: "Consumer Electronics",
    description:
      "Experience the future of technology with our premium electronics — smart, sleek, and built for everyday life.",
  },
  {
    image: "/image/q9.png",
    title: "Healthcare & Pharma",
    description:
      "Empowering healthier lives with accessible, affordable, and trusted healthcare solutions.",
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
    <div className="py-16 bg-gray-50 px-5 flex flex-col items-center">
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
        <div className="w-full lg:w-2/2 h-[300px] md:h-[350px] lg:h-auto">
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

        {/* NAV BUTTONS */}
        {/* <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-gray-100 hidden md:block"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-gray-100 hidden md:block"
        >
          <ChevronRight size={22} />
        </button> */}
      </div>

      {/* DOT INDICATORS */}
      {/* <div className="flex gap-2 mt-6">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i === index ? "bg-blue-600 scale-110" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div> */}

      {/* MOBILE NAV BUTTONS */}
      {/* <div className="flex justify-center gap-4 mt-4 md:hidden">
        <button
          onClick={handlePrev}
          className="bg-white shadow p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="bg-white shadow p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div> */}
    </div>
  );
};

export default IndustryExpertise;
