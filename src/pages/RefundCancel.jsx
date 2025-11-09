import React from "react";

const RefundCancel = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6 flex justify-center">
      <div className="bg-white max-w-4xl w-full shadow-md rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
          Refund & Cancellation Policy
        </h1>

        <p className="text-gray-700 mb-4">
          At Shipwale, we aim to deliver the best courier and logistics service.
          This Refund & Cancellation Policy explains when customers can request
          refunds, cancellations, or compensation.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          1. Order Cancellation
        </h2>
        <p className="text-gray-700 mb-3">
          ✅ Orders canceled before parcel pickup or dispatch are eligible for a complete refund.  
          ❌ Orders canceled after dispatch may include transportation charges or partial deductions.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          2. Damage or Lost Shipment
        </h2>
        <p className="text-gray-700 mb-3">
          Shipwale ensures safe handling of all shipments. However, refunds are not applicable if:
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>Poor or unsafe packaging by the sender</li>
          <li>Incorrect address or receiver unavailable</li>
          <li>Natural disasters or unavoidable delays</li>
        </ul>
        <p className="text-gray-700 mb-3">
          ✅ If insurance is purchased, customers can request compensation as per policy terms.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          3. Non-Refundable Service Charges
        </h2>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>COD charges</li>
          <li>Additional pickup attempts</li>
          <li>Return shipment charges due to failed delivery</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          4. Refund Process
        </h2>
        <p className="text-gray-700 mb-3">
          Once approved, refunds will be credited within 5–7 working days to the
          original payment method such as bank account, UPI, or wallet.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          5. How to Request a Refund
        </h2>
        <p className="text-gray-700 mb-3">
          Customers can request a refund or cancellation through:
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>Shipwale Customer Support</li>
          <li>Email request with booking details</li>
          <li>Registered user dashboard</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          6. Contact Support
        </h2>
        <p className="text-gray-700">
          For refund or cancellation queries, contact:
          <br />📧 <strong>support@shipwale.com</strong>
          <br />📞 <strong>+91 9983800788</strong>
        </p>
      </div>
    </div>
  );
};

export default RefundCancel;
