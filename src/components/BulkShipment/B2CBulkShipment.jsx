import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Box, Paper, Button, Typography, Alert, CircularProgress, TextField, IconButton } from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { toast } from 'react-toastify';
// FIX: Corrected relative path for helper function
import convertToUTCISOString from '../../helpers/convertToUTCISOString'; 

const API_URL = import.meta.env.VITE_APP_API_URL;

// --- LOGIC: constants.js (Configuration & Validation Rules) ---
const COLUMN_MAP = {
  'Order ID': { key: 'order', required: true, type: 'string', validate: (v) => v.length > 0 || 'Required' },
  'Warehouse ID': { key: 'wid', required: true, type: 'number', validate: (v) => !isNaN(Number(v)) || 'Must be a valid numeric ID' },
  'Payment Mode': { key: 'payMode', required: true, type: 'enum', options: ['COD', 'Pre-paid'], validate: (v) => ['COD', 'Pre-paid'].includes(String(v)) || 'Must be COD or Pre-paid' },
  'COD Amount': { key: 'cod', required: false, type: 'number', validate: (v, row) => (row['Payment Mode'] === 'COD' ? (Number(v) >= 1 || 'Required (>= 1) for COD') : true) },
  'Shipping Type': { key: 'shippingType', required: true, type: 'enum', options: ['Surface', 'Express'], validate: (v) => ['Surface', 'Express'].includes(String(v)) || 'Must be Surface or Express' },
  'Customer Name': { key: 'name', required: true, type: 'string' },
  'Customer Email': { key: 'email', required: true, type: 'string', validate: (v) => (String(v).includes('@') && String(v).includes('.')) || 'Invalid email format' },
  'Customer Phone': { key: 'phone', required: true, type: 'string', validate: (v) => /^\d{10}$/.test(String(v)) || 'Must be 10 digits' },
  'Shipping Address': { key: 'address', required: true, type: 'string' },
  'Shipping Pincode': { key: 'postcode', required: true, type: 'string', validate: (v) => /^\d{6}$/.test(String(v)) || 'Must be 6 digits' },
  'Shipping City': { key: 'city', required: true, type: 'string' },
  'Shipping State': { key: 'state', required: true, type: 'string' },
  'Length (cm)': { key: 'length', required: true, type: 'number', validate: (v) => Number(v) > 0 || 'Must be positive' },
  'Breadth (cm)': { key: 'breadth', required: true, type: 'number', validate: (v) => Number(v) > 0 || 'Must be positive' },
  'Height (cm)': { key: 'height', required: true, type: 'number', validate: (v) => Number(v) > 0 || 'Must be positive' },
  'Weight (kg)': { key: 'weight', required: true, type: 'number', validate: (v) => Number(v) > 0 || 'Must be positive' },
  'Shipment Value': { key: 'shipmentValue', required: true, type: 'number', validate: (v) => Number(v) >= 0 || 'Must be non-negative' },
  'Discount': { key: 'discount', required: false, type: 'number', default: 0 },
  'Seller GST': { key: 'gst', required: false, type: 'string' },
  'Is B2B': { key: 'isB2B', required: true, type: 'boolean', validate: (v) => ['TRUE', 'FALSE'].includes(String(v).toUpperCase()) || 'Must be TRUE or FALSE' },
  'Customer GSTIN': { key: 'Cgst', required: false, type: 'string', validate: (v, row) => (String(row['Is B2B']).toUpperCase() === 'TRUE' ? (String(v).length > 0 || 'Required for B2B') : true) },
  'Invoice Number': { key: 'invoiceNumber', required: false, type: 'string', validate: (v, row) => (String(row['Is B2B']).toUpperCase() === 'TRUE' ? (String(v).length > 0 || 'Required for B2B') : true) },
  'Invoice Date': { key: 'invoiceDate', required: false, type: 'date', validate: (v, row) => (String(row['Is B2B']).toUpperCase() === 'TRUE' ? (v && !isNaN(new Date(v))) || 'Required/Invalid YYYY-MM-DD date for B2B' : true) },
  'E-Waybill': { key: 'ewaybill', required: false, type: 'string', validate: (v, row) => (Number(row['Shipment Value']) >= 50000 ? (String(v).length > 0 || 'Required if Shipment Value >= 50000') : true) },
  'Pickup Date': { key: 'pickupDate', required: true, type: 'date', validate: (v) => v && !isNaN(new Date(v)) || 'Required/Invalid YYYY-MM-DD date' },
  'Pickup Time': { key: 'pickupTime', required: true, type: 'string', validate: (v) => /^\d{2}:\d{2}$/.test(v) || 'Must be HH:MM format' },
  'Customer Reference Number': { key: 'customer_reference_number', required: false, type: 'string', validate: (v) => String(v).length <= 15 || 'Max 15 characters' },
};

