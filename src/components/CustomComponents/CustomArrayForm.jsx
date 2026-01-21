import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomForm from "./CustomForm";

const CustomArrayForm = forwardRef(({ fields, setFields, required, onChange, viewMode, existingData = [] }, ref) => {
  const [forms, setForms] = useState(() => existingData);

  useImperativeHandle(ref, () => ({
    formsData: forms,
    addForm: handleAddForm,
    removeForm: handleRemoveForm,
    updateForm: updateFormData,
    setForms: (newForms) => {
      setForms(newForms);
      onChange?.(newForms);
    }
  }));

  useEffect(() => {
    console.log(fields)
  },[])

  // Add useEffect to handle existingData changes
  useEffect(() => {
    if (Array.isArray(existingData) && existingData.length > 0) {
      setForms(existingData);
      onChange?.(existingData);
    }
  }, [existingData]);

  const updateFormData = (index, data) => {
    const newForms = [...forms];
    newForms[index] = data;
    setForms(newForms);
    onChange?.(newForms);
  };
  const handleAddForm = () => {
    const currentForms = forms || [];
    const newForms = [...currentForms, {}];
    setForms(newForms);
    onChange?.(newForms);
  };
  const handleRemoveForm = (index) => {
    if (required && forms.length <= 1) return; // Keep at least one form if required
    const newForms = forms.filter((_, i) => i !== index);
    setForms(newForms);
    onChange?.(newForms);
  };
  return (
    <Stack spacing={3}>
      {forms.map((form, index) => (
        <Box key={index} sx={{ position: 'relative', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <CustomForm
            fields={fields}
            setFields={setFields}
            existingData={form}
            viewMode={viewMode}
            onChange={(data) => updateFormData(index, data)}
          />
          <Box sx={{ position: 'absolute', right: 8, bottom: -16, display: 'flex', gap: 1 }}>
            {(forms.length > required && !viewMode) && (
              <IconButton 
                size="small" 
                onClick={() => handleRemoveForm(index)}
                sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    
        {
          !viewMode && (
            <IconButton 
              size="small" 
              className="w-8 h-8"
              onClick={handleAddForm}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <AddIcon />
            </IconButton>
          )
        }
    </Stack>
  );
});

export default CustomArrayForm;