import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import getAllPendingRefundsService from '../../services/pendingRefundServices/getAllPendingRefundsService';
import creditRefundService from '../../services/pendingRefundServices/creditRefundService';
import { toast } from 'react-toastify';

const PendingRefunds = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPendingRefundsService();
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
      await creditRefundService(ord_id);
      toast.success('Refund credited');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to refund');
    } finally {
      setActionLoading((prev) => ({ ...prev, [ord_id]: false }));
    }
  };

  const columns = [
    { field: 'ord_id', headerName: 'Order ID', flex: 1 },
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
            disabled={!!actionLoading[params.row.ord_id]}
            onClick={() => handleRefund(params.row.ord_id)}
          >
            {actionLoading[params.row.ord_id] ? <CircularProgress size={18} /> : 'Refund'}
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
          getRowId={(row) => row.ord_id}
          loading={loading}
          disableSelectionOnClick
          pageSize={20}
          sx={{
            border: '1px solid #000',
            borderRadius: 0,
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '1px solid #000',
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

export default PendingRefunds;
