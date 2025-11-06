import React, { useState } from "react";

const faqData = [
  { 
    question: "What is Shipwale?", 
    answer: "Shipwale is a trusted domestic courier and logistics service provider delivering fast, safe, and affordable parcels across India."
  },
  { 
    question: "How do I contact you?", 
    answer: "You can reach us at our customer support number 1800-123-4567 or email us at support@shipwale.com. Our team is available 24/7."
  },
  { 
    question: "Will I get a full refund if I cancel my order?", 
    answer: "Yes, if the order is canceled before dispatch, you are eligible for a full refund. Check our refund policy for full details."
  },
  { 
    question: "What is your return policy?", 
    answer: "Returns are accepted within 7 days of delivery. The parcel must be unused and in the original packaging. Contact support to request a return."
  },
  { 
    question: "How do I track my shipment?", 
    answer: "After booking your delivery, you will receive a tracking ID via SMS and email. Enter it on our website to track your parcel in real time."
  },
  { 
    question: "Do you offer international delivery?", 
    answer: "Currently, we provide domestic deliveries within India. International shipping will be launched soon."
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
        <h2 className="text-center text-xl md:text-2xl font-semibold bg-blue-900 text-white py-4">
          Frequently Asked Questions
        </h2>

        {faqData.map((item, index) => (
          <div
            key={index}
            className="border-b border-gray-200 px-6 py-4 transition-all duration-200 hover:bg-gray-50 cursor-pointer"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <p className="text-base font-medium text-gray-800">{item.question}</p>
              <span className="text-2xl font-bold text-blue-900">
                {openIndex === index ? "−" : "+"}
              </span>
            </div>

            {/* Smooth expand area */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-40 mt-2" : "max-h-0"
              }`}
            >
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
