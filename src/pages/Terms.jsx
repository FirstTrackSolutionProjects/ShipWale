import React from "react";

const Terms = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6 flex justify-center">
      <div className="bg-white max-w-4xl w-full shadow-md rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
          Terms & Conditions
        </h1>
       

        <p className="text-gray-700 mb-4">
          These Terms & Conditions apply when you use the Shipwale website, mobile app,
          or delivery services. By booking a shipment or creating an account, you agree
          to the policies described below.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          1. Service Usage
        </h2>
        <p className="text-gray-700 mb-3">
          Shipwale provides domestic courier services for personal, commercial, and
          business deliveries. Illegal, restricted, or banned items are not allowed.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          2. Customer Responsibilities
        </h2>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>Provide correct pickup & delivery details</li>
          <li>Pack items safely to avoid damage</li>
          <li>Avoid shipping hazardous, banned, or illegal goods</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          3. Payments & Charges
        </h2>
        <p className="text-gray-700 mb-3">
          All payment must be completed using our approved online or offline methods.
          Extra charges may apply for oversized parcels, delayed pickup attempts, or
          return shipments.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          4. Shipment Tracking
        </h2>
        <p className="text-gray-700 mb-3">
          After booking, users receive a tracking ID to monitor parcel status on the
          Shipwale website. Tracking information may change in case of weather, delays,
          or operational issues.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          5. Damage or Loss
        </h2>
        <p className="text-gray-700 mb-3">
          Shipwale takes complete care during transportation. However, we are not
          responsible for damage caused by poor packaging, natural disasters, or
          incorrect customer information. Insurance can be claimed (if purchased).
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          6. Refund & Cancellation
        </h2>
        <p className="text-gray-700 mb-3">
          Orders canceled before dispatch are eligible for a full refund.  
          Orders canceled after dispatch may incur charges depending on transportation
          progress.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          7. Account Termination
        </h2>
        <p className="text-gray-700 mb-3">
          Shipwale reserves the right to suspend or deactivate accounts engaging in
          fraud, misuse, or violation of company policies.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          8. Legal Compliance
        </h2>
        <p className="text-gray-700 mb-3">
          Users must follow Indian shipping laws and regulations. Illegal items,
          prohibited chemicals, weapons, and counterfeit goods are strictly banned.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          9. Contact Information
        </h2>
        <p className="text-gray-700">
          For legal or policy-related queries, contact:
          <br />📧 <strong>support@shipwale.com</strong>
          <br />📞 <strong>+91 9983800788</strong>
        </p>
      </div>
    </div>
  );
};

export default Terms;
