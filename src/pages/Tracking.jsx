import React from "react";

const Tracking = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md border border-blue-100">
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Track Your <span className="text-blue-600">Parcel</span>
        </h1>

        {/* Input + Button */}
        <div className="flex items-center border border-blue-400 rounded-lg overflow-hidden shadow-sm">
          <span className="px-4 py-2 text-blue-600 font-semibold text-sm bg-blue-50 border-r border-blue-400">
            AWB
          </span>

          <input
            type="text"
            placeholder="Enter Tracking ID / AWB"
            className="flex-grow px-4 py-2 text-sm outline-none focus:bg-blue-50 transition-all"
          />

          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all">
            TRACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
