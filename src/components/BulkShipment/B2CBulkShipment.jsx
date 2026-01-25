import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
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
const COLUMN_NAME_MAP = {
  WAREHOUSE_ID: '*Warehouse ID',
  PICKUP_DATE: '*Pickup Date (YYYY-MM-DD)',
  PICKUP_TIME: '*Pickup Time (HH:MM)',
  CUSTOMER_REF: 'Customer Reference Number',
  PAYMENT_MODE: '*Payment Mode (cod/pre-paid)',
  COD_AMOUNT: 'COD Amount',
  SHIPPING_TYPE: '*Shipping Type (surface/express)',
  CUSTOMER_NAME: '*Customer Name',
  CUSTOMER_EMAIL: '*Customer Email',
  CUSTOMER_PHONE: '*Customer Phone',
  SHIPPING_ADDRESS: '*Shipping Address (Max 100 Char)',
  SHIPPING_ADDRESS_TYPE: '*Shipping Address Type (home/office)',
  SHIPPING_PINCODE: '*Shipping Pincode',
  SHIPPING_CITY: '*Shipping City',
  SHIPPING_STATE: '*Shipping State',
  LENGTH: '*Length (cm)',
  BREADTH: '*Breadth (cm)',
  HEIGHT: '*Height (cm)',
  WEIGHT: '*Weight (kg)',
  ITEM_NAMES: '*Item Name (Comma Separated)',
  ITEM_QUANTITIES: '*Item Quantity (Comma Separated)',
  ITEM_UNIT_PRICES: '*Item Unit Price (Comma Separated)',
  SHIPMENT_VALUE: '*Shipment Value',
  E_WAYBILL: 'E-Waybill (For Shipment Value more than ₹49999)',
}
const COLUMN_MAP = {
  [COLUMN_NAME_MAP.WAREHOUSE_ID]: {
    key: 'wid',
    required: true,
    type: 'number',
    width: 100,
    validate: (v) => !isNaN(Number(v)) || 'Must be a valid numeric ID',
  },
  [COLUMN_NAME_MAP.PICKUP_DATE]: {
    key: 'pickupDate',
    required: true,
    type: 'date',
    width: 150,
    validate: (v) => (v && !isNaN(new Date(v))) || 'Required/Invalid YYYY-MM-DD date',
  },
  [COLUMN_NAME_MAP.PICKUP_TIME]: {
    key: 'pickupTime',
    required: true,
    type: 'string',
    width: 120,
    validate: (v) => /^\d{2}:\d{2}$/.test(String(v)) || 'Must be HH:MM format',
  },
  [COLUMN_NAME_MAP.CUSTOMER_REF]: {
    key: 'customer_reference_number',
    required: false,
    type: 'string',
    width: 180,
    validate: (v) => String(v).length <= 15 || 'Max 15 characters',
  },
  [COLUMN_NAME_MAP.PAYMENT_MODE]: {
    key: 'payMode',
    required: true,
    type: 'enum',
    width: 150,
    options: ['COD', 'Pre-paid'],
    validate: (v) => ['COD', 'PRE-PAID'].includes(String(v).toUpperCase()) || 'Must be COD or Pre-paid',
  },
  [COLUMN_NAME_MAP.COD_AMOUNT]: {
    key: 'cod',
    required: false,
    type: 'number',
    width: 120,
    validate: (v, row) => (
      String(row[COLUMN_NAME_MAP.PAYMENT_MODE]).toUpperCase() === 'COD'
        ? (Number(v) >= 1 || 'Required (>= 1) for COD')
        : true
    ),
  },
  [COLUMN_NAME_MAP.SHIPPING_TYPE]: {
    key: 'shippingType',
    required: true,
    type: 'enum',
    width: 300,
    options: ['Surface', 'Express'],
    validate: (v) => ['SURFACE', 'EXPRESS'].includes(String(v).toUpperCase()) || 'Must be Surface or Express',
  },
  [COLUMN_NAME_MAP.CUSTOMER_NAME]: {
    key: 'name',
    required: true,
    type: 'string',
    width: 200,
  },
  [COLUMN_NAME_MAP.CUSTOMER_EMAIL]: {
    key: 'email',
    required: true,
    type: 'string',
    width: 200,
    validate: (v) => (String(v).includes('@') && String(v).includes('.')) || 'Invalid email format',
  },
  [COLUMN_NAME_MAP.CUSTOMER_PHONE]: {
    key: 'phone',
    required: true,
    type: 'string',
    width: 150,
    validate: (v) => /^\d{10}$/.test(String(v)) || 'Must be 10 digits',
  },
  [COLUMN_NAME_MAP.SHIPPING_ADDRESS]: {
    key: 'address',
    required: true,
    type: 'string',
    width: 300,
    validate: (v) => String(v).length <= 100 || 'Max 100 characters',
  },
  [COLUMN_NAME_MAP.SHIPPING_ADDRESS_TYPE]: {
    key: 'addressType',
    required: true,
    type: 'enum',
    options: ['home', 'office'],
    width: 180,
    validate: (v) => ['HOME', 'OFFICE'].includes(String(v).toUpperCase()) || 'Must be home or office',
  },
  [COLUMN_NAME_MAP.SHIPPING_PINCODE]: {
    key: 'postcode',
    required: true,
    type: 'string',
    width: 120,
    validate: (v) => /^\d{6}$/.test(String(v)) || 'Must be 6 digits',
  },
  [COLUMN_NAME_MAP.SHIPPING_CITY]: {
    key: 'city',
    required: true,
    type: 'string',
    width: 150,
  },
  [COLUMN_NAME_MAP.SHIPPING_STATE]: {
    key: 'state',
    required: true,
    type: 'string',
    width: 150,
  },
  [COLUMN_NAME_MAP.LENGTH]: {
    key: 'length',
    required: true,
    type: 'number',
    width: 120,
    validate: (v) => Number(v) > 0 || 'Must be positive',
  },
  [COLUMN_NAME_MAP.BREADTH]: {
    key: 'breadth',
    required: true,
    type: 'number',
    width: 120,
    validate: (v) => Number(v) > 0 || 'Must be positive',
  },
  [COLUMN_NAME_MAP.HEIGHT]: {
    key: 'height',
    required: true,
    type: 'number',
    width: 120,
    validate: (v) => Number(v) > 0 || 'Must be positive',
  },
  [COLUMN_NAME_MAP.WEIGHT]: {
    key: 'weight',
    required: true,
    type: 'number',
    width: 120,
    validate: (v) => Number(v) > 0 || 'Must be positive',
  },
  [COLUMN_NAME_MAP.ITEM_NAMES]: {
    key: 'itemNames',
    required: true,
    type: 'string',
    width: 200,
  },
  [COLUMN_NAME_MAP.ITEM_QUANTITIES]: {
    key: 'itemQuantities',
    required: true,
    type: 'string',
    width: 200,
  },
  [COLUMN_NAME_MAP.ITEM_UNIT_PRICES]: {
    key: 'itemUnitPrices',
    required: true,
    type: 'string',
    width: 200,
  },
  [COLUMN_NAME_MAP.SHIPMENT_VALUE]: {
    key: 'shipmentValue',
    required: true,
    type: 'number',
    width: 150,
    validate: (v) => Number(v) >= 0 || 'Must be non-negative',
  },
  [COLUMN_NAME_MAP.E_WAYBILL]: {
    key: 'ewaybill',
    required: false,
    type: 'string',
    width: 250,
    validate: (v, row) => (
      Number(row[COLUMN_NAME_MAP.SHIPMENT_VALUE]) >= 50000
        ? (String(v).length > 0 || 'Required if Shipment Value >= 50000')
        : true
    ),
  },
};