const SAMPLE_DATA = [
  {
    'Order ID': 'ORD1001', 'Warehouse ID': 1, 'Payment Mode': 'COD', 'COD Amount': 1500, 'Shipping Type': 'Express',
    'Customer Name': 'Anil Kumar', 'Customer Email': 'anil@test.com', 'Customer Phone': '9876543210',
    'Shipping Address': '45, Sector 12, Noida', 'Shipping Pincode': '201301', 'Shipping City': 'Noida', 'Shipping State': 'UP',
    'Length (cm)': 15, 'Breadth (cm)': 10, 'Height (cm)': 8, 'Weight (kg)': 1.2, 'Shipment Value': 1500, 'Discount': 0,
    'Seller GST': '', 'Is B2B': 'FALSE', 'Customer GSTIN': '', 'Invoice Number': 'INV/001', 'Invoice Date': '2024-06-15',
    'E-Waybill': '', 'Pickup Date': '2024-06-20', 'Pickup Time': '10:00', 'Customer Reference Number': 'CUSTREF1',
  },
  {
    'Order ID': 'ORD1002', 'Warehouse ID': 2, 'Payment Mode': 'Pre-paid', 'COD Amount': 0, 'Shipping Type': 'Surface',
    'Customer Name': 'Bela Singh', 'Customer Email': 'bela@test.com', 'Customer Phone': '8765432109',
    'Shipping Address': 'Plot 34, Gachibowli, Hyderabad', 'Shipping Pincode': '500032', 'Shipping City': 'Hyderabad', 'Shipping State': 'Telangana',
    'Length (cm)': 30, 'Breadth (cm)': 20, 'Height (cm)': 10, 'Weight (kg)': 3.5, 'Shipment Value': 55000, 'Discount': 100,
    'Seller GST': '36ABCDE1234Z5', 'Is B2B': 'TRUE', 'Customer GSTIN': '36FGHIJ5678K9', 'Invoice Number': 'INV/002', 'Invoice Date': '2024-06-15',
    'E-Waybill': 'EWAY000123456789', 'Pickup Date': '2024-06-21', 'Pickup Time': '15:30', 'Customer Reference Number': 'CUSTREF2',
  },
];


// --- LOGIC: fileHandlers.js ---

const convertCellDateToISO = (excelDate) => {
  if (typeof excelDate === 'number') {
    const date = XLSX.SSF.parse_date_code(excelDate);
    const jsDate = new Date(Date.UTC(date.y, date.m - 1, date.d));
    return jsDate.toISOString().split('T')[0];
  }
  return String(excelDate);
}

