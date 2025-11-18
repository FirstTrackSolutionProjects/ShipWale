import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { v4 } from "uuid";
import { MuiFileInput } from 'mui-file-input'
import CloseIcon from '@mui/icons-material/Close'
import { InputAdornment } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import checkPendingUpdateProfileRequest from "../services/checkPendingUpdateProfileRequest";

const API_URL = import.meta.env.VITE_APP_API_URL;

// Define the Zod validation schema
const formSchema = z.object({
  full_name: z.string().min(3, "Full Name is required and must be at least 3 characters long"),
  business_name: z.string().min(3, "Business Name is required and must be at least 3 characters long"),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pin: z.string().optional(),
  aadhar: z.string().optional(),
  pan: z.string().optional(),
  gst: z.string().optional(),
  msme: z.string().optional(),
  bank: z.string().optional(),
  ifsc: z.string().optional(),
  account: z.string().optional(),
  cin: z.string().optional(),
  aadhar_doc: z.string().optional(),
  pan_doc: z.string().optional(),
  gst_doc: z.string().optional(),
  cancelledCheque: z.string().optional(),
  selfie_doc: z.string().optional(),
}).refine((data) => (/^(?:[6-9]\d{9})?$/.test(data.phone)), {
  message: "Phone number should be 10 digits and must start with 6/7/8/9",
  path: ["phone"],
}).refine((data) => (!data.address.length) || (data.address.length >= 20 && data.address.length <= 255),{
  message: "Address should be between 20 and 255 characters",
  path: ["address"],
}).refine((data) => (!data.state.length) || (data.state.length >= 3 && data.state.length <= 100 ), {
  message: "State should be between 3 and 100 characters",
  path: ["state"],
}).refine((data) => (!data.city.length) || (data.city.length >= 3 && data.city.length <= 100 ), {
  message: "City should be between 3 and 100 characters",
  path: ["city"],
}).refine((data) => (/^(?:[1-9]\d{5})?$/.test(data.pin)), {
  message: "Invalid Pincode",
  path: ["pin"],
}).refine((data) => (/^(?:[1-9]\d{11})?$/.test(data.aadhar)), {
  message: "Invalid Aadhar Number",
  path: ["aadhar"],
}).refine((data) => (/^(?:[A-Z]{5}[0-9]{4}[A-Z]{1})?$/.test(data.pan)),{
  message: "Invalid PAN number (use capital letters)",
  path: ["pan"],
}).refine((data) => (/^(?:\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1})?$/.test(data.gst)), {
  message: "Invalid GST number",
  path: ["gst"],
}).refine((data) => (/^(UDYAM-[A-Z]{2}-\d{2}-\d{7})?$/.test(data.msme)),{
  message: "Invalid MSME number (use format UDYAM-XX-00-0000000)",
  path: ["msme"],
}).refine((data) => (/^(([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6}))?$/.test(data.cin)),{
  message: "Invalid CIN (use format U12345AB6784CDE123456)",
  path: ["cin"],
})

