import React, { useState } from "react";

const ShippingCalculator = () => {
  const [boxes, setBoxes] = useState([{ id: 1 }]); // Initial box

  // Function to add a new box
  const addBox = () => {
    setBoxes([...boxes, { id: boxes.length + 1 }]);
  };

  // Function to remove a box by ID
  const removeBox = (id) => {
    setBoxes(boxes.filter((box) => box.id !== id));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-5xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Calculate Your Shipping Price
        </h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Method */}
          <div>
            <label className="block text-gray-700 font-semibold">Shipping Method</label>
            <select className="w-full p-2 border rounded-md focus:ring-emerald-500">
              <option>Surface</option>
              <option>Express</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-semibold">Status</label>
            <select className="w-full p-2 border rounded-md focus:ring-emerald-500">
              <option>Forward</option>
              <option>RTO</option>
              <option>Reverse</option>
            </select>
          </div>

          {/* Origin Pincode */}
          <div>
            <label className="block text-gray-700 font-semibold">Origin Pincode</label>
            <input
              type="text"
              placeholder="Ex. 813210"
              className="w-full p-2 border rounded-md focus:ring-emerald-500"
            />
          </div>

          {/* Destination Pincode */}
          <div>
            <label className="block text-gray-700 font-semibold">Destination Pincode</label>
            <input
              type="text"
              placeholder="Ex. 845401"
              className="w-full p-2 border rounded-md focus:ring-emerald-500"
            />
          </div>

          {/* COD Amount */}
          <div>
            <label className="block text-gray-700 font-semibold">COD Amount</label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 border rounded-md focus:ring-emerald-500"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-gray-700 font-semibold">Payment Mode</label>
            <select className="w-full p-2 border rounded-md focus:ring-emerald-500">
              <option>COD</option>
              <option>Prepaid</option>
            </select>
          </div>

          {/* Shipment Type */}
          <div>
            <label className="block text-gray-700 font-semibold">Shipment Type</label>
            <select className="w-full p-2 border rounded-md focus:ring-emerald-500">
              <option>B2C</option>
              <option>B2B</option>
            </select>
          </div>

          {/* Invoice Amount */}
          <div>
            <label className="block text-gray-700 font-semibold">Invoice Amount</label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 border rounded-md focus:ring-emerald-500"
            />
          </div>
        </div>

  
      

        {/* Dynamically Added Boxes */}
        {boxes.map((box) => (
          <div key={box.id} className="overflow-x-auto">
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 bg-gray-100 p-3 rounded-lg shadow mt-3 min-w-[240px] relative">
              <input type="number" className="p-2 border rounded-md" placeholder="Weight" />
              <select className="p-2 border rounded-md">
                <option>g</option>
                <option>kg</option>
              </select>
              <input type="number" className="p-2 border rounded-md" placeholder="L (cm)" />
              <input type="number" className="p-2 border rounded-md" placeholder="B (cm)" />
              <input type="number" className="p-2 border rounded-md" placeholder="H (cm)" />
              <input type="number" className="p-2 border rounded-md" placeholder="Count" />
              {boxes.length>1?<button
                type="button"
                onClick={() => removeBox(box.id)}
                className="absolute top-[-8px] right-1 text-red-600 hover:text-red-800"
              >
                ❌
              </button>:null}
            </div>
          </div>
        ))}

        {/* Buttons */}
        <div className="flex justify-between mt-4 space-x-4">
          <button
            type="button"
            onClick={addBox}
            className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-md hover:bg-emerald-100 transition"
          >
            ➕ Add More Boxes
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition"
          >
            Submit and Compare
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;