const HEADER_ALIASES = {
  'Warehouse ID': '*Warehouse ID',
  'Pickup Date': '*Pickup Date (YYYY-MM-DD)',
  'Pickup Time': '*Pickup Time (HH:MM)',
  'Payment Mode': '*Payment Mode (cod/pre-paid)',
  'Shipping Type': '*Shipping Type (surface/express)',
  'Customer Name': '*Customer Name',
  'Customer Email': '*Customer Email',
  'Customer Phone': '*Customer Phone',
  'Shipping Address': '*Shipping Address (Max 100 Char)',
  '*Shipping Address Type (home/office)': '*Shipping Address Type (home/office)',
  'Shipping Pincode': '*Shipping Pincode',
  'Shipping City': '*Shipping City',
  'Shipping State': '*Shipping State',
  'Length (cm)': '*Length (cm)',
  'Breadth (cm)': '*Breadth (cm)',
  'Height (cm)': '*Height (cm)',
  'Weight (kg)': '*Weight (kg)',
  'Item Name': '*Item Name (Comma Separated)',
  'Item Quantity': '*Item Quantity (Comma Separated)',
  'Item Unit Price': '*Item Unit Price (Comma Separated)',
  'Shipment Value': '*Shipment Value',
  'E-Waybill': 'E-Waybill (For Shipment Value more than ₹49999)',
};

