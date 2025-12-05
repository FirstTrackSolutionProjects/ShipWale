import React, { useState } from "react";
const API_URL = import.meta.env.VITE_APP_API_URL
const ManualRecharge = () => {
    const [formData, setFormData] = useState({
        email : '',
        amount : '',
        reason : '',
    })
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/wallet/manualRecharge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify(formData)
          }).then(response => response.json()).then(result => alert(result.message)).catch(error => alert(error.message));
    }
  return (
    <>
      <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
        <div className="w-full p-8 flex flex-col items-center space-y-8">
          <div className="text-center text-3xl font-medium text-black">
            Manual Wallet Recharge
          </div>
          <form action="" className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="email">Beneficiary E-mail</label>
              <input
                className="w-full border py-2 px-4 rounded"
                type="email"
                id="email"
                name="email"
                placeholder="Ex. user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="amount">Amount</label>
              <input
                className="w-full border py-2 px-4 rounded"
                type="number"
                id="amount"
                name="amount"
                placeholder="Ex. 500"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="reason">Reason for manual Transaction</label>
              <input
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="reason"
                name="reason"
                placeholder="Ex. Cashback"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>
          
            <button type="submit" className="border bg-white mx-2  py-2 px-4 rounded">
              Recharge
            </button>
        </form>
        </div>
      </div>
    </>
  );
};

export default ManualRecharge;
