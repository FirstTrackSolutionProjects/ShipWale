import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import getFilterStartDate from '../helpers/getFilterStartDate';
import getTodaysDate from '../helpers/getTodaysDate';
import convertToUTCISOString from '../helpers/convertToUTCISOString';
import getAllTransactionsAdminService from '../services/transactionServices/getAllTransactionsAdminService';

const PAGE_SIZE = 50; // backend admin endpoint uses 50

const columns = [
  { field: 'date', headerName: 'Date', flex: 1, valueGetter: p => p?.row?.date, renderCell: p => new Date(p.row.date).toLocaleString() },
  { field: 'type', headerName: 'Type', flex: 1 },
  { field: 'order_id', headerName: 'Order ID', flex: 1 },
  { field: 'payment_id', headerName: 'Payment ID', flex: 1, hide: true },
  { field: 'fullName', headerName: 'Merchant Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'businessName', headerName: 'Business', flex: 1 },
  { field: 'service_name', headerName: 'Service', flex: 1 },
  { field: 'amount', headerName: 'Amount', flex: 1, renderCell: p => {
      const v = Number(p.value);
      if (isNaN(v)) return '';
      const sign = (p.row.type === 'expense' || p.row.type === 'dispute_charge' || p.row.type === 'extra') ? '-' : '+';
      const cls = sign === '+' ? 'text-green-600' : 'text-red-600';
      return <span className={cls}>{sign}{Math.abs(v)}</span>;
    } },
  { field: 'remaining_balance', headerName: 'Balance After', flex: 1, renderCell: p => p.value != null ? Number(p.value) : '' },
  { field: 'reason', headerName: 'Reason', flex: 1 }
];

const AllTransactions = () => {
  // Data state
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // 1-based for backend

  // Filters
  const [filters, setFilters] = useState({
    type: 'all',
    order_id: '',
    merchant_email: '',
    merchant_name: '',
    merchant_business_name: '',
    startDate: getFilterStartDate(),
    endDate: getTodaysDate()
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(t);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getAllTransactionsAdminService({
        page,
        startDate: convertToUTCISOString(`${debouncedFilters.startDate}T00:00:00`),
        endDate: convertToUTCISOString(`${debouncedFilters.endDate}T23:59:59.999`),
        order_id: debouncedFilters.order_id,
        merchant_email: debouncedFilters.merchant_email,
        merchant_name: debouncedFilters.merchant_name,
        merchant_business_name: debouncedFilters.merchant_business_name,
        type: debouncedFilters.type
      });
      const incoming = data?.rows || [];
      // Ensure each row has an id (backend provides id for each select we constructed). Fallback composite.
      setRows(incoming.map((r, i) => ({ id: r.id || `${r.type}_${r.order_id || r.payment_id || i}_${r.date}`, ...r })));
      setRowCount(data?.totalRecords || 0);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedFilters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = useMemo(() => Math.ceil(rowCount / PAGE_SIZE) || 1, [rowCount]);

  // Pagination component (same as TransactionHistory)
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const addPage = (num) => pages.push({ number: num, isCurrent: num === currentPage });
    addPage(1);
    if (totalPages <= 7) {
      for (let i = 2; i < totalPages; i++) addPage(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) addPage(i);
        pages.push({ number: '...', isCurrent: false });
      } else if (currentPage >= totalPages - 3) {
        pages.push({ number: '...', isCurrent: false });
        for (let i = totalPages - 4; i < totalPages; i++) addPage(i);
      } else {
        pages.push({ number: '...', isCurrent: false });
        for (let i = currentPage - 1; i <= currentPage + 1; i++) addPage(i);
        pages.push({ number: '...', isCurrent: false });
      }
    }
    if (totalPages > 1) addPage(totalPages);
    return (
      <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>
        {pages.map((p, idx) => (
          <button
            key={idx}
            onClick={() => p.number !== '...' && onPageChange(p.number)}
            className={`min-w-[30px] px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${p.number === '...' ? 'cursor-default' : p.isCurrent ? 'bg-red-500 text-white' : 'bg-white hover:bg-gray-100 border'}`}
            disabled={p.number === '...'}
          >
            {p.number}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </button>
      </div>
    );
  };

  return (
    <div className='py-10 w-full flex flex-col items-center'>
      <div className='w-full max-w-7xl px-4 flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold text-center'>Admin Transactions</h1>
        <div className='bg-red-500 text-white p-4 rounded-lg space-y-4'>
          <div className='grid md:grid-cols-7 gap-3'>
            <select name='type' value={filters.type} onChange={handleFilterChange} className='p-2 rounded text-black bg-white'>
              <option value='all'>All Types</option>
              <option value='recharge'>Recharge</option>
              <option value='manual'>Manual Recharge</option>
              <option value='expense'>Expense</option>
              <option value='refund'>Refund</option>
              <option value='dispute_charge'>Dispute Charge</option>
              {/* <option value='extra'>Extra Charge</option> */}
            </select>
            <input name='order_id' value={filters.order_id} onChange={handleFilterChange} placeholder='Order ID' className='p-2 rounded text-black bg-white'/>
            <input name='merchant_email' value={filters.merchant_email} onChange={handleFilterChange} placeholder='Merchant Email' className='p-2 rounded text-black bg-white'/>
            <input name='merchant_name' value={filters.merchant_name} onChange={handleFilterChange} placeholder='Merchant Name' className='p-2 rounded text-black bg-white'/>
            <input name='merchant_business_name' value={filters.merchant_business_name} onChange={handleFilterChange} placeholder='Business Name' className='p-2 rounded text-black bg-white'/>
            <input type='date' name='startDate' value={filters.startDate} onChange={handleFilterChange} className='p-2 rounded text-black bg-white'/>
            <input type='date' name='endDate' value={filters.endDate} onChange={handleFilterChange} className='p-2 rounded text-black bg-white'/>
          </div>
        </div>
        {error && <div className='text-red-600 text-sm'>{error}</div>}
        <div style={{ width: '100%', background: 'white' }} className='rounded-lg border'>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            loading={loading}
            paginationMode='server'
            rowCount={rows.length === 0 ? 0 : rowCount}
            pageSizeOptions={[PAGE_SIZE]}
            initialState={{ pagination: { paginationModel: { pageSize: PAGE_SIZE, page: 0 } } }}
            pageSize={PAGE_SIZE}
            rowSelection={false}
            hideFooterPagination
            disableColumnMenu
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-overlayWrapper': { backgroundColor: '#fff' },
              '& .MuiDataGrid-virtualScrollerRenderZone': rows.length === 0 ? { opacity: 0 } : {}
            }}
          />
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default AllTransactions;