const SAMPLE_DATA = [
  {
    '*Warehouse ID': 1, 
    '*Pickup Date (YYYY-MM-DD)': '2024-06-20', 
    '*Pickup Time (HH:MM)': '10:00', 
    'Customer Reference Number': 'CUSTREF1',
    '*Payment Mode (cod/pre-paid)': 'cod', 
    'COD Amount': 1500, 
    '*Shipping Type (surface/express)': 'express',
    '*Customer Name': 'Anil Kumar', 
    '*Customer Email': 'anil@test.com', 
    '*Customer Phone': '9876543210',
    '*Shipping Address (Max 100 Char)': '45, Sector 12, Noida', 
    '*Shipping Address Type (home/office)': 'home',
    '*Shipping Pincode': '201301', 
    '*Shipping City': 'Noida', 
    '*Shipping State': 'UP',
    '*Length (cm)': 15, 
    '*Breadth (cm)': 10, 
    '*Height (cm)': 8, 
    '*Weight (kg)': 1.2, 
    '*Item Name (Comma Separated)': 'Item1, Item2',
    '*Item Quantity (Comma Separated)': '1, 2',
    '*Item Unit Price (Comma Separated)': '100, 200',
    '*Shipment Value': 1500,
    'E-Waybill (For Shipment Value more than ₹49999)': '',
  },
  {
    '*Warehouse ID': 2, 
    '*Pickup Date (YYYY-MM-DD)': '2024-06-19', 
    '*Pickup Time (HH:MM)': '14:00', 
    'Customer Reference Number': 'CUSTREF1',
    '*Payment Mode (cod/pre-paid)': 'Pre-paid', 
    'COD Amount': 0, 
    '*Shipping Type (surface/express)': 'surface',
    '*Customer Name': 'Anil Kumar', 
    '*Customer Email': 'anil@test.com', 
    '*Customer Phone': '9876543210',
    '*Shipping Address (Max 100 Char)': '45, Sector 12, Noida', 
    '*Shipping Address Type (home/office)': 'home',
    '*Shipping Pincode': '201301', 
    '*Shipping City': 'Noida', 
    '*Shipping State': 'UP',
    '*Length (cm)': 15, 
    '*Breadth (cm)': 10, 
    '*Height (cm)': 8, 
    '*Weight (kg)': 1.2, 
    '*Item Name (Comma Separated)': 'Item1, Item2',
    '*Item Quantity (Comma Separated)': '1, 2',
    '*Item Unit Price (Comma Separated)': '100, 200',
    '*Shipment Value': 50000,
    'E-Waybill (For Shipment Value more than ₹49999)': 'ABCDEFGH',
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
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, raw: false }); 
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
        
        if (json.length < 2) { 
          resolve([]); 
          return;
        }

        const headers = json[0].map(h => String(h).trim());
        const rows = json.slice(1);

        const parsedData = rows.map((rowArr, excelIndex) => {
          const rowObj = {
             id: excelIndex + 2, 
          };

          headers.forEach((rawHeader, index) => {
            const header = HEADER_ALIASES[rawHeader] || rawHeader;
            let value = rowArr[index];
            const colDef = COLUMN_MAP[header];

            if (colDef) {
              if (colDef.type === 'date' && value) {
                value = convertCellDateToISO(value);
              }
              if (value === undefined || value === null) {
                 rowObj[header] = '';
              } else {
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
    const excelId = row.id; 
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
    const pickupDateTime = convertToUTCISOString(`${data.pickupDate}T${data.pickupTime}:00`);
    const customerRef = data.customer_reference_number || '';

    return {
      ord_id: customerRef,
      wid: Number(data.wid),
      payMode: data.payMode,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      addressType: data.addressType || 'home',
      postcode: data.postcode,
      city: data.city,
      state: data.state,
      country: 'India',
      Baddress: data.address,
      BaddressType: data.addressType || 'home',
      Bpostcode: data.postcode,
      Bcity: data.city,
      Bstate: data.state,
      Bcountry: 'India',
      same: true,
      shippingType: data.shippingType,
      pickupDate: pickupDateTime,
      pickupTime: data.pickupTime,
      shipmentValue: Number(data.shipmentValue),
      // discount removed (defaults to 0 on backend if needed, or excluded if unused)
      cod: Number(data.cod) || 0,
      gst: '',
      Cgst: '',
      isB2B: false,
      ewaybill: data.ewaybill || '',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceAmount: Number(data.shipmentValue),
      insurance: false,
      customer_reference_number: customerRef,

      boxes: [{
        box_no: 1,
        length: Number(data.length),
        breadth: Number(data.breadth),
        height: Number(data.height),
        weight: Number(data.weight),
        weight_unit: 'kg',
        quantity: 1,
      }],
      orders: [{
        box_no: 1,
        product_name: `Bulk Item - ${customerRef}`,
        product_quantity: 1,
        selling_price: Number(data.shipmentValue),
        tax_in_percentage: 0,
      }],
    };
  });
};


// --- UI Component: UploadSection.jsx ---
const UploadSection = ({ step, file, fileInputRef, handleFileChange, handleDownloadSample }) => (
    <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', boxShadow: 3, border: '2px dashed #fcd3d3' }}>
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
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 2, 
                        flexDirection: { xs: 'column', sm: 'row' } // Responsive stack for buttons
                    }}
                >
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
                        sx={{ mr: { xs: 0, sm: 2 }, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
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
                </Box>
                {file && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{file.name}</Typography>}
            </>
        )}
    </Paper>
);

// --- UI Component: ErrorSummary.jsx (No changes needed) ---
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
                            <span style={{ fontWeight: 'bold' }}>Row {err.row-1}</span> (Column "{err.column}"): {err.message}
                            <ArrowDownwardIcon sx={{ fontSize: 14, ml: 1, color: '#ef4444' }} />
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};


