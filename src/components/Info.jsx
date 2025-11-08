import React from "react";

function Info() {
  const data = [
    {
      count: "20K+",
      label: "Our Trusted Clients",
      bg: "from-blue-300 to-blue-100",
      text: "text-blue-900",
    },
    {
      count: "40K+",
      label: "Orders Successfully Delivered",
      bg: "from-violet-200 to-violet-100",
      text: "text-red-900",
    },
    {
      count: "35+",
      label: "Suppliers",
      bg: "from-purple-300 to-purple-100",
      text: "text-purple-900",
    },
  ];

  return (
    <div
  className="min-h-screen flex flex-col items-center justify-center px-6 py-14 bg-gradient-to-br from-red-200 via-pink-100 to-white"
>

      <h2 className="text-blue-900 text-3xl md:text-4xl font-bold mb-14 text-center">
        ShipWale Superiority
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {data.map((item, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${item.bg} rounded-2xl shadow-lg py-10 px-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
          >
            <div className={`text-4xl font-extrabold ${item.text}`}>
              {item.count}
            </div>
            <p className={`mt-2 text-lg font-medium ${item.text.replace("900", "800")}`}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Info;
