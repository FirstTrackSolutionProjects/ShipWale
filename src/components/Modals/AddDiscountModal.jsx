import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_APP_API_URL
const AddDiscountModal = ({ open, onClose, uid }) => {
    if (!open) return;
    const [formData, setFormData] = useState({
        uid: uid,
        service_id: "",
        discount: 0
    })
    const [services, setServices] = useState([])
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/discounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            toast.success('Discount added successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to add discount');
        }
    }
    const getServices = async () => {
        const serviceRequest = await fetch(`${API_URL}/services`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token'),
            }
        })
        const serviceResponse = await serviceRequest.json();
        if (serviceResponse?.success){
            setServices(serviceResponse?.services || []);
        } else {
            toast.error("Error while getting services")
        }
    }
    useEffect(() => {
        getServices();
    }, []);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative max-h-[80%] overflow-hidden">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
          <h1 className="text-xl text-center my-4 font-bold">ADD DISCOUNT</h1>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 2rem)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                <div className="flex flex-col">
                    <label htmlFor="service_id" className="font-semibold">Service Name</label>
                    <select
                        name="service_id"
                        id="service_id"
                        className="border-2 py-2 px-4 rounded-full"
                        required
                        value={formData.service_id}
                        onChange={e => setFormData({...formData, service_id: e.target.value })}
                    >
                        <option value="">Select Service</option>
                        {services.map((service)=>(
                            <option key={service.service_id} value={service.service_id}>{service.service_name}</option>
                        ))}
                        {/* Populate service options here */}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="discount"  className="font-semibold">Discount (%)</label>
                    <input
                        type="number"
                        name="discount"
                        id="discount"
                        className="border-2 py-2 px-4 rounded-full"
                        placeholder="Discount (%)"
                        required
                        value={formData.discount}
                        onChange={e => setFormData({...formData, discount: e.target.value })}
                        min={-100}
                        max={100}
                    />
                </div>
                <button type="submit" className="w-full px-4 py-2 mt-4 rounded-full text-white bg-red-500 hover:bg-red-700">
                  Submit
                </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default AddDiscountModal;
  