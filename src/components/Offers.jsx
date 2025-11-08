import React from "react";

function Offers() {
  const offersData = [

    {
      title: "Domestic Shipping",
      image: "/image/domestic.jpg",
      desc: "Enhance your local supply chain with faster and more reliable logistics solutions. From optimized scheduling to secure last-mile delivery, we handle freight with precision to support your business operations smoothly and consistently.",
    },
  ];

  return (
   <div className="bg-gradient-to-r from-blue-500 via-sky-300 to-gray-300 px-4 py-12 md:py-16 lg:py-20 text-center text-white md:text-gray-900">

      <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-14">
        What We Offer
      </h2>

      <div className="grid lg:grid-cols-1 gap-12 max-w-6xl mx-auto">
        {offersData.map((offer, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center bg-blue-50 hover:bg-blue-100 transition-all duration-300 p-8 rounded-2xl shadow-md hover:shadow-xl"
          >
            <img
              src={offer.image}
              alt={offer.title}
              className="w-[420px] h-auto rounded-lg shadow-md mb-6 transform hover:scale-105 transition duration-300"
            />
            <h3 className="text-2xl font-semibold text-orange-700 mb-4">
              {offer.title}
            </h3>
            <p className="text-blue-900 text-sm md:text-base leading-relaxed max-w-xl font-serif">
              {offer.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Offers;