const TextForm = ({ id, onNext }) => {
  const [loadingState, setLoadingState] = useState(null);
  const [uploadCompleted, setUploadCompleted] = useState(null);
  const reqId = v4();
  const [formData, setFormData] = useState({
    req_id: reqId,
    full_name: "",
    business_name: "",
    phone: "",
    email: "",
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
    aadhar_doc: "",
    pan_doc: "",
    gst_doc: "",
    cancelledCheque: "",
    selfie_doc: "",
  });
  const [files, setFiles] = useState({
    aadhar_doc: null,
    pan_doc: null,
    gst_doc: null,
    cancelledCheque: null,
    selfie_doc: null,
  })
  const [errors, setErrors] = useState({});

  const fields = [
    { fieldId: "full_name", fieldTitle: "Full Name*", helperText: "Enter Full Name", currentValue:""},
    { fieldId: "business_name", fieldTitle: "Business Name*", helperText: "Enter business name"},
    { fieldId: "phone", fieldTitle: "Phone", helperText: "Enter your phone number"},
    { fieldId: "email", fieldTitle: "Email", helperText: "Email cannot be changed", disabled: true, placeholder: "adityakumar5155@gmail.com"},
    { fieldId: "address", fieldTitle: "Address", helperText: "Enter your full address" },
    { fieldId: "state", fieldTitle: "State", helperText: "Enter your state" },
    { fieldId: "city", fieldTitle: "City", helperText: "Enter your city" },
    { fieldId: "pin", fieldTitle: "PIN Code", helperText: "Enter your PIN code" },
    { fieldId: "aadhar", fieldTitle: "Aadhar Number", helperText: "Enter your Aadhar number" },
    { fieldId: "pan", fieldTitle: "PAN Number", helperText: "Enter your PAN number (use capital letters)" },
    { fieldId: "gst", fieldTitle: "GST Number", helperText: "Enter your GST number" },
    { fieldId: "msme", fieldTitle: "MSME Number", helperText: "Enter your MSME number (if applicable)" },
    { fieldId: "bank", fieldTitle: "Bank Name", helperText: "Enter your bank name" },
    { fieldId: "ifsc", fieldTitle: "IFSC Code", helperText: "Enter your bank IFSC code" },
    { fieldId: "account", fieldTitle: "Account Number", helperText: "Enter your bank account number" },
    { fieldId: "cin", fieldTitle: "CIN Number", helperText: "Enter your CIN number (if applicable)" },
    { fieldId: "aadhar_doc", fieldTitle : "Aadhar Document", helperText: "Upload your Aadhar", type: "file"},
    { fieldId: "pan_doc", fieldTitle : "PAN Document", helperText: "Upload your PAN", type: "file"},
    { fieldId: "gst_doc", fieldTitle : "GST Document", helperText: "Upload your GST Document", type: "file"},
    { fieldId: "cancelledCheque", fieldTitle : "Cancelled Cheque", helperText: "Upload your cancelled cheque", type: "file"},
    { fieldId: "selfie_doc", fieldTitle : "Selfie Document", helperText: "Upload your selfie", type: "file"},

  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (value, name) => {
      if (!value){
        setFiles((prevFiles) => ({ ...prevFiles, [name]: null }));
        return;
      }
      if (!['image/png','image/jpeg'].includes(value.type) && name=="selfie_doc"){
        toast.error("Only png, jpeg, jpg are supported");
        setFiles((prevFiles) => ({ ...prevFiles, [name]: null }));
        return;
      }
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(value.type) && name!="selfie_doc"){
        toast.error("Only png, jpeg, jpg, pdf are supported");
        setFiles((prevFiles) => ({ ...prevFiles, [name]: null }));
        return;
      }
      setFiles((prevFiles) => ({...prevFiles, [name]: value }));
  };

  const handleUpload = async (name) => {
    try {
      if (!files[name]) return;
      const key = `merchant/${id}/profileUpdateDocs/${reqId}/${name}`;
      const urlResponse = await fetch(`${API_URL}/s3/putUrl`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: key, filetype: files[name].type }),
      });
      
      if (!urlResponse.ok) {
        return { success: false, key: name };
      }
      
      const { uploadURL } = await urlResponse.json();
      const uploadRequest = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": files[name].type },
        body: files[name],
      });
      
      if (!uploadRequest.ok) {
        return { success: false, key: name };
      }
      
      return { success: true, key: name, value: key };
    } catch (error) {
      toast.error(`Error uploading ${name}: ${error.message}`);
      return { success: false, key: name };
    }
  };
  
  const uploadFiles = async (e) => {
    e.preventDefault();
    setUploadCompleted(null);
    setLoadingState('Uploading Files...');
    
    try {
      const uploadResults = await Promise.all(
        Object.keys(files).map((key) => handleUpload(key))
      );

      const successfulUploads = uploadResults.filter(result => result && result.success);
      const newFormData = { ...formData };
      
      successfulUploads.forEach(({ key, value }) => {
        newFormData[key] = value;
      });
      await new Promise(resolve => {
        setFormData(newFormData);
        resolve();
      });

      setUploadCompleted(true);
    } catch (error) {
      toast.error("Error submitting form: " + error.message);
    } finally {
      setLoadingState(null);
    }
  };

  useEffect(()=>{
    if (uploadCompleted){
      handleSubmit();
    }
  },[uploadCompleted])
  
  const handleSubmit = async () => {
    setLoadingState('Submitting Form...');
    
    try {
      const result = formSchema.safeParse(formData);
      if (result.success) {
        setErrors({}); // Clear previous errors
        console.log(formData);
        
        // Uncomment when ready to submit to API
        const response = await fetch(
          `${API_URL}/update-profile-requests`,
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
        console.log(data);
        if (data.success) {
        toast.success("Submitted Successfully");
        } else {
          toast.error("Error submitting form: " + data.message);
        }
        onNext();
      } else {
        // Set validation errors
        const validationErrors = result.error.formErrors.fieldErrors;
        setErrors(validationErrors);
      }
    } catch (error) {
      toast.error("Error submitting form: " + error.message);
    } finally {
      setLoadingState(null);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={uploadFiles}
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
      <Typography variant="h4" className="text-2xl sm:text-4xl lg:text-5xl">Profile Update Request</Typography>
      <Typography variant="h6" className="text-2xl sm:text-4xl lg:text-5xl">(Only fill fields you want to update)</Typography>


      <Grid container spacing={2} sx={{ mt: 2 }}>
        {fields.map((field, idx) => {
          if (field.type !== "file"){
            return (
              <Grid item xs={12} md={6} key={idx}>
              <TextField
                label={field.fieldTitle}
                variant="outlined"
                size="small"
                name={field.fieldId}
                value={formData[field.fieldId]}
                type={field.type}
                onChange={handleChange}
                disabled={field.disabled}
                fullWidth
                error={Boolean(errors[field.fieldId])}
                helperText={errors[field.fieldId] ? errors[field.fieldId][0] : field.helperText}
              />
              </Grid>
            )
          } else {
            return (
              <Grid item xs={12} sm={6} key={idx}>
              <MuiFileInput
                label={field.fieldTitle}
                size="small"
                helperText={errors[field.fieldId] ? errors[field.fieldId][0] : field.helperText}
                placeholder={'Select File'}
                id={field.fieldId}
                name={field.fieldId}
                onChange={(value) => handleFileChange(value, field.fieldId)}
                value={files[field.fieldId]}
                clearIconButtonProps={{
                  title: "Remove",
                  children: <CloseIcon fontSize="small" />
                }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
              </Grid>
            )
          }
        })}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={loadingState?true:false}
        fullWidth
        sx={{ mt: 3, maxWidth: 300, bgcolor: 'black' }}
      >
        {loadingState || 'Submit'}
      </Button>
    </Box>
  );
};

const UpdateProfileRequest = () => {  
  const { id } = useAuth();
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prevStep) => prevStep + 1);

  const pendingRequest = async () => {
    const response = await checkPendingUpdateProfileRequest();
    if (response.success){
        nextStep();
    }
  }

  useEffect(()=>{
    pendingRequest()
  },[])

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      {step === 1 && <TextForm id={id} onNext={nextStep} />}
      {step === 2 && <Box className={'h-[calc(100vh-64px)] w-full flex justify-center items-center'}>
        <Box>
          <Box>
            Update Profile Request is submitted successfully.
          </Box>
          <Box>
            Please wait for the action by the admin.
          </Box>
        </Box>
      </Box>}
    </Box>
  );
};

export default UpdateProfileRequest;
