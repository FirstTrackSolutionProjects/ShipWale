import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileUpload, CheckCircle } from "@mui/icons-material";
import { z } from "zod";
import { USER_ROLES } from '../Constants'; 
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import checkIncompleteRequest from "../services/checkIncompleteRequest";
import checkPendingRequest from "../services/checkPendingRequest";

const API_URL = import.meta.env.VITE_APP_API_URL;

// Define the Zod validation schema
const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pin: z.string().min(1, "PIN Code is required").regex(/^\d{6}$/, "Invalid PIN Code"),
  aadhar: z.string().min(1, "Aadhar Number is required").length(12, "Aadhar must be 12 digits"),
  pan: z.string().min(1, "PAN Number is required").length(10, "PAN must be 10 characters"),
  gst: z.string().optional(),
  msme: z.string().optional(),
  bank: z.string().min(1, "Bank Name is required"),
  ifsc: z.string().min(1, "IFSC Code is required"),
  account: z.string().min(1, "Account Number is required"),
  cin: z.string().optional(),
});

const FileUploadForm = ({ reqId, onNext }) => {
  const { id } = useAuth();
  const [fileData, setFileData] = useState({
    aadhar_doc: null,
    pan_doc: null,
    gst_doc: null,
    cancelledCheque: null,
    selfie_doc: null,
  });
  const [uploadStatus, setUploadStatus] = useState({
    aadhar_doc: false,
    pan_doc: false,
    gst_doc: false,
    cancelledCheque: false,
    selfie_doc: false,
  });

  const getDocumentStatus = async () => {
    const response = await fetch(`${API_URL}/verification/documentStatus`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    const data = await response.json();
    setUploadStatus(data.message);
  }

  useEffect(()=>{
    getDocumentStatus()
  },[])

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFileData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const handleUpload = async (name) => {
    try {
      const key = `merchant/${id}/verificationDocs/${reqId}/${name}`;
      const urlResponse = await fetch(`${API_URL}/s3/putUrl`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: key, filetype: fileData[name].type }),
      });

      if (!urlResponse.ok) {
        throw new Error({message: "Failed to generate upload URL"});
      }

      const { uploadURL } = await urlResponse.json();

      const uploadRequest = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": fileData[name].type },
        body: fileData[name],
      });

      if (!uploadRequest.ok) {
        throw new Error({message: "Failed to upload file"});
      }

      const updateDocStatusRequest = await fetch(`${API_URL}/verification/documentStatus/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ name, key }),
      });

      if (!updateDocStatusRequest.ok) {
        throw new Error({message: "Failed to update document status"});
      }

      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        [name]: true,
      }));
      toast.success("Upload successful");
    } catch (error) {
      toast.error(`Error uploading ${name}: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadStatus.aadhar_doc || !uploadStatus.pan_doc || !uploadStatus.selfie_doc){
      toast.error("Please upload all required documents")
      return;
    }
    try{
        const request = await fetch(`${API_URL}/verification/submit`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: localStorage.getItem("token")
            }
        })
        const response = await request.json()
        if (response.success){
            toast.success(response.message)
            onNext()
        } else {
            toast.error(response.message)
        }
    } catch (error) {
        toast.error(`Error submitting verification form`)
    }
  }
  const files = [{
    name: "aadhar_doc",
    label: "Aadhar Card*"
  }, 
  {
    name: "pan_doc",
    label: "PAN Card*"
  },
  {
    name: "gst_doc",
    label: "GST Certificate"
  },
  {
    name: "cancelledCheque",
    label: "Cancelled Cheque"
  },
  {
    name: "selfie_doc",
    label: "Selfie Photo*"
  }
  ]

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }} onSubmit={handleSubmit} component={"form"}>
      <Typography variant="h5" align="center" gutterBottom>
        Upload Verification Documents
      </Typography>
      <Grid container spacing={2}>
        {files.map((doc, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Typography variant="subtitle1" gutterBottom>
              {doc.label}
            </Typography>
            <TextField
              type="file"
              id={doc.name}
              name={doc.name}
              variant="outlined"
              fullWidth
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => handleUpload(doc.name)}
              startIcon={<FileUpload />}
            >
              Upload
            </Button>
            {uploadStatus[doc.name] && (
              <Typography color="success.main" sx={{ mt: 1 }}>
                <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                Uploaded
              </Typography>
            )}
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        sx={{ mt: 3  }}
        >Submit</Button>
    </Box>
  );
};

