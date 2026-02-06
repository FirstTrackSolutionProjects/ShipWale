import { useEffect, useState } from "react";
import { Box, Paper, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid } from "@mui/x-data-grid";
import getAllInternationalShipmentsService from "../services/shipmentServices/internationalShipmentServices/getAllInternationalShipmentsService";
import getActiveInternationalServicesService from "../services/serviceServices/getActiveInternationalServicesService";
import getServicesActiveVendorsService from "../services/serviceServices/getServicesActiveVendorsService";
import { jwtDecode } from "jwt-decode";
import deductInternationalExtraChargeService from "../services/shipmentServices/internationalShipmentServices/deductInternationalExtraChargeService";
import allocateInternationalForwardingNumberService from "../services/shipmentServices/internationalShipmentServices/allocateInternationalForwardingNumberService";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_APP_API_URL;
import DownloadIcon from '@mui/icons-material/Download';
import getAllInternationalShipmentReportsDataService from '../services/shipmentServices/internationalShipmentServices/getAllInternationalShipmentReportsDataService';
import { USER_ROLES } from "../Constants";

// Tracking cards (unchanged functional rendering)
const WorldFirstCourierTrackingCard = ({ scan }) => (
  <div className="w-full py-3 bg-white relative items-center justify-center px-8 flex border-b space-x-4">
    <div className="flex flex-col items-center justify-center">
      <div className="font-bold">{scan?.Status}</div>
      <div>{scan.Location}</div>
      <div>
        {scan.EventDate1} {scan.EventTime1}
      </div>
    </div>
  </div>
);

const ICLCourierTrackingCard = ({ scan }) => (
  <div className="w-full py-3 bg-white relative items-center justify-center px-8 flex border-b space-x-4">
    <div className="flex flex-col items-center justify-center">
      <div className="font-bold">{scan?.Status}</div>
      <div>{scan.Location}</div>
      <div>
        {scan.EventDate1} {scan.EventTime1}
      </div>
    </div>
  </div>
);

const FlightGoCard = ({ scan }) => (
  <div className="w-full bg-white relative items-center px-8 py-2 flex-col border-b">
    <div>{scan.event_at}</div>
    <div>{scan.event_location}</div>
    <div>{scan.event_description}</div>
  </div>
);

const QuickShipNowCard = ({ scan }) => (
  <div className="w-full bg-white relative items-center px-8 py-2 flex-col border-b">
    <div>{scan.event_at}</div>
    <div>{scan.event_location}</div>
    <div>{scan.event_description}</div>
  </div>
);

const QuickShipNow2Card = ({ scan }) => (
  <div className="w-full bg-white relative items-center px-8 py-2 flex-col border-b">
    <div>{scan.event_at}</div>
    <div>{scan.event_location}</div>
    <div>{scan.event_description}</div>
  </div>
);

const DillikingCard = ({ scan }) => {
  const date = scan.event_date;
  const time = scan.event_time;
  const formattedDate = `${date.substr(0, 4)}/${date.substr(2, 2)}/${date.substr(6, 2)}`;
  const formattedTime = `${time.substr(0, 2)}:${time.substr(2, 2)}`;
  return (
    <div className="w-full py-3 bg-white relative items-center justify-center px-8 flex border-b space-x-4">
      <div className="flex flex-col items-center justify-center">
        <div className="font-bold">{scan.remark}</div>
        <div>{scan.location}</div>
        <div>{`${formattedDate} ${formattedTime}`}</div>
      </div>
    </div>
  );
};

