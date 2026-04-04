import React from "react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">We'll Be Back Soon!</h1>
        <p className="text-gray-600 mb-6">
          Our website is currently undergoing maintenance.
        </p>
        <p className="text-lg text-gray-700 font-semibold mb-4">
          Maintenance Time:
        </p>
        <p className="text-md text-gray-800">
          04-04-2026 11:45 PM IST
        </p>
        <p className="text-md text-gray-800">
          to
        </p>
        <p className="text-md text-gray-800">
          05-04-2026 01:00 AM IST
        </p>
        <div className="mt-6 text-gray-500 text-sm">
          Thank you for your patience.
        </div>
      </div>
    </div>
  );
}