// --- UI Component: DataGridPreview.jsx ---

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

    const traceErrorHandler = (excelId, column) => {
        const dataGridRowId = rows.find(row => row.id === excelId)?.id; 
        
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
            if (key !== 'id' && String(params.row[key]).toLowerCase().includes(lowerCaseFilter)) {
                return true;
            }
        }
        return false;
    }, [globalFilter]);
    
    const { gridColumns } = useMemo(() => {
        if (parsedData.length === 0) return { gridColumns: [] };
        
        const orderedHeaders = Object.keys(COLUMN_MAP); 
        
        const baseColumns = orderedHeaders.map(header => {
            const width = COLUMN_MAP[header]?.width || 150;

            return {
                field: header, 
                headerName: header,
                minWidth: width,
                sortable: true,
                renderCell: (params) => {
                    const error = validationErrors.find(e => e.row === params.row.id && e.column === header);
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
            renderCell: (params) => {
                 const hasError = validationErrors.some(e => e.row === params.row.id);
                 
                 const visibleRowIndex = apiRef.current.getRowIndexRelativeToVisibleRows(params.id);
                 const displayValue = visibleRowIndex !== -1 ? visibleRowIndex + 1 : ''; 

                 return (
                      <Typography sx={{ fontWeight: 'bold' }} color={hasError ? 'error' : 'initial'}>
                         {displayValue} 
                      </Typography>
                 );
            }
        };
        
        // 2. Status Column
        const statusColumn = {
            field: '__status__',
            headerName: 'Status',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const hasError = validationErrors.some(e => e.row === params.row.id);
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

        // 3. Original Excel Row Index
        const originalIndexColumn = {
            field: 'id',
            headerName: 'Id',
            width: 120, 
            sortable: false,
            filterable: false,
            renderCell: (params) => (params.value-1)
        };

        const finalColumns = [originalIndexColumn, statusColumn, ...baseColumns];
        
        return { gridColumns: finalColumns };

    }, [parsedData, validationErrors, focusedCell, apiRef]); 

    return (
        <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            
            {/* Global Filtering Input: responsive padding if needed, but width is 100% */}
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

            {/* Data Grid Container: Crucial for horizontal scroll on mobile */}
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
                    getRowId={(row) => `${row.id}`} 
                    
                    filterModel={filterModel}
                    isRowVisible={isRowVisible}
                    
                    sx={{
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
  const [focusedCell, setFocusedCell] = useState(null); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Validated Payload:", JSON.stringify(validatedPayload, null, 2));
    console.log("Parsed Data:", JSON.stringify(parsedData, null, 2));
  }, [validatedPayload, parsedData]);

  const filteredRows = useMemo(() => {
    if (!globalFilter) {
        return parsedData.map((row) => ({ id: `${row.id}`, ...row }));
    }

    const lowerCaseFilter = globalFilter.toLowerCase();
    
    return parsedData
        .filter(row => {
            for (const key in row) {
                if (key !== 'id' && String(row[key]).toLowerCase().includes(lowerCaseFilter)) {
                    return true;
                }
            }
            return false;
        })
        .map((row) => ({ id: `${row.id}`, ...row }));

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
    setGlobalFilter(''); 

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
            fileInputRef.current.value = ''; 
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        },
        body: JSON.stringify(validatedPayload),
      });

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

      {/* Action Buttons: Responsive stack applied here */}
      <Box 
        sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' } // Stack on mobile
        }}
      >
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

      {/* Data Grid and Error Summary */}
      <DataGridPreview
        parsedData={parsedData}
        validationErrors={validationErrors}
        handleTraceError={handleTraceError}
        focusedCell={focusedCell}
        setGlobalFilter={setGlobalFilter}
        globalFilter={globalFilter}
        rows={filteredRows} 
      />
      
    </Box>
  );

  return (
    // Outer container: Added responsive padding, adjusted height/width handling
    <Box 
        sx={{ 
            minHeight: '100vh', 
            width: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: { xs: 1, sm: 2, md: 4 }, 
            boxSizing: 'border-box',
            overflowY: 'auto', 
            overflowX: 'hidden',
        }}
    >
      <Box sx={{ width: '100%', maxWidth: 1600, px: { xs: 1, sm: 2 }, flexShrink: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          Domestic Bulk Shipment
        </Typography>
      </Box>

      {/* Content Area - Uses responsive padding */}
      <Paper 
          sx={{ 
              width: '100%', 
              maxWidth: 1600, 
              flexGrow: 1, 
              minHeight: { xs: '60vh', md: '80vh' }, 
              display: 'flex', 
              flexDirection: 'column', 
              p: { xs: 2, sm: 3, md: 4 }, 
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