// View dialog (MUI) using existing tracking render logic
const ViewDialog = ({ isOpen, onClose, report }) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getReport = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/shipment/international/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({ awb: report.awb }),
        });
        const data = await response.json();
        setStatus(data.track);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && report?.awb) getReport();
  }, [isOpen, report?.awb]);

  const renderStatus = () => {
    if (isLoading) return <div>Loading...</div>;
    if (!status) return <div>No Tracking Events Available</div>;
    switch (report?.service) {
      case 7:
        return status?.[0]?.docket_events?.map((scan, i) => <FlightGoCard key={i} scan={scan} />);
      case 8:
        return status?.length ? status.map((scan, i) => <DillikingCard key={i} scan={scan} />) : <div>No Tracking Events Available</div>;
      case 11:
        return status?.length ? status.map((scan, i) => <WorldFirstCourierTrackingCard key={i} scan={scan} />) : <div>No Tracking Events Available</div>;
      case 12:
        return status?.[0]?.docket_events?.map((scan, i) => <QuickShipNowCard key={i} scan={scan} />);
      case 13:
        return status?.[0]?.docket_events?.map((scan, i) => <QuickShipNow2Card key={i} scan={scan} />);
      case 14:
        return status?.length ? status.map((scan, i) => <ICLCourierTrackingCard key={i} scan={scan} />) : <div>No Tracking Events Available</div>;
      default:
        return <div>No Tracking Events Available</div>;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>Shipment Status</div>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>{renderStatus()}</DialogContent>
    </Dialog>
  );
};

const PAGE_SIZE = 50;

