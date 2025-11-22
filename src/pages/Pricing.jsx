// src/components/Form.js

import React from 'react';
import PriceCalc from '../components/PriceCalc';
const API_URL = import.meta.env.VITE_APP_API_URL
const Pricing = () => {
  return (
    <div className='flex justify-center items-center w-full flex-col'>
    <div className="mx-6 mb-5">
      <PriceCalc/>
    </div>
    </div>
  );
}

export default Pricing;
