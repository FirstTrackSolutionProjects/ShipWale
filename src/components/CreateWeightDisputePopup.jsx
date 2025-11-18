import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const API_URL = import.meta.env.VITE_APP_API_URL
const CreateWeightDisputePopup = ({ open, onClose, onSubmit }) => {
    if (!open) return;
    const [formData, setFormData] = useState({
        ord_id: "",
        dispute_deduction: "",
        dispute_boxes: [],
        doc_1: "",
        doc_2: "",
        doc_3: "",
        doc_4: ""
    })
    const [files, setFiles] = useState({
        doc_1: null,
        doc_2: null,
        doc_3: null,
        doc_4: null
    })
    const [submitting, setSubmitting] = useState(false)
    const getBoxes = async () => {
        try{
            const response = await fetch(`${API_URL}/order/domestic/boxes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token"),
                    "Accept": "application/json"
                },
                body: JSON.stringify({ order: formData.ord_id })
            })
            if (!response.ok){
                toast.error("Unable to get order details! Please try again")
            }
            const data = await response.json()
            const boxes = data?.order;
            const disputeBoxes = boxes.flatMap((box) =>
                Array(box?.quantity).fill(0).map(() => ({
                    box_no: box?.box_no,
                    weight: box?.weight,
                    weight_unit: box?.weight_unit,
                    length: box?.length,
                    breadth: box?.breadth,
                    height: box?.height,
                    actual_weight: box?.weight,
                    actual_weight_unit: box?.weight_unit,
                    actual_length: box?.length,
                    actual_breadth: box?.breadth,
                    actual_height: box?.height
                  }))
                );
            setFormData((prevFormData) => ({
                ...prevFormData,
                dispute_boxes: disputeBoxes
            }))
        } catch (error) {
            toast.error("Something went wrong! Please try again")
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true)
            await Promise.all(
                Object.entries(files).map(async ([key, file]) => {
                    if (file) {
                        const fileKey = `dispute/${formData.ord_id}/${uuidv4()}`;
                        const putUrlResponse = await fetch(`${API_URL}/s3/putUrl`,{
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": localStorage.getItem("token"),
                                "Accept": "application/json"
                            },
                            body: JSON.stringify({ filename: fileKey, filetype: file.type, isPublic: true })
                        })
                        if (!putUrlResponse.ok) {
                            throw new Error(`Failed to upload file: ${file.name}`);
                        }
                        const putUrlData = await putUrlResponse.json();
                        const { uploadURL } = putUrlData;
                        
                        const uploadResponse = await fetch(uploadURL, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': file.type
                            },
                            body: file
                        });
                        if (!uploadResponse.ok) {
                            throw new Error(`Failed to upload file: ${file.name}`);
                        }
                        formData[key] = fileKey;
                    }
                })
            )
            const response = await fetch(`${API_URL}/weight-disputes/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success){
                toast.success('Weight Dispute added successfully');
            } else {
                toast.error(data.message || 'Failed to add weight dispute');
            }
            onClose();
        } catch (error) {
            toast.error('Failed to add weight dispute');
        } finally {
            setSubmitting(false)
        }
    }

    const handleChange = (e) => {
        const {name , value} = e.target;
        setFormData((prevFormData) => ({...prevFormData, [name]: value}));
    }

    const handleBoxChange = (e, index) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
        const updatedBoxes = [...prevFormData.dispute_boxes];
        updatedBoxes[index] = {
            ...updatedBoxes[index],
            [name]: value
        };
        return {
            ...prevFormData,
            dispute_boxes: updatedBoxes
        };
    });
};

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative max-h-[80%] overflow-hidden">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
          <h1 className="text-xl text-center my-4 font-bold">CREATE WEIGHT DISPUTE</h1>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 2rem)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6 py-8">
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex flex-col">
                        <label htmlFor="ord_id" className="font-semibold">Order Id</label>
                        <input 
                            type="text"
                            id="ord_id"
                            name="ord_id"
                            className="w-full px-2 py-1 rounded-lg border border-black"
                            value={formData.ord_id}
                            onChange={handleChange}
                        />
                    </div>
                    <button type='button' onClick={getBoxes} disabled={!formData?.ord_id} className="mx-2 px-5 py-1 border rounded-3xl disabled:bg-gray-400 bg-red-500 text-white">Get Order Details</button>
                </div>

                {
                    formData?.dispute_boxes?.length > 0 ? 
                    <div className="flex flex-col space-y-2">
                        {
                            formData?.dispute_boxes?.map((box, index)=>(
                        <div className="h-84 p-4 rounded-lg bg-gray-300 space-y-2">
                            <div className="flex space-x-2">
                                <div className="flex flex-col space-y-1 w-full">
                                    <label htmlFor="length" className="text-sm">Length (In cm)</label>
                                    <input key={index} id="length" name="length" type="text" disabled value={formData?.dispute_boxes?.[index]?.length} className="rounded-lg py-1 px-2 w-full" />
                                </div>
                                <div className="flex flex-col space-y-1 w-full">
                                    <label htmlFor="actual_length" className="text-sm">Actual Length (In cm)</label>
                                    <input key={index} id="actual_length" name="actual_length" type="text" value={formData?.dispute_boxes?.[index]?.actual_length} onChange={(e) => handleBoxChange(e, index)} className="rounded-lg py-1 px-2 w-full" />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex flex-col space-y-1 w-full">
                                    <label htmlFor="breadth" className="text-sm">Breadth (In cm)</label>
                                    <input key={index} id="breadth" name="breadth" type="text"  disabled value={formData?.dispute_boxes?.[index]?.breadth} className="rounded-lg py-1 px-2 w-full" />
                                </div>
                                <div className="flex flex-col space-y-1 w-full">
                                    <label htmlFor="actual_breadth" className="text-sm">Actual Breadth (In cm)</label>
                                    <input key={index} id="actual_breadth" name="actual_breadth" type="text" value={formData?.dispute_boxes?.[index]?.actual_breadth} onChange={(e) => handleBoxChange(e, index)} className="rounded-lg py-1 px-2 w-full" />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex flex-col space-y-1 w-full">
                                    <label htmlFor="height" className="text-sm">Height (In cm)</label>
                                    <input key={index} id="height" name="height" type="text" disabled value={formData?.dispute_boxes?.[index]?.height} className="rounded-lg py-1 px-2 w-full" />
                                </div>
                                <div className="flex flex-col space-y-1 w-full">
                                    <label htmlFor="actual_height" className="text-sm">Actual Height (In cm)</label>
                                    <input key={index} id="actual_height" name="actual_height" type="text" value={formData?.dispute_boxes?.[index]?.actual_height} onChange={(e) => handleBoxChange(e, index)} className="rounded-lg py-1 px-2 w-full" />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex gap-1 w-full">
                                    <div className="flex-[2]">
                                        <label htmlFor="weight" className="text-sm">Weight</label>
                                        <input key={index} id="weight" name="weight" type="text" disabled value={formData?.dispute_boxes?.[index]?.weight} className="rounded-lg py-1 px-2 w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="weight_unit" className="text-sm">Unit</label>
                                        <select key={`weight_unit_${index}`} id="weight_unit" name="weight_unit" disabled value={formData?.dispute_boxes?.[index]?.weight_unit || 'g'} className="rounded-lg py-1 px-2 w-full">
                                            <option value="g">g</option>
                                            <option value="kg">kg</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-1 w-full">
                                    <div className="flex-[2]">
                                        <label htmlFor="actual_weight" className="text-sm">Act. Wt.</label>
                                        <input key={index} id="actual_weight" name="actual_weight" type="text" value={formData?.dispute_boxes?.[index]?.actual_weight} onChange={(e) => handleBoxChange(e, index)} className="rounded-lg py-1 px-2 w-full" />
                                    </div> 
                                    <div className="flex-1">
                                        <label htmlFor="actual_weight_unit" className="text-sm">Unit</label>
                                        <select key={`actual_weight_unit_${index}`} id="actual_weight_unit" name="actual_weight_unit" value={formData?.dispute_boxes?.[index]?.actual_weight_unit || 'g'} onChange={(e) => handleBoxChange(e, index)} className="rounded-lg py-1 px-2 w-full">
                                            <option value="g">g</option>
                                            <option value="kg">kg</option>
                                        </select>
                                    </div> 
                                </div>
                            </div>
                        </div> 
                    ))
                        }
                        <div className="flex flex-col space-y-1 w-full">
                            <label htmlFor="dispute_deduction" className="text-sm">Dispute Deduction (In ₹)</label>
                            <input id="dispute_deduction" name="dispute_deduction" type="text" value={formData?.dispute_deduction} onChange={handleChange} className="rounded-lg py-1 px-2 w-full border border-black" />
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <div>
                                <label htmlFor="doc_1" className="text-sm">Dispute Image 1</label>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png" 
                                    onChange={(e) => setFiles((prevFiles) => ({ ...prevFiles, doc_1: e.target.files[0] }))} 
                                    className="w-full px-2 py-1 rounded-lg border border-black"
                                    name="doc_1"
                                    id="doc_1"
                                />
                            </div>
                            <div>
                                <label htmlFor="doc_2" className="text-sm">Dispute Image 2</label>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png" 
                                    onChange={(e) => setFiles((prevFiles) => ({ ...prevFiles, doc_2: e.target.files[0] }))} 
                                    className="w-full px-2 py-1 rounded-lg border border-black"
                                    name="doc_2"
                                    id="doc_2"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <div>
                                <label htmlFor="doc_3" className="text-sm">Dispute Image 3</label>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png" 
                                    onChange={(e) => setFiles((prevFiles) => ({ ...prevFiles, doc_3: e.target.files[0] }))} 
                                    className="w-full px-2 py-1 rounded-lg border border-black"
                                    name="doc_3"
                                    id="doc_3"
                                />
                            </div>
                            <div>
                                <label htmlFor="doc_4" className="text-sm">Dispute Image 4</label>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png" 
                                    onChange={(e) => setFiles((prevFiles) => ({ ...prevFiles, doc_4: e.target.files[0] }))} 
                                    className="w-full px-2 py-1 rounded-lg border border-black"
                                    name="doc_4"
                                    id="doc_4"
                                />
                            </div>
                        </div>
                    </div>
                    :
                    null 
                }

                
                
                <button type="submit" disabled={!(formData?.ord_id && formData?.dispute_deduction) || submitting} className="w-full px-4 py-2 mt-4 rounded-full disabled:bg-gray-400 text-white bg-red-500 hover:bg-red-700">
                  {submitting ? "Submitting..." : "Submit"}
                </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default CreateWeightDisputePopup;
  