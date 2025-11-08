import React from "react";

function Mission() {
  const missionData = [
    {
      title: "Our Mission",
      desc: "Our goal is to transform the logistics landscape through cutting-edge technology, delivering smart, scalable solutions that adapt to the evolving needs of global enterprises.",
      image: "/image/mission.jpeg",
    },
    {
      title: "Our Vision",
      desc: "To build the most reliable and intelligent global logistics ecosystem, driven by data and empowered by seamless, connected technologies.",
      image: "/image/vision.jpg",
    },
    {
      title: "Our Values",
      desc: "To transform global logistics through advanced technology, delivering smart and scalable solutions customized for the needs of modern enterprises.",
      image: "/image/value.jpeg",
    },
  ];

  return (
   <div className="bg-gradient-to-r from-teal-100 via-blue-100 to-gray-100 px-6 py-10 md:px-16 lg:px-24 xl:px-32 space-y-16">

      <div className="max-w-7xl mx-auto space-y-14">
        {missionData.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-blue-100 p-6 md:p-10 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-blue-900 text-2xl md:text-3xl font-bold mb-3">
              {item.title}
            </h2>

            <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
              {item.desc}
            </p>

            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transform hover:scale-105 transition-all duration-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mission;