const generateSampleExcel = () => {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_DATA);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shipments');
  XLSX.writeFile(wb, 'Shipwale_Domestic_Bulk_Shipment_Sample.xlsx');
};

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        // Use raw: false for parsing strings/dates
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, raw: false }); 
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Header: 1 means the first row is headers
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
        
        if (json.length < 2) { // Only headers or empty file
          resolve([]); 
          return;
        }

        const headers = json[0].map(h => String(h).trim());
        const rows = json.slice(1);

        const parsedData = rows.map((rowArr, excelIndex) => {
          const rowObj = {
             // Store the original Excel row index (Row 2 in Excel is index 0 in array)
             excelId: excelIndex + 2, 
          };
          headers.forEach((header, index) => {
            let value = rowArr[index];
            const colDef = COLUMN_MAP[header];

            if (colDef) {
              if (colDef.type === 'date' && value) {
                value = convertCellDateToISO(value);
              }
              if (value === undefined || value === null) {
                 rowObj[header] = '';
              } else {
                 // Ensure all inputs are treated as strings initially for validation
                 rowObj[header] = String(value).trim(); 
              }
            } else {
              rowObj[header] = String(value ?? '').trim();
            }
          });
          return rowObj;
        });
        
        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}. Ensure it is a valid format.`));
      }
    };
    // FIX: Using the error object in the rejection message
    reader.onerror = (err) => reject(new Error(`Error reading file: ${err.message || 'Unknown error during file read.'}`));
    reader.readAsArrayBuffer(file);
  });
};

// --- LOGIC: validationService.js ---

const validateData = (data) => {
  const errors = [];
  const requiredHeaders = Object.keys(COLUMN_MAP).filter(col => COLUMN_MAP[col].required);
  const availableHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const requiredHeaderKeys = Object.keys(COLUMN_MAP);

  // 1. Check for missing required headers
  const missingHeaders = requiredHeaders.filter(h => !availableHeaders.includes(h));
  if (missingHeaders.length > 0) {
    errors.push({ row: 'Header', column: 'N/A', message: `Missing required columns: ${missingHeaders.join(', ')}`, errorId: 'HEADER_ERROR' });
    return { valid: false, errors, validatedData: [] };
  }
  
  // 2. Validate row data
  const validatedData = data.map((row) => {
    const excelId = row.excelId; // Get the original Excel row ID
    const rowErrors = [];
    const processedRow = {};

    requiredHeaderKeys.forEach((header) => {
      const def = COLUMN_MAP[header];
      let value = row[header] !== undefined ? row[header] : '';
      const { key, required, type, validate } = def;

      let processedValue = value;
      let error = null;
      
      try {
        // Standardize Value based on Type
        if (type === 'number') {
          const cleanedValue = String(value).replace(/,/g, '').trim();
          processedValue = Number(cleanedValue);
          if (value !== '' && isNaN(processedValue)) {
            error = 'Must be a valid number.';
          } else if (value === '' && !required) {
             processedValue = def.default !== undefined ? def.default : '';
          }
        } else if (type === 'boolean') {
          processedValue = String(value).toUpperCase() === 'TRUE';
        } else if (type === 'string' || type === 'enum' || type === 'date') {
          processedValue = String(value).trim();
        }

        // Run required check
        if (required && (processedValue === '' || processedValue === undefined || (type === 'number' && isNaN(processedValue)) || (type === 'boolean' && String(value).trim() === '') )) {
          error = `${header} is required.`;
        }

        // Run specific validation
        if (!error && validate) {
          // Pass the original (unprocessed) row for context-dependent validation (e.g., COD amount check)
          const validationResult = validate(processedValue, row); 
          if (validationResult !== true) {
            error = validationResult;
          }
        }
        
      } catch (e) {
        error = e.message || 'Validation failed during processing.';
      }

      if (error) {
        rowErrors.push({ row: excelId, column: header, message: error, errorId: `${excelId}-${header}` });
      }

      // Store processed value (or default if optional and empty)
      if (processedValue === '' && def.default !== undefined && !required) {
          processedRow[key] = def.default;
      } else {
          processedRow[key] = processedValue;
      }
    });

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    }
    return processedRow;
  });

  return {
    valid: errors.length === 0,
    errors,
    validatedData,
  };
};

const convertToBackendPayload = (validatedData) => {
  return validatedData.map((data) => {
    const isB2B = String(data.isB2B).toUpperCase() === 'TRUE';
    // Combine date and time, and convert to ISO standard using the helper
    const pickupDateTime = convertToUTCISOString(`${data.pickupDate}T${data.pickupTime}:00`);
    
    return {
      ord_id: data.order,
      wid: Number(data.wid),
      payMode: data.payMode,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      addressType: 'home',
      postcode: data.postcode,
      city: data.city,
      state: data.state,
      country: 'India',
      Baddress: data.address,
      BaddressType: 'home',
      Bpostcode: data.postcode,
      Bcity: data.city,
      Bstate: data.state,
      Bcountry: 'India',
      same: true,
      shippingType: data.shippingType,
      // Use the converted full ISO string
      pickupDate: pickupDateTime, 
      pickupTime: data.pickupTime, // Keep separate for clarity/legacy fields if needed
      shipmentValue: Number(data.shipmentValue),
      discount: Number(data.discount) || 0,
      cod: Number(data.cod) || 0,
      gst: data.gst || '',
      Cgst: data.Cgst || '',
      isB2B: isB2B,
      ewaybill: data.ewaybill || '',
      invoiceNumber: data.invoiceNumber || '',
      invoiceDate: data.invoiceDate || '',
      invoiceAmount: Number(data.shipmentValue), 
      insurance: false, 
      customer_reference_number: data.customer_reference_number || '',
      
      boxes: [{
        box_no: 1,
        length: Number(data.length),
        breadth: Number(data.breadth),
        height: Number(data.height),
        weight: Number(data.weight),
        weight_unit: 'kg', 
        quantity: 1
      }],
      orders: [{
        box_no: 1,
        product_name: `Bulk Item - ${data.order}`,
        product_quantity: 1,
        selling_price: Number(data.shipmentValue),
        tax_in_percentage: 0
      }],
    };
  });
};


// --- UI Component: UploadSection.jsx ---
const UploadSection = ({ step, file, fileInputRef, handleFileChange, handleDownloadSample }) => (
    <Paper sx={{ p: 4, textAlign: 'center', boxShadow: 3, border: '2px dashed #fcd3d3' }}>
        {step === 'LOADING' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress color="error" sx={{ mb: 2 }} />
                <Typography variant="h6">Processing File...</Typography>
                <Typography variant="body2" color="textSecondary">Validating structure and data. This may take a moment.</Typography>
            </Box>
        ) : (
            <>
                <Typography variant="h6" gutterBottom>Upload Domestic Bulk Shipment File</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Please upload your `.xlsx` or `.xls` file following the provided format.
                </Typography>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <Button
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current.click()}
                    sx={{ mr: 2, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                >
                    Choose File
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadSample}
                    sx={{ color: '#ef4444', borderColor: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                >
                    Download Sample
                </Button>
                {file && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{file.name}</Typography>}
            </>
        )}
    </Paper>
);

// --- UI Component: ErrorSummary.jsx ---
const ErrorSummary = ({ errors, onTraceError }) => {
    const downloadReport = () => {
        if (errors.length === 0) return toast.info("No errors to report.");
        
        const reportData = errors.map(err => ({
            'Excel Row': err.row,
            'Field Name': err.column,
            'Error Reason': err.message,
        }));

        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Error Report');
        XLSX.writeFile(wb, 'Shipwale_Bulk_Shipment_Error_Report.csv');
        toast.info("Error report downloaded.");
    };

    return (
        <Box sx={{ mt: 3, p: 2, border: '1px solid #fca5a5', borderRadius: 1, bgcolor: '#fef2f2' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold" color="error">
                    Detailed Errors ({errors.length})
                </Typography>
                <Button 
                    size="small" 
                    onClick={downloadReport} 
                    startIcon={<DownloadIcon />} 
                    variant="text" 
                    color="error"
                >
                    Export Report (CSV)
                </Button>
            </Box>
            
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
                {errors.map((err, index) => (
                    <Box 
                        key={index} 
                        sx={{ 
                            p: 0.5, 
                            cursor: 'pointer', 
                            '&:hover': { bgcolor: '#fce7e7' },
                            borderRadius: 0.5
                        }}
                        onClick={() => onTraceError(err.row, err.column)}
                    >
                        <Typography variant="body2" color="error">
                            <span style={{ fontWeight: 'bold' }}>Row {err.row}</span> (Column "{err.column}"): {err.message}
                            <ArrowDownwardIcon sx={{ fontSize: 14, ml: 1, color: '#ef4444' }} />
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};


// --- UI Component: DataGridPreview.jsx (Handles Grid, Filtering, Row Numbers, Scroll, Inline Validation) ---

const DataGridPreview = ({ 
    parsedData, 
    validationErrors, 
    handleTraceError, 
    focusedCell,
    setGlobalFilter,
    globalFilter,
    rows
}) => {
    const apiRef = useGridApiRef();

    // Trace error handler wrapper (standard logic)
    const traceErrorHandler = (excelId, column) => {
        const dataGridRowId = rows.find(row => row.excelId === excelId)?.id; 
        
        if (dataGridRowId) {
            const rowIndex = apiRef.current.getRowIndex(dataGridRowId);
            const colIndex = apiRef.current.getColumnIndex(column);
            
            apiRef.current.scrollToIndexes({
                rowIndex,
                colIndex
            });
            
            handleTraceError(dataGridRowId, column);
        } else {
            toast.warn(`Row ${excelId} not visible due to current filtering/sorting.`);
        }
    };
    
    // Custom filter model and isRowVisible logic (standard logic)
    const filterModel = useMemo(() => {
        if (!globalFilter) return { items: [] };
        return {
            items: [{ 
                id: 9999, 
                field: 'globalFilter', 
                value: globalFilter, 
                operator: 'contains' 
            }]
        };
    }, [globalFilter]);
    
    const isRowVisible = useCallback((params) => {
        if (!globalFilter) return true;
        const lowerCaseFilter = globalFilter.toLowerCase();
        for (const key in params.row) {
            if (key !== 'id' && key !== 'excelId' && String(params.row[key]).toLowerCase().includes(lowerCaseFilter)) {
                return true;
            }
        }
        return false;
    }, [globalFilter]);
    
    // Define Grid Columns and calculate minWidth dynamically
    const { gridColumns, minWidth } = useMemo(() => {
        if (parsedData.length === 0) return { gridColumns: [], minWidth: 0 };
        
        const orderedHeaders = Object.keys(COLUMN_MAP); 
        let totalWidth = 0; 

        const getColumnWidth = (header) => {
            let width = 200; 
            if (['Shipping Address', 'Customer Email', 'Customer GSTIN', 'Invoice Number', 'E-Waybill'].includes(header)) {
                width = 250; 
            } else if (['Order ID', 'Warehouse ID', 'Weight (kg)', 'Discount', 'Payment Mode', 'COD Amount', 'Is B2B'].includes(header)) {
                width = 140; 
            }
            return width;
        };
        
        // Base Columns
        const baseColumns = orderedHeaders.map(header => {
            const isRequired = COLUMN_MAP[header]?.required;
            const width = getColumnWidth(header);
            totalWidth += width; 

            return {
                field: header, 
                headerName: header + (isRequired ? ' *' : ''),
                width: width,
                sortable: true,
                renderCell: (params) => {
                    const error = validationErrors.find(e => e.row === params.row.excelId && e.column === header);
                    const isFocused = focusedCell?.id === params.id && focusedCell?.field === header;
                    
                    return (
                        <Box
                            sx={{
                                p: 0.5,
                                borderRadius: 0.5,
                                border: error ? '1px solid red' : isFocused ? '2px solid orange' : 'none',
                                bgcolor: error ? '#fee2e2' : isFocused ? '#fff3e0' : 'inherit',
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
                                }
                            }}
                            title={error ? `Error: ${error.message}` : params.value}
                        >
                            {params.value}
                        </Box>
                    );
                }
            }
        });

        // 1. Dynamic Row Numbering Column (Row)
        const rowNumberColumn = {
            field: '__rowNumber__',
            headerName: 'Row',
            width: 70,
            sortable: false,
            filterable: false,
            // FIX: Ensure apiRef is referenced correctly for visible row index
            valueGetter: (params) => {
                const id = params?.id;
                // If apiRef or ID isn't ready, return an empty string
                if (!id || !apiRef.current) return ''; 
                
                // This retrieves the index relative to the visible, sorted rows.
                const visibleIndex = apiRef.current.getRowIndexRelativeToVisibleRows(id);
                
                return visibleIndex !== -1 ? visibleIndex + 1 : ''; 
            },
            renderCell: (params) => {
                 const hasError = validationErrors.some(e => e.row === params.row.excelId);
                 const displayValue = params.value || ''; 
                 return (
                      <Typography sx={{ fontWeight: 'bold' }} color={hasError ? 'error' : 'initial'}>
                         {displayValue} {/* FIX: Use the value returned by valueGetter */}
                      </Typography>
                 );
            }
        };
        totalWidth += 70;
        
        // 2. Status Column
        const statusColumn = {
            field: '__status__',
            headerName: 'Status',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const hasError = validationErrors.some(e => e.row === params.row.excelId);
                const statusText = hasError ? 'Error' : 'Valid';
                return (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 'bold', 
                            color: hasError ? 'error.main' : 'success.main',
                            backgroundColor: hasError ? '#fee2e2' : '#f0fdf4',
                            borderRadius: 1,
                            p: 0.5,
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        {statusText}
                    </Typography>
                );
            }
        };
        totalWidth += 100;

        // 3. Original Excel Row Index
        const originalIndexColumn = {
            field: 'excelId',
            headerName: 'Original Excel Row',
            width: 120, 
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                 <Typography variant="caption" color="textSecondary">
                    ({params.value})
                 </Typography>
            )
        };
        totalWidth += 120; 

        // Final ordered columns: Row, Status, Original Index, Data...
        const finalColumns = [rowNumberColumn, statusColumn, originalIndexColumn, ...baseColumns];
        
        return { gridColumns: finalColumns, minWidth: totalWidth };

    }, [parsedData, validationErrors, focusedCell, apiRef]); 

    return (
        <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            
            {/* Global Filtering Input (omitted for brevity) */}
            <TextField
                variant="outlined"
                size="small"
                placeholder="Global Search across all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                    endAdornment: globalFilter && (
                        <IconButton size="small" onClick={() => setGlobalFilter('')}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    ),
                    sx: { mb: 2 }
                }}
            />

            {/* Data Grid Container */}
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    minHeight: 300, 
                    width: '100%', 
                    overflowX: 'auto', 
                }}
            >
                <DataGrid
                    apiRef={apiRef}
                    rows={rows} 
                    columns={gridColumns}
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 25 },
                        },
                    }}
                    disableRowSelectionOnClick
                    getRowId={(row) => `data-row-${row.excelId}`} 
                    
                    filterModel={filterModel}
                    isRowVisible={isRowVisible}
                    
                    sx={{
                        // FIX 1: Reduced buffer size to prevent trailing blank column
                        minWidth: `${minWidth + 1}px`, 
                        height: '100%', 
                        border: '1px solid #000',
                        borderRadius: 0,
                        '& .MuiDataGrid-columnHeaders': {
                          borderBottom: '1px solid #000',
                          backgroundColor: '#A34757',
                          color: '#FFF',
                        },
                        '& .MuiDataGrid-columnHeader': {
                          backgroundColor: '#A34757',
                          fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
                          borderRight: '1px solid #000',
                        },
                        '& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-cell:first-of-type': {
                          borderLeft: '1px solid #000',
                        },
                        '& .MuiDataGrid-row': {
                          borderBottom: '1px solid #000',
                        },
                    }}
                />
            </Box>
            
            <ErrorSummary errors={validationErrors} onTraceError={traceErrorHandler} />
            
        </Box>
    );
  
};

// --- Main Component: BulkShipment.jsx ---

const BulkShipment = () => {
  const [step, setStep] = useState('UPLOAD'); 
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validatedPayload, setValidatedPayload] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [focusedCell, setFocusedCell] = useState(null); // State for visual error tracing
  const fileInputRef = useRef(null);

  // Rows filtered by the global search term
  const filteredRows = useMemo(() => {
    if (!globalFilter) {
        // Map the parsed data for the DataGrid using a synthetic ID (required by DataGrid)
        return parsedData.map((row) => ({ id: `data-row-${row.excelId}`, ...row }));
    }

    const lowerCaseFilter = globalFilter.toLowerCase();
    
    // Perform manual filtering based on all stringifiable fields
    return parsedData
        .filter(row => {
            for (const key in row) {
                if (key !== 'id' && key !== 'excelId' && String(row[key]).toLowerCase().includes(lowerCaseFilter)) {
                    return true;
                }
            }
            return false;
        })
        // Map the filtered results to DataGrid format
        .map((row) => ({ id: `data-row-${row.excelId}`, ...row }));

  }, [parsedData, globalFilter]);

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Only .xlsx or .xls files are supported.');
      return;
    }

    setFile(uploadedFile);
    setStep('LOADING');
    setGlobalFilter(''); // Clear filter on new upload

    try {
      const rawData = await parseExcel(uploadedFile);
      if (rawData.length === 0) {
        toast.error('The uploaded file is empty or contains no data rows.');
        handleRemoveFile();
        return;
      }

      const { valid, errors, validatedData } = validateData(rawData);
      setParsedData(rawData);
      setValidationErrors(errors);

      if (valid) {
        const backendPayload = convertToBackendPayload(validatedData);
        setValidatedPayload(backendPayload);
        setStep('PREVIEW');
        toast.success(`${validatedData.length} orders validated successfully. Ready to submit.`);
      } else {
        setValidatedPayload([]); 
        setStep('PREVIEW'); 
        toast.error(`Validation failed for ${errors.length} item(s). Please fix and re-upload.`);
      }

    } catch (error) {
      toast.error(error.message || 'An error occurred during file processing.');
      handleRemoveFile();
    } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
        }
    }
  };
  
  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setValidatedPayload([]);
    setGlobalFilter('');
    setFocusedCell(null);
    setStep('UPLOAD');
  }, []);
  
  const handleTraceError = useCallback((dataGridRowId, column) => {
    setFocusedCell({ id: dataGridRowId, field: column });
    // Clear focus after highlighting
    setTimeout(() => setFocusedCell(null), 3000);
  }, []);

  const handleSubmitBulk = async () => {
    if (validationErrors.length > 0 || validatedPayload.length === 0) {
      toast.error('Cannot submit due to validation errors or empty payload.');
      return;
    }
    
    setStep('SUBMITTING');
    
    try {
      const response = await fetch(`${API_URL}/order/domestic/bulk/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming Auth token is stored in localStorage
          'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        },
        body: JSON.stringify(validatedPayload),
      });

      // Handle non-2xx responses generically
      if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        const successCount = result.results?.filter(r => r.success).length || validatedPayload.length;
        const failedResults = result.results?.filter(r => r.success === false) || [];
        const failedCount = failedResults.length;
        
        toast.success(`Bulk submission complete. ${successCount} orders created.`);
        if (failedCount > 0) {
            toast.warn(`${failedCount} orders failed server-side processing. Check console for details.`);
            console.error("Server-side bulk submission failures:", failedResults);
        }

        handleRemoveFile();
      } else {
        toast.error(result.message || 'Bulk submission failed due to a server error.');
        setStep('PREVIEW');
      }

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred during bulk submission.');
      setStep('PREVIEW');
    }
  };

  // --- Render Sections ---

  const renderPreview = () => (
    <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>File Preview: {file?.name}</Typography>
      
      {/* Validation Summary Alert */}
      {validationErrors.length > 0 ? (
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#fef2f2' }}>
          <Typography fontWeight="bold">{validationErrors.length} validation errors found across {parsedData.length} total entries.</Typography>
          Please fix the highlighted cells, or check the detailed error list below.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 2, bgcolor: '#f0fdf4' }}>
          All {validatedPayload.length} entries passed validation. Ready to submit.
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSubmitBulk}
          disabled={validationErrors.length > 0 || validatedPayload.length === 0 || step === 'SUBMITTING'}
          sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
        >
          {step === 'SUBMITTING' ? 'Submitting...' : `Submit ${validatedPayload.length} Valid Orders`}
        </Button>
        <Button
          variant="outlined"
          onClick={handleRemoveFile}
          disabled={step === 'SUBMITTING'}
        >
          Remove File / Re-upload
        </Button>
      </Box>

      {/* Data Grid and Error Summary (Takes up remaining height) */}
      <DataGridPreview
        parsedData={parsedData}
        validationErrors={validationErrors}
        handleTraceError={handleTraceError}
        focusedCell={focusedCell}
        setGlobalFilter={setGlobalFilter}
        globalFilter={globalFilter}
        rows={filteredRows} // Pass the filtered data set
      />
      
    </Box>
  );

  return (
    // Outer container: Full Viewport Height, allowing vertical scroll if content exceeds screen height
    <Box 
        sx={{ 
            height: '100vh', 
            width: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 2, 
            boxSizing: 'border-box',
            overflowY: 'auto', // Main container handles vertical scroll
            overflowX: 'hidden',
        }}
    >
      <Box sx={{ width: '100%', maxWidth: 1600, px: 2, flexShrink: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          Domestic Bulk Shipment
        </Typography>
      </Box>

      {/* Content Area - Flex Grow to take remaining space, handling content inside */}
      <Paper 
          sx={{ 
              width: '100%', 
              maxWidth: 1600, 
              flexGrow: 1, // Allows Paper to expand
              minHeight: '80vh', 
              display: 'flex', 
              flexDirection: 'column', 
              p: 4, 
              boxShadow: 3 
          }}
      >
        {step === 'UPLOAD' || step === 'LOADING' ? (
          <UploadSection 
            step={step} 
            file={file} 
            fileInputRef={fileInputRef} 
            handleFileChange={handleFileChange} 
            handleDownloadSample={generateSampleExcel} 
          />
        ) : renderPreview()}

      </Paper>
    </Box>
  );
};

export default BulkShipment;
