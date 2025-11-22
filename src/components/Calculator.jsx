import React from 'react';
const API_URL = import.meta.env.VITE_APP_API_URL
const Calculator = ()=>{
    return(
        <>
        <form className="bg-slate-400 bg-opacity-40 shadow-md rounded p-4 md:p-8 w-[300px] md:w-[600px]">
        
        {/* First Row */}
        <div className="mb-4 flex flex-wrap ">
          <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dropdown1">
              Shipping Method
            </label>
            <select
              className="block w-full bg-white border border-gray-400 hover:border-gray-500 md:px-2 lg:px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              id="dropdown1"
            >
              <option value="">Select shipping method</option>
              <option value="S">Surface</option>
              <option value="E">Express 2</option>
            </select>
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dropdown2">
              Status
            </label>
            <select
              className="block  w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              id="dropdown2"
            >
              <option value="">Select status</option>
              <option value="F">Forward</option>
              <option value="RTO">RTO</option>
              <option value="REV">Reverse</option>
            </select>
          </div>
        </div>

        {/* Second Row */}
        
        <div className="mb-4 flex flex-wrap ">
          <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              Source Pincode
            </label>
            <input
              className="shadow  border rounded w-full py-2 px-3 border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="sourcePin"
              type="text"
              placeholder="Ex: 411037"
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
              Destination Pincode
            </label>
            <input
              className="shadow  border rounded w-full py-2 px-3 border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="destPin"
              type="text"
              placeholder="Ex: 411001"
            />
          </div>
        </div>

        {/* Third Row */}
        
        <div className="mb-4 flex flex-wrap">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <label className="block text-gray-700 text-sm font-bold mb-3" htmlFor="firstName">
              COD Amount
            </label>
            <input
              className="shadow  border rounded w-full py-2 px-3 border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="codAmount"
              type="text"
              placeholder="0"
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dropdown2">
              Payment Mode
            </label>
            <select
              className="block  w-full bg-white border border-gray-400 hover:border-gray-500 md:px-2 lg:px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              id="payment"
            >
              <option value="">Select a payment option</option>
              <option value="COD">COD</option>
              <option value="PRE">Prepaid</option>
            </select>
          </div>
        </div>

        {/* Fourth Row */}
        <div className="mb-4 flex flex-wrap">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              Weight (In Kg)
            </label>
            <input
              className="shadow  border rounded w-full py-2 px-3 border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="weight"
              type="text"
              placeholder="1kg"
            />
          </div>
          
          <div className="md:w-1/2 w-full  flex space-x-4 sm:space-x-0 justify-between sm:justify-evenly px-3 lg:px-1">
          
            <div className="flex-1  mb-2 md:w-2/3 flex">
            <div className="flex-1 md:mx-1 mb-2 md:w-2/6 space-y-2">
              <label className="text-center block text-gray-700 text-sm font-bold mb-1" htmlFor="length">L (in cm)</label>
              <input
                className=" text-center shadow  border rounded w-full py-2 border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="length"
                name="length"
                placeholder="Ex. 2.5"
              />
            </div>
            <div className="flex-1 md:mx-1 mb-2 md:w-2/6 space-y-2">
              <label className="text-center block text-gray-700 text-sm font-bold mb-1" htmlFor="breadth">B (in cm)</label>
              <input
                className=" text-center shadow  border rounded w-full py-2  border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="breadth"
                name="breadth"
                placeholder="Ex. 2.5"
              />
            </div>
            <div className="flex-1 md:mx-1 mb-2 md:w-2/6 space-y-2">
              <label className="text-center block text-gray-700 text-sm font-bold mb-1" htmlFor="height">H (in cm)</label>
              <input
                className="text-center shadow  border rounded w-full py-2  border-gray-400 hover:border-gray-500  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="height"
                name="height"
                placeholder="Ex. 2.5"
              />
            </div>
            
            
          </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center">
          <button
            className="bg-sky-950 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Submit
          </button>
        </div>
      </form>
        </>
    )
}

export default Calculator;