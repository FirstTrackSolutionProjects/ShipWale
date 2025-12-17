import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import getAllInternationalPendingRefundsService from '../../services/pendingRefundServices/getAllInternationalPendingRefundsService';
import internationalCreditRefundService from '../../services/pendingRefundServices/internationalCreditRefundService';

const InternationalPendingRefunds = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllInternationalPendingRefundsService();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefund = async (ord_id) => {
    setActionLoading((prev) => ({ ...prev, [ord_id]: true }));
    try {
      await internationalCreditRefundService(ord_id);
      toast.success('Refund credited');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to refund');
    } finally {
      setActionLoading((prev) => ({ ...prev, [ord_id]: false }));
    }
  };

  const columns = [
    { field: 'iid', headerName: 'Order ID', flex: 1 },
    { field: 'fullName', headerName: 'Merchant', flex: 1 },
    { field: 'awb', headerName: 'AWB', flex: 1 },
    { field: 'service_name', headerName: 'Service', flex: 2 },
    { field: 'expense_cost', headerName: 'Amount', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={!!actionLoading[params.row.iid]}
            onClick={() => handleRefund(params.row.iid)}
          >
            {actionLoading[params.row.iid] ? <CircularProgress size={18} /> : 'Refund'}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Pending Refunds</Typography>
      <Box sx={{ height: 500, width: '100%', background: 'white', borderRadius: 2, boxShadow: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.iid}
          loading={loading}
          disableSelectionOnClick
          pageSize={20}
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
          rowsPerPageOptions={[20, 50, 100]}
        />
      </Box>
    </Box>
  );
};

export default InternationalPendingRefunds;