const TextForm = ({ onNext }) => {
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
  const [errors, setErrors] = useState({});

  const fields = [
    { fieldId: "address", fieldTitle: "Address", required: true, helperText: "Enter your full address" },
    { fieldId: "state", fieldTitle: "State", required: true, helperText: "Enter your state" },
    { fieldId: "city", fieldTitle: "City", required: true, helperText: "Enter your city" },
    { fieldId: "pin", fieldTitle: "PIN Code", required: true, helperText: "Enter your PIN code" },
    { fieldId: "aadhar", fieldTitle: "Aadhar Number", required: true, helperText: "Enter your Aadhar number" },
    { fieldId: "pan", fieldTitle: "PAN Number", required: true, helperText: "Enter your PAN number" },
    { fieldId: "gst", fieldTitle: "GST Number", required: false, helperText: "Enter your GST number" },
    { fieldId: "msme", fieldTitle: "MSME Number", required: false, helperText: "Enter your MSME number (if applicable)" },
    { fieldId: "bank", fieldTitle: "Bank Name", required: true, helperText: "Enter your bank name" },
    { fieldId: "ifsc", fieldTitle: "IFSC Code", required: true, helperText: "Enter your bank IFSC code" },
    { fieldId: "account", fieldTitle: "Account Number", required: true, helperText: "Enter your bank account number" },
    { fieldId: "cin", fieldTitle: "CIN Number", required: false, helperText: "Enter your CIN number (if applicable)" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data using Zod schema
    const result = formSchema.safeParse(formData);

    if (result.success) {
      setErrors({}); // Clear previous errors

      // Proceed with the form submission
      const response = await fetch(
        `${API_URL}/verification/createIncompleteVerifyRequest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      toast.success(data.message);
      onNext();
    } else {
      // Set validation errors
      const validationErrors = result.error.formErrors.fieldErrors;
      setErrors(validationErrors);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
      className="border-gray-300 shadow-xl border-2 rounded-xl "
    >
      <Typography variant="h4" className="text-2xl sm:text-4xl lg:text-5xl">Verification Form</Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {fields.map((field, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <TextField
              label={field.fieldTitle}
              variant="outlined"
              name={field.fieldId}
              value={formData[field.fieldId]}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors[field.fieldId])}
              helperText={errors[field.fieldId] ? errors[field.fieldId][0] : field.helperText}
            />
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        sx={{ mt: 3, maxWidth: 300, bgcolor: 'black' }}
      >
        Submit
      </Button>
    </Box>
  );
};

const Verify = () => {  
  const navigate = useNavigate();  
  const {isAuthenticated ,verified, role} = useAuth()
  const [step, setStep] = useState(1);
  const [reqId, setReqId] = useState(null);
  const nextStep = () => setStep((prevStep) => prevStep + 1);

  // Only Merchants require verification
  const requiresVerification = role === USER_ROLES.MERCHANT;

  const incompleteRequest = async () => {
    const response = await checkIncompleteRequest();
    if (response.success){
        setReqId(response.message.reqId)
        setStep(2)
    }
  }

  const pendingRequest = async () => {
    const response = await checkPendingRequest();
    if (response.success){
        setStep(3)
    }
  }

  useEffect(()=>{
    if (!isAuthenticated){
        navigate('/login')
        return;
    }
    
    // 1. If already verified, redirect to dashboard
    if (verified) {
        navigate('/dashboard');
        return;
    }
    
    // 2. If authenticated but the role does NOT require verification (e.g., Admin Employee),
    // send them to the dashboard immediately.
    if (!requiresVerification) {
        navigate('/dashboard');
        return;
    }

    // If here: isAuthenticated=true, !verified, role=MERCHANT. Proceed with KYC forms.
    incompleteRequest()
    pendingRequest()
    
  },[isAuthenticated, verified, navigate, role, requiresVerification])

  // Prevent rendering forms if the user is redirecting or doesn't need verification
  if (!isAuthenticated || !requiresVerification || verified) {
      return null;
  }

  return (
    <Box
      sx={{
        // minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      {step === 1 && <TextForm onNext={incompleteRequest} />}
      {step === 2 && <FileUploadForm reqId={reqId} onNext={nextStep} />}
      {step === 3 && <div>Verification Request Submitted</div>}
    </Box>
  );
};

export default Verify;
