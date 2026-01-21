import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export const FormContext = createContext();
import { z } from 'zod';

// Helpers (mirroring CreateOrder helpers where relevant)
const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getPickupTime = () => {
  const currentTime = getCurrentTime();
  let hour = parseInt(currentTime.split(':')[0], 10) + 1;
  const minute = currentTime.split(':')[1];
  if (hour >= 24) {
    hour = hour - 24;
  }
  const hourString = String(hour).padStart(2, '0');
  return `${hourString}:${minute}`;
};

const PAY_MODES = ['COD', 'Pre-paid', 'topay'];
const ADDRESS_TYPES = ['home', 'office'];
const SHIPPING_TYPES = ['Surface', 'Express'];

export const FormProvider = ({ children }) => {
  const [B2CBulkShipmentFormFields, setB2CBulkShipmentFormFields] = useState({
    // wid: {
    //   category: 'Pickup Details',
    //   label: 'Pickup Warehouse Name',
    //   inputType: 'text',
    //   required: true,
    //   validation: z.string({
    //     error: issue =>
    //       issue.input === undefined
    //         ? 'Pickup Warehouse Name is required'
    //         : issue.code === 'invalid_type'
    //         ? 'Pickup Warehouse Name must be a string'
    //         : undefined,
    //   }).min(1, { error: 'Pickup Warehouse Name is required' }),
    //   colSpan: 6,
    // },
    // pickupDate: {
    //   category: 'Pickup Details',
    //   label: 'Pickup Date',
    //   inputType: 'date',
    //   required: true,
    //   defaultValue: getTodaysDate(),
    //   validation: z
    //     .string({
    //       error: issue =>
    //         issue.input === undefined
    //           ? 'Pickup Date is required'
    //           : issue.code === 'invalid_type'
    //           ? 'Pickup Date must be a string'
    //           : undefined,
    //     })
    //     .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Pickup Date must be in yyyy-mm-dd format' }),
    //   colSpan: 3,
    // },
    // pickupTime: {
    //   category: 'Pickup Details',
    //   label: 'Pickup Time',
    //   inputType: 'time',
    //   required: true,
    //   defaultValue: getPickupTime(),
    //   validation: z
    //     .string({
    //       error: issue =>
    //         issue.input === undefined
    //           ? 'Pickup Time is required'
    //           : issue.code === 'invalid_type'
    //           ? 'Pickup Time must be a string'
    //           : undefined,
    //     })
    //     .regex(/^\d{2}:\d{2}$/, { error: 'Pickup Time must be in HH:MM format' }),
    //   colSpan: 3,
    // },
    payMode: {
      category: 'Payment Details',
      label: 'Payment Method',
      inputType: 'select',
      required: true,
      options: [],
      getOptions: () => PAY_MODES,
      validation: z.enum(PAY_MODES, { error: 'Payment Method is required' }),
      colSpan: 4,
    },
    name: {
      category: 'Receiver Details',
      label: "Buyer Name",
      inputType: 'text',
      required: true,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? "Buyer name is required"
              : issue.code === 'invalid_type'
              ? 'Buyer name must be a string'
              : undefined,
        })
        .min(1, { error: "Buyer name is required" })
        .max(50, { error: 'Buyer name must be less than 50 characters' }),
      colSpan: 6,
    },
    email: {
      // category: 'Receiver Details',
      label: 'Email',
      inputType: 'text',
      required: true,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'Email is required'
              : issue.code === 'invalid_type'
              ? 'Email must be a string'
              : undefined,
        })
        .email({ error: 'Invalid email address' }),
      colSpan: 6,
    },
    phone: {
      // category: 'Receiver Details',
      label: 'Phone',
      inputType: 'text',
      required: true,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'Phone number is required'
              : issue.code === 'invalid_type'
              ? 'Phone must be a string'
              : undefined,
        })
        .regex(/^[6-9]\d{9}$/, { error: 'Enter valid 10-digit Indian mobile number' }),
      colSpan: 6,
    },
    address: {
      // category: 'Receiver Details',
      label: 'Shipping Address',
      inputType: 'textField',
      required: true,
      maxLength: 100,
      rows: 1,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'Shipping address is required'
              : issue.code === 'invalid_type'
              ? 'Shipping address must be a string'
              : undefined,
        })
        .min(5, { error: 'Shipping address must be at least 5 characters' })
        .max(100, { error: 'Shipping address must be less than 100 characters' }),
      colSpan: 12,
    },
    addressType: {
      label: 'Address Type',
      inputType: 'select',
      required: true,
      options: [],
      getOptions: () => ADDRESS_TYPES,
      validation: z.enum(ADDRESS_TYPES, { error: 'Address Type is required' }),
      colSpan: 3,
    },
    postcode: {
      label: 'Pincode',
      inputType: 'text',
      required: true,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'Pincode is required'
              : issue.code === 'invalid_type'
              ? 'Pincode must be a string'
              : undefined,
        })
        .regex(/^[1-9][0-9]{5}$/, { error: 'Enter a valid 6-digit Indian pincode' }),
      colSpan: 3,
    },
    city: {
      label: 'City',
      inputType: 'text',
      required: true,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'City is required'
              : issue.code === 'invalid_type'
              ? 'City must be a string'
              : undefined,
        })
        .min(2, { error: 'City must be at least 2 characters' })
        .max(50, { error: 'City must be less than 50 characters' }),
      colSpan: 3,
    },
    state: {
      label: 'State',
      inputType: 'text',
      required: true,
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'State is required'
              : issue.code === 'invalid_type'
              ? 'State must be a string'
              : undefined,
        })
        .min(2, { error: 'State must be at least 2 characters' })
        .max(50, { error: 'State must be less than 50 characters' }),
      colSpan: 3,
    },
    country: {
      label: 'Country',
      inputType: 'text',
      required: true,
      defaultValue: 'India',
      validation: z
        .string({
          error: issue =>
            issue.input === undefined
              ? 'Country is required'
              : issue.code === 'invalid_type'
              ? 'Country must be a string'
              : undefined,
        })
        .min(2, { error: 'Country must be at least 2 characters' }),
      colSpan: 3,
    },
    shipmentValue: {
      category: 'Shipment Details',
      label: 'Shipment Value (₹)',
      inputType: 'number',
      required: true,
      defaultValue: 0,
      validation: z
        .coerce.number({
          error: issue =>
            issue.input === undefined
              ? 'Shipment Value is required'
              : issue.code === 'invalid_type'
              ? 'Shipment Value must be a number'
              : undefined,
        })
        .min(1, { error: 'Shipment Value must be greater than 0' }),
      colSpan: 2,
    },
    cod: {
      label: 'COD Amount (₹)',
      inputType: 'number',
      required: true,
      defaultValue: 0,
      validation: z
        .coerce.number({
          error: issue =>
            issue.input === undefined
              ? 'COD Amount is required'
              : issue.code === 'invalid_type'
              ? 'COD Amount must be a number'
              : undefined,
        })
        .min(0, { error: 'COD Amount must be a non-negative number' }),
      colSpan: 2,
    },
    discount: {
      label: 'Discount (₹)',
      inputType: 'number',
      required: true,
      defaultValue: 0,
      conditions: () => false,
      validation: z
        .coerce.number({
          error: issue =>
            issue.input === undefined
              ? 'Discount is required'
              : issue.code === 'invalid_type'
              ? 'Discount must be a number'
              : undefined,
        })
        .min(0, { error: 'Discount must be a non-negative number' }),
      colSpan: 2,
    },
    shippingType: {
      label: 'Shipping Type',
      inputType: 'select',
      required: true,
      defaultValue: 'Surface',
      options: [],
      getOptions: () => SHIPPING_TYPES,
      validation: z.enum(SHIPPING_TYPES, { error: 'Shipping Type is required' }),
      colSpan: 2,
    },
    customer_reference_number: {
      label: 'Customer Reference Number',
      inputType: 'text',
      required: false,
      validation: z
        .string({
          error: issue =>
            issue.code === 'invalid_type'
              ? 'Customer Reference Number must be a string'
              : undefined,
        })
        .max(15, { error: 'Customer Reference Number cannot exceed 15 characters' })
        .optional(),
      colSpan: 3,
    },
    gst: {
      label: 'GSTIN',
      inputType: 'text',
      required: false,
      validation: z.string().optional(),
      colSpan: 3,
    },
    insurance: {
      label: 'Insurance Required',
      inputType: 'switch',
      required: false,
      defaultValue: false,
      validation: z.boolean().optional(),
      colSpan: 6,
    },
    isB2B: {
      label: 'Is B2B Shipment',
      inputType: 'switch',
      required: true,
      defaultValue: false,
      validation: z.boolean({ error: 'This field is required' }),
      colSpan: 6,
    },
    box_weight: {
      required: true,
      label: 'Box Weight',
      inputType: 'number',
      defaultValue: 0.5,
      validation: z
        .coerce.number({
          error: issue =>
            issue.input === undefined
              ? 'Box Weight is required'
              : issue.code === 'invalid_type'
              ? 'Box Weight must be a number'
              : undefined,
        })
        .min(0.1, { error: 'Box Weight must be at least 0.1 kg' }),
      colSpan: 2,
    },
    weight_unit: {
      label: 'Weight Unit',
      inputType: 'select',
      required: true,
      defaultValue: 'kg',
      options: [{id: 'kg', name: 'Kg'}, {id: 'g', name: 'Gm'}],
      validation: z.enum(['kg', 'g'], { error: 'Weight Unit is required' }),
      colSpan: 2,
    },
    length: {
      label: 'Length',
      inputType: 'number',
      required: true,
      defaultValue: 10,
      validation: z.coerce.number({
        error: issue =>
          issue.input === undefined
            ? 'Length is required'
            : issue.code === 'invalid_type'
            ? 'Length must be a number'
            : undefined,
      }).min(1, { error: 'Length must be greater than 0' }),
      colSpan: 2,
    },
    breadth: {
      label: 'Breadth',
      inputType: 'number',
      required: true,
      defaultValue: 10,
      validation: z.coerce.number({
        error: issue =>
          issue.input === undefined
            ? 'Breadth is required'
            : issue.code === 'invalid_type'
            ? 'Breadth must be a number'
            : undefined,
      }).min(1, { error: 'Breadth must be greater than 0' }),
      colSpan: 2,
    },
    height: {
      label: 'Height',
      inputType: 'number',
      required: true,
      defaultValue: 10,
      validation: z.coerce.number({
        error: issue =>
          issue.input === undefined
            ? 'Height is required'
            : issue.code === 'invalid_type'
            ? 'Height must be a number'
            : undefined,
      }).min(1, { error: 'Height must be greater than 0' }),
      colSpan: 2,
    },
  });

  return (
    <FormContext.Provider value={{ B2CBulkShipmentFormFields, setB2CBulkShipmentFormFields }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
