import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_APP_API_URL
const ComparePrices = ({method, boxes, status, origin, dest, payMode, codAmount, isB2B, invoiceAmount, setShowCompare}) => {
  const [prices,setPrices] = useState([])
  const navigate = useNavigate()
  const {isAuthenticated} = useAuth()
  useEffect(()=>{
    console.log({method, status, origin, dest, payMode, codAmount})
    const data = async () => {
      await fetch(`${API_URL}/shipment/domestic/price`, {
        method: 'POST',
        headers: { 'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('token')}`
        },
          body : JSON.stringify({method: method, boxes : boxes, status : status, origin : origin, dest : dest, payMode : payMode, codAmount : codAmount, isB2B : isB2B, invoiceAmount : invoiceAmount, priceCalc : true}),
        
      }).then(response => response.json()).then(result => {console.log(result); setPrices(result.prices)}).catch(error => console.log(error + " " + error.message))
    }  
    data()
  }, []) 

  const handleShip = () => {
    const shipment = {
      payMode: payMode,
      shippingType: method==="E"?"Express":"Surface",
      postcode: dest,
      isB2B: isB2B,
      cod: codAmount,
      invoiceAmount: invoiceAmount
    }
    const shipmentBoxes = boxes.map((box, index) => ({
      box_no: index + 1,
      ...box
    }))
    navigate('/dashboard/order/create', {
      state: { shipment, boxes: shipmentBoxes }
    })
  }
  return (
    <>
     <div className="w-full absolute z-[1] inset-0 overflow-y-scroll px-4 pt-24 pb-4 flex flex-col bg-gray-100 items-center space-y-6">
        <div className="text-center relative w-full">
          <div className="absolute right-5 text-2xl cursor-pointer" onClick={()=>setShowCompare(false)}>x</div>
          <p className="text-3xl font-medium">CHOOSE YOUR SERVICE</p>
        </div>
        <div className="w-full p-4 ">
          {
            prices.length ? prices.map((price)=>(
              <div className="w-full h-16 bg-white relative justify-center px-4 flex flex-col border-b" >
          <div className="font-bold">{price.name+" "+price.weight}</div>
          <div>{"Chargable Weight : "+price.chargableWeight}gm</div>
          <div className="absolute right-4 flex gap-2">
            <p>{`₹${Math.round((price.price))}`}</p>
            {isAuthenticated && <button type="button" onClick={handleShip} className="bg-blue-500 text-white py-1 px-2 rounded">Ship</button>}
          </div>
        </div>
            ))
          : null
          }
          
        </div>
      </div>
    </>
  )
}


