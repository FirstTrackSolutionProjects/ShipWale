import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddDiscountModal from "./AddDiscountModal";
import { MdModeEditOutline } from "react-icons/md";
import UpdateDiscountModal from "./UpdateDiscountModal";
import { FaTrashCan } from "react-icons/fa6";

const API_URL = import.meta.env.VITE_APP_API_URL
const UserDiscountModal = ({ open, onClose, uid }) => {
    if (!open) return;
    const [discounts, setDiscounts] = useState([])
    const [openAddDiscount, setOpenAddDiscount] = useState(false)
    const closeAddDiscount = () => {
        setOpenAddDiscount(false)
        getDiscounts();
    }
    const [openUpdateDiscount, setOpenUpdateDiscount] = useState(false)
    const closeUpdateDiscount = () => {
        setOpenUpdateDiscount(false)
        getDiscounts();
    }
    const getDiscounts = async () => {
        const discountRequest = await fetch(`${API_URL}/discounts/${uid}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('token'),
            }
        })
        const discountResponse = await discountRequest.json();
        if (discountResponse?.success){
            setDiscounts(discountResponse?.discounts || []);
        } else {
            toast.error("Error while getting discounts")
        }
    }

    useEffect(() => {
        getDiscounts();
    }, [])

    const handleDeleteDiscount = async (serviceId) => {
        if (!window.confirm("Are you sure you want to delete this discount?")) return;
        try {
            const response = await fetch(`${API_URL}/discounts/`,{
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
                body: JSON.stringify({ service_id : serviceId, uid : uid }),
            })
            const data = await response.json();
            if (data?.success){
                toast.success("Discount deleted successfully")
                getDiscounts();
            } else {
                toast.error("Error while deleting discount")
            }
        } catch (error) {
            toast.error("Unexpected error")
        }
    }
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative max-h-[80%] overflow-hidden">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
          <h1 className="text-xl text-center my-4 font-bold">DISCOUNTS</h1>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 2rem)' }}>
            { discounts.length ? discounts.map((discount) =>(
                <div key={discount.id} className="border-b border-gray-200 py-2 flex items-center relative">
                  <div>
                    <h2 className="text-lg font-bold">{discount?.service_name}</h2>
                    <p>{discount?.discount_percentage}%</p>
                  </div>
                  <div className="text-xl absolute right-10 transition-all duration-500 hover:text-2xl" onClick={()=>setOpenUpdateDiscount(true)}>
                    <MdModeEditOutline />
                  </div>
                  <div className="text-xl absolute right-2 transition-all text-red-500 duration-500 hover:text-2xl" onClick={()=>handleDeleteDiscount(discount?.service_id)}>
                    <FaTrashCan />
                  </div>
                  <UpdateDiscountModal open={openUpdateDiscount} onClose={closeUpdateDiscount} uid={uid} serviceId={discount?.service_id} discount={discount?.discount_percentage} />
                </div>
            )) : <div className="text-center">No discounts applied</div>}
          </div>
          <div className="flex justify-center">
            <button
              className="px-4 py-2 my-4 rounded-full text-white bg-red-500 hover:bg-red-700"
              onClick={()=>setOpenAddDiscount(true)}
            >
              Add Discount
            </button>
          </div>
        </div>
        <AddDiscountModal open={openAddDiscount} onClose={closeAddDiscount} uid={uid} />
      </div>
    );
  };
  
  export default UserDiscountModal;
  