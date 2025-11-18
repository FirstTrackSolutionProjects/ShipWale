import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Paper, TextField, Button, Menu, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-toastify";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { v4 } from "uuid";

import getInternationalOrdersPagedService from "../services/orderServices/internationalOrderServices/getInternationalOrdersPagedService";
import getInternationalShipmentLabelService from "../services/shipmentServices/internationalShipmentServices/getInternationalShipmentLabel";
import getInternationalShipmentInvoiceService from "../services/shipmentServices/internationalShipmentServices/getInternationalShipmentInvoiceService";
import getInternationalShipmentThirdPartyLabelService from "../services/shipmentServices/internationalShipmentServices/getInternationalShipmentThirdPartyLabelService";
import { generateInternationalShipmentInvoicePDF } from "../services/pdf/generateInternationalShipmentInvoice";
import getServicesActiveVendorsService from "../services/serviceServices/getServicesActiveVendorsService";
import getActiveInternationalServicesService from "../services/serviceServices/getActiveInternationalServicesService";
import getS3PutUrlService from "../services/s3Services/getS3PutUrlService";
import s3FileUploadService from "../services/s3Services/s3FileUploadService";
import { COUNTRIES, HS_CODES } from "../Constants";

const API_URL = import.meta.env.VITE_APP_API_URL;
const BUCKET_URL = import.meta.env.VITE_APP_BUCKET_URL || "";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-[1000] bg-white rounded-lg w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
};

const convertToUTCISOString = (ts) => new Date(ts).toISOString();

