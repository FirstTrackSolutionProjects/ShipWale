import { useState } from "react";
const API_URL = import.meta.env.VITE_APP_API_URL
const International = () => {
    const [formData, setFormData] = useState({
      status : 'Delivered',
      originCountry : '',
      origin : '',
      destCountry : '',
      dest : '',
      weight : '',
      payMode : 'prepaid',
      length : '',
      breadth : '',
      height : '',
      name : '',
      phone : '',
      email : '',
    })
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      await fetch(`${API_URL}/shipment/international/price/inquiry`, {
        method : 'POST',
        headers : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body : JSON.stringify(formData)
      }).then(response => response.json()).then(result => alert(result.message));
    }
    return (
      <>
        <form action="" className="flex flex-col max-w-[724px] space-y-4" onSubmit={handleSubmit}>
        <div className="w-full flex mb-2 flex-wrap ">
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2">
                <label htmlFor="name">Name</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2">
                <label htmlFor="phone">Contact Number</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Contact No."
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2">
                <label htmlFor="email">Email</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap ">
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2 flex flex-col justify-center">
                <label htmlFor="status">Status</label>
                <select
                  name="status"
                  id="status"
                  className="border py-2 px-4 rounded"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Delivered">Forward</option>
                  <option value="RTO">RTO</option>
                  <option value="DTO">Reverse</option>
                </select>
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2">
                <label htmlFor="originCountry">Origin Country</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="originCountry"
                  name="originCountry"
                  placeholder="Ex. India"
                  value={formData.originCountry}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2">
                <label htmlFor="destCountry">Destination Country</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="destCountry"
                  name="destCountry"
                  placeholder="Ex. Japan"
                  value={formData.destCountry}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap ">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="origin">Origin Pincode</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="origin"
                  name="origin"
                  placeholder="XXXXXX"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="dest">Destination Pincode</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="dest"
                  name="dest"
                  placeholder="XXXXXX"
                  value={formData.dest}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap ">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="weight">Weight (In grams)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="weight"
                  name="weight"
                  placeholder="Ex. 1500"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
                <label htmlFor="payMode">Payment Mode</label>
                <select
                  name="payMode"
                  id="payMode"
                  className="border py-2 px-4 rounded"
                  value={formData.payMode}
                  onChange={handleChange}
                  required
  
                >
                  <option value="prepaid">Prepaid</option>
                </select>
              </div>
              
            </div>
            <div className="w-full flex mb-2 flex-wrap ">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] flex">
              <div className="flex-1 mx-2 mb-2 min-w-[90px] space-y-2">
                <label htmlFor="length">L (in cm)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="length"
                  name="length"
                  placeholder="Ex. 2.5"
                  value={formData.length}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[90px] space-y-2">
                <label htmlFor="breadth">B (in cm)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="breadth"
                  name="breadth"
                  placeholder="Ex. 2.5"
                  value={formData.breadth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[90px] space-y-2">
                <label htmlFor="height">H (in cm)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="height"
                  name="height"
                  placeholder="Ex. 2.5"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
              </div>
              </div>
              <button type="submit" className="border bg-white mx-2  py-2 px-4 rounded">
                Submit Request
              </button>
          </form>
      </>
    )
  }

  const InternationalPriceInquiry = () => {
    return (
      <>
        
        <div className="pt-16 relative">
        
        <div className="w-full p-8 flex flex-col items-center space-y-6">
          <div className="justify-center text-center text-3xl font-medium mb-8 flex">
            International Price Inquiry
          </div>
          <International />
        </div>
        </div>
      </>
    );
  };
  
  export default InternationalPriceInquiry