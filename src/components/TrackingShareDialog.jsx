import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, IconButton, Button, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { toast } from "react-toastify";

// Helper function to format timestamp (re-used from Listing.jsx)
const timestampToDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const formattedTimestamp = date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, '0') + "-" +
    String(date.getDate()).padStart(2, '0') + " " +
    String(date.getHours()).padStart(2, '0') + ":" +
    String(date.getMinutes()).padStart(2, '0');
  return formattedTimestamp;
};

// Re-using/adapting card components from Tracking.jsx or Listing.jsx
// Card for Delhivery B2B (serviceId = 1)
const TrackingShareDelhiveryB2BCard = ({ scan }) => {
  return (
    <div className="w-full px-4 py-3 flex items-start gap-4">
      <div className="mt-1 w-3 h-3 rounded-full bg-red-500 shadow shadow-red-200" />
      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-semibold text-gray-800">{scan?.scan_remark || '—'}</div>
        <div className="mt-1 text-xs text-gray-500">{scan?.location || '—'}</div>
        <div className="mt-1 text-xs text-gray-400">{timestampToDate(scan.scan_timestamp)}</div>
      </div>
    </div>
  );
};

// Card for Delhivery B2C (serviceId = 2)
const TrackingShareDelhiveryCard = ({ scan }) => {
  return (
    <div className="w-full px-4 py-3 flex items-start gap-4">
      <div className="mt-1 w-3 h-3 rounded-full bg-red-500 shadow shadow-red-200" />
      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-semibold text-gray-800">{scan?.Instructions || scan?.Scan || '—'}</div>
        <div className="mt-1 text-xs text-gray-500">{scan?.ScannedLocation || '—'}</div>
        <div className="mt-1 text-xs text-gray-400">{timestampToDate(scan.ScanDateTime)}</div>
      </div>
    </div>
  );
};

// Generic card for other services
const GenericTrackingShareCard = ({ scan }) => {
  return (
    <div className="w-full px-4 py-3 flex items-start gap-4">
      <div className="mt-1 w-3 h-3 rounded-full bg-red-500 shadow shadow-red-200" />
      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className='font-bold text-sm text-gray-800'>{scan?.status || '—'}</div>
        {scan?.description && <div className='text-xs text-gray-600'>{scan.description}</div>}
        {scan?.location && <div className='text-xs text-gray-500'>{scan.location}</div>}
        {scan?.timestamp && <div className='text-xs text-gray-400'>{timestampToDate(scan.timestamp)}</div>}
      </div>
    </div>
  );
};


