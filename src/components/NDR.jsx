import React, { useEffect, useMemo, useState } from "react";
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
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from "react-toastify";
import convertToUTCISOString from "../helpers/convertToUTCISOString";
import { PDFDocument } from "pdf-lib";

const API_URL = import.meta.env.VITE_APP_API_URL;

// Utility to merge multiple base64-encoded PDF files into a single PDF
const mergePDFs = async (pdfBase64s) => {
  if (!Array.isArray(pdfBase64s) || pdfBase64s.length === 0) {
    throw new Error("No PDF data provided to mergePDFs");
  }

  const mergedPdf = await PDFDocument.create();

  for (const base64 of pdfBase64s) {
    if (!base64) continue;

    // Some APIs may return data URLs ("data:application/pdf;base64,....")
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

    const pdfBytes = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return url;
};

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
      <p>AWB : {report.awb}</p>
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
  const [filters, setFilters] = useState({
    awb: "",
    ord_id: "",
    serviceId: "",
    startDate: "",
    endDate: ""
  });
  const [services, setServices] = useState([]);
  const [selection, setSelection] = useState({ ids: new Set() });
  const apiRef = useGridApiRef();

  // Dynamic DataGrid height
  const [dataGridHeight, setDataGridHeight] = useState(Math.round(window.innerHeight * 0.65));
  useEffect(() => {
    const handleResize = () => {
      setDataGridHeight(Math.round(window.innerHeight * 0.65));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedOrderIds = useMemo(() => {
    if (apiRef.current) {
      return [...apiRef.current.getSelectedRows().keys()]
    }
    return [];
  }, [apiRef, selection]);

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
      awb: filters.awb,
      ord_id: filters.ord_id,
      serviceId: filters.serviceId,
      startDate: startDate,
      endDate: endDate
    });

    try {
      const response = await fetch(`${API_URL}/shipment/domestic/reports?${queryParams}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLabel = async (shipmentIds) => {
    try {
      if (!Array.isArray(shipmentIds)) {
        shipmentIds = [shipmentIds.ref_id];
      }
      const response = await fetch(`${API_URL}/shipment/domestic/label`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ orders: shipmentIds })
      });
      const result = await response.json();
      const base64s = result?.labels || [];
      if (!base64s.length) {
        toast.error("No labels found");
        return;
      }
      ///DOWNLOAD EACH LABEL AND MERGE INTO A SINGLE PDF
      const pdfBase64s = base64s;
      const mergedPdfUrl = await mergePDFs(pdfBase64s);
      const link = document.createElement('a');
      link.href = mergedPdfUrl;
      link.download = `labels_${new Date().toISOString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Failed to get label");
    }
  };

  const handleBulkLabel = async () => {
    if (!selectedOrderIds.length) return;

    await handleGetLabel(selectedOrderIds);

    // Optional: clear selection after processing
    setSelection({ ids: new Set() });
  };

  const columns = [
    { field: 'ref_id', headerName: 'Reference ID', width: 130 },
    {
      field: 'customer_details', headerName: 'Customer', width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div>{params.row.customer_name}</div>
          <div>{params.row.customer_email}</div>
          <div>{params.row.customer_mobile}</div>
        </Box>
      )
    },
    { field: 'from_address', headerName: 'Origin', width: 200,
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
    {
      field: 'Shipment Details', headerName: 'Shipment Details', width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', whiteSpace: 'normal', lineHeight: 1.3, height: 100, justifyContent: 'center' }}>
          <div>Pay Method: {params.row.pay_method}</div>
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
      width: 200,
      renderCell: (params) => (
        <Box display="flex h-16" gap={1}>
          <Button
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => {
              setSelectedReport(params.row);
              setIsViewOpen(true);
            }}
          >
            View Status
          </Button>
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

        {/* Bulk actions */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleBulkLabel}
            disabled={selectedOrderIds.length === 0}
          >
            Bulk Label
          </Button>
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
                    awb: filters.awb,
                    ord_id: filters.ord_id,
                    serviceId: filters.serviceId,
                    startDate: filters.startDate ? convertToUTCISOString(new Date(filters.startDate).setHours(0,0,0,0)) : '',
                    endDate: filters.endDate ? convertToUTCISOString(new Date(filters.endDate).setHours(23,59,59,999)) : ''
                  }
                  const response = await fetch(`${API_URL}/shipment/domestic/reports/download/merchant`, {
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

        <Box sx={{ height: `${dataGridHeight}px`, width: '100%' }}>
          <DataGrid
            apiRef={apiRef}
            rows={reports}
            columns={columns}
            loading={isLoading}
            hideFooter={true}
            rowHeight={100}
            disableSelectionOnClick
            checkboxSelection
            onRowSelectionModelChange={setSelection}
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
    </div>
  );
};

export default function NDR() {
  return (
    <div className="py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <Listing />
    </div>
  );
}
