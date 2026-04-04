import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import { USER_ROLES } from "../Constants";
import { useAuth } from "../context/AuthContext";
import checkPendingRequest from "../services/checkPendingRequest";
import getS3PutUrlService from "../services/s3Services/getS3PutUrlService";
import putObjectService from "../components/CustomComponents/s3Services/putObjectService";

import {
  VERIFICATION_STEP_SCHEMAS,
  VERIFICATION_WIZARD_CONFIG,
  buildVerificationPayload,
  getActiveVerificationSteps,
  getRequiredFileFieldNames,
} from "./verify/verificationWizardConfig";

const API_URL = import.meta.env.VITE_APP_API_URL;

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const createUploadSessionId = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const Verify = () => {
  const navigate = useNavigate();
  const { isAuthenticated, verified, role, id } = useAuth();

  const steps = useMemo(() => getActiveVerificationSteps(), []);

  const initialValues = useMemo(() => {
    const values = {};
    for (const step of VERIFICATION_WIZARD_CONFIG.steps) {
      for (const field of step.textFields || []) {
        values[field.name] = "";
      }
    }
    return values;
  }, []);

  const initialFiles = useMemo(() => {
    const files = {};
    for (const step of VERIFICATION_WIZARD_CONFIG.steps) {
      for (const field of step.fileFields || []) {
        files[field.name] = null;
      }
    }
    return files;
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [files, setFiles] = useState(initialFiles);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState("form"); // form | pending

  const validateStep = (stepId) => {
    const stepConfig = steps.find((s) => s.id === stepId);
    if (!stepConfig) return true;
    if (!stepConfig.mandatory) return true;

    const schema = VERIFICATION_STEP_SCHEMAS[stepId];
    const nextErrors = {};

    // Validate text fields
    if (schema) {
      const dataForStep = {};
      for (const field of stepConfig.textFields || []) {
        dataForStep[field.name] = values[field.name];
      }
      const result = schema.safeParse(dataForStep);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = issue.path?.[0];
          if (key) nextErrors[key] = issue.message;
        }
      }
    }

    // Validate file fields (required only)
    for (const field of stepConfig.fileFields || []) {
      if (!field.required) continue;
      if (!files[field.name]) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateAllMandatorySteps = () => {
    for (let index = 0; index < steps.length; index++) {
      const stepConfig = steps[index];
      if (stepConfig.id === "review") continue;
      if (!stepConfig.mandatory) continue;

      const ok = validateStep(stepConfig.id);
      if (!ok) {
        setActiveStep(index);
        return false;
      }
    }
    return true;
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleNext = () => {
    const stepId = steps[activeStep]?.id;
    if (stepId && stepId !== "review" && steps[activeStep]?.mandatory) {
      const ok = validateStep(stepId);
      if (!ok) return;
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const uploadAllSelectedFiles = async () => {
    const uploadSessionId = createUploadSessionId();

    const fileEntries = Object.entries(files).filter(([, file]) => Boolean(file));
    const batches = chunkArray(
      fileEntries,
      VERIFICATION_WIZARD_CONFIG.batchUploadSize
    );

    const uploadedFileKeys = {};
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(async ([fieldName, file]) => {
          const key = `merchant/${id}/verificationDocs/${uploadSessionId}/${fieldName}`;
          const uploadUrl = await getS3PutUrlService(key, file.type, true);
          await putObjectService(uploadUrl, file, file.type);
          return { fieldName, key };
        })
      );

      for (const result of batchResults) {
        uploadedFileKeys[result.fieldName] = result.key;
      }
    }

    return uploadedFileKeys;
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;

    // Validate all enabled + mandatory steps
    const allStepsOk = validateAllMandatorySteps();
    if (!allStepsOk) return;

    // Validate required files across enabled + mandatory steps
    const requiredFiles = getRequiredFileFieldNames();
    const missingFiles = requiredFiles.filter((name) => !files[name]);
    if (missingFiles.length) {
      const nextErrors = missingFiles.reduce((acc, name) => {
        acc[name] = "This file is required";
        return acc;
      }, {});
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      toast.error("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);
    try {
      toast.info("Uploading documents...");
      const uploadedFileKeys = await uploadAllSelectedFiles();

      const payload = buildVerificationPayload({
        values,
        uploadedFileKeys,
      });

      toast.info("Submitting verification request...");
      const response = await fetch(`${API_URL}/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.message || "Failed to submit verification request");
        return;
      }

      toast.success(data?.message || "Verification request submitted successfully");
      setView("pending");
    } catch (error) {
      toast.error("Failed to submit verification request");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (verified) {
      navigate("/dashboard");
      return;
    }

    (async () => {
      try {
        const pending = await checkPendingRequest();
        if (pending?.success) {
          setView("pending");
        }
      } catch {
        // ignore
      }
    })();
  }, [isAuthenticated, verified, navigate]);

  if (!isAuthenticated || verified) {
    return null;
  }

  if (view === "pending") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Verification Request Submitted</Typography>
      </Box>
    );
  }

  const currentStep = steps[activeStep];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          p: 3,
        }}
        className="border-gray-300 shadow-xl border-2 rounded-xl"
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Verification Form
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((s) => (
            <Step key={s.id}>
              <StepLabel>{s.title}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {currentStep?.id !== "review" ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {currentStep?.title}
            </Typography>

            <Grid container spacing={2}>
              {(currentStep?.textFields || []).map((field) => (
                <Grid item xs={12} md={6} key={field.name}>
                  <TextField
                    label={`${field.label}${field.required ? "*" : ""}`}
                    name={field.name}
                    value={values[field.name]}
                    onChange={handleTextChange}
                    fullWidth
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name] || field.helperText}
                  />
                </Grid>
              ))}

              {(currentStep?.fileFields || []).map((field) => (
                <Grid item xs={12} md={6} key={field.name}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {field.label}
                    {field.required ? "*" : ""}
                  </Typography>
                  <TextField
                    type="file"
                    name={field.name}
                    variant="outlined"
                    fullWidth
                    inputProps={{ accept: field.accept }}
                    onChange={handleFileChange}
                    error={Boolean(errors[field.name])}
                    helperText={
                      errors[field.name] ||
                      (files[field.name]?.name
                        ? files[field.name].name
                        : field.helperText)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review
            </Typography>

            <Grid container spacing={2}>
              {Object.entries(values).map(([key, value]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                    {key}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    {value || "-"}
                  </Typography>
                </Grid>
              ))}
              {Object.entries(files).map(([key, file]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                    {key}
                  </Typography>
                  <Typography sx={{ wordBreak: "break-word" }}>
                    {file?.name || "-"}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || isSubmitting}
            fullWidth
          >
            Back
          </Button>

          {currentStep?.id === "review" ? (
            <Button
              variant="contained"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              fullWidth
              sx={{ bgcolor: "black" }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
              fullWidth
              sx={{ bgcolor: "black" }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Verify;
