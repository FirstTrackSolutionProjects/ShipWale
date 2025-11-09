import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay } from 'swiper/modules';

const partners = [
  { name: 'Zoho', logo: '/Partners/zoho.png' },
  { name: 'Hostinger', logo: '/Partners/hostinger.jpg' },
  { name: 'AWS', logo: '/Partners/aws.jpg' },
  { name: 'Netlify', logo: '/Partners/netlify.png' },
  { name: 'Delhivery', logo: '/Partners/delhivery.png' },
];

const TrustedPartners = () => {
  return (
    <div className="bg-gray-200 py-10 mt-5">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-6">
        Our Trusted Partners
      </h2>

      <div className="max-w-6xl mx-auto flex justify-center">
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          loop={true}
          autoplay={{ delay: 1500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          modules={[Autoplay]}
          className="w-full flex justify-center items-center mx-auto"
        >
          {partners.map((partner, index) => (
            <SwiperSlide key={index} className="flex justify-center">
              <div className="bg-white rounded-lg shadow-md flex justify-center items-center p-2">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-28 h-18 object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TrustedPartners;
