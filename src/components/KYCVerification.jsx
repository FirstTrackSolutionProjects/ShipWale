import React, { useState, useEffect} from "react";
const API_URL = import.meta.env.VITE_APP_API_URL

const FileUploadForm = ({reqId}) => {
  const [fileData, setFileData] = useState({
    aadharDoc: null,
    panDoc: null,
    gstDoc: null,
    cancelledCheque: null,
    selfieDoc: null,
  });
  const [uploadStatus, setUploadStatus] = useState({
    aadharDoc: false,
    panDoc: false,
    gstDoc: false,
    cancelledCheque: false,
    selfieDoc: false,
  });
  useEffect(() => {
    const getDocumentStatus = async () => {
      await fetch(`${API_URL}/kyc/documentStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': localStorage.getItem('token')
        }
      }).then(response => response.json()).then((result) => {
        setUploadStatus({
          aadharDoc: result.message.aadharDoc?(true):(false),
          panDoc: result.message.panDoc?(true):(false),
          gstDoc: result.message.gstDoc?(true):(false),
          cancelledCheque: result.message.cancelledCheque?(true):(false),
          selfieDoc: result.message.selfieDoc?(true):(false),
        })
      })
    }
    getDocumentStatus()
  }, [])
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFileData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const handleUpload = async (name) => {
    // Fetch signed URL from backend
    const response  = await fetch (`${API_URL}/auth/token/decode`, {
      method: 'POST',
      headers: {
        'Authorization' : localStorage.getItem('token'),
      }
    })
    const tokenData = await response.json();
    const id = tokenData.id;
    const key  = `merchant/${id}/kycDocs/${reqId}/${name}`
    await fetch(`${API_URL}/s3/putUrl`, {
      method: "POST",
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({filename : key, filetype : fileData[name].type})
    })
      .then((response) => response.json())
      .then(async (data) => {
        const { uploadURL } = data;
        await fetch(uploadURL, {
          method: "PUT",
          headers: {
            'Content-Type': fileData[name].type
          },
          body: fileData[name],
        });
        await fetch(`${API_URL}/kyc/documentStatus/update`, {
          method: 'POST',
          headers : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json',
            'Authorization' : localStorage.getItem('token')
          },
          body : JSON.stringify({name : name, key : key})
        })
        alert("Success");
      })
      .then(() => {
        setUploadStatus((prevStatus) => ({
          ...prevStatus,
          [name]: true,
        }));
      })
      .catch((error) => alert(error.message));
  };

  const handleSubmit= async (e) => {
    e.preventDefault();
    if (!(uploadStatus.aadharDoc && uploadStatus.panDoc && uploadStatus.cancelledCheque && uploadStatus.selfieDoc)){
      alert("Please upload all required documents")
      return;
    }
    await fetch(`${API_URL}/kyc/submit`, {
      method: 'POST',
      headers : {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json',
        'Authorization' : localStorage.getItem('token')
      }
  }).then(response => response.json()).then(result => alert(result.message));
}
  return (
    <form className="w-[1024px] flex flex-col bg-white pt-8 px-4" onSubmit={handleSubmit}>
      {/* File input required fields */}
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="aadharDoc">Aadhar Card (Both Sides) *</label>
          <input
            className="w-full border leading-8 rounded-3xl"
            type="file"
            onChange={handleFileChange}
            id="aadharDoc"
            name="aadharDoc"
          />
          <button
            type="button"
            onClick={() => handleUpload("aadharDoc")}
            className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
          >
            Upload
          </button>
          {uploadStatus.aadharDoc && <span>✔️</span>}
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="panDoc">PAN Card (Front Side) *</label>
          <input
            className="w-full border leading-8 rounded-3xl"
            type="file"
            onChange={handleFileChange}
            id="panDoc"
            name="panDoc"
          />
          <button
            type="button"
            onClick={() => handleUpload("panDoc")}
            className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
          >
            Upload
          </button>
          {uploadStatus.panDoc && <span>✔️</span>}
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="gstDoc">GST Certificate </label>
          <input
            className="w-full border leading-8 rounded-3xl"
            type="file"
            onChange={handleFileChange}
            id="gstDoc"
            name="gstDoc"
          />
          <button
            type="button"
            onClick={() => handleUpload("gstDoc")}
            className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
          >
            Upload
          </button>
          {uploadStatus.gstDoc && <span>✔️</span>}
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="cancelledCheque">Cancelled Cheque *</label>
          <input
            className="w-full border leading-8 rounded-3xl"
            type="file"
            onChange={handleFileChange}
            id="cancelledCheque"
            name="cancelledCheque"
          />
          <button
            type="button"
            onClick={() => handleUpload("cancelledCheque")}
            className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
          >
            Upload
          </button>
          {uploadStatus.cancelledCheque && <span>✔️</span>}
        </div>
      </div>
      <div className="w-1/2 flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="selfieDoc">Upload your selfie *</label>
          <input
            className="w-full border leading-8 rounded-3xl"
            type="file"
            onChange={handleFileChange}
            id="selfieDoc"
            name="selfieDoc"
          />
          <button
            type="button"
            onClick={() => handleUpload("selfieDoc")}
            className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
          >
            Upload
          </button>
          {uploadStatus.selfieDoc && <span>✔️</span>}
        </div>
      </div>
      <div className="px-2 space-x-4 mb-4">
        <button
          type="submit"
          className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
        >
          Submit
        </button>
      </div>
      {/* Add similar file inputs for other documents */}
    </form>
  );
};

const TextForm = ({ onNext, setReqId }) => {
  const [formData, setFormData] = useState({
    address: "",
    state: "",
    city: "",
    pin: "",
    aadhar: "",
    pan: "",
    gst: "",
    msme: "",
    bank: "",
    ifsc: "",
    account: "",
    cin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/kyc/submit/incomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((result) => {
        setReqId(result.reqId);
        alert(result.message);
        onNext(); // Move to the next step
      })
      .catch((error) => alert(error.message));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[1024px] flex flex-col bg-white pt-8 px-4"
    >
      <div className="w-full flex mb-2 flex-wrap "></div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="address">Address*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.address}
            id="address"
            name="address"
            placeholder="Enter Address"
          />
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
          <label htmlFor="state">State*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.state}
            id="state"
            name="state"
            placeholder="Enter State"
          />
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
          <label htmlFor="city">City*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.city}
            id="city"
            name="city"
            placeholder="Enter City"
          />
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="pin">PIN*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.pin}
            id="pin"
            name="pin"
            placeholder="XXXXXX"
          />
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="aadhar">Aadhar Number*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.aadhar}
            id="aadhar"
            name="aadhar"
            placeholder="XXXXXXXXXXXX"
          />
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="pan">PAN Number*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.pan}
            id="pan"
            name="pan"
            placeholder="ABCDE1234F"
          />
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="gst">GST Number</label>
          <input
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.gst}
            id="gst"
            name="gst"
            placeholder="22AAAAA0000A1Z5"
          />
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="msme">MSME/UDYAM Number</label>
          <input
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.msme}
            id="msme"
            name="msme"
            placeholder="UDYAMXX000000000"
          />
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="bank">Bank Name*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.bank}
            id="bank"
            name="bank"
            placeholder="Ex. State Bank of India"
          />
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="ifsc">IFSC*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.ifsc}
            id="ifsc"
            name="ifsc"
            placeholder="Ex. ABCD0001234"
          />
        </div>
      </div>
      <div className="w-full flex mb-2 flex-wrap ">
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="account">Account Number*</label>
          <input required
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.account}
            id="account"
            name="account"
            placeholder="Ex. 1234567890"
          />
        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="cin">CIN</label>
          <input
            className="w-full border py-2 px-4 rounded-3xl"
            type="text"
            onChange={handleChange}
            value={formData.cin}
            id="cin"
            name="cin"
            placeholder="U12345MH2024PTC012345"
          />
        </div>
      </div>

      <div className="px-2 space-x-4 mb-4">
        <button
          type="submit"
          className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
        >
          Next
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setFormData(InitialState);
          }}
          className="px-5 py-1 border rounded-3xl bg-red-500 text-white"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

const KYCVerification = () => {
  const [reqId, setReqId] = useState(null)
  const [step, setStep] = useState(1);
  useEffect(() => {
    const getStatus = async () => {
      await fetch(`${API_URL}/kyc/incomplete`, {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type' : 'application/json',
          'Accept' : 'application/json'
        }
      }).then((response)=>response.json()).then((data)=>{
        if (data.success){
          setReqId(data.message.reqId)
          setStep(2);
        }
      })
    }
    getStatus()
  }, [])

  const handleNextStep = () => {
    setStep(2);
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex flex-col items-center p-8 bg-white">
          <div className="text-center text-3xl font-medium">
            KYC Verification
          </div>
          {step === 1 ? (
            <TextForm onNext={handleNextStep} setReqId={setReqId} />
          ) : (
            <FileUploadForm reqId={reqId} />
          )}
        </div>
      </div>
    </>
  );
};

export default KYCVerification;