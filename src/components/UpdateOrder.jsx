import cloneOrderService from "../services/orderServices/cloneOrderService";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Box,
  Paper,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import convertToUTCISOString from "../helpers/convertToUTCISOString";

const API_URL = import.meta.env.VITE_APP_API_URL

const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0'); // Hours in 24-hour format
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}


const ManageForm = ({ isManage, setIsManage, shipment, isShipped }) => {
  if (!isManage) return null;
  
  const [boxes, setBoxes] = useState([
    { box_no: 1, length: 0, breadth: 0, height: 0, weight: 0, weight_unit: 'kg', quantity: 1 }
  ]);
  const [orders, setOrders] = useState([
    { box_no: 1, product_name: '', product_quantity: 0, selling_price: 0, tax_in_percentage: '' }
  ]);
  const [warehouses, setWarehouses] = useState([])
  
  useEffect(() => {
    const getWarehouses = async () => {
      await fetch(`${API_URL}/warehouse/warehouses`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        }
      }).then(response => response.json()).then(result => setWarehouses(result.rows))
    }
    getWarehouses();
    fetch(`${API_URL}/order/domestic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify({ order: shipment.ord_id }),
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setOrders(result.order)
        } else {
          alert('failed: ' + result.message)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during fetching Order');
      });
    fetch(`${API_URL}/order/domestic/boxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify({ order: shipment.ord_id }),
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setBoxes(result.order)
        } else {
          alert('failed: ' + result.message)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during fetching Boxes');
      });
  }, [])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      orders: orders
    }))
  }, [orders]);
  
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      boxes: boxes
    }))
  }, [boxes]);

  const [formData, setFormData] = useState({
    wid: shipment.wid,
    order: shipment.ord_id,
    payMode: shipment.pay_method,
    name: shipment.customer_name,
    email: shipment.customer_email,
    phone: shipment.customer_mobile,
    address: shipment.shipping_address,
    addressType: shipment.shipping_address_type,
    postcode: shipment.shipping_postcode,
    city: shipment.shipping_city,
    state: shipment.shipping_state,
    country: shipment.shipping_country,
    Baddress: shipment.billing_address,
    BaddressType: shipment.billing_address_type,
    Bpostcode: shipment.billing_postcode,
    Bcity: shipment.billing_city,
    Bstate: shipment.billing_state,
    Bcountry: shipment.billing_country,
    same: 1,
    boxes: boxes,
    orders: orders,
    discount: shipment.total_discount,
    cod: shipment.cod_amount,
    gst: shipment.gst,
    Cgst: shipment.customer_gst,
    shippingType: shipment.shipping_mode,
    pickupDate: shipment.pickup_date,
    pickupTime: shipment.pickup_time,
    shipmentValue: shipment.shipment_value,
    insurance: shipment.insurance || false,
    ewaybill: shipment.ewaybill,
    invoiceNumber: shipment.invoice_number,
    invoiceDate: shipment.invoice_date,
    invoiceAmount: shipment.invoice_amount,
    invoiceUrl: shipment.invoice_url,
    isB2B: shipment.is_b2b,
    customer_reference_number: shipment?.customer_reference_number
  })

  useEffect(() => {
    const pinToAdd = async () => {
      try {
        await fetch(`https://api.postalpincode.in/pincode/${formData.postcode}`)
          .then(response => response.json())
          .then(result => {
            const city = result[0].PostOffice[0].District
            const state = result[0].PostOffice[0].State
            setFormData((prev) => ({
              ...prev,
              city: city,
              state: state
            }))
          })
      } catch (e) {
        setFormData((prev) => ({
          ...prev,
          city: '',
          state: ''
        }))
      }
    }
    if (formData.postcode.length == 6) pinToAdd()
  }, [formData.postcode])
  
  useEffect(() => {
    const pinToAdd = async () => {
      try {
        await fetch(`https://api.postalpincode.in/pincode/${formData.Bpostcode}`)
          .then(response => response.json())
          .then(result => {
            const city = result[0].PostOffice[0].District
            const state = result[0].PostOffice[0].State
            setFormData((prev) => ({
              ...prev,
              Bcity: city,
              Bstate: state
            }))
          })
      } catch (e) {
        setFormData((prev) => ({
          ...prev,
          Bcity: '',
          Bstate: ''
        }))
      }
    }
    if (formData.Bpostcode.length == 6) pinToAdd()
  }, [formData.Bpostcode])

  const addProduct = () => {
    setOrders([...orders, { box_no: 1, product_name: '', product_quantity: 0, selling_price: 0, tax_in_percentage: '' }]);
  };
  
  const addBox = () => {
    setBoxes([...boxes, { box_no: boxes.length + 1, length: 0, breadth: 0, height: 0, weight: 0, weight_unit: 'kg', quantity: 1 }]);
  };
  
  const removeProduct = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
    setFormData((prev) => ({
      ...prev,
      orders: orders
    }))
  };
  
  const removeBox = (index) => {
    const updatedBoxes = boxes.filter((_, i) => i !== index);
    setBoxes(updatedBoxes);
    setFormData((prev) => ({
      ...prev,
      boxes: boxes
    }))
  };
  
  const handleOrders = (index, event) => {
    if (isShipped)
      return;
    const { name, value } = event.target;
    const updatedOrders = [...orders];
    updatedOrders[index][name] = value;
    setOrders(updatedOrders);
    setFormData((prev) => ({
      ...prev,
      orders: orders
    }))
  };
  
  const handleBoxes = (index, event) => {
    if (isShipped)
      return;
    const { name, value } = event.target;
    const updatedBoxes = [...boxes];
    updatedBoxes[index][name] = value;
    setBoxes(updatedBoxes);
    setFormData((prev) => ({
      ...prev,
      boxes: boxes
    }))
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const [invoice, setInvoice] = useState(null)
  const handleInvoice = (e) => {
    const { files } = e.target;
    setInvoice(files[0])
  }
  
  const uploadInvoice = async () => {
    if (!invoice) {
      return;
    }
    const invoiceUuid = uuidv4();
    const key = `invoice/${invoiceUuid}`;
    const filetype = invoice.type;

    const putUrlReq = await fetch(`${API_URL}/s3/putUrl`, {
      method: "POST",
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ filename: key, filetype: filetype, isPublic: true }),
    }).catch(err => { console.error(err); alert("err"); return });
    const putUrlRes = await putUrlReq.json();

    const uploadURL = putUrlRes.uploadURL;
    await fetch(uploadURL, {
      method: "PUT",
      headers: {
        'Content-Type': filetype
      },
      body: invoice,
    }).then(response => {
      if (response.status == 200) {
        setFormData((prev) => ({
          ...prev,
          invoiceUrl: key
        }))
        alert("Invoice uploaded successfully!");
      } else {
        setFormData((prev) => ({
          ...prev,
          invoiceUrl: null
        }))
        alert("Failed to upload invoice!");
      }
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
        
    // Combine shipment pickup date and time into a single Date object
    const pickupDateAndTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
        
    // Compare pickup time with the current IST time
    if (pickupDateAndTime < istDate) {
        alert('Pickup time is already passed. Please update and try again');
        return;
    }
    let boxFlag = 0
    for (let i = 0; i < formData.boxes.length; i++) {
      for (let j = 0; j < formData.orders.length; j++) {
        if (parseInt(formData.orders[j].box_no) == i + 1) {
          boxFlag = 1
        }
      }
      if (boxFlag == 0) {
        alert('Please make sure every box has some items')
        return
      }
      boxFlag = 0
    }

    let itemFlag = 0
    for (let i = 0; i < formData.orders.length; i++) {
      for (let j = 0; j < formData.boxes.length; j++) {
        if (formData.orders[i].box_no == formData.boxes[j].box_no) {
          itemFlag = 1
        }
      }
      if (itemFlag == 0) {
        alert('Some items have invalid box no.')
        return
      }
      itemFlag = 0
    }

    fetch(`${API_URL}/order/domestic/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          alert('Order Updated successfully')
        } else {
          alert('Order failed: ' + result.message)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during Order');
      });
  }

  return (
    <Dialog 
      open={isManage} 
      onClose={() => setIsManage(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>MANAGE SHIPMENT</div>
          <IconButton onClick={() => setIsManage(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
            <FormControl fullWidth sx={{ minWidth: 300 }}>
              <InputLabel>Pickup Warehouse Name</InputLabel>
              <Select
                value={formData.wid}
                onChange={handleChange}
                size="small"
                name="wid"
                label="Pickup Warehouse Name"
              >
                <MenuItem value="">Select Warehouse</MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.wid} value={warehouse.wid}>
                    {warehouse.warehouseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Pickup Date"
                type="date"
                name="pickupDate"
                size="small"
                value={formData.pickupDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getTodaysDate() }}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Pickup Time"
                type="time"
                name="pickupTime"
                size="small"
                value={formData.pickupTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Order Id"
                name="order"
                size="small"
                placeholder="Ex. ORDER123456"
                value={formData.order}
                disabled
                onChange={handleChange}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Customer Reference Number"
                name="customer_reference_number"
                size="small"
                placeholder="Ex. REF123456"
                value={formData.customer_reference_number}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.payMode}
                onChange={handleChange}
                name="payMode"
                size="small"
                label="Payment Method"
              >
                <MenuItem value="COD">COD</MenuItem>
                <MenuItem value="Pre-paid">Prepaid</MenuItem>
                <MenuItem value="topay">To Pay</MenuItem>
              </Select>
            </FormControl>
             <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="COD Amount"
                name="cod"
                size="small"
                value={formData.cod}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <InputLabel>Shipping Type</InputLabel>
              <Select
                value={formData.shippingType}
                onChange={handleChange}
                name="shippingType"
                size="small"
                label="Shipping Type"
              >
                <MenuItem value="Surface">Surface</MenuItem>
                <MenuItem value="Express">Express</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Shipment Value"
                name="shipmentValue"
                size="small"
                type="number"
                value={formData.shipmentValue}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Buyer's Name"
                name="name"
                size="small"
                placeholder="Ex. Aditya Kumar"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 2 }}>
              <TextField
                label="Buyer's email"
                name="email"
                placeholder="Ex. customer@example.com"
                size="small"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Buyer's Phone"
                name="phone"
                size="small"
                placeholder="Ex. 1234554321"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 3 }}>
              <TextField
                label="Shipping Address"
                name="address"
                size="small"
                placeholder="Ex. House no. 105, Kankarbagh, Patna, Bihar"
                value={formData.address}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <InputLabel>Shipping Address Type</InputLabel>
              <Select
                value={formData.addressType}
                onChange={handleChange}
                name="addressType"
                size="small"
                label="Shipping Address Type"
              >
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="office">Office</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Shipping Postcode"
                name="postcode"
                size="small"
                placeholder="Ex. 813210"
                value={formData.postcode}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Shipping City"
                name="city"
                size="small"
                placeholder="Ex. Bhagalpur"
                value={formData.city}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Shipping State"
                name="state"
                size="small"
                placeholder="Ex. Bihar"
                value={formData.state}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <TextField
                label="Shipping Country"
                name="country"
                size="small"
                placeholder="Ex. India"
                disabled
                value={formData.country}
                onChange={handleChange}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.same}
                  onChange={handleChange}
                  name="same"
                />
              }
              label="Billing address is same as Shipping address"
            />
          </Box>
          <Box sx={{ display: formData.same ? 'none' : 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
            <FormControl fullWidth sx={{ minWidth: 300 }}>
              <TextField
                label="Billing Address"
                name="Baddress"
                size="small"
                placeholder="Ex. House no. 105, Kankarbagh, Patna, Bihar"
                value={formData.Baddress}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex: 1 }}>
              <InputLabel>Billing Address Type</InputLabel>
              <Select
                value={formData.BaddressType}
                onChange={handleChange}
                name="BaddressType"
                size="small"
                label="Billing Address Type"
              >
                <MenuItem value="home">Home</MenuItem>
                <MenuItem value="office">Office</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300,  flex: 1 }}>
              <TextField
                label="Billing Postcode"
                name="Bpostcode"
                size="small"
                placeholder="Ex. 813210"
                value={formData.Bpostcode}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300,   flex: 1 }}>
              <TextField
                label="Billing City"
                name="Bcity"
                size="small"
                placeholder="Ex. Bhagalpur"
                value={formData.Bcity}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300,   flex: 1 }}>
              <TextField
                label="Billing State"
                name="Bstate"
                size="small"
                placeholder="Ex. Bihar"
                value={formData.Bstate}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300,   flex: 1 }}>
              <TextField
                label="Billing Country"
                name="Bcountry"
                size="small"
                placeholder="Ex. India"
                value={formData.Bcountry}
                onChange={handleChange}
              />
            </FormControl>
          </Box>
          <Box sx={{ my: 4 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Boxes</div>
            {boxes.map((box, index) => (
              <Box key={index} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
                <FormControl sx={{ minWidth: 100, flex: 1 }}>
                  <TextField
                    label="Box No"
                    name="box_no"
                    size="small"
                    disabled
                    value={index + 1}
                  />
                </FormControl>
                <FormControl sx={{ minWidth: 100, flex: 1 }}>
                  <TextField
                    label="Length (in cm)"
                    name="length"
                    size="small"
                    value={box.length}
                    onChange={(e) => handleBoxes(index, e)}
                  />
                </FormControl>
                <FormControl sx={{ minWidth: 100,  flex: 1 }}>
                  <TextField
                    label="Width (in cm)"
                    name="breadth"
                    size="small"
                    value={box.breadth}
                    onChange={(e) => handleBoxes(index, e)}
                  />
                </FormControl>
                <FormControl sx={{ minWidth: 100, flex: 1 }}>
                  <TextField
                    label="Height (in cm)"
                    name="height"
                    size="small"
                    value={box.height}
                    onChange={(e) => handleBoxes(index, e)}
                  />
                </FormControl>
                <Box sx={{ flex: 1, display: 'flex' }}>
                   <FormControl sx={{ minWidth: 90, flex: 1 }}>
                   <TextField
                     label="Weight"
                     name="weight"
                     size="small"
                     value={box.weight}
                     onChange={(e) => handleBoxes(index, e)}
                   />
                 </FormControl>
                 <FormControl sx={{ minWidth: 50 }}>
                   <InputLabel>Unit</InputLabel>
                   <Select
                     value={box.weight_unit}
                     onChange={(e) => handleBoxes(index, e)}
                     name="weight_unit"
                     size="small"
                     label="Weight Unit"
                   >
                     <MenuItem value="g">gm</MenuItem>
                     <MenuItem value="kg">kg</MenuItem>
                   </Select>
                 </FormControl>
                </Box>
                <FormControl sx={{ minWidth: 100, flex: 1 }}>
                  <TextField
                    label="Quantity"
                    name="quantity"
                    size="small"
                    type="text"
                    value={box.quantity}
                    onChange={(e) => handleBoxes(index, e)}
                  />
                </FormControl>
                {boxes.length > 1 && (
                  <FormControl fullWidth sx={{ minWidth: 150 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeBox(index)}
                      sx={{ width: '100%' }}
                    >
                      Remove
                    </Button>
                  </FormControl>
                )}
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={addBox}
              sx={{ borderRadius: '24px', mt: 2 }}
            >
              Add More Boxes
            </Button>
          </Box>
          <Box sx={{ my: 4 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Items</div>
            {orders.map((order, index) => (
              <Box key={index} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
                <FormControl sx={{ minWidth: 150, flex: 1 }}>
                  <TextField
                    label="Box No"
                    name="box_no"
                    size="small"
                    value={order.box_no}
                    onChange={(e) => handleOrders(index, e)}
                  />
                </FormControl>
                <FormControl  sx={{ minWidth: 300, flex: 2 }}>
                  <TextField
                    label="Product Name"
                    name="product_name"
                    size="small"
                    value={order.product_name}
                    onChange={(e) => handleOrders(index, e)}
                  />
                </FormControl>
                <FormControl sx={{ minWidth: 75, flex: 1 }}>
                  <TextField
                    label="Quantity"
                    name="product_quantity"
                    size="small"
                    type="number"
                    value={order.product_quantity}
                    onChange={(e) => handleOrders(index, e)}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ minWidth: 100, flex: 1 }}>
                  <TextField
                    label="Price"
                    name="selling_price"
                    size="small"
                    value={order.selling_price}
                    onChange={(e) => handleOrders(index, e)}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ minWidth: 100, flex: 1 }}>
                  <TextField
                    label="Tax"
                    name="tax_in_percentage"
                    size="small"
                    value={order.tax_in_percentage}
                    onChange={(e) => handleOrders(index, e)}
                  />
                </FormControl>
                {orders.length > 1 && (
                  <FormControl fullWidth sx={{ minWidth: 150 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeProduct(index)}
                      sx={{ width: '100%' }}
                    >
                      Remove
                    </Button>
                  </FormControl>
                )}
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={addProduct}
              sx={{ borderRadius: '24px', mt: 2 }}
            >
              Add More Product
            </Button>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isB2B}
                onChange={handleChange}
                name="isB2B"
              />
            }
            label="Is this is a B2B shipment?"
          />
          {formData.isB2B ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
              <FormControl sx={{ minWidth: 150, flex:1 }}>
                <TextField
                  label="Invoice Number"
                  name="invoiceNumber"
                  size="small"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl sx={{ minWidth: 150, flex:1 }}>
                <TextField
                  label="Invoice Date"
                  type="date"
                  size="small"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
              <FormControl sx={{ minWidth: 150, flex:1 }}>
                <TextField
                  label="Invoice Amount"
                  name="invoiceAmount"
                  type="number"
                  size="small"
                  value={formData.invoiceAmount}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl fullWidth sx={{ minWidth: 300, flex:1 }}>
                <label>Invoice</label>
                <input
                  type="file"
                  onChange={handleInvoice}
                />
                <Box className="flex items-center mt-2">
                  <a type="button" className="m-2 w-20 px-5 py-2 border rounded-3xl bg-red-600 text-white" target="_blank" href={import.meta.env.VITE_APP_BUCKET_URL + formData.invoiceUrl}>View</a>
                  <Button
                    variant="contained"
                    onClick={uploadInvoice}
                    className="bg-red-500"
                    sx={{ borderRadius: '24px' }}
                  >
                    Update
                  </Button>
                </Box>
              </FormControl>
              <FormControl fullWidth sx={{ minWidth: 300 }}>
                <TextField
                  label="E-Waybill"
                  name="ewaybill"
                  value={formData.ewaybill}
                  onChange={handleChange}
                />
              </FormControl>
            </Box>
          ) : null}
          <FormControlLabel
            control={
              <Checkbox
                checked={!!formData.insurance}
                onChange={(e)=> setFormData(prev=>({...prev, insurance: e.target.checked}))}
                name="insurance"
              />
            }
            label="Do you want insurance?"
          />
          <Box sx={{ my: 4 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Additional Info</div>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
            <FormControl fullWidth sx={{ minWidth: 300, flex:1 }}>
              <TextField
                label="Discount"
                name="discount"
                size="small"
                value={formData.discount}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex:1 }}>
              <TextField
                label="Seller GST"
                name="gst"
                size="small"
                value={formData.gst}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 300, flex:1 }}>
              <TextField
                label="Customer GSTIN (FOR B2B)"
                name="Cgst"
                size="small"
                value={formData.Cgst}
                onChange={handleChange}
              />
            </FormControl>
            </Box>
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isShipped}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const ShipCard = ({ price, shipment, setIsShipped, setIsShip, getParcels }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const ship = async () => {
    setIsLoading(true);
    const getBalance = await fetch(`${API_URL}/wallet/balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('token'),
      }
    });
    const balanceData = await getBalance.json();
    const balance = balanceData.balance;
    
    if ((parseFloat(balance) < (parseFloat(price.price)))) {
        alert('Insufficient balance to create shipment');
        setIsLoading(false);
        return;
    }
    
    fetch(`${API_URL}/shipment/domestic/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify({ 
        order: shipment.ord_id, 
        price: Math.round(price.price), 
        serviceId: price.serviceId, 
        courierId: price.courierId,
        courierServiceId: price.courierServiceId 
      })
    }).then(response => response.json()).then(async result => {
      if (result.success) {
        setIsShipped(true);
        console.log(result);
        const message = (result?.message instanceof String) ? result?.message : null;
        toast.success(message || "Your shipment has been created successfully");
        getParcels();
        setIsLoading(false);
        setIsShip(false);
      } else {
        const failureReason = result.message || "Your shipment has not been created";
        toast.error(failureReason);
        console.log(result);
        setIsLoading(false);
      }
    });
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <div>{price.name + " " + price.weight}</div>
        <Box sx={{ mt: 0.5 }}>
          <Box component="span" sx={{
            px: 1.2,
            py: 0.3,
            fontSize: '0.65rem',
            fontWeight: 600,
            borderRadius: '12px',
            letterSpacing: 0.5,
            display: 'inline-block',
            textTransform: 'uppercase',
            color: price.insurance ? '#065f46' : '#6b7280',
            backgroundColor: price.insurance ? '#d1fae5' : '#f3f4f6',
            border: '1px solid',
            borderColor: price.insurance ? '#10b981' : '#d1d5db'
          }}>
            {price.insurance ? 'Insured' : 'Not Insured'}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <div>{`₹${Math.round((price.price))}`}</div>
        <Button
          variant="contained"
          onClick={isLoading ? () => {} : () => ship()}
          disabled={isLoading}
          sx={{ borderRadius: '24px' }}
        >
          {isLoading ? "Shipping..." : "Ship"}
        </Button>
      </Box>
    </Paper>
  );
};

const ShipList = ({ shipment, isShipOpen, setIsShipOpen, setIsShipped, getParcels }) => {
  if (!isShipOpen) return null;
  const [prices, setPrices] = useState([]);
  const [boxes, setBoxes] = useState([]);
  
  useEffect(() => {
    if (!isShipOpen) return;
    
    const data = async () => {
      const getBoxes = await fetch(`${API_URL}/order/domestic/boxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify({ order: shipment.ord_id }),
      });
      const boxesData = await getBoxes.json();
      setBoxes(boxesData.order);
      console.log(boxesData.order);
      
      let weight = 0;
      let volume = 0;
      const volumetric = async () => {
        boxesData.order.map((box) => {
          weight += parseFloat(box.weight);
          volume += (parseFloat(box.length) * parseFloat(box.breadth) * parseFloat(box.height));
        });
      };
      await volumetric();
      
      console.log({ 
        method: shipment.shipping_mode == "Surface" ? "S" : "E", 
        status: "Delivered", 
        origin: shipment.pin, 
        dest: shipment.shipping_postcode, 
        payMode: shipment.pay_method == "topay" ? "COD" : shipment.pay_method, 
        codAmount: shipment.cod_amount, 
        volume, 
        weight, 
        quantity: boxesData.order.length, 
        boxes: boxesData.order 
      });
      
      const getPrice = await fetch(`${API_URL}/shipment/domestic/price`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          method: shipment.shipping_mode == "Surface" ? "S" : "E", 
          status: "Delivered", 
          origin: shipment.pin, 
          dest: shipment.shipping_postcode, 
          payMode: shipment.pay_method == "topay" ? "COD" : shipment.pay_method, 
          codAmount: shipment.cod_amount, 
          volume, 
          weight, 
          quantity: boxesData.order.length, 
          boxes: boxesData.order, 
          isShipment: true, 
          insurance: shipment.insurance,
          isB2B: shipment.is_b2b, 
          invoiceAmount: shipment.invoice_amount 
        }),
      });
      const prices = await getPrice.json();
      setPrices(prices.prices);
    };
    data();
  }, [isShipOpen, shipment]);

  return (
    <Dialog open={isShipOpen} onClose={() => setIsShipOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>CHOOSE YOUR {shipment.is_b2b ? "B2B" : "B2C"} SERVICE</div>
          <IconButton onClick={() => setIsShipOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {prices.length ? prices.map((price, index) => (
            <ShipCard 
              setIsShipped={setIsShipped} 
              setIsShip={setIsShipOpen} 
              key={index} 
              shipment={shipment} 
              price={price} 
              getParcels={getParcels} 
            />
          )) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div>Loading shipping options...</div>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};


const PickupRequest = ({ setPickup }) => {
  const [warehouses, setWarehouses] = useState([]);
  useEffect(() => {
    const getWarehouses = async () => {
      const response = await fetch(`${API_URL}/warehouse/warehouses`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        }
      });
      const result = await response.json();
      setWarehouses(result.rows);
    };
    getWarehouses();
  }, []);
  
  const [formData, setFormData] = useState({
    wid: "",
    pickDate: "",
    pickTime: "",
    packages: "",
    serviceId: ""
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/shipment/domestic/pickup/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify(formData)
    }).then(response => response.json()).then(result => {
      alert(result.schedule);
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  return (
    <Dialog open={true} onClose={() => setPickup(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>Pickup Request</div>
          <IconButton onClick={() => setPickup(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Pickup Warehouse Name</InputLabel>
            <Select
              value={formData.wid}
              onChange={handleChange}
              name="wid"
              label="Pickup Warehouse Name"
            >
              <MenuItem value="">Select Warehouse</MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.wid} value={warehouse.wid}>
                  {warehouse.warehouseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth required>
            <InputLabel>Delivery Partner</InputLabel>
            <Select
              value={formData.serviceId}
              onChange={handleChange}
              name="serviceId"
              label="Delivery Partner"
            >
              <MenuItem value="">Select Service</MenuItem>
              <MenuItem value="2">Delhivery (10Kg)</MenuItem>
              <MenuItem value="1">Delhivery (500gm)</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            required
            fullWidth
            label="Pickup Date"
            type="date"
            name="pickDate"
            value={formData.pickDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            required
            fullWidth
            label="Pickup Time"
            type="time"
            name="pickTime"
            value={formData.pickTime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            required
            fullWidth
            label="No of packages"
            type="number"
            name="packages"
            value={formData.packages}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add pagination component
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

// Modal component for better dialog display
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-[1000] bg-white rounded-lg w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
};

const Listing = ({ step, setStep }) => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pickup, setPickup] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isShipOpen, setIsShipOpen] = useState(false);
  const [actionStates, setActionStates] = useState({});
  // Dynamic DataGrid height
  const [dataGridHeight, setDataGridHeight] = useState(Math.round(window.innerHeight * 0.65));
  useEffect(() => {
    const handleResize = () => {
      setDataGridHeight(Math.round(window.innerHeight * 0.65));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper function to get action state for a specific shipment
  const getActionState = (orderId, action) => {
    return actionStates[orderId]?.[action] || false;
  };
  
  // Helper function to set action state for a specific shipment
  const setActionState = (orderId, action, value) => {
    setActionStates(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [action]: value
      }
    }));
  };

  const handleShip = (shipment) => {
    setSelectedShipment(shipment);
    setIsShipOpen(true);
  };

  const handleClone = async (shipment) => {
    try {
      const clone = confirm('Do you want to clone this order?');
      if (!clone) return;
      
      setActionState(shipment.ord_id, 'cloning', true);
      await cloneOrderService(shipment.ord_id);
      toast.success("Order cloned successfully");
      getParcels();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to clone order");
    } finally {
      setActionState(shipment.ord_id, 'cloning', false);
    }
  };

  const handleCancel = async (shipment) => {
    const cancel = confirm('Do you want to cancel this shipment?');
    if (!cancel) return;
    
    setActionState(shipment.ord_id, 'cancelling', true);
    try {
      const response = await fetch(`${API_URL}/shipment/cancel`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ order: shipment.ord_id })
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(result?.data || "Your shipment has been cancelled");
        getParcels();
      } else {
        toast.error(result?.data || "Your shipment has not been cancelled");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel shipment");
    } finally {
      setActionState(shipment.ord_id, 'cancelling', false);
    }
  };

  const handleDelete = async (shipment) => {
    const del = confirm('Do you want to delete this order?');
    if (!del) return;
    
    setActionState(shipment.ord_id, 'deleting', true);
    try {
      const response = await fetch(`${API_URL}/order/domestic/delete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ orderId: shipment.ord_id })
      });
      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        getParcels();
      } else {
        alert("Failed to delete order");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete order");
    } finally {
      setActionState(shipment.ord_id, 'deleting', false);
    }
  };

  const handleRefresh = async (shipment) => {
    setActionState(shipment.ord_id, 'refreshing', true);
    try {
      const response = await fetch(`${API_URL}/shipment/domestic/refresh`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ ord_id: shipment.ord_id })
      });
      const result = await response.json();
      
      if (result.success) {
        getParcels(); // Refresh data to show updated AWB
      } else {
        alert("Your shipment is still under processing, please wait...");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to refresh shipment");
    } finally {
      setActionState(shipment.ord_id, 'refreshing', false);
    }
  };

  const handleGetLabel = async (shipment) => {
    try {
      const response = await fetch(`${API_URL}/shipment/domestic/label`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ order: shipment.ord_id })
      });
      const result = await response.json();
      
      const link = document.createElement('a');
      link.href = result.label;
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Failed to get label");
    }
  };
  const [filters, setFilters] = useState({
    customer_email: "",
    orderId: "",
    customer_name: "",
    startDate: "",
    endDate: ""
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [abortController, setAbortController] = useState(null);

  // Debounce filter changes
  useEffect(() => {
    const timerId = setTimeout(() => {
      setPage(1); // Reset to first page when filters change
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timerId);
  }, [filters]);

  // Fetch data with filters and pagination
  useEffect(() => {
    const fetchData = async () => {
      if (abortController) {
        abortController.abort();
      }
      const newController = new AbortController();
      setAbortController(newController);

      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          ...(debouncedFilters.customer_name && { customer_name: debouncedFilters.customer_name }),
          ...(debouncedFilters.customer_email && { customer_email: debouncedFilters.customer_email }),
          ...(debouncedFilters.orderId && { orderId: debouncedFilters.orderId }),
          ...(debouncedFilters.startDate && { startDate: convertToUTCISOString(debouncedFilters.startDate) }),
          ...(debouncedFilters.endDate && { endDate: convertToUTCISOString(`${debouncedFilters.endDate}T23:59:59.999Z`) })
        });

        const response = await fetch(`${API_URL}/order/domestic/merchant?${queryParams}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'),
          },
          signal: newController.signal
        });
        
        const result = await response.json();
        if (result.success) {
          // Sort orders to prioritize unshipped orders
          const unShippedShipments = result.order.filter(shipment => !shipment.awb);
          const shippedShipments = result.order.filter(shipment => shipment.awb);
          const sortedShipments = [...unShippedShipments, ...shippedShipments];
          
          setShipments(sortedShipments);
          setTotalPages(result.totalPages || 1);
        } else {
          alert("Failed to fetch parcels");
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error:', error);
          alert('An error occurred during Order fetch');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedFilters, page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getParcels = () => {
    // Trigger refetch by updating filters slightly
    setDebouncedFilters(prev => ({ ...prev }));
  };

  const columns = [
    { 
      field: 'space', 
      headerName: '', 
      sortable: false, 
      disableColumnMenu: true,
      width: 5,
    },
    { field: 'ord_id', headerName: 'Order ID', width: 130 },
    {
      field: 'customer_reference_number',
      headerName: 'Customer Reference Number',
      width: 100,
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 180,
      renderCell: (params) => 
        params.row.date ? new Date(params.row.date).toLocaleString() : ''
    },
    { field: 'customer_name', headerName: 'Customer Name', width: 180 },
    { field: 'customer_email', headerName: 'Email', width: 200 },
    {
      field: 'shipping',
      headerName: 'Shipping Details',
      width: 250,
      renderCell: (params) => {
        const isShipped = Boolean(params.row.awb);
        return (
          <Box sx={{ whiteSpace: 'normal', lineHeight: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 80 }}>
            {isShipped ? (
              <>
                <div>{params.row.service_name}</div>
                {params.row.awb && <div>AWB: {params.row.awb}</div>}
                {params.row.shipping_vendor_reference_id && <div>LRN: {params.row.shipping_vendor_reference_id}</div>}
              </>
            ) : (
              <div style={{ color: '#666' }}>No shipping details yet</div>
            )}
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const isShipped = Boolean(params.row.awb);
        const isCancelled = params.row.cancelled;
        const isDeleted = params.row.deleted;

        let status = 'Pending';
        let color = '#92400e';
        let bgColor = '#fef3c7';

        if (isDeleted) {
          status = 'Deleted';
          color = '#dc2626';
          bgColor = '#fee2e2';
        } else if (isCancelled) {
          status = 'Cancelled';
          color = '#dc2626';
          bgColor = '#fee2e2';
        } else if (isShipped) {
          status = 'Shipped';
          color = '#166534';
          bgColor = '#dcfce7';
        }

        return (
          <Box 
            sx={{ 
              px: 1.5, 
              py: 0.5, 
              backgroundColor: bgColor,
              color: color,
              borderRadius: 2,
              display: 'inline-block',
              fontSize: '0.875rem',
              minWidth: 80,
              textAlign: 'center',
              lineHeight: 1.5
            }}
          >
            {status}
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 400,
      renderCell: (params) => {
        const isShipped = Boolean(params.row.awb);
        const isCancelled = params.row.cancelled;
        const isDeleted = params.row.deleted;
        const isProcessing = params.row.in_process;
        const serviceId = params.row.serviceId;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', height: 80 }}>
            {/* Manage/View Button */}
            {!isDeleted ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedShipment(params.row);
                  setIsManageOpen(true);
                }}
                sx={{ borderRadius: '24px' }}
              >
                {isShipped ? 'View' : 'Manage'}
              </Button>
            ): null}
            
            {/* Clone Button */}
            <Button
              variant="contained"
              size="small"
              onClick={() => handleClone(params.row)}
              disabled={getActionState(params.row.ord_id, 'cloning')}
              sx={{ borderRadius: '24px' }}
            >
              {getActionState(params.row.ord_id, 'cloning') ? 'Cloning...' : 'Clone'}
            </Button>
            
            {/* Refresh Button - only for processing shipments */}
            {isProcessing ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleRefresh(params.row)}
                disabled={getActionState(params.row.ord_id, 'refreshing')}
                sx={{ borderRadius: '24px' }}
              >
                {getActionState(params.row.ord_id, 'refreshing') ? 'Refreshing...' : 'Refresh'}
              </Button>
            ) : null}
            
            {/* Label Button - only for shipped, non-cancelled, specific services */}
            {(isShipped && !isProcessing && !isCancelled && ![6].includes(serviceId)) ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleGetLabel(params.row)}
                sx={{ borderRadius: '24px' }}
              >
                Label
              </Button>
            ): null}
            
            {/* Ship Button - only for unshipped orders */}
            {!isShipped && !isDeleted && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleShip(params.row)}
                sx={{ borderRadius: '24px' }}
              >
                Ship
              </Button>
            )}
            
            {/* Cancel Button - only for shipped, non-cancelled, specific services */}
            {isShipped && !isProcessing && !isCancelled && [1,2,4,5,6].includes(serviceId) && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleCancel(params.row)}
                disabled={getActionState(params.row.ord_id, 'cancelling')}
                sx={{ borderRadius: '24px' }}
              >
                {getActionState(params.row.ord_id, 'cancelling') ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
            
            {/* Delete Button - only for unshipped, non-deleted orders */}
            {!isShipped && !isDeleted && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDelete(params.row)}
                disabled={getActionState(params.row.ord_id, 'deleting')}
                sx={{ borderRadius: '24px' }}
              >
                {getActionState(params.row.ord_id, 'deleting') ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <>
      <div className={`w-full p-4 flex flex-col items-center gap-4 ${step == 0 ? "" : "hidden"}`}>
        {pickup ? <PickupRequest setPickup={setPickup} /> : null}
        
        {/* Header */}
        <div className="w-full px-4 relative flex">
          <div className="text-2xl font-medium">SHIPMENTS</div>
          <div
            onClick={() => setPickup(true)}
            className="px-5 py-1 bg-red-500 absolute rounded-3xl text-white right-4"
          >
            Pickup Request
          </div>
        </div>

        {/* Filters */}
        <Paper sx={{ p: 2, width: '100%', overflowX: 'auto' }}>
          <Box sx={{ display: 'inline-flex', gap: 2, alignItems: 'center', minWidth: '600px', whiteSpace: 'nowrap' }}>
            <TextField
              label="Customer Name"
              name="customer_name"
              size="small"
              value={filters.customer_name}
              onChange={handleChange}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Customer Email"
              name="customer_email"
              size="small"
              value={filters.customer_email}
              onChange={handleChange}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Order ID"
              name="orderId"
              size="small"
              value={filters.orderId}
              onChange={handleChange}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              size="small"
              value={filters.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              size="small"
              value={filters.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        </Paper>

        {/* DataGrid */}
        <Box sx={{ height: `${dataGridHeight}px`, width: '100%' }}>
          <DataGrid
            rows={shipments}
            columns={columns}
            loading={isLoading}
            hideFooter={true}
            disableSelectionOnClick
            getRowId={(row) => row.ord_id}
            rowHeight={80}
          />
        </Box>

        {/* Custom Pagination */}
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Modal for ManageForm */}
      {selectedShipment && (
        <Modal isOpen={isManageOpen} onClose={() => setIsManageOpen(false)}>
          <ManageForm
            isManage={isManageOpen}
            setIsManage={setIsManageOpen}
            shipment={selectedShipment}
            isShipped={Boolean(selectedShipment.awb)}
          />
        </Modal>
      )}
      
      {/* Modal for ShipList */}
      {selectedShipment && (
        <ShipList 
          shipment={selectedShipment}
          isShipOpen={isShipOpen}
          setIsShipOpen={setIsShipOpen}
          setIsShipped={() => {
            getParcels();
            setIsShipOpen(false);
          }}
          getParcels={getParcels}
        />
      )}
    </>
  );
};

const UpdateOrder = () => {
  const [step, setStep] = useState(0)
  return (
    <div className=" relative w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      {step == 0 && <Listing step={step} setStep={setStep} />}
      {/* <FullDetails /> */}
    </div>
  );
};

export default UpdateOrder;
