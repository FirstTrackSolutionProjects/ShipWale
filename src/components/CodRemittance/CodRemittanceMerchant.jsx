import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import convertToUTCISOString from '../../helpers/convertToUTCISOString';
import getCodRemittanceMerchantService from '../../services/codRemittanceServices/getCodRemittanceMerchant.service';

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

const CodRemittanceMerchant = () => {
  const [filters, setFilters] = useState({
    orderId: '',
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

  const canSearch = useMemo(() => !loading, [loading]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services/active-shipments/domestic`,{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('token'),
        }
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'Failed to fetch services');
      const rows = data?.services;
      if (Array.isArray(rows)) setServices(rows);
    } catch (e) {
      console.warn('Failed to fetch services', e);
    }
  };

  const fetchRows = async (usePage = page, useFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const startDate = useFilters.startDate ? convertToUTCISOString(new Date(useFilters.startDate).setHours(0,0,0,0)) : '';
      const endDate = useFilters.endDate ? convertToUTCISOString(new Date(useFilters.endDate).setHours(23,59,59,999)) : '';
      const payload = { ...useFilters, page: usePage, startDate, endDate };
      const data = await getCodRemittanceMerchantService(payload);
      setRows(data?.rows || []);
      setTotalPages(data?.totalPages || 1);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);
  useEffect(() => { fetchRows(page, filters); }, [page]);
  // Debounce filters
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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">COD Remittance</h2>

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

      {error ? (
        <div className="text-red-600 mt-3">{error}</div>
      ) : null}

  <div className="mt-4 bg-white rounded-md border" style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          loading={loading}
          hideFooter={true}
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
  );
};

export default CodRemittanceMerchant;
