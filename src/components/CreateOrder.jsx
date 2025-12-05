import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

const schema = z.object({
  wid: z.string().min(1, "Pickup Warehouse Name is required"),
  // order: z.string().min(1, "Order ID is required"),
  // date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (DD/MM/YYYY)"),
  payMode: z.enum(['COD', 'Pre-paid', 'topay']),
  name: z.string().min(1, "Buyer's name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Invalid phone number"),
  address: z.string().min(1, "Shipping address is required"),
  addressType: z.enum(['home', 'office']),
  postcode: z.string().regex(/^\d{6}$/, "Invalid postcode"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  same: z.boolean(),
  Baddress: z.string().optional(),
  BaddressType: z.enum(['home', 'office']).optional(),
  Bpostcode: z.string().optional(),
  Bcity: z.string().optional(),
  Bstate: z.string().optional(),
  Bcountry: z.string().optional(),
  orders: z.array(
    z.object({
      box_no: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Box no. must be at least 1")),
      product_name: z.string().min(1, "Product name is required"),
      product_quantity: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Quantity must be at least 1")),
      selling_price: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(0, "Price must be a non-negative number")),
      tax_in_percentage: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(0, "Tax must be a positive number")),
    })
  ),
  boxes: z.array(
    z.object({
      box_no: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Box no. must be at least 1")),
      length: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Length must be at greater than 0")),
      breadth: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Breadth must be at greater than 0")),
      height: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Height must be at greater than 0")),
      weight: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Weight must be at greater than 0")),
        weight_unit: z.enum(['g','kg']),
      quantity: z.preprocess(
        (a) => parseInt(a, 10),
        z.number().min(1, "Quantity must be at least 1")
      )
    })
  ),
  discount: z.preprocess(
    (a) => parseInt(a, 10),
    z.number().min(0, "Must be a non-negative number")),
  cod: z.preprocess(
    (a) => parseInt(a, 10),
    z.number().min(0, "COD must be a positive number")),
  shippingType: z.enum(['Surface', 'Express']),
  gst: z.string(),
  Cgst: z.string().optional(),
  pickupDate: z.string(),
  pickupTime: z.preprocess((a) => a + ':00', z.string()),
  shipmentValue: z.preprocess(
    (a) => parseFloat(a),
    z.number().min(1, "Shipment value must be greater than 0")
  ),
  insurance: z.boolean().optional(),
  ewaybill: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  invoiceAmount: z.preprocess(
    (a) => parseInt(a, 10),
    z.number().min(1, "Invoice Amount must be a positive number")),
  invoiceUrl: z.string().optional(),
  isB2B: z.boolean(),
  customer_reference_number: z.string().max(15, "Customer Reference Number cannot exceed 15 characters")
}).refine((data) => !data.isB2B || (data.isB2B && !!data.invoiceUrl), {
  message: "Invoice is required for B2B shipments",
  path: ["invoiceUrl"],
}).refine((data) => (data.shipmentValue < 50000) || (data.ewaybill && data.ewaybill.length > 0), {
  message: "Ewaybill is required for invoice amount of at least 50000",
  path: ["ewaybill"], // Error path
});
const FullDetails = () => {
  const [warehouses, setWarehouses] = useState([]);
  const { register, control, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pickupDate: getTodaysDate(),
      pickupTime: getCurrentTime(),
      payMode: 'Pre-paid',
      postcode: '',
      Bpostcode: '',
      same: true,
      shipmentValue: 0,
      insurance: false,
      discount: 0,
      cod: 0,
      addressType: "home",
      BaddressType: "home",
      shippingType: "Surface",
      orders: [{ box_no: '1', product_name: '', product_quantity: 0, selling_price: 0, tax_in_percentage: 0 }],
      boxes: [{ box_no: 1, length: 0, breadth: 0, height: 0, weight: 0, weight_unit: 'kg', quantity: 1 }],
      invoiceAmount: 1,
      isB2B: false,
      invoiceUrl: ''
    }
  });
  useEffect(() => {
    console.log(errors)
  }, [errors])
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'orders'
  });
  const boxes = useFieldArray({
    control,
    name: 'boxes'
  });
  useEffect(() => {

    const pinToAdd = async () => {
      try {
        await fetch(`https://api.postalpincode.in/pincode/${watch('postcode')}`)
          .then(response => response.json())
          .then(result => {
            const city = result[0].PostOffice[0].District
            const state = result[0].PostOffice[0].State
            setValue('city', city)
            setValue('state', state)
          })
      } catch (e) {
        setValue('city', '')
        setValue('state', '')
      }
    }
    if (watch('postcode').length == 6) pinToAdd()
  }, [watch('postcode')])
  useEffect(() => {
    const pinToAdd = async () => {
      try {
        await fetch(`https://api.postalpincode.in/pincode/${watch('Bpostcode')}`)
          .then(response => response.json())
          .then(result => {
            const city = result[0].PostOffice[0].District
            const state = result[0].PostOffice[0].State
            setValue('Bcity', city)
            setValue('Bstate', state)
          })
      } catch (e) {
        setValue('Bcity', '')
        setValue('Bstate', '')
      }
    }
    if (watch('Bpostcode').length == 6) pinToAdd()
  }, [watch('Bpostcode')])

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

  const onSubmit = async (data) => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
        
    // Combine shipment pickup date and time into a single Date object
    const pickupDateAndTime = new Date(`${data.pickupDate}T${data.pickupTime}`);
        
    // Compare pickup time with the current IST time
    if (pickupDateAndTime < istDate) {
        alert('Pickup time is already passed. Please update and try again');
        return;
    }
    let boxFlag = 0
    for (let i = 0; i < data.boxes.length; i++) {
      for (let j = 0; j < data.orders.length; j++) {
        if (parseInt(data.orders[j].box_no) == i + 1) {
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
    for (let i = 0; i < data.orders.length; i++) {
      for (let j = 0; j < data.boxes.length; j++) {
        if (data.orders[i].box_no == data.boxes[j].box_no) {
          itemFlag = 1
        }
      }
      if (itemFlag == 0) {
        alert('Some items have invalid box no.')
        return
      }
      itemFlag = 0
    }
    try {
      const response = await fetch(`${API_URL}/order/domestic/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        alert('Order created successfully');
      } else {
        alert('Order failed: ' + result.message);
        console.log(result.orders);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during Order');
    }
  };
  const [invoice, setInvoice] = useState(null);
  const handleInvoice = (e) => {
    const { files } = e.target;
    setInvoice(files[0]);
  };

  const handleInvoiceUpload = async () => {
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
        setValue("invoiceUrl", key);
        alert("Invoice uploaded successfully!");
      } else {
        setValue("invoiceUrl", null)
        alert("Failed to upload invoice!");
      }
    })



  }

  return (
    <div className="w-full p-4 flex flex-col items-center">
      <div className="text-3xl font-medium text-center my-8">Enter Shipping Details</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="wid">Pickup Warehouse Name</label>
            <select
              className="w-full border py-2 px-4 rounded"
              id="wid"
              {...register("wid")}
            >
              <option value="">Select Warehouse</option>
              {warehouses.length ?
                warehouses.map((warehouse, index) => (
                  <option key={index} value={warehouse.wid}>{warehouse.warehouseName}</option>
                )) : null
              }
            </select>
            {errors.wid && <span className='text-red-500'>{errors.wid.message}</span>}
          </div>
        </div>

        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="pickupDate">Pickup Date</label>
            <input required
              className="w-full border py-2 px-4 rounded"
              type="date"
              min={getTodaysDate()}
              id="pickupDate"
              {...register("pickupDate")}
            />
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="pickupTime">Pickup Time</label>
            <input required
              className="w-full border py-2 px-4 rounded"
              type="time"
              id="pickupTime"
              {...register("pickupTime")}
            />
          </div>
        </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="payMode">Payment Method</label>
            <select
              className="w-full border py-2 px-4 rounded"
              id="payMode"
              {...register("payMode")}
            >
              <option value="COD">COD</option>
              <option value="Pre-paid">Prepaid</option>
              <option value="topay">To Pay</option>
            </select>
            {errors.payMode && <span className='text-red-500'>{errors.payMode.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="name">Buyer's Name</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="name"
              {...register("name")}
              placeholder="Ex. John Doe"
            />
            {errors.name && <span className='text-red-500'>{errors.name.message}</span>}
          </div>
        </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="email">Email</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="email"
              id="email"
              {...register("email")}
              placeholder="Ex. john@example.com"
            />
            {errors.email && <span className='text-red-500'>{errors.email.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="phone">Phone Number</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="phone"
              {...register("phone")}
              placeholder="Ex. 9876543210"
            />
            {errors.phone && <span className='text-red-500'>{errors.phone.message}</span>}
          </div>
        </div>

        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="address">Shipping Address</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              maxLength={100}
              id="address"
              {...register("address")}
              placeholder="Ex. 123 Street"
            />
            {errors.address && <span className='text-red-500'>{errors.address.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="addressType">Shipping Address Type</label>
            <select
              className="w-full border py-2 px-4 rounded"
              id="addressType"
              {...register("addressType")}
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
            </select>
            {errors.addressType && <span className='text-red-500'>{errors.addressType.message}</span>}
          </div>
        </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="postcode">Shipping Postcode</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="postcode"
              pattern='^\d{6}$'
              {...register("postcode")}
              placeholder="Ex. 123456"
            />
            {errors.postcode && <span className='text-red-500'>{errors.postcode.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="city">Shipping City</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="city"
              {...register("city")}
              placeholder="Ex. New York"
            />
            {errors.city && <span className='text-red-500'>{errors.city.message}</span>}
          </div>
        </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="state">Shipping State</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="state"
              {...register("state")}
              placeholder="Ex. NY"
            />
            {errors.state && <span className='text-red-500'>{errors.state.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="country">Shipping Country</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="country"
              value={"India"}
              {...register("country")}
              placeholder="Ex. USA"
            />
            {errors.country && <span className='text-red-500'>{errors.country.message}</span>}
          </div>
        </div>
        <div className="w-full flex mb-2 items-center">
          <input
            className="mr-2"
            type="checkbox"
            id="same"
            {...register("same")}
          />
          <label htmlFor="same">Billing Address same as Shipping Address</label>
        </div>
        {/* Additional Billing Address Fields if 'same' is not checked */}
        {!watch("same") && (
          <>
            <div className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="Baddress">Billing Address</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  maxLength={100}
                  id="Baddress"
                  {...register("Baddress")}
                  placeholder="Ex. 123 Street"
                />
                {errors.Baddress && <span className='text-red-500'>{errors.Baddress.message}</span>}
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="BaddressType">Billing Address Type</label>
                <select
                  className="w-full border py-2 px-4 rounded"
                  id="BaddressType"
                  {...register("BaddressType")}
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                </select>
                {errors.BaddressType && <span className='text-red-500'>{errors.BaddressType.message}</span>}
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="Bpostcode">Billing Postcode</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="Bpostcode"
                  pattern='^\d{6}$'
                  {...register("Bpostcode")}
                  placeholder="Ex. 123456"
                />
                {errors.Bpostcode && <span className='text-red-500'>{errors.Bpostcode.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="Bcity">Billing City</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="Bcity"
                  {...register("Bcity")}
                  placeholder="Ex. New York"
                />
                {errors.Bcity && <span className='text-red-500'>{errors.Bcity.message}</span>}
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="Bstate">Billing State</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="Bstate"
                  {...register("Bstate")}
                  placeholder="Ex. NY"
                />
                {errors.Bstate && <span className='text-red-500'>{errors.Bstate.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="Bcountry">Billing Country</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="Bcountry"
                  value={"India"}
                  {...register("Bcountry")}
                  placeholder="Ex. USA"
                />
                {errors.Bcountry && <span className='text-red-500'>{errors.Bcountry.message}</span>}
              </div>
            </div>
          </>
        )}
        <div className="w-full flex mb-2 flex-wrap">
          <div className="w-full mb-2">
            <div className="text-2xl font-medium">Order Details</div>
          </div>
          {boxes.fields.map((field, index) => (
            <div key={field.id} className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2  space-y-2">
                <label htmlFor={`boxes[${index}].box_no`}>Box No.</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`boxes[${index}].box_no`}
                  value={index + 1}
                  disabled
                  {...register(`boxes[${index}].box_no`)}
                />
                {errors.boxes?.[index]?.box_no && <span className='text-red-500'>{errors.boxes?.[index]?.box_no.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 space-y-2">
                <label htmlFor={`boxes[${index}].length`}>Length (in cm)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`boxes[${index}].length`}
                  {...register(`boxes[${index}].length`)}
                />
                {errors.boxes?.[index]?.length && <span className='text-red-500'>{errors.boxes?.[index]?.length.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2  space-y-2">
                <label htmlFor={`boxes[${index}].breadth`}>Width (in cm)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`boxes[${index}].breadth`}
                  {...register(`boxes[${index}].breadth`)}
                />
                {errors.boxes?.[index]?.breadth && <span className='text-red-500'>{errors.boxes?.[index]?.breadth.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 space-y-2">
                <label htmlFor={`boxes[${index}].height`}>Height (in cm)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`boxes[${index}].height`}
                  {...register(`boxes[${index}].height`)}
                />
                {errors.boxes?.[index]?.height && <span className='text-red-500'>{errors.boxes?.[index]?.height.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2  space-y-2">
                <label htmlFor={`boxes[${index}].weight`}>Weight</label>
                <div className='w-full flex space-x-2'>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`boxes[${index}].weight`}
                  {...register(`boxes[${index}].weight`)}
                />
                <select
                  className="w-full border py-2 px-4 rounded"
                  id={`boxes[${index}].weight_unit`}
                  {...register(`boxes[${index}].weight_unit`)}
                >
                  <option value="g">gm</option>
                  <option value="kg">kg</option>
                </select>
                </div>
                {errors.boxes?.[index]?.weight && <span className='text-red-500'>{errors.boxes?.[index]?.weight.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 space-y-2">
                <label htmlFor={`boxes[${index}].quantity`}>Quantity</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`boxes[${index}].quantity`}
                  {...register(`boxes[${index}].quantity`)}
                />
                {errors.boxes?.[index]?.quantity && <span className='text-red-500'>{errors.boxes?.[index]?.quantity.message}</span>}
              </div>
              {watch('boxes').length > 1 ? <div className="w-full text-right">
                <button type="button" className="text-red-500" onClick={() => boxes.remove(index)}>Remove</button>
              </div> : null}
            </div>
          ))}
          <div className="w-full text-right">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => boxes.append({ box_no: watch('boxes').length + 1, product_name: '', product_quantity: 0, selling_price: 0, discount: '', tax_in_percentage: 0 })}
            >
              Add Boxes
            </button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2  max-w-[150px] min-w-[150px] space-y-2">
                <label htmlFor={`orders[${index}].box_no`}>Box No</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`orders[${index}].box_no`}
                  defaultValue={1}
                  {...register(`orders[${index}].box_no`)}
                />
                {errors.orders?.[index]?.box_no && <span className='text-red-500'>{errors.orders[index].box_no.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[200px] space-y-2">
                <label htmlFor={`orders[${index}].product_name`}>Product Name</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id={`orders[${index}].product_name`}
                  {...register(`orders[${index}].product_name`)}
                />
                {errors.orders?.[index]?.product_name && <span className='text-red-500'>{errors.orders[index].product_name.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 max-w-[150px] min-w-[150px] space-y-2">
                <label htmlFor={`orders[${index}].product_quantity`}>Quantity</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="number"
                  id={`orders[${index}].product_quantity`}
                  {...register(`orders[${index}].product_quantity`)}
                />
                {errors.orders?.[index]?.product_quantity && <span className='text-red-500'>{errors.orders[index].product_quantity.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 max-w-[150px] min-w-[150px] space-y-2">
                <label htmlFor={`orders[${index}].selling_price`}>Price</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="number"
                  id={`orders[${index}].selling_price`}
                  {...register(`orders[${index}].selling_price`)}
                />
                {errors.orders?.[index]?.selling_price && <span className='text-red-500'>{errors.orders[index].selling_price.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 max-w-[150px] min-w-[150px] space-y-2">
                <label htmlFor={`orders[${index}].tax_in_percentage`}>Tax (in %)</label>
                <input
                  className="w-full border py-2 px-4 rounded"
                  type="number"
                  id={`orders[${index}].tax_in_percentage`}
                  {...register(`orders[${index}].tax_in_percentage`)}
                />
                {errors.orders?.[index]?.tax_in_percentage && <span className='text-red-500'>{errors.orders[index].tax_in_percentage.message}</span>}
              </div>
              {watch('orders').length > 1 ? <div className="w-full text-right">
                <button type="button" className="text-red-500" onClick={() => remove(index)}>Remove</button>
              </div> : null}
            </div>
          ))}
          <div className="w-full text-right">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => append({ box_no: 1, product_name: '', product_quantity: 0, selling_price: 0, discount: '', tax_in_percentage: 0 })}
            >
              Add Product
            </button>
          </div>
        </div>
        <div className="w-full flex mb-2 items-center">
          <input
            className="mr-2"
            type="checkbox"
            id="isB2B"
            {...register("isB2B")}
          />
          <label htmlFor="isB2B">Is this a B2B shipment?</label>
        </div>
        {
          watch("isB2B") ? <>
            <div className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="invoiceNumber">Invoice Number</label>
                <input required={watch("isB2B")}
                  className="w-full border py-2 px-4 rounded"
                  type="text"
                  id="invoiceNumber"
                  {...register("invoiceNumber")}
                />
                {errors.invoiceNumber && <span className='text-red-500'>{errors.invoiceNumber.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="invoiceDate">Invoice Date</label>
                <input required={watch("isB2B")}
                  className="w-full border py-2 px-4 rounded"
                  type="date"
                  id="invoiceDate"
                  {...register("invoiceDate")}
                />
                {errors.invoiceDate && <span className='text-red-500'>{errors.invoiceDate.message}</span>}
              </div>
            </div>
            <div className="w-full flex mb-2 flex-wrap">
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="invoiceAmount">Invoice Amount</label>
                <input required={watch("isB2B")}
                  className="w-full border py-2 px-4 rounded"
                  type="number"
                  id="invoiceAmount"
                  {...register("invoiceAmount")}
                />
                {errors.invoiceAmount && <span className='text-red-500'>{errors.invoiceAmount.message}</span>}
              </div>
              <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
                <label htmlFor="invoice">Invoice</label>

                <input
                  className="w-full border py-2 px-4 rounded"
                  type="file"
                  id="invoice"
                  onChange={handleInvoice}
                />
                {errors.invoiceUrl && <span className='text-red-500'>{errors.invoiceUrl.message}</span>}
                <button
                  type='button'
                  className="bg-red-500 text-white px-6 py-2 rounded"
                  onClick={handleInvoiceUpload}
                >
                  Upload
                </button>
                {errors.cod && <span className='text-red-500'>{errors.cod.message}</span>}
              </div>
            </div>
          </> : null
        }
        <div className="flex-1 mb-2 min-w-[300px] space-y-2 flex items-center">
            <div>
              <input
                className="mr-2"
                type="checkbox"
                id="insurance"
                {...register("insurance")}
              />
              <label htmlFor="insurance">Do you want insurance?</label>
            </div>
          </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="shipmentValue">Shipment Value</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="number"
              id="shipmentValue"
              {...register("shipmentValue")}
            />
            {errors.shipmentValue && <span className='text-red-500'>{errors.shipmentValue.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="ewaybill">E-Waybill</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="ewaybill"
              {...register("ewaybill")}
            />
            {errors.ewaybill && <span className='text-red-500'>{errors.ewaybill.message}</span>}
          </div>
        </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="discount">Discount</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="number"
              id="discount"
              {...register("discount")}
            />
            {errors.discount && <span className='text-red-500'>{errors.discount.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="cod">COD</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="number"
              min={watch("payMode") == "Pre-paid" ? 0 : 1}
              id="cod"
              {...register("cod")}
            />
            {errors.cod && <span className='text-red-500'>{errors.cod.message}</span>}
          </div>
        </div>
        <div className="w-full flex mb-2 flex-wrap">
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="shippingType">Shipping Type</label>
            <select
              className="w-full border py-2 px-4 rounded"
              id="shippingType"
              {...register("shippingType")}
            >
              <option value="Surface">Surface</option>
              <option value="Express">Express</option>
            </select>
            {errors.shippingType && <span className='text-red-500'>{errors.shippingType.message}</span>}
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="customer_reference_number">Customer Reference Number</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="customer_reference_number"
              {...register("customer_reference_number")}
            />
            {errors.customer_reference_number && <span className='text-red-500'>{errors.customer_reference_number.message}</span>}
          </div>
        </div>

        <div className="w-full flex mb-2 flex-wrap">

          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="gst">Seller GSTIN</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="gst"
              {...register("gst")}
            />
            {errors.gst && <span className='text-red-500'>{errors.gst.message}</span>}
          </div>

        </div>
        <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
          <label htmlFor="Cgst">Customer GSTIN(For B2B)</label>
          <input
            className="w-full border py-2 px-4 rounded"
            type="text"
            id="Cgst"
            {...register("Cgst")}
          />
          {errors.Cgst && <span className='text-red-500'>{errors.Cgst.message}</span>}
        </div>
        <div className="w-full flex justify-center mt-4">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateOrder = () => {
  const [step, setStep] = useState(0)
  return (
    <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      {/* {step==0 && <InitialDetails setStep={setStep} />} */}
      <FullDetails />
    </div>
  );
};

export default CreateOrder;
