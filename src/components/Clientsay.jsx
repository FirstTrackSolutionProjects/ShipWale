import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Karan Patel",
    title: "Logistics Lead, E-Marketplace",
    text: "The best logistics partner we've worked with. Seamless integrations and great customer support.",
    image: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
  },
  {
    name: "Shruti Agarwal",
    title: "Supply Manager, RetailCo",
    text: "Always on time and extremely professional. Our go-to for logistics solutions.",
    image: "https://cdn-icons-png.flaticon.com/512/2922/2922656.png",
  },
  {
    name: "Anil Mehta",
    title: "Head of Ops, TradeHub",
    text: "Reliable, efficient, and easy to work with. Highly recommended for scaling operations.",
    image: "https://cdn-icons-png.flaticon.com/512/2922/2922688.png",
  },
  {
    name: "Pooja Chatterjee",
    title: "Procurement Manager, ShopEase",
    text: "Their technology-driven approach has transformed our supply chain management.",
    image: "https://cdn-icons-png.flaticon.com/512/2922/2922566.png",
  },
  {
    name: "Ananya Gupta",
    title: "COO, GlobalMart",
    text: "Exceptional service and innovative solutions that meet our complex logistics needs.",
    image: "https://cdn-icons-png.flaticon.com/512/2922/2922731.png",
  },
];

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 600,
  autoplay: true,
  autoplaySpeed: 2800,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  pauseOnHover: true,
};

const Clientsay = () => {
  return (
    <div className="bg-gradient-to-br from-blue-200 to-yellow-100 px-5 py-16 flex justify-center">
      <div className="w-full max-w-4xl text-center">
        {/* Heading */}
        <h2 className="text-blue-700 text-2xl md:text-3xl font-bold mb-10 tracking-wide">
          What Our Clients Say
        </h2>

        <Slider {...sliderSettings}>
          {testimonials.map((t, index) => (
            <div key={index} className="px-4">
              <div className="bg-white shadow-lg rounded-2xl px-8 py-10 flex flex-col items-center border border-gray-100 hover:shadow-xl transition duration-300">
                
                {/* Avatar */}
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-md mb-4"
                />

                {/* Quote Icon */}
                <Quote size={32} className="text-yellow-500 mb-2" />

                {/* Review Text */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg">
                  “{t.text}”
                </p>

                {/* Name + Title */}
                <div className="mt-5">
                  <p className="font-semibold text-gray-800 text-lg">{t.name}</p>
                 
                </div>
              </div>
            </div>
          ))}
        </Slider>

        {/* Custom Dot Styling */}
        {/* <style>
          {`
            .slick-dots li button:before {
              font-size: 10px;
              color: #80bfff;
            }
            .slick-dots li.slick-active button:before {
              color: #005ae0;
              opacity: 1;
            }
          `}
        </style> */}
      </div>
    </div>
  );
};

export default Clientsay;