const Listing = () => {
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState(null); // set when API returns full array (no pagination)
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [extraSubmitting, setExtraSubmitting] = useState(false);
  const [extraForm, setExtraForm] = useState({ amount: "", reason: "" });
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [forwardSubmitting, setForwardSubmitting] = useState(false);
  const [forwardForm, setForwardForm] = useState({ forwarding_number: "", forwarding_service: "" });
  const [filters, setFilters] = useState({
    awb: "",
    iid: "",
    serviceId: "",
    vendorId: "",
    merchant_name: "",
    merchant_email: "",
    consignee_name: "",
    consignee_email: "",
    startDate: "",
    endDate: "",
  });
  const [services, setServices] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    // Determine if current user is admin from JWT
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setIsAdmin(Boolean(decoded?.role === USER_ROLES.ADMIN));
      }
    } catch (_) {}

    const fetchServices = async () => {
      try {
        const list = await getActiveInternationalServicesService();
        setServices(Array.isArray(list) ? list : []);
      } catch (e) {
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  // Load vendors when a service is selected; clear vendor filter when service changes
  useEffect(() => {
    const loadVendors = async () => {
      try {
        if (!filters.serviceId) {
          setVendors([]);
          setFilters((prev) => ({ ...prev, vendorId: "" }));
          return;
        }
        const list = await getServicesActiveVendorsService(filters.serviceId);
        setVendors(Array.isArray(list) ? list : []);
        // If current vendorId is not in the new list, clear it
        setFilters((prev) => ({
          ...prev,
          vendorId: list?.some(v => String(v.vendor_id) === String(prev.vendorId)) ? prev.vendorId : ""
        }));
      } catch (_) {
        setVendors([]);
        setFilters((prev) => ({ ...prev, vendorId: "" }));
      }
    };
    loadVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.serviceId]);

  // Export current dataset to CSV
  const exportToCSV = (rows, filename = 'international_reports.csv') => {
    try {
      const arr = Array.isArray(rows) ? rows : [];
      if (!arr.length) throw new Error('No data to export');
      const headers = Array.from(new Set(arr.flatMap(obj => Object.keys(obj || {}))));
      const esc = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const lines = [headers.join(',')].concat(
        arr.map(obj => headers.map(h => esc(obj[h])).join(','))
      );
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to export CSV');
    }
  };

  // Trigger server-side fetch of full reports dataset based on current filters
  const handleDownload = async () => {
    try {
      const params = { ...filters };
      const data = await getAllInternationalShipmentReportsDataService(params);
      exportToCSV(data || [], 'international_reports.csv');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to download reports');
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = {
        awb: filters.awb || undefined,
        iid: filters.iid || undefined,
        serviceId: filters.serviceId || undefined,
        vendorId: filters.vendorId || undefined,
        // Admin vs merchant person filters
        ...(isAdmin
          ? {
              merchant_name: filters.merchant_name || undefined,
              merchant_email: filters.merchant_email || undefined,
            }
          : {
              consignee_name: filters.consignee_name || undefined,
              consignee_email: filters.consignee_email || undefined,
            }),
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
      };

      const response = await getAllInternationalShipmentsService(params);
      const data = response?.data;
      // Support both array and paginated object shapes
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).reverse();
        setAllReports(sorted);
        setTotalPages(response?.totalPages);
        setReports(sorted);
      } else if (data && typeof data === "object") {
        const rows = data.reports || data.rows || data.orders || data.data || [];
        setReports(rows);
        if (typeof data.totalPages === "number") setTotalPages(data.totalPages || 1);
        if (typeof data.page === "number") setPage(Number(data.page) || 1);
      } else {
        setReports([]);
        setTotalPages(1);
      }
    } catch (e) {
      setReports([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.awb, filters.iid, filters.serviceId, filters.vendorId, filters.merchant_name, filters.merchant_email, filters.consignee_name, filters.consignee_email, filters.startDate, filters.endDate]);

  const handleOpenExtra = (row) => {
    setSelectedReport(row);
    setExtraForm({ amount: "", reason: "" });
    setIsExtraOpen(true);
  };

  const handleSubmitExtra = async () => {
    try {
      if (!selectedReport) return;
      const amtNum = parseFloat(extraForm.amount);
      if (isNaN(amtNum) || amtNum <= 0) {
        toast.error("Amount must be a number greater than 0");
        return;
      }
      if (!extraForm.reason || !extraForm.reason.trim()) {
        toast.error("Reason is required");
        return;
      }
      setExtraSubmitting(true);
      // Assumption: orderId corresponds to iid; fallback to ref_id if missing
      const orderId = selectedReport?.iid || selectedReport?.ref_id;
      await deductInternationalExtraChargeService(orderId, { amount: amtNum, reason: extraForm.reason.trim() });
      toast.success("Extra charge applied successfully");
      setIsExtraOpen(false);
      setExtraForm({ amount: "", reason: "" });
      // Optionally refresh reports
      fetchReports();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to apply extra charge";
      toast.error(msg || "Failed to apply extra charge");
    } finally {
      setExtraSubmitting(false);
    }
  };

  const handleOpenForward = (row) => {
    setSelectedReport(row);
    setForwardForm({
      forwarding_number: row?.forwarding_number || "",
      forwarding_service: row?.forwarding_service || "",
    });
    setIsForwardOpen(true);
  };

  const handleSubmitForward = async () => {
    try {
      if (!selectedReport) return;
      const { forwarding_number, forwarding_service } = forwardForm;
      if (!forwarding_number || !forwarding_service) {
        toast.error("Both forwarding number and service are required");
        return;
      }
      setForwardSubmitting(true);
      const orderId = selectedReport?.iid || selectedReport?.ref_id;
      await allocateInternationalForwardingNumberService(orderId, { forwarding_number, forwarding_service });
      toast.success("Forwarding number saved");
      setIsForwardOpen(false);
      // Refresh list to reflect new values
      fetchReports();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save forwarding info";
      toast.error(msg);
    } finally {
      setForwardSubmitting(false);
    }
  };

  const merchantCol = {
    field: 'merchant', 
    headerName: 'Merchant', 
    width: 200, 
    renderCell: (params) => (
        <Box sx={{ whiteSpace: 'normal', lineHeight: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
          <div>{params.row.fullName}</div>
          <div>{params.row.email}</div>
        </Box>
    )
  };
  const consigneeCol = { 
    field: 'consignee', 
    headerName: 'Consignee', 
    width: 200, 
    renderCell: (params) => (
        <Box sx={{ whiteSpace: 'normal', lineHeight: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
          <div>{params.row.consignee_name}</div>
          <div>{params.row.consignee_email}</div>
          <div>{params.row.consignee_contact_no}</div>
        </Box>
    )
  };
  const columns = [
    { field: "ref_id", headerName: "Reference ID", width: 140 },
    {
      field: "date",
      headerName: "Date",
      width: 180,
      renderCell: (params) => (params.value ? new Date(params.value).toLocaleString() : ""),
    },
    ...(isAdmin ? [merchantCol] : []),
    ...(!isAdmin ? [consigneeCol] : []),
    {
      field: "forwarding_info",
      headerName: "Forwarding Info",
      width: 260,
      renderCell: (params) => {
        const content = (
          <Box sx={{ whiteSpace: 'normal', lineHeight: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
            <div>Forwarding No: {params.row.forwarding_number || 'N/A'}</div>
            <div>Service: {params.row.forwarding_service || 'N/A'}</div>
          </Box>
        );
        if (!isAdmin) return content;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {content}
            <IconButton size="small" onClick={() => handleOpenForward(params.row)} title="Edit forwarding info">
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    },
    {
      field: 'shipping',
      headerName: 'Shipping Details',
      width: 300,
      renderCell: (params) => {
        const isShipped = Boolean(params.row.awb);
        return (
          <Box sx={{ whiteSpace: 'normal', lineHeight: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
            {isShipped ? (
              <>
                <div>{params.row.service_name}</div>
                <div>{params.row.vendor_name}</div>
                <div>Order Id: {params.row.iid}</div>
                {(isAdmin && params.row.awb) ? <div>AWB : {params.row.awb}</div> : null}
              </>
            ) : (
              <div style={{ color: '#666' }}>No shipping details yet</div>
            )}
          </Box>
        );
      }
    },
    { field: "status", headerName: "Status", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1} height={90} alignItems={'center'}>
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
          {isAdmin ? <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenExtra(params.row)}
          >
            Charge
          </Button> : null}
        </Box>
      ),
    },
  ];

  const getRowId = (row) => row?.ref_id || row?.iid || row?.iid;

  return (
    <div className="w-full p-4">
      <Paper sx={{ width: "100%", p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <h2 className="text-2xl font-medium">Shipment Reports</h2>
        </Box>

        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "red",
            borderRadius: 2,
            "& .MuiTextField-root": { bgcolor: "background.paper", borderRadius: 1 },
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <Box display="flex" gap={1} sx={{ minWidth: "fit-content", alignItems: 'flex-end' }}>
            <TextField
              label="Order ID"
              variant="outlined"
              size="small"
              name="iid"
              value={filters.iid}
              onChange={(e) => setFilters({ ...filters, iid: e.target.value })}
              sx={{ mr: 1, minWidth: "150px" }}
              InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
            />
            {/* Conditional name/email filters */}
            {isAdmin ? (
              <>
                <TextField
                  label="Merchant Name"
                  variant="outlined"
                  size="small"
                  name="merchant_name"
                  value={filters.merchant_name}
                  onChange={(e) => setFilters({ ...filters, merchant_name: e.target.value })}
                  sx={{ mr: 1, minWidth: "180px" }}
                  InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
                />
                <TextField
                  label="Merchant Email"
                  variant="outlined"
                  size="small"
                  name="merchant_email"
                  value={filters.merchant_email}
                  onChange={(e) => setFilters({ ...filters, merchant_email: e.target.value })}
                  sx={{ mr: 1, minWidth: "200px" }}
                  InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
                />
              </>
            ) : (
              <>
                <TextField
                  label="Consignee Name"
                  variant="outlined"
                  size="small"
                  name="consignee_name"
                  value={filters.consignee_name}
                  onChange={(e) => setFilters({ ...filters, consignee_name: e.target.value })}
                  sx={{ mr: 1, minWidth: "180px" }}
                  InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
                />
                <TextField
                  label="Consignee Email"
                  variant="outlined"
                  size="small"
                  name="consignee_email"
                  value={filters.consignee_email}
                  onChange={(e) => setFilters({ ...filters, consignee_email: e.target.value })}
                  sx={{ mr: 1, minWidth: "200px" }}
                  InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
                />
              </>
            )}
            <TextField
              label="AWB"
              variant="outlined"
              size="small"
              name="awb"
              value={filters.awb}
              onChange={(e) => setFilters({ ...filters, awb: e.target.value })}
              sx={{ mr: 1, minWidth: "150px" }}
              InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
            />
            <TextField
              label="Start Date"
              variant="outlined"
              size="small"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              sx={{ mr: 1, minWidth: "150px" }}
              InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
            />
            <TextField
              label="End Date"
              variant="outlined"
              size="small"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              sx={{ mr: 1, minWidth: "150px" }}
              InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
            />
            <FormControl size="small" sx={{ minWidth: "180px", mr: 1 }}>
              <InputLabel id="service-select-label" className="bg-white w-full">
                Service
              </InputLabel>
              <Select
                labelId="service-select-label"
                value={filters.serviceId}
                onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
                label="Service"
                sx={{ backgroundColor: "white", borderRadius: 1 }}
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
            <FormControl size="small" sx={{ minWidth: "180px", mr: 1 }} disabled={!filters.serviceId}>
              <InputLabel id="vendor-select-label" className="bg-white w-full">
                Vendor
              </InputLabel>
              <Select
                labelId="vendor-select-label"
                value={filters.vendorId}
                onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}
                label="Vendor"
                sx={{ backgroundColor: !filters.serviceId ? "#f3f4f6" : "white", borderRadius: 1 }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {vendors.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.vendor_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Download reports button */}
            <IconButton
              onClick={handleDownload}
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

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={reports}
            columns={columns}
            loading={isLoading}
            hideFooter={true}
            rowHeight={90}
            disableSelectionOnClick
            getRowId={getRowId}
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

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
      </Paper>

      <ViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} report={selectedReport} />

      {/* Extra Charge Dialog */}
      <Dialog open={isExtraOpen} onClose={() => !extraSubmitting && setIsExtraOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <div>Deduct Extra Charge</div>
            <IconButton onClick={() => !extraSubmitting && setIsExtraOpen(false)} size="small" disabled={extraSubmitting}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Amount"
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={extraForm.amount}
              onChange={(e) => setExtraForm((f) => ({ ...f, amount: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Reason"
              multiline
              minRows={2}
              value={extraForm.reason}
              onChange={(e) => setExtraForm((f) => ({ ...f, reason: e.target.value }))}
              fullWidth
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsExtraOpen(false)} disabled={extraSubmitting} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmitExtra} disabled={extraSubmitting} variant="contained">
            {extraSubmitting ? 'Submitting…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Forwarding Info Dialog */}
        <Dialog open={isForwardOpen} onClose={() => !forwardSubmitting && setIsForwardOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <div>Set Forwarding Info</div>
              <IconButton onClick={() => !forwardSubmitting && setIsForwardOpen(false)} size="small" disabled={forwardSubmitting}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Forwarding Number"
                value={forwardForm.forwarding_number}
                onChange={(e) => setForwardForm((f) => ({ ...f, forwarding_number: e.target.value }))}
                fullWidth
                size="small"
              />
              <TextField
                label="Forwarding Service"
                value={forwardForm.forwarding_service}
                onChange={(e) => setForwardForm((f) => ({ ...f, forwarding_service: e.target.value }))}
                fullWidth
                size="small"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsForwardOpen(false)} disabled={forwardSubmitting} variant="outlined">Cancel</Button>
            <Button onClick={handleSubmitForward} disabled={forwardSubmitting} variant="contained">{forwardSubmitting ? 'Saving…' : 'Save'}</Button>
          </DialogActions>
        </Dialog>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const addPageNumber = (pageNum) => pages.push({ number: pageNum, isCurrent: pageNum === currentPage });
  addPageNumber(1);
  if (totalPages <= 7) {
    for (let i = 2; i < totalPages; i++) addPageNumber(i);
  } else {
    if (currentPage <= 4) {
      for (let i = 2; i <= 5; i++) addPageNumber(i);
      pages.push({ number: "..." });
    } else if (currentPage >= totalPages - 3) {
      pages.push({ number: "..." });
      for (let i = totalPages - 4; i < totalPages; i++) addPageNumber(i);
    } else {
      pages.push({ number: "..." });
      for (let i = currentPage - 1; i <= currentPage + 1; i++) addPageNumber(i);
      pages.push({ number: "..." });
    }
  }
  if (totalPages > 1) addPageNumber(totalPages);
  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-4">
      <Button size="small" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} variant={currentPage === 1 ? "outlined" : "contained"}>
        Previous
      </Button>
      {pages.map((p, idx) => (
        <Button key={idx} size="small" onClick={() => p.number !== "..." && onPageChange(p.number)} variant={p.number === "..." ? "outlined" : p.isCurrent ? "contained" : "outlined"}>
          {p.number}
        </Button>
      ))}
      <Button size="small" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} variant={currentPage === totalPages ? "outlined" : "contained"}>
        Next
      </Button>
    </div>
  );
};

export default function InternationalReports() {
  return (
    <div className="py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <Listing />
    </div>
  );
}
