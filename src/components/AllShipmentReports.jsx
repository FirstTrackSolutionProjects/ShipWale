import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from "react-toastify";
import convertToUTCISOString from "../helpers/convertToUTCISOString";
import { DOMESTIC_SHIPMENT_REPORT_STATUS_ENUMS } from "@/Constants";

const API_URL = import.meta.env.VITE_APP_API_URL;

const timestampToDate = (timestamp) => {
  const date = new Date(timestamp);
  const formattedTimestamp = date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, '0') + "-" +
    String(date.getDate()).padStart(2, '0') + " " +
    String(date.getHours()).padStart(2, '0') + ":" +
    String(date.getMinutes()).padStart(2, '0');
  return formattedTimestamp;
}

const DelhiveryStatusCard = ({ report, status }) => {
  return (
    <div>
      <p className="font-bold">AWB : <b className="text-red-500">{report.awb}</b></p>
      <p>Ref Id: {report.ref_id}</p>
      <p>Status : {status.Status.Status}</p>
      <div className="my-2 border-b border-black"> </div>
      {
        (status.Scans).map((scan, index) => {
          const timestamp = scan.ScanDetail.ScanDateTime;
          const formattedTimestamp = timestampToDate(timestamp);
          return (
            <>
            <div>{formattedTimestamp} | {scan.ScanDetail.ScannedLocation} | {scan.ScanDetail.Instructions} </div>
            <div className="my-2 border-b border-black"> </div>
            </>
          )
        })
      }
    </div>
  )
}

const DelhiveryB2BStatusCard = ({report , status}) => {
  const timestamp = status?.scan_timestamp;
  const formattedTimestamp = timestampToDate(timestamp);
  return (
    <div>
      <p>AWB : {report.awb}</p>
      <p>Ref Id: {report.ref_id}</p>
      <p>LRN : {status.lrnum}</p>
      <p>Status : {status.status}</p>
      <div>{formattedTimestamp} | {status?.location} | {status?.scan_remark} </div>
    </div>
  )
}

const MovinStatusCard = ({ report, status }) => {
  return (
    <div className="flex flex-col">
      <p className="mt-5">AWB : {report.awb}</p>
      {status.scans?.length ? <p className="mb-5">Currently At : {status?.latestLocation}</p> : null}
      {status.scans?.length ?
        (status.scans).reverse().map((scan, index) => {
          const date = scan.timestamp
          const formattedTimestamp = timestampToDate(date);
          return (
            <div className="flex space-x-5">
              <div>{formattedTimestamp}</div>
              <div>{scan.package_status}</div>
            </div>
          )
        }) : "Shipment is not yet picked up"
      }
    </div>
  )
}

const PickrrStatusCard = ({ report, status }) => {
  return (
    <div className="flex flex-col">
      <p className="mt-5">AWB : {report.awb}</p>

      {status.length ?
        (status).reverse().map((scan, index) => {
          const date = scan.timestamp
          const formattedTimestamp = timestampToDate(date);
          return (
            <div>{formattedTimestamp} | {scan.location} | {scan.remarks} </div>
          )
        }) : "Shipment is not yet picked up"
      }
    </div>
  )
}

const ShiprocketStatusCard = ({ report, status }) => {
  return (
    <div className="flex flex-col">
      <p className="mt-5">AWB : {report.awb}</p>

      {status.length ?
        (status).reverse().map((scan, index) => {
          return (
            <div className='flex flex-col justify-center'>
              <div className='font-bold'>{scan["sr-status-label"]}</div>
              <div>{scan.location}</div>
              <div>{scan.date}</div>
            </div>
          )
        }) : "Shipment is not yet picked up"
      }
    </div>
  )
}

const EnviaCard = ({ report, status }) => {
  return (
  <>
      <div className="flex flex-col">
      <p className="mt-5">AWB : {report.awb}</p>

      {status.length ?
        (status).reverse().map((scan, index) => {
          return (
            <div className='flex flex-col justify-center'>
              <div className='font-bold'>{scan.description}</div>
              <div>{scan.location}</div>
              <div>{scan.date}</div>
            </div>
          )
        }) : "Shipment is not yet picked up"
      }
      </div>
  </>
  )
}

