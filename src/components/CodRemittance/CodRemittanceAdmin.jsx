import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Box, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import convertToUTCISOString from '../../helpers/convertToUTCISOString';
import getCodRemittanceAdminService from '../../services/codRemittanceServices/getCodRemittanceAdmin.service';
import markCodRemittanceAsPaidByOrdersService from '../../services/codRemittanceServices/markCodRemittanceAsPaidByOrders.service';
import getS3PutUrlService from '../../services/s3Services/getS3PutUrlService';
import s3FileUploadService from '../../services/s3Services/s3FileUploadService';
import getPendingCodRemittanceAmountService from '../../services/codRemittanceServices/getPendingCodRemittanceAmount.service';
import getPaidCodRemittanceAmountService from '../../services/codRemittanceServices/getPaidCodRemittanceAmount.service';

const API_URL = import.meta.env.VITE_APP_API_URL;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const addPageNumber = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    pages.push({ number: pageNum, isCurrent: pageNum === currentPage });
  };

  addPageNumber(1);
  if (totalPages <= 7) {
    for (let i = 2; i <= totalPages; i++) addPageNumber(i);
  } else {
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push({ number: '...' });
    for (let i = start; i <= end; i++) addPageNumber(i);
    if (end < totalPages - 1) pages.push({ number: '...' });
    addPageNumber(totalPages);
  }

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
          currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {pages.map((page, idx) => (
        <button
          key={idx}
          onClick={() => page.number !== '...' && onPageChange(page.number)}
          className={`min-w-[30px] px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
            page.number === '...' ? 'cursor-default'
            : page.isCurrent ? 'bg-red-500 text-white'
            : 'bg-white hover:bg-gray-100 border'
          }`}
        >
          {page.number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
          currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
      </button>
    </div>
  );
};

const CodRemittanceAdmin = () => {
  const [filters, setFilters] = useState({
    orderId: '',
    merchant_email: '',
    merchant_name: '',
    status: '',
    serviceId: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const apiRef = useGridApiRef();
  const [selection, setSelection] = useState({ ids: new Set() });
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const totalAmount = useMemo(() => pendingAmount + paidAmount, [pendingAmount, paidAmount]);

  const selectedIds = useMemo(() => {
    if (apiRef.current) {
      return [...apiRef.current.getSelectedRows().keys()]
    }
    return [];
  }, [apiRef, selection]);

  useEffect(() => {
    console.log('Selected IDs:', selectedIds);
  }, [selectedIds]);

  // Dialog state for marking as paid
  const [dialogOpen, setDialogOpen] = useState(false);
  const [utrNo, setUtrNo] = useState('');
  const [utrDoc, setUtrDoc] = useState('');
  const [utrFile, setUtrFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const openMarkPaidDialog = () => {
    setSubmitError('');
    setUtrNo('');
    setUtrDoc('');
    setUtrFile(null);
    setIsUploading(false);
    setUploadError('');
    setDialogOpen(true);
  };

  const closeMarkPaidDialog = () => {
    if (isSubmitting || isUploading) return;
    setDialogOpen(false);
  };

  const sanitizeKey = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_/]+/g, '-')
      .replace(/-+/g, '-')
      .slice(-200);
  };

  const handleUtrFileChange = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setUploadError('');
    setUtrFile(file);
    try {
      // basic validations
      const maxSizeBytes = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSizeBytes) throw new Error('File size must be 15MB or less');
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) throw new Error('Only PDF or image files are allowed');

      setIsUploading(true);
      // Build S3 key
      const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
      const base = sanitizeKey(file.name.replace(/\.[^.]+$/, '')) || 'utr-doc';
      const key = `utr_docs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext ? '.' + ext : ''}`;

      // Request signed PUT URL and upload
      const putUrl = await getS3PutUrlService(key, file.type, true);
      await s3FileUploadService(putUrl, file, file.type);
      // Use the URL without query string to store
      setUtrDoc(key);
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload document');
      setUtrDoc('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitMarkPaid = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      const payload = {
        ord_ids: selectedIds,
        ...(utrNo.trim() ? { utr_no: utrNo.trim() } : {}),
        ...(utrDoc.trim() ? { utr_doc: utrDoc.trim() } : {}),
      };
      await markCodRemittanceAsPaidByOrdersService(payload);
      // Clear selection and refresh data
      if (apiRef.current) apiRef.current.setRowSelectionModel([]);
      setSelection([]);
      setDialogOpen(false);
      setUtrFile(null);
      setUtrDoc('');
      setUploadError('');
      fetchRows(page, filters);
    } catch (err) {
      setSubmitError(err?.message || 'Failed to mark as paid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services/active-shipments/domestic`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'Failed to fetch services');
      const svc = data?.services;
      if (Array.isArray(svc)) setServices(svc);
    } catch (e) {
      console.warn('Failed to fetch services', e);
    }
  };

  const fetchRows = async (usePage = page, useFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const startDate = useFilters.startDate
        ? convertToUTCISOString(new Date(useFilters.startDate).setHours(0, 0, 0, 0))
        : '';
      const endDate = useFilters.endDate
        ? convertToUTCISOString(new Date(useFilters.endDate).setHours(23, 59, 59, 999))
        : '';
      const payload = { ...useFilters, page: usePage, startDate, endDate };
      const data = await getCodRemittanceAdminService(payload);
      setRows(data?.rows || []);
      setTotalPages(data?.totalPages || 1);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();

    const fetchSummary = async () => {
      try {
        const [pendingRes, paidRes] = await Promise.all([
          getPendingCodRemittanceAmountService(),
          getPaidCodRemittanceAmountService(),
        ]);

        const extractAmount = (res) => {
          if (!res) return 0;
          return parseInt(res.data) || 0;
        };

        setPendingAmount(extractAmount(pendingRes));
        setPaidAmount(extractAmount(paidRes));
      } catch (e) {
        console.warn('Failed to fetch COD admin summary', e);
      }
    };

    fetchSummary();
  }, []);
  useEffect(() => { fetchRows(page, filters); }, [page]);
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // skip initial fetch triggered by filters on mount
    }
    const t = setTimeout(() => {
      // If already on page 1, just refetch; else move to page 1 and let the page effect fetch once
      if (page === 1) {
        fetchRows(1, filters);
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [filters]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  return (
    <>
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">COD Remittance (Admin)</h2>

      <Paper sx={{ width: '100%', p: 2, mb: 3 }}>
        <Box
          sx={{
            mb: 1,
            p: 2,
            bgcolor: 'red',
            borderRadius: 2,
            '& .MuiTextField-root': { bgcolor: 'background.paper', borderRadius: 1 },
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <Box display="flex" gap={1} sx={{ minWidth: 'fit-content' }}>
            <TextField
              label="Order ID"
              variant="outlined"
              size="small"
              name="orderId"
              value={filters.orderId}
              onChange={onFilterChange}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              label="Merchant Email"
              variant="outlined"
              size="small"
              name="merchant_email"
              value={filters.merchant_email}
              onChange={onFilterChange}
              sx={{ mr: 1, minWidth: '180px' }}
              InputLabelProps={{
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              label="Merchant Name"
              variant="outlined"
              size="small"
              name="merchant_name"
              value={filters.merchant_name}
              onChange={onFilterChange}
              sx={{ mr: 1, minWidth: '180px' }}
              InputLabelProps={{
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: '150px', mr: 1 }}>
              <InputLabel id="status-select-label" className="bg-white w-full">Status</InputLabel>
              <Select
                labelId="status-select-label"
                name="status"
                value={filters.status}
                onChange={onFilterChange}
                label="Status"
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: '150px', mr: 1 }}>
              <InputLabel id="service-select-label" className="bg-white w-full">Service</InputLabel>
              <Select
                labelId="service-select-label"
                name="serviceId"
                value={filters.serviceId}
                onChange={onFilterChange}
                label="Service"
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {services?.map((s) => (
                  <MenuItem key={s.service_id} value={s.service_id}>{s.service_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              size="small"
              name="startDate"
              value={filters.startDate}
              onChange={onFilterChange}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              label="End Date"
              type="date"
              size="small"
              name="endDate"
              value={filters.endDate}
              onChange={onFilterChange}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* COD summary tiles */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: 1, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
          <div className="text-xs font-semibold text-gray-600">Pending COD</div>
          <div className="text-lg font-bold">₹ {Number(pendingAmount).toFixed(2)}</div>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: 1, bgcolor: '#e0f2fe', border: '1px solid #bae6fd' }}>
          <div className="text-xs font-semibold text-gray-600">Paid COD</div>
          <div className="text-lg font-bold">₹ {Number(paidAmount).toFixed(2)}</div>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200, p: 2, borderRadius: 1, bgcolor: '#ecfdf3', border: '1px solid #bbf7d0' }}>
          <div className="text-xs font-semibold text-gray-600">Total COD</div>
          <div className="text-lg font-bold">₹ {Number(totalAmount).toFixed(2)}</div>
        </Box>
      </Box>

      {/* Action bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <div className="text-sm text-gray-600">Selected: {selectedIds.length}</div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={selectedIds.length === 0}
          onClick={openMarkPaidDialog}
        >
          Mark selected as PAID
        </Button>
      </Box>

      <div className="mt-2 bg-white rounded-md border" style={{ height: 600, width: '100%' }}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          loading={loading}
          hideFooter={true}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row?.ord_id}
          onRowSelectionModelChange={setSelection}
          sx={{
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
          columns={[
            { field: 'ord_id', headerName: 'Order ID', width: 130 },
            { field: 'awb', headerName: 'AWB', width: 150 },
            { field: 'service_name', headerName: 'Service', width: 160 },
            { field: 'fullName', headerName: 'Merchant Name', width: 180 },
            { field: 'email', headerName: 'Email', width: 200 },
            { field: 'phone', headerName: 'Phone', width: 150 },
            {
              field: 'amount', headerName: 'Amount', width: 140,
              renderCell: (params) => `₹ ${Number(params.value || 0).toFixed(2)}`
            },
            { field: 'status', headerName: 'Status', width: 130 },
            {
              field: 'utr_no', headerName: 'UTR No.', width: 180
            },
            {
              field: 'utr_doc', headerName: 'UTR Document', width: 180,
              renderCell: (params) => (
                <Button
                  disabled={!params.value}
                  onClick={() => params.value && window.open(`${import.meta.env.VITE_APP_BUCKET_URL}${params.value}`, '_blank', 'noopener,noreferrer')}
                  variant="contained"
                  color={params.value ? 'primary' : 'inherit'}
                  sx={{ borderRadius: 1 }}
                >
                  <span className='text-white'>DOCUMENT</span>
                </Button>
              )
            },
            {
              field: 'created_at', headerName: 'Created', width: 200,
              renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : ''
            },
            {
              field: 'updated_at', headerName: 'Updated', width: 200,
              renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : ''
            },
          ]}
        />
      </div>


      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
  </div>

  {/* Mark as PAID dialog */}
    <Dialog open={dialogOpen} onClose={closeMarkPaidDialog} fullWidth maxWidth="sm">
      <DialogTitle>Mark selected as PAID</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="UTR ID (optional)"
            value={utrNo}
            onChange={(e) => setUtrNo(e.target.value)}
            size="small"
          />
          <div>
            <label className="block text-sm font-medium mb-1">UTR Document (PDF/Image)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleUtrFileChange}
              disabled={isUploading || isSubmitting}
            />
            {isUploading && (
              <div className="text-sm text-red-600 mt-1">Uploading...</div>
            )}
            {uploadError && (
              <div className="text-sm text-red-600 mt-1">{uploadError}</div>
            )}
            {utrDoc && !isUploading && (
              <div className="text-xs text-green-700 mt-1 break-all">Uploaded: {utrDoc}</div>
            )}
          </div>
          {submitError ? (
            <div className="text-red-600 text-sm">{submitError}</div>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeMarkPaidDialog} disabled={isSubmitting || isUploading}>Cancel</Button>
        <Button onClick={handleSubmitMarkPaid} disabled={isSubmitting || isUploading} variant="contained" color="primary">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default CodRemittanceAdmin;