const TrackingShareDialog = ({ isOpen, onClose, trackingData, report }) => {
  const [loading, setLoading] = useState(true); // Internal loading state for fetching data

  useEffect(() => {
    if (isOpen) {
      if (trackingData === null) {
        setLoading(true); // Still loading if trackingData is null when dialog opens
      } else {
        setLoading(false); // Data received
      }
    } else {
      setLoading(true); // Reset loading when dialog closes
    }
  }, [isOpen, trackingData]);

  // Generate a comprehensive tracking message for sharing
  const generateTrackingMessage = () => {
    if (!report) return "No shipment details available.";

    let message = `*🚚 ShipWale - Shipment Tracking Update 🚚*\n\n`;

    // Shipment Details Section
    message += `*----- Shipment Details ----*\n`;
    message += `📦 *AWB:* ${report.awb || 'N/A'}\n`;
    message += `🛒 *Order ID:* ${report.ord_id || 'N/A'}\n`;
    message += `👤 *Customer:* ${report.customer_name || 'N/A'}\n`;
    message += `📍 *Destination:* ${report.shipping_city || 'N/A'}, ${report.shipping_state || 'N/A'} - ${report.shipping_postcode || 'N/A'}\n`;
    message += `*----------------------------*\n\n`;


    if (loading || !trackingData || !trackingData.success) {
      // Improved message for loading/unavailable data
      message += `*🗓️ Tracking History:*\n`;
      message += `_Tracking information is currently unavailable or still loading._\n`;
      message += `_Please check back shortly._\n`;
      return message;
    }

    const statusUpdates = Array.isArray(trackingData.data) ? trackingData.data : (trackingData.data ? [trackingData.data] : []);
    const cleanedStatusUpdates = statusUpdates.filter(Boolean); // Filter out null/undefined scans

    message += `*🗓️ Tracking History:*\n`;
    if (cleanedStatusUpdates.length > 0) {
      // Reversing to show latest first, similar to UI
      cleanedStatusUpdates.slice().reverse().forEach((scan) => {
        let formattedTimestamp = '';
        let status = 'N/A';
        let description = '';
        let location = '';
        const serviceId = Number(trackingData.id);

        if (serviceId === 1) { // Delhivery B2B
          formattedTimestamp = timestampToDate(scan.scan_timestamp);
          status = scan.scan_remark || 'N/A';
          location = scan.location || '';
        } else if (serviceId === 2) { // Delhivery B2C
          // Use ScanDetail if available, otherwise assume scan object itself holds the details
          const detail = scan.ScanDetail ?? scan; 
          formattedTimestamp = timestampToDate(detail.ScanDateTime);
          status = detail.Instructions || detail.Scan || 'N/A';
          location = detail.ScannedLocation || '';
        } else { // Generic tracking
          formattedTimestamp = timestampToDate(scan.timestamp);
          status = scan.status || 'N/A';
          description = scan.description || '';
          location = scan.location || '';
        }
        
        // Construct the scan text more consistently for better readability
        let scanText = `• *${formattedTimestamp}* - *${status}*`;
        if (description) {
            scanText += ` (${description})`;
        }
        if (location) {
            scanText += ` at ${location}`;
        }
        
        message += `${scanText.trim()}\n`;
      });
    } else {
      message += "_No detailed scan history available yet._\n";
    }

    const trackingLink = report.awb ? `${window.location.origin}/tracking?awb=${report.awb}` : 'N/A';
    message += `\n\n🔗 *Live Tracking Link:* ${trackingLink}`;
    
    return message;
  };

  const getTrackingLink = () => {
    return report.awb ? `${window.location.origin}/tracking?awb=${report.awb}` : '';
  };

  // Handler for copying tracking information to clipboard
  const handleCopyTrackingInfo = () => {
    const message = generateTrackingMessage();
    navigator.clipboard.writeText(message)
      .then(() => toast.success("Tracking info copied to clipboard!"))
      .catch((err) => toast.error("Failed to copy tracking info."));
  };

  // Handler for copying only the tracking link to clipboard
  const handleCopyTrackingLink = () => {
    const link = getTrackingLink();
    if (link && link !== 'N/A') {
      navigator.clipboard.writeText(link)
        .then(() => toast.success("Tracking link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy tracking link."));
    } else {
      toast.error("No tracking link available.");
    }
  };

  // Handler for sharing tracking information via WhatsApp
  const handleShareWhatsApp = () => {
    const message = generateTrackingMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Render tracking cards based on service ID
  const renderTrackingCards = () => {
    if (loading) {
      return (
        <Box p={4} textAlign="center" display="flex" flexDirection="column" alignItems="center" gap={2}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
          <Typography color="text.secondary">Fetching tracking updates...</Typography>
        </Box>
      );
    }

    if (!trackingData || !trackingData.success) {
      return (
        <Box p={4} textAlign="center">
          <Typography variant="body1" color="error">
            {trackingData?.message || "Failed to load tracking information."}
          </Typography>
        </Box>
      );
    }

    const updates = Array.isArray(trackingData.data) ? trackingData.data : (trackingData.data ? [trackingData.data] : []);
    const count = updates.length;

    if (count === 0) {
      return (
        <Box p={4} textAlign="center">
          <Typography variant="body1" color="text.secondary">No tracking updates available yet.</Typography>
        </Box>
      );
    }
    
    return (
      <div className="relative">
        {/* Vertical timeline rail */}
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gray-200" /> 
        {/* Conditional Rendering for Cards based on trackingData.id (serviceId) */}
        {Number(trackingData?.id) === 1 ? ( // Delhivery B2B
          updates
            .filter(Boolean)
            .slice()
            .reverse() // Display latest first
            .map((scan, index) => (
              <TrackingShareDelhiveryB2BCard key={index} scan={scan} />
            ))
        ) : Number(trackingData?.id) === 2 ? ( // Delhivery B2C
          updates
            .filter(Boolean)
            .slice()
            .reverse() // Display latest first
            .map((scan, index) => (
              <TrackingShareDelhiveryCard key={index} scan={scan?.ScanDetail ?? scan} />
            ))
        ) : ( // Generic Tracking
          updates
            .filter(Boolean)
            .map((scan, index) => ( // GenericTrackingShareCard assumes data is already ordered or handles it internally
              <GenericTrackingShareCard key={index} scan={scan} />
            ))
        )}
      </div>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: { xs: 2, sm: 3 }, 
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Track Shipment: {report?.awb || 'N/A'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ '&:hover': { color: 'error.main', bgcolor: 'error.light' }, p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </DialogTitle>
      
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: 0, maxHeight: '70vh' }}>
        {renderTrackingCards()}
      </DialogContent>

      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        {report?.awb && (
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyTrackingLink}
            disabled={!report?.awb} // Disable if AWB is not available
            sx={{ textTransform: 'none' }}
          >
            Copy Link
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyTrackingInfo}
          disabled={loading || !trackingData || !trackingData.success}
          sx={{ textTransform: 'none' }}
        >
          Copy Info
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          onClick={handleShareWhatsApp}
          disabled={loading || !trackingData || !trackingData.success}
          sx={{ textTransform: 'none' }}
        >
          Share on WhatsApp
        </Button>
      </Box>
    </Dialog>
  );
};

export default TrackingShareDialog;