async function generateShipmentLabels(labelData) {
  if (!labelData) throw new Error("No label data provided");
  const boxes = Array.isArray(labelData.BOXES) ? labelData.BOXES : [];
  if (!boxes.length) throw new Error("No boxes to generate labels");
  const { default: jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const fetchAsDataURL = async (url) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch asset: ${url}`);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const awb = String(labelData.SHIPMENT_AWB || '');
  const logoUrl = `/logo-nobg.png`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(awb)}&size=80x80`;
  // Generate barcode client-side using bwip-js
  const { default: bwipjs } = await import('bwip-js');
  const makeBarcodeDataUrl = async (text) => {
    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    try {
      bwipjs.toCanvas(canvas, {
        bcid: 'code128',
        text: text || '',
        scale: 2,
        height: 10,
        includetext: false,
        backgroundcolor: 'FFFFFF',
        paddingwidth: 2,
        paddingheight: 2,
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Barcode generation failed:', err);
    }
  };
  const [qrDataUrl, barcodeDataUrl] = await Promise.all([
    fetchAsDataURL(qrUrl),
    makeBarcodeDataUrl(awb),
  ]);

  const buildHTML = (box, index, total) => {
    const weight = Number(box.DOCKET_WEIGHT_IN_KG || 0).toFixed(3);
    const dims = `${box.LENGTH} × ${box.BREADTH} × ${box.HEIGHT}`;
    const piecesStr = `${index + 1}/${total}`;
    return `<!DOCTYPE html><html><head><meta charset='UTF-8'><style>
      *{box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif}
      body{width:480px;margin:0;padding:12px;border:2px solid #000}
      .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:8px}
      .brand{display:flex;align-items:center;gap:8px}
      .brand img{width:70px;height:30px}
      .brand-name{font-size:22px;font-weight:700;line-height:1.1}
      .brand-sub{font-size:12px;font-weight:500;color:#555}
      .contact{font-size:12px;text-align:right;line-height:1.4}
      .section{border:1px solid #aaa;border-radius:6px;padding:10px;margin-bottom:10px}
      .section-title{font-weight:700;text-transform:uppercase;font-size:14px;margin-bottom:0px;border-bottom:1px solid #ddd;padding-bottom:8px}
      .address{font-size:14px;line-height:1.5}
      .address b{font-size:15px}
      .phone,.aadhaar{margin-top:3px;font-size:13px}
      .details{display:flex;justify-content:space-between;margin-top:4px}
      .details div{font-size:13px}
      .weight-box{border:2px solid #000;border-radius:8px;text-align:center;padding:8px;flex:0 0 150px}
      .weight-box .label{font-size:13px;font-weight:600}
      .weight-box .value{font-size:26px;font-weight:bold;line-height:1}
      .weight-box .unit{font-size:14px}
      .account{font-size:13px}
      .bottom{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
      .qr img{width:80px;height:80px}
      .barcode{text-align:center}
      .barcode img{height:50px;margin-bottom:4px}
      .barcode .ref{font-weight:700;font-size:16px;letter-spacing:1px}
      .footer{text-align:center;font-size:11px;color:#666;margin-top:8px}
    </style></head><body>
      <div class='header'>
        <div class='brand'>
          <img src='${logoUrl}' />
          <div><div class='brand-name'>SHIPWALE</div><div class='brand-sub'>Courier & Cargo</div></div>
        </div>
        <div class='contact'>info@shipwale.com<br/>https://shipwale.com</div>
      </div>
      <div class='section'>
        <div class='section-title'>To</div>
        <div class='address'>
          <b>${labelData.CONSIGNEE_NAME || ''}</b><br/>
          <span>${(labelData.CONSIGNEE_ADDRESS || '').replace(/\n/g,'<br/>')}<br/>${labelData.CONSIGNEE_CITY || ''}<br/>${labelData.CONSIGNEE_STATE || ''}<br/>${labelData.CONSIGNEE_PIN || ''}<br/>${labelData.CONSIGNEE_COUNTRY || ''}</span>
          <div class='phone'>📞 ${labelData.CONSIGNEE_PHONE || ''}</div>
        </div>
      </div>
      <div class='section'>
        <div class='section-title'>From</div>
        <div class='address'>
          <b>${labelData.SHIPPER_NAME || ''}</b><br/>
          <span>${(labelData.SHIPPER_ADDRESS || '').replace(/\n/g,'<br/>')}<br/>${labelData.SHIPPER_CITY || ''} - ${labelData.SHIPPER_PIN || ''}<br/>${labelData.SHIPPER_STATE || ''}<br/>${labelData.SHIPPER_COUNTRY || ''}</span>
          <div class='aadhaar'>🪪 Aadhaar No: <b>${labelData.SHIPPER_AADHAAR || ''}</b></div>
        </div>
      </div>
      <div class='section'>
        <div class='details'>
          <div>
            <div>Date: <b>${labelData.SHIPMENT_DATE || ''}</b></div>
            <div>Dimensions: <b>${dims}</b></div>
            <div>Pieces: <b>${piecesStr}</b></div>
          </div>
          <div class='weight-box'>
            <div class='label'>Weight / Kilogram</div>
            <div class='value'>${weight}</div>
            <div class='unit'>K.G.</div>
          </div>
        </div>
      </div>
      <div class='section account'>
        Reference No.: <b>${labelData.SHIPMENT_REFERENCE_ID || ''}</b><br/>
        Service: <b>${labelData.VENDOR_NAME || ''}</b>
      </div>
      <div class='bottom'>
        <div class='qr'><img src='${qrDataUrl}' /></div>
        <div class='barcode'>
          <img src='${barcodeDataUrl}' />
          <div class='ref'>${labelData.SHIPMENT_REFERENCE_ID || ''}</div>
        </div>
      </div>
      <div class='footer'>Thank you for shipping with ShipWale Courier & Cargo</div>
    </body></html>`;
  };

  const A4_WIDTH_MM = 210, A4_HEIGHT_MM = 297, PAGE_MARGIN_MM = 10;
  const GRID_COLUMNS = 2, GRID_ROWS = 2, CELL_GAP_MM = 4;
  const HTML2CANVAS_SCALE = 1.5, IMAGE_QUALITY = 0.76;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  const renderBoxes = boxes;
  for (let i = 0; i < renderBoxes.length; i++) {
    const html = buildHTML(renderBoxes[i], i, renderBoxes.length);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    doc.open();
    doc.write(html);
    doc.close();
    await new Promise((r) => setTimeout(r, 20));
    const canvas = await html2canvas(doc.body, { scale: HTML2CANVAS_SCALE, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);

    const availableWidthMm = A4_WIDTH_MM - 2 * PAGE_MARGIN_MM - (GRID_COLUMNS - 1) * CELL_GAP_MM;
    const availableHeightMm = A4_HEIGHT_MM - 2 * PAGE_MARGIN_MM - (GRID_ROWS - 1) * CELL_GAP_MM;
    const cellWidthMm = availableWidthMm / GRID_COLUMNS;
    const cellHeightMm = availableHeightMm / GRID_ROWS;
    const pxWidth = canvas.width,
      pxHeight = canvas.height;
    const mmPerPx = Math.min(cellWidthMm / pxWidth, cellHeightMm / pxHeight);
    const imgWidthMm = pxWidth * mmPerPx,
      imgHeightMm = pxHeight * mmPerPx;

    const slot = i % (GRID_COLUMNS * GRID_ROWS);
    const row = Math.floor(slot / GRID_COLUMNS);
    const col = slot % GRID_COLUMNS;
    if (slot === 0 && i > 0) pdf.addPage();
    const cellLeft = PAGE_MARGIN_MM + col * (cellWidthMm + CELL_GAP_MM);
    const cellTop = PAGE_MARGIN_MM + row * (cellHeightMm + CELL_GAP_MM);
    const x = cellLeft + (cellWidthMm - imgWidthMm) / 2;
    const y = cellTop + (cellHeightMm - imgHeightMm) / 2;
    pdf.addImage(imgData, "JPEG", x, y, imgWidthMm, imgHeightMm);
    document.body.removeChild(iframe);
  }
  pdf.save(`labels_${labelData.SHIPMENT_REFERENCE_ID || "shipment"}.pdf`);
}

// Exact duplicate of ManageForm from UpdateOrderInternational.jsx
const ManageForm = ({ shipment, isManage, setIsManage, isShipped }) => {
  const [loading, setLoading] = useState(null);
  const [dockets, setDockets] = useState([
    { box_no: 1, docket_weight: 0, docket_weight_unit: "kg", length: 0, breadth: 0, height: 0, quantity: 1 },
  ]);
  const handleDeleteDocket = (index) => {
    const newDockets = dockets
      .filter((_, i) => i !== index)
      .map((docket, i) => ({ ...docket, box_no: i + 1 }));
    setDockets(newDockets);
  };
  const handleAddDocket = () => {
    setDockets([
      ...dockets,
      { box_no: dockets.length + 1, docket_weight: 1, length: 10, breadth: 10, height: 10, docket_weight_unit: "kg", quantity: 1 },
    ]);
  };
  const [items, setItems] = useState([
    { hscode: "", box_no: "", quantity: 1, rate: 1, description: "", unit: "Pc", unit_weight: 0, item_weight_unit: "kg", igst_amount: 0, manufacturer_name: "", manufacturer_address: "" },
  ]);
  const [hsnSuggestions, setHsnSuggestions] = useState({});
  const hsnTimersRef = useRef({});
  const hsnInputRefs = useRef([]);
  const [activeHsnIndex, setActiveHsnIndex] = useState(null);
  const [hsnPortalPos, setHsnPortalPos] = useState({ top: 0, left: 0, width: 0 });

  const [descOpenIndex, setDescOpenIndex] = useState(null);
  const [descSuggestions, setDescSuggestions] = useState({});
  const descTimersRef = useRef({});
  const descInputRefs = useRef([]);
  const [descPortalPos, setDescPortalPos] = useState({ top: 0, left: 0, width: 0 });
  const filterDescriptions = (q) => {
    if (!q) return [];
    const query = String(q).toLowerCase().trim();
    if (!query) return [];
    return Object.keys(HS_CODES)
      .filter((s) => s && s.toLowerCase().includes(query))
      .slice(0, 20);
  };

  useEffect(() => {
    return () => {
      Object.values(hsnTimersRef.current || {}).forEach((t) => clearTimeout(t));
      Object.values(descTimersRef.current || {}).forEach((t) => clearTimeout(t));
    };
  }, []);

  const fetchHsnSuggestions = (index, description) => {
    if (hsnTimersRef.current[index]) clearTimeout(hsnTimersRef.current[index]);
    hsnTimersRef.current[index] = setTimeout(() => {
      try {
        if (!description || typeof description !== "string") return;
        const hsn = HS_CODES[description.trim()];
        setItems((it) => it.map((item, i) => (i === index ? { ...item, hscode: hsn || "" } : item)));
      } catch (err) {
        console.error("HSN mapping failed", err);
      }
    }, 400);
  };

  useEffect(() => {
    if (activeHsnIndex == null) return;
    const el = hsnInputRefs.current[activeHsnIndex];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHsnPortalPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
  }, [activeHsnIndex, hsnSuggestions]);

  useEffect(() => {
    if (descOpenIndex == null) return;
    const el = descInputRefs.current[descOpenIndex];
    if (!el) return;
    const reposition = () => {
      const rect = el.getBoundingClientRect();
      setDescPortalPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    };
    reposition();
    window.addEventListener("scroll", reposition, { passive: true });
    document.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition);
      document.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [descOpenIndex]);

  useEffect(() => {
    if (activeHsnIndex == null) return;
    let mounted = true;
    const recompute = () => {
      if (!mounted) return;
      const el = hsnInputRefs.current[activeHsnIndex];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setHsnPortalPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    };
    let raf = null;
    const onScrollOrResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        recompute();
        raf = null;
      });
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    const observer = new MutationObserver(onScrollOrResize);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    recompute();
    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activeHsnIndex]);

  const setItemsAndActivate = (index, patch) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    setActiveHsnIndex(index);
  };

  useEffect(() => {
    const getDockets = async () => {
      await fetch(`${API_URL}/order/international/dockets`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ iid: shipment.iid }),
      })
        .then((response) => response.json())
        .then((result) => {
          setDockets(result.dockets);
        });
    };
    const getItems = async () => {
      await fetch(`${API_URL}/order/international/items`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ iid: shipment.iid }),
      })
        .then((response) => response.json())
        .then((result) => setItems(result.dockets));
    };
    getDockets();
    getItems();
  }, []);

  const [formData, setFormData] = useState({
    iid: shipment.iid,
    wid: shipment.wid || "",
    service: shipment.service || "",
    vendor: shipment.vendor || "",
    contents: shipment.contents || "",
    consigneeName: shipment.consignee_name || "",
    consigneeCompany: shipment.consignee_company_name || "",
    countryCode: shipment.consignee_country_code || "",
    consigneeContact: shipment.consignee_contact_no || "",
    consigneeEmail: shipment.consignee_email || "",
    consigneeAddress: shipment.consignee_address_1 || "",
    consigneeAddress2: shipment.consignee_address_2 || "",
    consigneeAddress3: shipment.consignee_address_3 || "",
    consigneeCity: shipment.consignee_city || "",
    consigneeState: shipment.consignee_state || "",
    consigneeCountry: shipment.consignee_country || "",
    consigneeZipCode: shipment.consignee_zip_code || "",
    actualWeight: shipment.actual_weight || "",
    gst: shipment.gst || "",
    shipmentValue: shipment.shipment_value,
    price: shipment.shipping_price || "",
    aadhaarNumber: shipment.aadhaar_number || "",
    aadhaarDoc: shipment.aadhaar_doc || "",
    invoiceNumber: shipment.invoice_number || "",
    invoiceDate: shipment.invoice_date || "",
    invoiceDoc: shipment.invoice_doc || "",
    packageType: shipment.package_type || "NON-DOX",
  });
  const formDataRef = useRef(formData);
  const updateForm = (patch) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      formDataRef.current = next;
      return next;
    });
  };

  const isUS = (formData.consigneeCountry) ? COUNTRIES[formData.consigneeCountry]?.iso_code2 === 'US' : false;

  useEffect(() => {
    const totalWeight = dockets.reduce((acc, docket) => {
      const weightInKg =
        docket.docket_weight_unit === 'g'
          ? docket.docket_weight / 1000
          : docket.docket_weight;
      return acc + weightInKg * docket.quantity;
    }, 0).toFixed(3).toString()
    setFormData((prev) => ({ ...prev, actualWeight: totalWeight }));
  }, [dockets]);

  useEffect(() => {
    const total = items.reduce((sum, it) => {
      const rate = parseFloat(it.rate) || 0;
      const qty = parseFloat(it.quantity) || 0;
      return sum + rate * qty;
    }, 0);
    if (String(total) !== String(formDataRef.current.shipmentValue)) {
      updateForm({ shipmentValue: String(total) });
    }
  }, [items]);

  const [files, setFiles] = useState({ aadhaarDoc: null, invoiceDoc: null });
  const filesMeta = Object.freeze({
    aadhaarDoc: { label: "Aadhaar Document", required: true },
    invoiceDoc: { label: "Invoice Document", required: false },
  });

  const handleFileChange = async (e) => {
    const { name, files: newFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: newFiles[0] }));
  };

  const [warehouses, setWarehouses] = useState([]);
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await fetch(`${API_URL}/warehouse/warehouses/all`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
        });
        const result = await response.json();
        if (result?.rows) setWarehouses(result.rows);
      } catch (e) {
        console.error(e);
      }
      try {
        const list = await getActiveInternationalServicesService();
        setServices(list || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchVend = async () => {
      try {
        if (!formData.service) {
          setVendors([]);
          return;
        }
        const list = await getServicesActiveVendorsService(formData.service);
        setVendors(list || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchVend();
  }, [formData.service]);

  const addItemForBox = (boxNo) => {
    // Default rate set to '1' to satisfy > 0 rule
    const bn = parseInt(boxNo) || 1;
    setItems((it) => [
      ...it,
      { box_no: bn, hscode: "", quantity: 1, rate: "1", description: "", unit: "Pc", unit_weight: "1", item_weight_unit: "kg", manufacturer_name: "", manufacturer_address: "" },
    ]);
  };
  const removeProduct = (index) => {
    setItems((it) => it.filter((_, i) => i !== index));
  };
  const handleDocket = (index, event) => {
    const { name, value } = event.target;
    setDockets((ds) => {
      const next = [...ds];
      next[index][name] = value;
      return next;
    });
  };
  const handleItems = (index, e) => {
    const { name, value } = e.target;
    if (name === "description") {
      setItemsAndActivate(index, { [name]: value });
      if (descTimersRef.current[index]) clearTimeout(descTimersRef.current[index]);
      descTimersRef.current[index] = setTimeout(() => {
        const list = filterDescriptions(value);
        setDescSuggestions((prev) => ({ ...prev, [index]: list }));
        setDescOpenIndex(list.length ? index : null);
      }, 150);
      if (value.trim().length >= 3) fetchHsnSuggestions(index, value);
      else setHsnSuggestions((prev) => ({ ...prev, [index]: [] }));
    } else {
      setItems((it) => it.map((item, i) => (i === index ? { ...item, [name]: value } : item)));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateForm({ [name]: value });
  };

  const uploadFile = async (file) => {
    if (!files[file] && !formData[file] && filesMeta[file]?.required) {
      throw new Error(`${filesMeta[file]?.label} is required`);
    }
    if (!files[file]) return;
    try {
      const fileName = files[file].name;
      const key = `shipment/international/${v4()}/${file}/${fileName}`;
      updateForm({ [file]: key });
      const filetype = files[file].type;
      const putUrl = await getS3PutUrlService(key, filetype, true);
      await s3FileUploadService(putUrl, files[file], filetype);
    } catch (error) {
      console.error(error);
      setFormData((prev) => ({ ...prev, [file]: "" }));
      toast.error(`Failed to upload ${file}, try again!`);
    }
  };

  const handleUpload = async () => {
    try {
      setLoading("Uploading Files...");
      await Promise.all(Object.keys(files).map((key) => uploadFile(key)));
      return true;
    } catch (error) {
      toast.error(error?.message || "Failed to upload files");
    } finally {
      setLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If service 14, require manufacturer fields
    if (String(formData.service) === '14' && isUS) {
      const manufacturerInvalid = items.some(it => !it.manufacturer_name?.trim() || !it.manufacturer_address?.trim());
      if (manufacturerInvalid) {
        toast.error('Manufacturer Name and Address are required for all items for this service');
        return;
      }
    }
    const invalidRate = items.some((it) => {
      const r = parseFloat(it.rate);
      return isNaN(r) || r <= 0;
    });
    if (invalidRate) {
      toast.error("Each item rate must be greater than 0");
      return;
    }
    if (!(await handleUpload())) return;
    try {
      setLoading("Updating Order...");
      const payload = {
        ...formDataRef.current,
        dockets,
        items: (String(formDataRef.current.service) === '14' && isUS)
          ? items.map(it => ({
              ...it,
              manufacturer_name: (it.manufacturer_name || '').trim(),
              manufacturer_address: (it.manufacturer_address || '').trim()
            }))
          : items.map(({ manufacturer_name, manufacturer_address, ...rest }) => rest)
      };

      let docketFlag = 0;
      for (let i = 0; i < payload.dockets.length; i++) {
        for (let j = 0; j < payload.items.length; j++) {
          if (parseInt(payload.items[j].box_no) == i + 1) {
            docketFlag = 1;
          }
        }
        if (docketFlag == 0) {
          alert("Please make sure every docket has some items");
          return;
        }
        docketFlag = 0;
      }

      let itemFlag = 0;
      for (let i = 0; i < payload.items.length; i++) {
        for (let j = 0; j < payload.dockets.length; j++) {
          if (payload.items[i].box_no == payload.dockets[j].box_no) {
            itemFlag = 1;
          }
        }
        if (itemFlag == 0) {
          alert("Some items have invalid box no.");
          return;
        }
        itemFlag = 0;
      }

      fetch(`${API_URL}/order/international/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ ...payload }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            alert("Order Updated successfully");
          } else {
            alert("Something Went Wrong, please try again");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Something Went Wrong, please try again");
        });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order");
    } finally {
      setLoading(null);
    }
  };

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [destCountryOpen, setDestCountryOpen] = useState(false);
  const [destCountrySearch, setDestCountrySearch] = useState("");
  const countryDropdownRef = useRef(null);
  const destCountryRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) setCountryDropdownOpen(false);
      if (destCountryRef.current && !destCountryRef.current.contains(e.target)) setDestCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    return Object.keys(COUNTRIES)
      .filter((c) => COUNTRIES[c].name.toLowerCase().includes(q) || COUNTRIES[c].country_code.toLowerCase().includes(q))
      .map((c) => ({ key: c, name: COUNTRIES[c].name, code: COUNTRIES[c].country_code, iso2: COUNTRIES[c].iso_code2 }));
  }, [countrySearch]);
  const filteredDestCountries = useMemo(() => {
    const q = destCountrySearch.toLowerCase();
    return Object.keys(COUNTRIES)
      .filter((c) => COUNTRIES[c].name.toLowerCase().includes(q) || COUNTRIES[c].country_code.toLowerCase().includes(q))
      .map((c) => ({ key: c, name: COUNTRIES[c].name, code: COUNTRIES[c].country_code, iso2: COUNTRIES[c].iso_code2 }));
  }, [destCountrySearch]);

  useEffect(() => {
    let patch = {};
    const currentCC = formDataRef.current.countryCode;
    if (currentCC && !COUNTRIES[currentCC]) {
      const found = Object.keys(COUNTRIES).find((k) => COUNTRIES[k].country_code === currentCC);
      if (found) patch.countryCode = found;
    }
    const currentDest = formDataRef.current.consigneeCountry;
    if (currentDest && !COUNTRIES[currentDest]) {
      const found2 = Object.keys(COUNTRIES).find((k) => COUNTRIES[k].name === currentDest);
      if (found2) patch.consigneeCountry = found2;
    }
    if (Object.keys(patch).length) updateForm(patch);
  }, [formData.countryCode, formData.consigneeCountry]);
  const displayDialCode = formData.countryCode && COUNTRIES[formData.countryCode]?.country_code;
  const displayCountryName = formData.consigneeCountry && COUNTRIES[formData.consigneeCountry]?.name;

  const toKg = (value, unit) => {
    const n = parseFloat(value);
    if (isNaN(n)) return 0;
    return unit === 'g' ? n / 1000 : n;
  };

  return (
    <div className="w-full p-4 flex flex-col items-center relative">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setIsManage(false)}
        className="absolute right-4 top-4 h-8 w-8 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-lg leading-none"
        title="Close"
      >
        X
      </button>
      <div className="text-3xl font-medium text-center my-8">Update Shipping Details</div>
      <form onSubmit={handleSubmit} className="w-full max-w-7xl space-y-8">
        <div className="bg-white shadow rounded-2xl p-6 border">
          <div className="text-lg font-semibold mb-4">Service Details</div>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex flex-col space-y-2">
              <label htmlFor="orderId">Order Id</label>
              <input id="orderId" name="iid" disabled value={formData.iid} onChange={handleChange} className="border rounded-xl px-4 py-2 bg-white" />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="wid" className="text-sm font-medium">Pickup Warehouse*</label>
              <select id="wid" name="wid" required value={formData.wid} onChange={handleChange} className="border rounded-xl px-4 py-2 bg-white">
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.wid} value={w.wid}>
                    {w.warehouseName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="service" className="text-sm font-medium">Service*</label>
              <select id="service" name="service" value={formData.service} onChange={handleChange} className="border rounded-xl px-4 py-2" required>
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.service_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="vendor" className="text-sm font-medium">Vendor*</label>
              <select id="vendor" name="vendor" value={formData.vendor} onChange={handleChange} className="border rounded-xl px-4 py-2" required>
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="packageType" className="text-sm font-medium">Package Type*</label>
              <select id="packageType" name="packageType" required value={formData.packageType} onChange={handleChange} className="border rounded-xl px-4 py-2">
                <option value="DOX">DOX</option>
                <option value="NON-DOX">NON-DOX</option>
              </select>
            </div>
          </div>
        </div>

        <section className="bg-white/70  rounded-2xl border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Consignee Details</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeName">Name*</label>
              <input id="consigneeName" name="consigneeName" required value={formData.consigneeName} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeCompany">Company*</label>
              <input id="consigneeCompany" name="consigneeCompany" required value={formData.consigneeCompany} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Country Code*</label>
              <div className="relative" ref={countryDropdownRef}>
                <button type="button" onClick={() => setCountryDropdownOpen((o) => !o)} className="w-full border py-2 px-3 rounded-xl text-left flex justify-between items-center">
                  <span>{displayDialCode || "Select"}</span>
                  <span className="ml-2">▾</span>
                </button>
                <input tabIndex={-1} style={{ position: "absolute", opacity: 0, height: 0, width: 0 }} required value={displayDialCode || ""} onChange={() => {}} />
                {countryDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-64 max-h-72 overflow-hidden bg-white border rounded-xl shadow-lg">
                    <div className="p-2 border-b">
                      <input autoFocus type="text" className="w-full border px-2 py-1 rounded-md text-sm bg-white" placeholder="Search code or name" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                    </div>
                    <ul className="max-h-60 overflow-y-auto text-sm">
                      {filteredCountries.length === 0 && <li className="px-3 py-2 text-gray-500">No matches</li>}
                      {filteredCountries.map((c) => (
                        <li key={c.iso2 + "-code"}>
                          <button type="button" className={`w-full text-left px-3 py-2 hover:bg-red-100 ${formData.countryCode === c.key ? "bg-red-50 font-medium" : ""}`} onClick={() => {
                            updateForm({ countryCode: c.key });
                            setCountryDropdownOpen(false);
                            setCountrySearch("");
                          }}>
                            <span className="inline-block w-16">{c.code}</span>
                            <span>{c.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeContact">Contact*</label>
              <input id="consigneeContact" name="consigneeContact" required value={formData.consigneeContact} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeEmail">Email*</label>
              <input id="consigneeEmail" name="consigneeEmail" type="email" required value={formData.consigneeEmail} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="consigneeAddress">Address*</label>
              <input id="consigneeAddress" name="consigneeAddress" required value={formData.consigneeAddress} onChange={handleChange} maxLength={60} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeZipCode">Zip Code*</label>
              <input id="consigneeZipCode" name="consigneeZipCode" required value={formData.consigneeZipCode} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeCity">City*</label>
              <input id="consigneeCity" name="consigneeCity" required value={formData.consigneeCity} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="consigneeState">State*</label>
              <input id="consigneeState" name="consigneeState" required value={formData.consigneeState} onChange={handleChange} className="w-full border py-2 px-3 rounded-xl bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Country*</label>
              <div className="relative" ref={destCountryRef}>
                <button type="button" onClick={() => setDestCountryOpen((o) => !o)} className="w-full border py-2 px-3 rounded-xl text-left flex justify-between items-center">
                  <span>{displayCountryName || "Select"}</span>
                  <span className="ml-2">▾</span>
                </button>
                <input tabIndex={-1} style={{ position: "absolute", opacity: 0, height: 0, width: 0 }} required value={displayCountryName || ""} onChange={() => {}} />
                {destCountryOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-80 bg-white border rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b">
                      <input autoFocus type="text" className="w-full border px-2 py-1 rounded-md text-sm" placeholder="Search country" value={destCountrySearch} onChange={(e) => setDestCountrySearch(e.target.value)} />
                    </div>
                    <ul className="max-h-72 overflow-y-auto text-sm">
                      {filteredDestCountries.length === 0 && <li className="px-3 py-2 text-gray-500">No matches</li>}
                      {filteredDestCountries.map((c) => (
                        <li key={c.iso2 + "-dest"}>
                          <button type="button" className={`w-full text-left px-3 py-2 hover:bg-red-100 ${formData.consigneeCountry === c.key ? "bg-red-50 font-medium" : ""}`} onClick={() => {
                            updateForm({ consigneeCountry: c.key });
                            setDestCountryOpen(false);
                            setDestCountrySearch("");
                          }}>
                            {c.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white shadow rounded-2xl p-6 border space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Dockets</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-red-50 text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">L*</th>
                  <th className="p-2">W*</th>
                  <th className="p-2">H*</th>
                  <th className="p-2">Weight*</th>
                  <th className="p-2">Vol. Weight (kg/pc)</th>
                  <th className="p-2">Qty*</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {dockets.map((d, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-medium">{i + 1}</td>
                    <td className="p-2"><input required name="length" value={d.length} onChange={(e) => handleDocket(i, e)} className="w-20 border px-2 py-1 rounded" /></td>
                    <td className="p-2"><input required name="breadth" value={d.breadth} onChange={(e) => handleDocket(i, e)} className="w-20 border px-2 py-1 rounded" /></td>
                    <td className="p-2"><input required name="height" value={d.height} onChange={(e) => handleDocket(i, e)} className="w-20 border px-2 py-1 rounded" /></td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <input required name="docket_weight" value={d.docket_weight} onChange={(e) => handleDocket(i, e)} className="w-20 border px-2 py-1 rounded" />
                        <select name="docket_weight_unit" value={d.docket_weight_unit} onChange={(e) => handleDocket(i, e)} className="border px-2 py-1 rounded">
                          <option value="g">g/pc</option>
                          <option value="kg">kg/pc</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-2">
                      {(() => {
                        const l = parseFloat(d.length) || 0;
                        const b = parseFloat(d.breadth) || 0;
                        const h = parseFloat(d.height) || 0;
                        const volWeight = (l * b * h) / 5000;
                        return volWeight.toFixed(3);
                      })()}
                    </td>
                    <td className="p-2"><input required name="quantity" value={d.quantity} onChange={(e) => handleDocket(i, e)} className="w-16 border px-2 py-1 rounded" /></td>
                    <td className="p-2 text-right">{dockets.length > 1 && <button type="button" onClick={() => handleDeleteDocket(i)} className="text-red-500 hover:underline">Remove</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleAddDocket} className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white">Add Docket</button>
          </div>
        </div>

        {/* Items Section (per Docket) */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Items</h2>
          {dockets.map((d, di) => {
            const entries = items
              .map((it, idx) => ({ it, idx }))
              .filter((x) => String(x.it.box_no) === String(d.box_no));
            return (
              <div key={`docket-items-${d.box_no}`} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Docket #{d.box_no}</div>
                </div>
                <div className="overflow-x-auto overflow-visible">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-red-50 text-left">
                        <th className="p-2">Description*</th>
                        {(String(formData.service) === '14' && isUS) && <th className="p-2">Manufacturer Name*</th>}
                        {(String(formData.service) === '14' && isUS) && <th className="p-2">Manufacturer Address*</th>}
                        <th className="p-2">HS Code*</th>
                        <th className="p-2">Qty*</th>
                        <th className="p-2">Rate (₹/Pc)*</th>
                        <th className="p-2">Weight* (kg/Pc)</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.length === 0 && (
                        <tr>
                          <td colSpan={String(formData.service) === '14' ? 8 : 6} className="p-3 text-center text-gray-500">No items added for this docket.</td>
                        </tr>
                      )}
                      {entries.map(({ it, idx }) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">
                            <input
                              required
                              name="description"
                              value={it.description}
                              onChange={(e) => handleItems(idx, e)}
                              onFocus={() => {
                                const list = filterDescriptions(items[idx]?.description || '');
                                setDescSuggestions((prev) => ({ ...prev, [idx]: list }));
                                setDescOpenIndex(list.length ? idx : null);
                                const el = descInputRefs.current[idx];
                                if (el) {
                                  const rect = el.getBoundingClientRect();
                                  setDescPortalPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setDescOpenIndex((prev) => (prev === idx ? null : prev));
                                }, 120);
                              }}
                              className="w-56 border px-2 py-1 rounded"
                              autoComplete="off"
                              ref={(el) => (descInputRefs.current[idx] = el)}
                            />
                          </td>
                          {(String(formData.service) === '14' && isUS) && (
                            <td className="p-2">
                              <input
                                required
                                name="manufacturer_name"
                                value={it.manufacturer_name || ''}
                                onChange={(e) => handleItems(idx, e)}
                                className="w-40 border px-2 py-1 rounded"
                                placeholder="Ex. ABC Corp"
                              />
                            </td>
                          )}
                          {(String(formData.service) === '14' && isUS) && (
                            <td className="p-2">
                              <input
                                required
                                name="manufacturer_address"
                                value={it.manufacturer_address || ''}
                                onChange={(e) => handleItems(idx, e)}
                                className="w-56 border px-2 py-1 rounded"
                                placeholder="Address"
                                maxLength={100}
                              />
                            </td>
                          )}
                          <td className="p-2">
                            <div className="relative">
                              <input
                                ref={(el) => (hsnInputRefs.current[idx] = el)}
                                required
                                name="hscode"
                                value={it.hscode}
                                onChange={(e) => handleItems(idx, e)}
                                onFocus={() => setActiveHsnIndex(idx)}
                                className="w-28 border px-2 py-1 rounded"
                                autoComplete="off"
                              />
                            </div>
                          </td>
                          <td className="p-2"><input required name="quantity" value={it.quantity} onChange={(e) => handleItems(idx, e)} className="w-16 border px-2 py-1 rounded" /></td>
                          <td className="p-2"><input required type="text" name="rate" value={it.rate} onChange={(e) => handleItems(idx, e)} className="w-20 border px-2 py-1 rounded" /></td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <input required name="unit_weight" value={it.unit_weight} onChange={(e) => handleItems(idx, e)} className="w-20 border px-2 py-1 rounded" />
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            {items.filter(item => item.box_no == d.box_no).length > 1 && (
                              <button type="button" onClick={() => removeProduct(idx)} className="text-red-500 hover:underline">Remove</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Docket totals and add button at bottom */}
                {(() => {
                  const totalPrice = entries.reduce((sum, { it }) => sum + (parseFloat(it.rate) || 0) * (parseFloat(it.quantity) || 0), 0);
                  const totalWeight = entries.reduce((sum, { it }) => {
                    const qty = parseFloat(it.quantity) || 0;
                    const unitW = parseFloat(it.unit_weight) || 0;
                    const unit = it.item_weight_unit || 'kg';
                    return sum + toKg(unitW, unit) * qty;
                  }, 0);
                  const docketQty = parseFloat(d.quantity) || 1;
                  const docketCapacity = toKg(d.docket_weight, d.docket_weight_unit || 'kg') * docketQty;
                  const exceeds = totalWeight > docketCapacity;
                  return (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
                      <div className={`text-sm ${exceeds ? 'text-red-600' : 'text-gray-700'}`}>
                        <span className="mr-4"><strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}</span>
                        <span className="mr-4"><strong>Total Weight:</strong> {totalWeight.toFixed(3)} kg</span>
                        <span><strong>Capacity:</strong> {docketCapacity.toFixed(3)} kg</span>
                        {exceeds && (
                          <div className="text-xs mt-1">Total items weight exceeds docket capacity</div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => addItemForBox(d.box_no)}
                          className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </section>

        <div className="bg-white shadow rounded-2xl p-6 border">
          <div className="text-lg font-semibold mb-4">Shipment Meta</div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col space-y-2 md:col-span-1">
              <label htmlFor="contents" className="text-sm font-medium">Contents*</label>
              <input id="contents" name="contents" required value={formData.contents} onChange={handleChange} placeholder="Ex. Books" className="border rounded-xl px-4 py-2" />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="shipmentValue" className="text-sm font-medium">Shipment Value*</label>
              <input id="shipmentValue" name="shipmentValue" type="number" min={0} required value={formData.shipmentValue} readOnly className="border rounded-xl px-4 py-2 bg-gray-100 cursor-not-allowed" title="Automatically calculated from Items (Rate * Qty)" />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="gst" className="text-sm font-medium">Seller GST</label>
              <input id="gst" name="gst" value={formData.gst} onChange={handleChange} placeholder="GSTIN" className="border rounded-xl px-4 py-2" />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="actualWeight" className="text-sm font-medium">Total Weight (Kg)*</label>
              <input id="actualWeight" name="actualWeight" type="number" min={0} step={0.001} required value={formData.actualWeight} onChange={handleChange} className="border rounded-xl px-4 py-2 bg-gray-100 cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border space-y-4">
          <div className="text-lg font-semibold">KYC Document</div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label htmlFor="aadhaarNumber" className="text-sm font-medium">Aadhaar Number*</label>
              <input id="aadhaarNumber" name="aadhaarNumber" required value={formData.aadhaarNumber} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" className="border rounded-xl px-4 py-2" />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label htmlFor="aadhaarDoc" className="text-sm font-medium">Aadhaar Document (PDF/Image)</label>
              <input id="aadhaarDoc" name="aadhaarDoc" type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="border rounded-xl px-4 py-2" />
              {formData.aadhaarDoc && typeof formData.aadhaarDoc === "string" && (
                <a href={`${import.meta.env.VITE_APP_BUCKET_URL}${formData.aadhaarDoc}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50">View</a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border space-y-4">
          <div className="text-lg font-semibold">Invoice Details</div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="invoiceNumber" className="text-sm font-medium">Invoice Number*</label>
              <input id="invoiceNumber" name="invoiceNumber" required value={formData.invoiceNumber} onChange={handleChange} placeholder="INV-001" className="border rounded-xl px-4 py-2" />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date*</label>
              <input id="invoiceDate" name="invoiceDate" required type="date" value={formData.invoiceDate} onChange={handleChange} className="border rounded-xl px-4 py-2" />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label htmlFor="invoiceDoc" className="text-sm font-medium">Invoice Document (PDF/Image)</label>
              <input id="invoiceDoc" name="invoiceDoc" type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="border rounded-xl px-4 py-2" />
              {formData.invoiceDoc && typeof formData.invoiceDoc === "string" && (
                <a href={`${import.meta.env.VITE_APP_BUCKET_URL}${formData.invoiceDoc}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50">View</a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 border space-y-4">
          <div className="text-lg font-semibold">Pricing</div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col space-y-2 md:col-span-1">
              <label htmlFor="price" className="text-sm font-medium">Shipment Cost*</label>
              <input id="price" name="price" required type="number" min={0} value={formData.price} onChange={handleChange} placeholder="Ex. 1150" className="border rounded-xl px-4 py-2" />
            </div>
          </div>
        </div>

        {!isShipped && (
          <div className="pt-4">
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl bg-red-600 text-white font-medium shadow hover:bg-red-700 transition">{loading || "Update"}</button>
          </div>
        )}
      </form>

      {activeHsnIndex !== null && hsnSuggestions[activeHsnIndex] && hsnSuggestions[activeHsnIndex].length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div style={{ position: "absolute", top: hsnPortalPos.top + "px", left: hsnPortalPos.left + "px", width: Math.max(240, hsnPortalPos.width) + "px", zIndex: 1 }}>
            <div className="bg-white border rounded-xl shadow-lg max-h-72 overflow-y-auto">
              <ul className="text-sm">
                {hsnSuggestions[activeHsnIndex].map((s) => (
                  <li key={s.c}>
                    <button
                      type="button"
                      title={s.n}
                      className="w-full text-left px-3 py-2 hover:bg-red-50"
                      onClick={() => {
                        setItems((prev) => prev.map((it2, idx) => (idx === activeHsnIndex ? { ...it2, hscode: s.c } : it2)));
                        setHsnSuggestions((prev) => ({ ...prev, [activeHsnIndex]: [] }));
                        setActiveHsnIndex(null);
                      }}
                    >
                      {s.c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )}

      {descOpenIndex !== null && Array.isArray(descSuggestions[descOpenIndex]) && descSuggestions[descOpenIndex].length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div style={{ position: "absolute", top: descPortalPos.top + "px", left: descPortalPos.left + "px", width: Math.max(280, descPortalPos.width) + "px", zIndex: 9999 }}>
            <div className="bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <ul className="text-sm">
                {descSuggestions[descOpenIndex].map((s, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-red-50"
                      title={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setItems((prev) => prev.map((it2, ix) => (ix === descOpenIndex ? { ...it2, description: s } : it2)));
                        fetchHsnSuggestions(descOpenIndex, s);
                        setActiveHsnIndex(descOpenIndex);
                        setDescOpenIndex(null);
                      }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const AllInternationalShipmentReports = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    orderId: "",
    merchant_name: "",
    merchant_email: "",
    startDate: "",
    endDate: "",
  });
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const [downloadRowId, setDownloadRowId] = useState(null);
  const [vendorLabelsMap, setVendorLabelsMap] = useState({});

  const getRowId = (row) => row?.iid;
  const getRowKey = (row) => row?.iid || row?.ord_id || row?.ref_id;

  const handleOpenDownload = async (event, row) => {
    const rowId = getRowKey(row);
    setDownloadAnchorEl(event.currentTarget);
    setDownloadRowId(rowId);
    if (!vendorLabelsMap[rowId]) {
      try {
        const data = await getInternationalShipmentThirdPartyLabelService(row.iid);
        const keys = Array.isArray(data) ? data : Array.isArray(data?.labels) ? data.labels : [];
        const unique = Array.from(new Set(keys.filter(Boolean)));
        setVendorLabelsMap((prev) => ({ ...prev, [rowId]: unique }));
      } catch (e) {
        setVendorLabelsMap((prev) => ({ ...prev, [rowId]: [] }));
      }
    }
  };
  const handleCloseDownload = () => {
    setDownloadAnchorEl(null);
    setDownloadRowId(null);
  };

  const handleGetLabel = async (orderId) => {
    if (!orderId) {
      toast.error("Invalid order ID");
      return;
    }
    try {
      const labelResponse = await getInternationalShipmentLabelService(orderId);
      if (!labelResponse?.success) {
        toast.error(labelResponse?.message || "Failed to get label");
        return;
      }
      const labelData = labelResponse.label;
      if (!labelData || !Array.isArray(labelData.BOXES) || !labelData.BOXES.length) {
        toast.error("No boxes found for label generation");
        return;
      }
      await generateShipmentLabels(labelData);
      toast.success("Label PDF generated");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to generate label PDF");
    }
  };

  const handleGetInvoice = async (orderId) => {
    if (!orderId) {
      toast.error("Invalid order ID");
      return;
    }
    try {
      const invoiceData = await getInternationalShipmentInvoiceService(orderId);
      if (!invoiceData || !Array.isArray(invoiceData.BOXES) || !invoiceData.BOXES.length) {
        toast.error("No boxes found for invoice generation");
        return;
      }
      await generateInternationalShipmentInvoicePDF(invoiceData);
      toast.success("Invoice PDF generated");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to generate invoice PDF");
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const sDate = filters.startDate ? convertToUTCISOString(new Date(filters.startDate).setHours(0, 0, 0, 0)) : undefined;
      const eDate = filters.endDate ? convertToUTCISOString(new Date(filters.endDate).setHours(23, 59, 59, 999)) : undefined;
      const payload = {
        page,
        pageSize: 20,
        orderId: filters.orderId || undefined,
        merchant_name: filters.merchant_name || undefined,
        merchant_email: filters.merchant_email || undefined,
        startDate: sDate,
        endDate: eDate,
      };
  const data = await getInternationalOrdersPagedService(payload);
  setRows(Array.isArray(data?.rows) ? data.rows : Array.isArray(data?.orders) ? data.orders : []);
      setTotalPages(Number(data?.totalPages || 1));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shipments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.orderId, filters.merchant_name, filters.merchant_email, filters.startDate, filters.endDate]);

  const columns = [
    { field: "iid", headerName: "Order Id", width: 120, renderCell: (p) => p.row?.iid || "" },
    { field: "created_at", headerName: "Date", width: 180, renderCell: (p) => (p.value ? new Date(p.value).toLocaleString() : "") },
    {
      field: "merchant",
      headerName: "Merchant",
      width: 220,
      renderCell: (p) => (
        <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.4, height: 90, justifyContent: "center" }}>
          <span>{p.row.fullName || "-"}</span>
          <span>{p.row.email || "-"}</span>
        </Box>
      ),
    },
    {
      field: "shipping",
      headerName: "Shipping Details",
      width: 280,
      renderCell: (p) => (
        <Box sx={{ display: "flex", flexDirection: "column", height: 90, justifyContent: "center", lineHeight: 1.4 }}>
          <span>{p.row.service_name || "-"}</span>
          <span>{p.row.vendor_name || "-"}</span>
          {!!p.row.ref_id && <span>Ref Id: {p.row.ref_id}</span>}
          {!!p.row.awb && <span>AWB: {p.row.awb}</span>}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (p) => {
        const r = p.row || {};
        if (r.cancelled) return <span style={{ color: "#b91c1c" }}>Cancelled</span>;
        if (r.awb) return <span style={{ color: "#065f46" }}>Manifested</span>;
        if (r.is_requested) return <span style={{ color: "#b45309" }}>Requested</span>;
        return <span style={{ color: "#6b7280" }}>Pending</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 260,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        const hasAwb = !!row.awb;
        const rowId = getRowKey(row);
        const isMenuOpen = downloadRowId === rowId;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: 90 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setSelectedShipment(row);
                setIsManageOpen(true);
              }}
            >
              <VisibilityIcon />
            </Button>
            {hasAwb && (
              <>
                <Button size="small" variant="outlined" onClick={(e) => handleOpenDownload(e, row)}>
                  <DownloadIcon />
                </Button>
                <Menu
                  anchorEl={downloadAnchorEl}
                  open={isMenuOpen}
                  onClose={handleCloseDownload}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleCloseDownload();
                      handleGetLabel(row.iid);
                    }}
                  >
                    Shipment Label
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseDownload();
                      handleGetInvoice(row.iid);
                    }}
                  >
                    Invoice
                  </MenuItem>
                  {(vendorLabelsMap[rowId] || []).length > 0 && (
                    <Box sx={{ px: 1.5, py: 0.5, fontSize: 12, color: "text.secondary" }}>Vendor Labels</Box>
                  )}
                  {(vendorLabelsMap[rowId] || []).map((key, idx) => (
                    <MenuItem
                      key={key + idx}
                      onClick={() => {
                        handleCloseDownload();
                        const url = `${BUCKET_URL}${key}`;
                        try {
                          window.open(url, "_blank", "noopener,noreferrer");
                        } catch {
                          const a = document.createElement("a");
                          a.href = url;
                          a.target = "_blank";
                          a.rel = "noopener noreferrer";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }
                      }}
                    >
                      {`Vendor Label ${idx + 1}`}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <div className="w-full p-4 flex flex-col items-center space-y-6">
      <Paper sx={{ width: "100%", p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <h2 className="text-2xl font-medium">International Shipments (Admin)</h2>
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
          <Box display="flex" gap={1} sx={{ minWidth: "fit-content" }}>
            <TextField
              label="Order ID"
              variant="outlined"
              size="small"
              name="orderId"
              value={filters.orderId}
              onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
              sx={{ mr: 1, minWidth: "150px" }}
              InputLabelProps={{ sx: { backgroundColor: "white", px: 0.5, width: "100%", borderRadius: 1 } }}
            />
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
          </Box>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            hideFooter={true}
            disableSelectionOnClick
            rowHeight={90}
            getRowId={getRowId}
          />
        </Box>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
      </Paper>

      <Modal isOpen={isManageOpen} onClose={() => setIsManageOpen(false)}>
        {selectedShipment && (
          <ManageForm shipment={selectedShipment} isShipped={!!selectedShipment?.awb} isManage={true} setIsManage={setIsManageOpen} />
        )}
      </Modal>
    </div>
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
      pages.push({ number: '...' });
    } else if (currentPage >= totalPages - 3) {
      // We're near the end
      pages.push({ number: '...' });
      for (let i = totalPages - 4; i < totalPages; i++) {
        addPageNumber(i);
      }
    } else {
      // We're in the middle
      pages.push({ number: '...' });
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        addPageNumber(i);
      }
      pages.push({ number: '...' });
    }
  }

  // Add last page if we have more than 1 page
  if (totalPages > 1) {
    addPageNumber(totalPages);
  }

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
        className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
      </button>
    </div>
  );
};

export default AllInternationalShipmentReports;
