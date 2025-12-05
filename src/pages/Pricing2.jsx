import React, { useState } from "react";

const Pricing = () => {
  const [formData, setFormData] = useState({
    shippingMethod: "Surface",
    status: "Forward",
    originPincode: "",
    destinationPincode: "",
    codAmount: 0,
    paymentMode: "COD",
    shipmentType: "B2C",
    invoiceAmount: 0,
  });

  // Boxes state (array of box objects)
  const [boxes, setBoxes] = useState([
    { weight: "", weight_unit: "g", length: "", breadth: "", height: "", quantity: "" },
  ]);

  // Handle non-box inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in boxes array
  const handleBoxes = (index, e) => {
    const { name, value } = e.target;
    const updatedBoxes = [...boxes];
    updatedBoxes[index][name] = value;
    setBoxes(updatedBoxes);
  };

  // Add a new box row
  const addBox = () => {
    setBoxes([...boxes, { weight: "", weight_unit: "g", length: "", breadth: "", height: "", quantity: "" }]);
  };

  // Remove a box row
  const removeBox = (index) => {
    const updatedBoxes = boxes.filter((_, i) => i !== index);
    setBoxes(updatedBoxes);
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", { ...formData, boxes });
    alert("Form submitted! Check console for data.");
  };

  return (
    <div className="flex justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-2xl"
      >
          {/* Image */}
        {/* <div className="flex justify-center mb-4">
          <img
            src="/pricing.jpg" 
            alt="Shipping Banner"
            className="w-full rounded-lg object-cover"
          />
        </div> */}

        <h2 className="text-2xl font-semibold text-center mb-6">
          Calculate Your Shipping Price
        </h2>

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Shipping Method</label>
            <select
              name="shippingMethod"
              value={formData.shippingMethod}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="Surface">Surface</option>
              <option value="Air">Express</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="Forward">Forward</option>
              <option value="RTO">RTO</option>
              <option value="Reverse">Reverse</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Origin Pincode</label>
            <input
              type="text"
              name="originPincode"
              placeholder="Ex. 813210"
              value={formData.originPincode}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Destination Pincode</label>
            <input
              type="text"
              name="destinationPincode"
              placeholder="Ex. 845401"
              value={formData.destinationPincode}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">COD Amount</label>
            <input
              type="number"
              name="codAmount"
              value={formData.codAmount}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="COD">COD</option>
              <option value="Prepaid">Prepaid</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Shipment Type</label>
            <select
              name="shipmentType"
              value={formData.shipmentType}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Invoice Amount</label>
            <input
              type="number"
              name="invoiceAmount"
              value={formData.invoiceAmount}
              onChange={handleChange}
              className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Boxes Section */}
        {boxes.map((box, index) => (
          <div
            key={index}
            className="relative grid grid-cols-2 sm:grid-cols-6 gap-4 p-2 mb-2 rounded-md bg-gray-200"
          >
            <div>
              <label className="block text-sm font-medium">Weight</label>
              <input
                type="text"
                name="weight"
                placeholder="Ex. 1500"
                value={box.weight}
                onChange={(e) => handleBoxes(index, e)}
                className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">W Unit</label>
              <select
                name="weight_unit"
                value={box.weight_unit}
                onChange={(e) => handleBoxes(index, e)}
                className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">L (cm)</label>
              <input
                type="text"
                name="length"
                placeholder="Ex. 2.5"
                value={box.length}
                onChange={(e) => handleBoxes(index, e)}
                className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">B (cm)</label>
              <input
                type="text"
                name="breadth"
                placeholder="Ex. 2.5"
                value={box.breadth}
                onChange={(e) => handleBoxes(index, e)}
                className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">H (cm)</label>
              <input
                type="text"
                name="height"
                placeholder="Ex. 2.5"
                value={box.height}
                onChange={(e) => handleBoxes(index, e)}
                className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Count</label>
              <input
                type="text"
                name="quantity"
                placeholder="Ex. 2"
                value={box.quantity}
                onChange={(e) => handleBoxes(index, e)}
                className="mt-1 text-sm block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {boxes.length > 1 && (
              <button
                type="button"
                className="absolute w-5 h-5 text-sm flex justify-center items-center top-0 right-0 border rounded-full bg-red-500 text-white"
                onClick={() => removeBox(index)}
              >
                X
              </button>
            )}
          </div>
        ))}

        <div className="mx-auto justify-center items-center flex">
          <button
            type="button"
            className="m-2 px-2 md:px-5 py-2 text-sm md:text-base border border-green-600 rounded bg-white text-green-600"
            onClick={addBox}
          >
            Add More Boxes
          </button>
          <button
            type="submit"
            className="border bg-green-600 text-white mx-2 text-sm md:text-base py-2 md:px-4 px-2 rounded"
          >
            Submit and Compare
          </button>
        </div>
      </form>
    </div>
  );
};

export default Pricing;

