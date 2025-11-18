import React from "react";

const Tracking = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4 py-10">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md border border-red-100">
        
        <img
          src="/image/track.jpg"
          alt="Tracking"
          className="w-full max-w-2xl h-auto mx-auto mb-6 rounded-xl shadow-md"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Track Your <span className="text-red-600">Parcel</span>
        </h1>

        {/* Input + Button */}
        <div className="flex items-center border border-red-400 rounded-lg overflow-hidden shadow-sm">
          <span className="px-4 py-2 text-red-600 font-semibold text-sm bg-red-50 border-r border-red-400">
            AWB
          </span>

          <input
            type="text"
            placeholder="Enter Tracking ID / AWB"
            className="flex-grow px-4 py-2 text-sm outline-none focus:bg-red-50 transition-all"
          />

          <button className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all">
            TRACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
