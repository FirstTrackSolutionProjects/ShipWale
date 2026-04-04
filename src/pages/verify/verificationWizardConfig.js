import { z } from "zod";

// JSON-like configuration for the verification wizard.
// All steps default to mandatory; set `enabled: false` on a step to disable/skip it.
export const VERIFICATION_WIZARD_CONFIG = Object.freeze({
  batchUploadSize: 5,
  steps: [
    {
      id: "personal",
      title: "Personal Data",
      enabled: true,
      mandatory: true,
      textFields: [
        {
          name: "address",
          label: "Address",
          required: true,
          helperText: "Enter your full address",
        },
        {
          name: "state",
          label: "State",
          required: true,
          helperText: "Enter your state",
        },
        {
          name: "city",
          label: "City",
          required: true,
          helperText: "Enter your city",
        },
        {
          name: "pin",
          label: "PIN Code",
          required: true,
          helperText: "Enter 6-digit PIN code",
        },
        {
          name: "bank",
          label: "Bank Name",
          required: true,
          helperText: "Enter your bank name",
        },
        {
          name: "ifsc",
          label: "IFSC Code",
          required: true,
          helperText: "Enter your bank IFSC code",
        },
        {
          name: "account",
          label: "Account Number",
          required: true,
          helperText: "Enter your bank account number",
        },
      ],
      fileFields: [
        {
          name: "selfie_doc",
          label: "Selfie Photo",
          required: true,
          helperText: "Upload a clear selfie photo",
          accept: "image/*",
        },
        {
          name: "cancelledCheque",
          label: "Cancelled Cheque",
          required: false,
          helperText: "Upload cancelled cheque (optional)",
          accept: "image/*,application/pdf",
        },
      ],
    },
    {
      id: "kyc",
      title: "KYC Data",
      enabled: true,
      mandatory: true,
      textFields: [
        {
          name: "aadhar",
          label: "Aadhar Number",
          required: true,
          helperText: "Enter your 12-digit Aadhar number",
        },
        {
          name: "pan",
          label: "PAN Number",
          required: true,
          helperText: "Enter your 10-character PAN",
        },
      ],
      fileFields: [
        {
          name: "aadhar_doc",
          label: "Aadhar Card",
          required: true,
          helperText: "Upload Aadhar card",
          accept: "image/*,application/pdf",
        },
        {
          name: "pan_doc",
          label: "PAN Card",
          required: true,
          helperText: "Upload PAN card",
          accept: "image/*,application/pdf",
        },
      ],
    },
    {
      id: "business",
      title: "Business Data",
      enabled: true,
      mandatory: true,
      textFields: [
        {
          name: "business_name",
          label: "Business Name",
          required: true,
          helperText: "Enter your business name",
        },
        {
          name: "gst",
          label: "GST Number",
          required: false,
          helperText: "Enter GST number (if applicable)",
        },
        {
          name: "msme",
          label: "MSME Number",
          required: false,
          helperText: "Enter MSME number (if applicable)",
        },
        {
          name: "cin",
          label: "CIN Number",
          required: false,
          helperText: "Enter CIN number (if applicable)",
        },
      ],
      fileFields: [
        {
          name: "gst_doc",
          label: "GST Certificate",
          required: false,
          helperText: "Upload GST certificate (optional)",
          accept: "image/*,application/pdf",
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      enabled: true,
      mandatory: true,
      textFields: [],
      fileFields: [],
    },
  ],
});

export const VERIFICATION_STEP_SCHEMAS = Object.freeze({
  personal: z.object({
    address: z.string().min(1, "Address is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    pin: z
      .string()
      .min(1, "PIN Code is required")
      .regex(/^\d{6}$/, "Invalid PIN Code"),
    bank: z.string().min(1, "Bank Name is required"),
    ifsc: z.string().min(1, "IFSC Code is required"),
    account: z.string().min(1, "Account Number is required"),
  }),
  kyc: z.object({
    aadhar: z
      .string()
      .min(1, "Aadhar Number is required")
      .regex(/^\d{12}$/, "Aadhar must be 12 digits"),
    pan: z
      .string()
      .min(1, "PAN Number is required")
      .length(10, "PAN must be 10 characters"),
  }),
  business: z.object({
    business_name: z.string().min(1, "Business Name is required"),
    gst: z.string().optional(),
    msme: z.string().optional(),
    cin: z.string().optional(),
  }),
  review: z.object({}),
});

export const getActiveVerificationSteps = (
  config = VERIFICATION_WIZARD_CONFIG
) => config.steps.filter((s) => s.enabled);

export const getAllWizardFieldNames = (
  config = VERIFICATION_WIZARD_CONFIG
) => {
  const names = new Set();
  for (const step of config.steps) {
    for (const field of step.textFields || []) names.add(field.name);
    for (const field of step.fileFields || []) names.add(field.name);
  }
  return Array.from(names);
};

export const getRequiredFileFieldNames = (
  config = VERIFICATION_WIZARD_CONFIG
) => {
  const required = [];
  for (const step of config.steps) {
    if (!step.enabled) continue;
    if (!step.mandatory) continue;
    for (const field of step.fileFields || []) {
      if (field.required) required.push(field.name);
    }
  }
  return required;
};

export const buildVerificationPayload = ({ values, uploadedFileKeys }) => {
  return {
    PERSONAL_DATA: {
      address: values.address,
      state: values.state,
      city: values.city,
      pin: values.pin,
      account: values.account,
      ifsc: values.ifsc,
      bank: values.bank,
      cancelledCheque: uploadedFileKeys.cancelledCheque || null,
      selfie_doc: uploadedFileKeys.selfie_doc,
    },
    KYC_DATA: {
      aadhar_number: values.aadhar,
      pan_number: values.pan,
      aadhar_doc: uploadedFileKeys.aadhar_doc,
      pan_doc: uploadedFileKeys.pan_doc,
    },
    BUSINESS_DATA: {
      business_name: values.business_name,
      gst: values.gst || null,
      gst_doc: uploadedFileKeys.gst_doc || null,
      msme: values.msme || null,
      cin: values.cin || null,
    },
  };
};
