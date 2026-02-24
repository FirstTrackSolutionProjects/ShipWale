import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import getAllTransactionsMerchantService from '../services/transactionServices/getAllTransactionsMerchantService';
import getFilterStartDate from '../helpers/getFilterStartDate';
import getTodaysDate from '../helpers/getTodaysDate';
import convertToUTCISOString from '../helpers/convertToUTCISOString';
import DownloadIcon from '@mui/icons-material/Download';
import { IconButton } from '@mui/material';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import getAllTransactionsDataService from '../services/transactionServices/getAllTransactionDataService';

const PAGE_SIZE = 50;

const columns = [
    { field: 'date', headerName: 'Date', flex: 1, renderCell: (p) => new Date(p?.row?.date).toLocaleString() },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'order_id', headerName: 'Order ID', flex: 1 },
    { field: 'payment_id', headerName: 'Payment ID', flex: 1, hide: true },
    { field: 'service_name', headerName: 'Service', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1, renderCell: (p)=> p.value != null ? Number(p.value) : '' },
    { field: 'reason', headerName: 'Reason', flex: 1 }
];

const TransactionHistory = () => {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1); // server 1-based
    const [filters, setFilters] = useState({
        type: 'all',
        order_id: '',
        startDate: getFilterStartDate(),
        endDate: getTodaysDate()
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(()=>{
        const t = setTimeout(()=> setDebouncedFilters(filters), 500);
        return ()=> clearTimeout(t);
    },[filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const fetchData = useCallback(async ()=> {
        setLoading(true); setError(null);
        try {
            const data = await getAllTransactionsMerchantService({
                page,
                startDate: convertToUTCISOString(`${debouncedFilters.startDate}T00:00:00`),
                endDate: convertToUTCISOString(`${debouncedFilters.endDate}T23:59:59.999`),
                order_id: debouncedFilters.order_id,
                type: debouncedFilters.type
            });
            // Build a stable unique id; order_id can repeat across different types (e.g. expense & refund for same order)
            setRows(data?.rows || []);
            setRowCount(data?.totalRecords || 0);
        } catch (err) {
            setError(err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedFilters]);

    useEffect(()=> { fetchData(); }, [fetchData]);

    const totalPages = useMemo(()=> Math.ceil(rowCount / PAGE_SIZE) || 1, [rowCount]);

    // Advanced pagination component (mirrors UpdateOrder.jsx style)
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
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                </button>
                {pages.map((p, idx) => (
                    <button
                        key={idx}
                        onClick={() => p.number !== '...' && onPageChange(p.number)}
                        className={`min-w-[30px] px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
                            p.number === '...' ? 'cursor-default'
                            : p.isCurrent ? 'bg-blue-500 text-white'
                            : 'bg-white hover:bg-gray-100 border'
                        }`}
                        disabled={p.number === '...'}
                    >
                        {p.number}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
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
                <h1 className='text-2xl font-semibold text-center'>Transaction History</h1>
                <div className='bg-red-500 text-white p-4 rounded-lg space-y-4'>
                    <div className='grid md:grid-cols-5 gap-3'>
                        <select name='type' value={filters.type} onChange={handleFilterChange} className='p-2 rounded text-black bg-white'>
                            <option value='all'>All Types</option>
                            <option value='recharge'>Recharge</option>
                            <option value='manual'>Manual Recharge</option>
                            <option value='expense'>Expense</option>
                            <option value='refund'>Refund</option>
                            <option value='dispute_charge'>Dispute Charge</option>
                            {/* <option value='extra'>Extra Charge</option> */}
                            <option value='rto'>RTO Charge</option>
                        </select>
                        <input type='text' name='order_id' value={filters.order_id} onChange={handleFilterChange} placeholder='Order ID' className='p-2 rounded text-black bg-white'/>
                        <input type='date' name='startDate' value={filters.startDate} onChange={handleFilterChange} className='p-2 rounded text-black bg-white'/>
                        <input type='date' name='endDate' value={filters.endDate} onChange={handleFilterChange} className='p-2 rounded text-black bg-white'/>
                        <IconButton
                            onClick={async () => {
                              try {
                                const payload = {
                                  type: filters.type,
                                  order_id: filters.order_id,
                                  startDate: filters.startDate ? convertToUTCISOString(new Date(filters.startDate).setHours(0,0,0,0)) : '',
                                  endDate: filters.endDate ? convertToUTCISOString(new Date(filters.endDate).setHours(23,59,59,999)) : ''
                                }
                                const data = await getAllTransactionsDataService(payload);
                                const worksheet = XLSX.utils.json_to_sheet(data);
                                const workbook = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

                                // Generate filename with current date
                                const date = new Date().toISOString().split('T')[0];
                                XLSX.writeFile(workbook, `transaction_reports_${date}.xlsx`);
                              } catch (error) {
                                console.error('Download failed:', error);
                                toast.error(error?.message || 'Failed to download reports');
                              }
                            }}
                            sx={{ 
                              backgroundColor: 'white',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'grey.100',
                              },
                              minWidth: '40px'
                            }}
                        >
                          <DownloadIcon />
                        </IconButton>
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
                        // Prevent skeleton placeholder rows after filters return zero by forcing rowCount to 0
                        rowCount={rows.length === 0 ? 0 : rowCount}
                        pageSizeOptions={[PAGE_SIZE]}
                        initialState={{ pagination: { paginationModel: { pageSize: PAGE_SIZE, page: 0 } } }}
                        pageSize={PAGE_SIZE}
                        rowSelection={false}
                        hideFooterPagination
                        disableColumnMenu
                        disableRowSelectionOnClick
                        // Style tweaks to ensure no ghost rows bleed through the "No rows" overlay
                        sx={{
                            '& .MuiDataGrid-overlayWrapper': { backgroundColor: '#fff' },
                            '& .MuiDataGrid-virtualScrollerRenderZone': rows.length === 0 ? { opacity: 0 } : {},
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
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p)=> setPage(p)} />
            </div>
        </div>
    );
};

export default TransactionHistory;
