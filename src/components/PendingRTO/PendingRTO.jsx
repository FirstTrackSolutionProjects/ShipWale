import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import getAllPendingRTOsService from '@/services/rtoServices/getAllPendingRTOService';
import processPendingRTOService from '@/services/rtoServices/processPendingRTOService';
import { toast } from 'react-toastify';

const PendingRTO = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedOrdId, setSelectedOrdId] = useState(null);
  const [rtoAmount, setRtoAmount] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPendingRTOsService();
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

  const openProcessDialog = (ord_id) => {
    setSelectedOrdId(ord_id);
    setRtoAmount('');
    setProcessDialogOpen(true);
  };

  const closeProcessDialog = () => {
    setProcessDialogOpen(false);
    setSelectedOrdId(null);
    setRtoAmount('');
  };

  const handleProcessConfirm = async () => {
    if (!selectedOrdId) return;

    const amountNumber = Number(rtoAmount);
    if (!Number.isFinite(amountNumber)) {
      toast.error('Enter a valid RTO amount');
      return;
    }
    if (amountNumber < 0) {
      toast.error('RTO amount cannot be negative');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [selectedOrdId]: true }));
    try {
      await processPendingRTOService({ ord_id: selectedOrdId, rto_amount: amountNumber });
      toast.success('RTO processed successfully');
      closeProcessDialog();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to process RTO');
    } finally {
      setActionLoading((prev) => ({ ...prev, [selectedOrdId]: false }));
    }
  };

  const columns = [
    { field: 'ord_id', headerName: 'Order ID', flex: 1 },
    { field: 'fullName', headerName: 'Merchant', flex: 1 },
    { field: 'awb', headerName: 'AWB', flex: 1 },
    { field: 'service_name', headerName: 'Service', flex: 2 },
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
            onClick={() => openProcessDialog(params.row.ord_id)}
          >
            {actionLoading[params.row.ord_id] ? <CircularProgress size={18} /> : 'Process'}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Pending RTOs</Typography>
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

      <Dialog open={processDialogOpen} onClose={closeProcessDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Process RTO</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Order ID: {selectedOrdId || '-'}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="RTO Amount"
            type="number"
            value={rtoAmount}
            onChange={(e) => setRtoAmount(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProcessDialog} disabled={selectedOrdId ? !!actionLoading[selectedOrdId] : false}>
            Cancel
          </Button>
          <Button
            onClick={handleProcessConfirm}
            variant="contained"
            disabled={selectedOrdId ? !!actionLoading[selectedOrdId] : true}
          >
            {selectedOrdId && actionLoading[selectedOrdId] ? <CircularProgress size={18} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingRTO;
