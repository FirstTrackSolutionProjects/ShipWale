import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6 flex justify-center">
      <div className="bg-white max-w-4xl w-full shadow-md rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
          Privacy Policy
        </h1>
       
        <p className="text-gray-700 mb-4">
          Welcome to <strong>Shipwale</strong>. Your privacy is extremely important to us.
          This Privacy Policy outlines how we collect, store, protect, and use your
          information when you use our website, mobile app, or courier services.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          1. Information We Collect
        </h2>
        <p className="text-gray-700 mb-3">
          We collect the following details to provide smooth delivery services:
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>Name, email address, phone number</li>
          <li>Full delivery address and pickup address</li>
          <li>Tracking details and parcel information</li>
          <li>Payment details and transaction logs</li>
          <li>Device information, IP address & cookies</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>To process shipments and deliver your parcels</li>
          <li>To send order confirmations, tracking updates, and notifications</li>
          <li>To improve our logistics services and customer experience</li>
          <li>To detect fraud, security violations, or illegal activities</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          3. Sharing Your Information
        </h2>
        <p className="text-gray-700 mb-3">
          We do <strong>not</strong> sell your data to anyone. However, we may share limited
          information with:
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>Delivery partners, courier agents, and logistics providers</li>
          <li>Authorized payment gateways</li>
          <li>Government or law enforcement (only if legally required)</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          4. Data Security
        </h2>
        <p className="text-gray-700 mb-3">
          We use encryption, secure servers, and restricted access methods to protect
          your personal data. However, no internet system is 100% secure—so we encourage
          users to safeguard their login credentials.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          5. Cookies & Tracking
        </h2>
        <p className="text-gray-700 mb-3">
          Shipwale uses cookies to improve website performance, track shipments faster,
          and provide a customized user experience. You can disable cookies anytime from
          your browser settings.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          6. Your Rights
        </h2>
        <ul className="list-disc ml-6 text-gray-700 mb-3">
          <li>Request to delete or update your personal data</li>
          <li>Request a copy of stored information</li>
          <li>Opt-out of promotional emails/SMS</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          7. Changes to Policy
        </h2>
        <p className="text-gray-700 mb-3">
          Shipwale may update this Privacy Policy from time to time. Updated versions
          will be posted on our website with a revised date.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
          8. Contact Information
        </h2>
        <p className="text-gray-700">
          For any privacy-related questions, reach us at:
          <br />📧 <strong>support@shipwale.com</strong>
          <br />📞 <strong>+91 9983800788</strong>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