const Domestic = () => {
  const [boxes, setBoxes] = useState([{weight : 0, weight_unit : 'kg', length : 0, breadth : 0, height : 0, quantity : 1}])
  const [formData, setFormData] = useState({
    method : 'S',
    status: 'Delivered',
    origin : '',
    dest : '',
    payMode : 'COD',
    codAmount : '0',
    invoiceAmount : 0,
    isB2B : false
  })
  const [showCompare, setShowCompare] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.origin.length !== 6 || formData.origin.length !== 6){
      toast.error("Origin and Destination pincodes should be 6 digits")
      return;
    }
    if (formData.isB2B && formData.invoiceAmount < 1){
      toast.error("Invoice Amount should be atleast 1 for B2B")
      return;
    }
    if (formData.payMode == "COD" && formData.codAmount < 1){
      toast.error("COD Amount should be atleast 1")
      return;
    }
    let boxValidationError = false;
    boxes.map(box => {
      if (!box.weight){
        toast.error("Weight is required")
        boxValidationError = true;
      }
      if (!box.length || !box.breadth || !box.height){
        toast.error("Length, Breadth and Height should be non-zero")
        boxValidationError = true;
      }
      if (box.quantity < 1){
        toast.error("Quantity should be atleast 1")
        boxValidationError = true;
      }
    })
    if (boxValidationError) return;
    setShowCompare(true)
  }
  const handleBoxes = (index, event) => {
    const { name, value } = event.target;
    const updatedBoxes = [...boxes];
    updatedBoxes[index][name] = value;
    setBoxes(updatedBoxes);
  };
  const addBox = () => {
    setBoxes([...boxes, {  length: 0 , breadth : 0 , height : 0  , weight: 0, weight_unit : 'kg', quantity: 1 }]);
  };
  const removeBox = (index) => {
    const updatedBoxes = boxes.filter((_, i) => i !== index);
    setBoxes(updatedBoxes);
  };
  return (
    <>
      {showCompare && <ComparePrices {...formData} boxes={boxes} setShowCompare={setShowCompare} />}
      <form action="" className="flex flex-col max-w-[724px] space-y-4" onSubmit={handleSubmit}>
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
              <label htmlFor="method">Shipping Method</label>
              <select
                name="method"
                id="method"
                className="border py-2 px-4 rounded"
                value={formData.method}
                onChange={handleChange}
              >
                <option value="S">Surface</option>
                <option value="E">Express</option>
              </select>
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
              <label htmlFor="status">Status</label>
              <select
                name="status"
                id="status"
                className="border py-2 px-4 rounded"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Delivered">Forward</option>
                <option value="RTO">RTO</option>
                <option value="DTO">Reverse</option>
              </select>
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
                placeholder="Ex. 813210"
                value={formData.origin}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="dest">Destination Pincode</label>
              <input
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="dest"
                name="dest"
                placeholder="Ex. 845401"
                value={formData.dest}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
              <label htmlFor="codAmount">COD Amount</label>
              <input
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="codAmount"
                name="codAmount"
                placeholder="Ex. 157"
                value={formData.codAmount}
                onChange={handleChange}
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

              >
                <option value="COD">COD</option>
                <option value="Pre-paid">Prepaid</option>
                <option value="Pickup">Pickup</option>
              </select>
            </div>
            
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
              <label htmlFor="shipmentType">Shipment Type</label>
              <select
                name="isB2B"
                id="shipmentType"
                className="border py-2 px-4 rounded"
                value={formData.isB2B}
                onChange={handleChange}

              >
                <option value={false}>B2C</option>
                <option value={true}>B2B</option>
              </select>
            </div>
            
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
              <label htmlFor="invoiceAmount">Invoice Amount</label>
              <input
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="invoiceAmount"
                name="invoiceAmount"
                placeholder="Ex. 157"
                value={formData.invoiceAmount}
                onChange={handleChange}
              />
            </div>
            
          </div>
          {boxes.map((box,index)=>(
            <>
              <div className="w-full relative z-0 flex mb-2 flex-wrap ">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="weight">Weight</label>
              <div className="w-full flex space-x-2">
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="weight"
                name="weight"
                placeholder="Ex. 1500"
                value = {box.weight}
                onChange={(e)=>handleBoxes(index,e)}
              />
              <select
                name="weight_unit"
                id="weight_unit"
                className="border py-2 px-4 rounded"
                value={box.weight_unit}
                onChange={(e)=>handleBoxes(index,e)}
              >
                <option value={'g'}>g</option>
                <option value={'kg'}>kg</option>
              </select>
              </div>
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] flex space-x-2">
            <div className="flex-1 mb-2 min-w-[70px] space-y-2">
              <label htmlFor="length">L (in cm)</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="length"
                name="length"
                min={1}
                placeholder="Ex. 2.5"
                value={box.length}
                onChange={(e)=>handleBoxes(index,e)}
              />
            </div>
            <div className="flex-1 mb-2 min-w-[70px] space-y-2">
              <label htmlFor="breadth">B (in cm)</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="breadth"
                name="breadth"
                min={1}
                placeholder="Ex. 2.5"
                value={box.breadth}
                onChange={(e)=>handleBoxes(index,e)}
              />
            </div>
            <div className="flex-1 mb-2 min-w-[70px] space-y-2">
              <label htmlFor="height">H (in cm)</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="height"
                name="height"
                min={1}
                placeholder="Ex. 2.5"
                value={box.height}
                onChange={(e)=>handleBoxes(index,e)}
              />
            </div>
            <div className="flex-1 mb-2 min-w-[70px] space-y-2">
              <label htmlFor="quantity">Quantity</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="quantity"
                name="quantity"
                min={1}
                placeholder="Ex. 2.5"
                value={box.quantity}
                onChange={(e)=>handleBoxes(index,e)}
              />
            </div>
            </div>
            {boxes.length > 1 && <button type="button" className="absolute w-5 h-5 text-sm flex justify-center items-center top-0 right-0  border rounded-full bg-red-500 text-white" onClick={() => removeBox(index)}>X</button>}
            </div>
            </>
          ))}
            <button type="button" className="m-2 px-5 py-1 border border-red-500 rounded bg-white text-red-500" onClick={addBox}>Add More Boxes</button>
            <button type="submit" className="border bg-red-500 hover:bg-red-600 text-white mx-2  py-2 px-4 rounded">
              Submit and Compare
            </button>
        </form>
    </>
  )
}




const PriceCalc = () => {
  return (
    <>
      
      <div className="pt-16 relative">
      
      <div className="w-full p-8 flex flex-col items-center space-y-6">
        <div className="justify-center text-center text-3xl font-medium mb-8 flex">
          Calculate your shipping price
        </div>
        <Domestic />
      </div>
      </div>
    </>
  );
};

export default PriceCalc