const ReportCard = ({ report, status }) => {
  return (
  <>
      <div className="flex flex-col">
      <p className="mt-5">AWB : {report.awb}</p>
      {report?.lrn ? <p>LRN : {report.lrn}</p> : null}
      {status.length ?
        (status).map((scan, index) => {
          return (
            <div className='flex flex-col justify-center'>
              <div className='font-bold'>{scan.status}</div>
              {scan?.description ? <div>{scan.description}</div> : null}
              {scan?.location ? <div>{scan.location}</div> : null}
              <div>{scan.timestamp}</div>
            </div>
          )
        }) : "Shipment is not yet picked up"
      }
      </div>
  </>
  )
}

const ViewDialog = ({ isOpen, onClose, report }) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add report?.ref_id to dependency array and check if report exists before making request
  useEffect(() => {
    const getReport = async () => {
      if (!report?.ref_id || !report?.serviceId) return;
      
      setIsLoading(true);
      setStatus(null); // Reset status when loading new report
      
      try {
        const response = await fetch(`${API_URL}/shipment/domestic/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('token'),
          },
          body: JSON.stringify({ 
            ref_id: report.ref_id, 
            serviceId: report.serviceId 
          }),
        });
        const result = await response.json();
        if (result.success) {
          setStatus(result.data || []);
        } else {
          console.error('Failed to fetch status:', result);
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      getReport();
    }
  }, [report?.ref_id, report?.serviceId, isOpen]);

  const renderStatus = () => {
    if (isLoading) return <Box p={2}>Loading...</Box>;
    
    switch(report?.serviceId) {
      case 1:
        return <DelhiveryB2BStatusCard report={report} status={status} />;
      case 2:
        return <DelhiveryStatusCard report={report} status={status} />;
      // case 3:
      //   return <MovinStatusCard report={report} status={status} />;
      // case 4:
      //   return <PickrrStatusCard report={report} status={status} />;
      // case 5:
      //   return <ShiprocketStatusCard report={report} status={status} />;
      // case 6:
      //   return <EnviaCard report={report} status={status} />;
      default:
        return <ReportCard report={report} status={status} />;
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>Shipment Status</div>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {renderStatus()}
      </DialogContent>
    </Dialog>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Function to add page numbers to the array
  const addPageNumber = (pageNum) => {
    pages.push({
      number: pageNum,
      isCurrent: pageNum === currentPage
    });
  };

  // Add first page
  addPageNumber(1);

  if (totalPages <= 7) {
    // If total pages is 7 or less, show all pages
    for (let i = 2; i < totalPages; i++) {
      addPageNumber(i);
    }
  } else {
    if (currentPage <= 4) {
      // We're near the start
      for (let i = 2; i <= 5; i++) {
        addPageNumber(i);
      }
      pages.push({ number: '...', isCurrent: false });
      addPageNumber(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // We're near the end
      pages.push({ number: '...', isCurrent: false });
      for (let i = totalPages - 4; i < totalPages; i++) {
        addPageNumber(i);
      }
    } else {
      // We're in the middle
      pages.push({ number: '...', isCurrent: false });
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        addPageNumber(i);
      }
      pages.push({ number: '...', isCurrent: false });
      addPageNumber(totalPages);
    }
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

const Listing = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    merchant_email: "",
    merchant_name: "",
    awb: "",
    ord_id: "",
    status: "",
    serviceId: "",
    startDate: "",
    endDate: ""
  });
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchReports();
  }, [page, filters]);

  const fetchServices = async () => {
    await fetch(`${API_URL}/services/active-shipments/domestic`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
    }).then(response => response.json()).then((result) => {
      if (result.success) {
        setServices(result.services)
      }
    })
  };

  const fetchReports = async () => {
    setIsLoading(true);
    const startDate = filters.startDate ? convertToUTCISOString(new Date(filters.startDate).setHours(0,0,0,0)) : '';
    const endDate = filters.endDate ? convertToUTCISOString(new Date(filters.endDate).setHours(23,59,59,999)) : '';
    const queryParams = new URLSearchParams({
      page,
      merchant_email: filters.merchant_email,
      merchant_name: filters.merchant_name,
      awb: filters.awb,
      ord_id: filters.ord_id,
      status: filters.status,
      serviceId: filters.serviceId,
      startDate: startDate,
      endDate: endDate
    });

    try {
      const response = await fetch(`${API_URL}/shipment/domestic/reports/admin?${queryParams}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (row) => {
    const cancel = confirm('Do you want to cancel this shipment?');
    if (!cancel) return;
    await fetch(`${API_URL}/shipment/cancel`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify({ order: row.ord_id })
    }).then(response => response.json()).then(async result => {
      if (result.message.status) {
        alert(result.message.remark)
        fetchReports();
      }
      else {
        alert("Your shipment has not been cancelled")
        console.log(result.message)
      }
    })
  };

  const columns = [
    { field: 'ref_id', headerName: 'Reference ID', width: 130 },
    { field: 'merchant_details', headerName: 'Merchant Details', width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div className="font-bold">{params.row.fullName}</div>
          <div>{params.row.email}</div>
          <div>{params.row.phone}</div>
        </Box>
      )
    },
    { field: 'customer_details', headerName: 'Customer Details', width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div className="font-bold">{params.row.customer_name}</div>
          <div>{params.row.customer_email}</div>
          <div>{params.row.customer_mobile}</div>
        </Box>
      )
    },
    {
      field: 'from_to', headerName: 'Origin', width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div>{params.row.warehouse_city}, {params.row.warehouse_state}</div>
          <div>{params.row.warehouse_country} - {params.row.warehouse_pin}</div>
        </Box>
      )
    },
    { field: 'to_address', headerName: 'Destination', width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div>{params.row.shipping_city}, {params.row.shipping_state}</div>
          <div>{params.row.shipping_country} - {params.row.shipping_postcode}</div>
        </Box>
      )
    },
    { field: 'shipment_details', headerName: 'Shipment Details', width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div>Pay Method: {params.row.pay_method} {params.row.pay_method === "COD" ? ` - ₹${parseInt(params.row.cod_amount)}` : ''}</div>
          <div>Service: {params.row.service_name}</div>
          <div>AWB: {params.row.awb}</div>
          <div>Order ID: {params.row.ord_id}</div>
          <div>{params.row.date ? new Date(params.row.date).toLocaleString() : ''}</div>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => (
        <Box display="flex h-16" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSelectedReport(params.row);
              setIsDetailsOpen(true);
            }}
          >
            Details
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setSelectedReport(params.row);
              setIsViewOpen(true);
            }}
          >
            Status
          </Button>
          {!params.row.cancelled && [1,2,6].includes(params.row.serviceId) && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleCancel(params.row)}
            >
              Cancel
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <div className="w-full p-4">
      <Paper sx={{ width: '100%', p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <h2 className="text-2xl font-medium">Shipment Reports</h2>
        </Box>

        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'red',
            borderRadius: 2, '& .MuiTextField-root': {bgcolor: 'background.paper', borderRadius: 1},
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <Box
            display="flex"
            gap={1}
            sx={{
              minWidth: 'fit-content',  // Prevents wrapping
            }}
          >
            <TextField
              label="Merchant Name"
              variant="outlined"
              size="small"
              name="merchant_name"
              value={filters.merchant_name}
              onChange={(e) => setFilters({ ...filters, merchant_name: e.target.value })}
              sx={{ mr: 1, minWidth: '200px' }}
              InputLabelProps={{
                // shrink: true,
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
              onChange={(e) => setFilters({ ...filters, merchant_email: e.target.value })}
              sx={{ mr: 1, minWidth: '200px' }}
              InputLabelProps={{
                // shrink: true,
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />
            <TextField
              label="Order ID"
              variant="outlined"
              size="small"
              name="ord_id"
              value={filters.ord_id}
              onChange={(e) => setFilters({ ...filters, ord_id: e.target.value })}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                // shrink: true,
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
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {Object.values(DOMESTIC_SHIPMENT_REPORT_STATUS_ENUMS).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="AWB"
              variant="outlined"
              size="small"
              name="awb"
              value={filters.awb}
              onChange={(e) => setFilters({ ...filters, awb: e.target.value })}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                // shrink: true,
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />
            <TextField
              label="Start Date"
              variant="outlined"
              size="small"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                // shrink: true,
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
              variant="outlined"
              size="small"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              sx={{ mr: 1, minWidth: '150px' }}
              InputLabelProps={{
                // shrink: true,
                sx: {
                  backgroundColor: 'white',
                  px: 0.5,
                  width: '100%',
                  borderRadius: 1,
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: '150px', mr: 1 }}>
              <InputLabel id="service-select-label" className="bg-white w-full">Service</InputLabel>
              <Select
                labelId="service-select-label"
                value={filters.serviceId}
                onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
                label="Service"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {services.map((service) => (
                  <MenuItem key={service.service_id} value={service.service_id}>
                    {service.service_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              onClick={async () => {
                try {
                  const payload = {
                    merchant_email: filters.merchant_email,
                    merchant_name: filters.merchant_name,
                    awb: filters.awb,
                    ord_id: filters.ord_id,
                    serviceId: filters.serviceId,
                    startDate: filters.startDate ? convertToUTCISOString(new Date(filters.startDate).setHours(0,0,0,0)) : '',
                    endDate: filters.endDate ? convertToUTCISOString(new Date(filters.endDate).setHours(23,59,59,999)) : ''
                  }
                  const response = await fetch(`${API_URL}/shipment/domestic/reports/download/admin`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': localStorage.getItem('token'),
                    },
                    body: JSON.stringify(payload)
                  });
                  const data = await response.json();
                  if (!data.success) {
                    throw new Error(data.message || 'Failed to download reports');
                  }
                  // Convert to Excel and download
                  const worksheet = XLSX.utils.json_to_sheet(data.data);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
                  
                  // Generate filename with current date
                  const date = new Date().toISOString().split('T')[0];
                  XLSX.writeFile(workbook, `shipment_reports_${date}.xlsx`);
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
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={reports}
            columns={columns}
            loading={isLoading}
            hideFooter={true}
            rowHeight={100}
            disableSelectionOnClick
            getRowId={(row) => row.ref_id}
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
          />
        </Box>

        {/* Add custom pagination */}
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Paper>

      <ViewDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        report={selectedReport}
      />

      {selectedReport && (
        <OrderDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          orderId={selectedReport.ord_id}
          shipment={selectedReport}
        />
      )}
    </div>
  );
};

const OrderDetailsDialog = ({ isOpen, onClose, orderId, shipment }) => {
  const [boxes, setBoxes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ordRes, boxRes] = await Promise.all([
          fetch(`${API_URL}/order/domestic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
            body: JSON.stringify({ order: orderId }),
          }).then(res => res.json()),
          fetch(`${API_URL}/order/domestic/boxes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
            body: JSON.stringify({ order: orderId }),
          }).then(res => res.json())
        ]);
        if (ordRes.success) setItems(ordRes.order);
        if (boxRes.success) setBoxes(boxRes.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isOpen, orderId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      case 'RTO':
      case 'RTO DELIVERED': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }
      }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" fontWeight="700" color="text.primary">
              Order Details - {orderId}
            </Typography>
            <Chip 
              label={shipment.status || 'PENDING'} 
              color={getStatusColor(shipment.status)} 
              size="small" 
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Box>
          <IconButton onClick={onClose} sx={{ '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}>
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 0 }}>
        {loading ? (
          <Box p={8} textAlign="center" display="flex" flexDirection="column" alignItems="center" gap={2}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            <Typography color="text.secondary">Fetching order details...</Typography>
          </Box>
        ) : (
          <Box className="space-y-8">
            {/* Info Cards Section */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CONTACT Info */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="700" sx={{ letterSpacing: '0.05em' }} gutterBottom>
                  CONTACT INFORMATION
                </Typography>
                <Box className="grid grid-cols-2 gap-x-4 gap-y-4 mt-4">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Merchant</Typography>
                    <Typography variant="body2" fontWeight="600" color="text.primary">{shipment.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', mt: 0.5, display: 'block' }}>{shipment.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{shipment.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Customer</Typography>
                    <Typography variant="body2" fontWeight="600" color="text.primary">{shipment.customer_name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', mt: 0.5, display: 'block' }}>{shipment.customer_email}</Typography>
                    <Typography variant="caption" color="text.secondary">{shipment.customer_mobile}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Shipment Meta Info */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="700" sx={{ letterSpacing: '0.05em' }} gutterBottom>
                  SHIPMENT INFO
                </Typography>
                <Box className="grid grid-cols-2 gap-y-4 mt-4">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Service Type</Typography>
                    <Chip label={shipment.is_b2b ? "B2B" : "B2C"} size="small" color="default" sx={{ mt: 0.5, fontWeight: 700, height: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Courier Service</Typography>
                    <Typography variant="body2" fontWeight="600">{shipment.service_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Payment Mode</Typography>
                    <Typography variant="body2" fontWeight="700" color={shipment.pay_method === "COD" ? "error.main" : "success.main"}>
                      {shipment.pay_method} 
                      {shipment.pay_method === "COD" && <span> (₹{parseInt(shipment.cod_amount)})</span>}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">AWB Number</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="body2" fontWeight="800" color="primary.main">{shipment.awb || 'N/A'}</Typography>
                      {shipment.awb && (
                        <Tooltip title="Copy AWB">
                          <IconButton size="small" onClick={() => handleCopy(shipment.awb)} sx={{ p: 0.5 }}>
                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Address Section */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
              <Box>
                <Typography variant="subtitle2" fontWeight="800" display="flex" alignItems="center" gap={1.5} mb={2} color="text.primary">
                  <Box sx={{ width: 6, height: 18, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                  ORIGIN
                </Typography>
                <Box sx={{ pl: 2.5 }}>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    {shipment.warehouse_city}, {shipment.warehouse_state}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {shipment.warehouse_country} — {shipment.warehouse_pin}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="800" display="flex" alignItems="center" gap={1.5} mb={2} color="text.primary">
                  <Box sx={{ width: 6, height: 18, bgcolor: 'error.main', borderRadius: 0.5 }} />
                  DESTINATION
                </Typography>
                <Box sx={{ pl: 2.5 }}>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    {shipment.shipping_city}, {shipment.shipping_state}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {shipment.shipping_country} — {shipment.shipping_postcode}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Packages Table */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" display="flex" alignItems="center" gap={1.5} mb={2} color="text.primary">
                <InventoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                PACKAGES ({boxes.length})
              </Typography>
              <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest">Box #</th>
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest">Dimensions (L×B×H cm)</th>
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest text-right">Weight</th>
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boxes.map((b, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-gray-700">{b.box_no}</td>
                        <td className="p-4 text-sm text-gray-600">{b.length} × {b.breadth} × {b.height}</td>
                        <td className="p-4 text-sm text-gray-900 font-bold text-right">{b.weight} {b.weight_unit}</td>
                        <td className="p-4 text-sm text-gray-600 text-center font-medium">{b.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            </Box>

            {/* Items Table */}
            <Box>
              <Typography variant="subtitle2" fontWeight="800" display="flex" alignItems="center" gap={1.5} mb={2} color="text.primary">
                <ListAltIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                ITEM DETAILS
              </Typography>
              <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest">Box #</th>
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest">Product Name</th>
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest text-center">Qty</th>
                      <th className="p-4 font-bold text-gray-600 text-[10px] uppercase tracking-widest text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-gray-700">{it.box_no}</td>
                        <td className="p-4 text-sm text-gray-600 font-medium">{it.product_name}</td>
                        <td className="p-4 text-sm text-gray-600 text-center font-bold">{it.product_quantity}</td>
                        <td className="p-4 text-sm text-gray-900 font-bold text-right">₹{parseFloat(it.selling_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            </Box>

            {/* Summary Section */}
            <Box display="flex" justifyContent="flex-end" pt={2} pb={2}>
              <Paper 
                variant="elevation" 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  minWidth: 280, 
                  bgcolor: '#F3F4F6',
                  border: '1px solid #E5E7EB'
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" fontWeight="600" color="text.secondary">Total Items</Typography>
                  <Typography variant="body2" fontWeight="800" color="text.primary">
                    {items.reduce((acc, item) => acc + parseInt(item.product_quantity), 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" fontWeight="600" color="text.secondary">Total dead weight</Typography>
                  <Typography variant="body2" fontWeight="800" color="text.primary">
                    {boxes.reduce((acc, box) => acc + parseFloat(box.weight), 0).toFixed(3)} {boxes[0]?.weight_unit || 'kg'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2, borderColor: '#D1D5DB' }} />
                <Box display="flex" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="subtitle1" fontWeight="800" color="text.primary">Total Amount</Typography>
                  <Typography variant="h6" fontWeight="900" color="primary.main">
                    ₹{items.reduce((acc, item) => acc + (parseFloat(item.selling_price) * parseInt(item.product_quantity)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function AllShipmentReports() {
  return (
    <div className="py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <Listing />
    </div>
  );
}
