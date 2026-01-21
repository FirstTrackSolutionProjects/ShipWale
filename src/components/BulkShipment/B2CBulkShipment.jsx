import React, { useRef, useState } from 'react'
import CustomForm from '../CustomComponents/CustomForm'
import { useForm } from '@/context/FormContext';

const ShipmentCard = ({ shipment, index }) => {
  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white/80 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Shipment
          </p>
          <h3 className="text-lg font-semibold text-gray-900">#{index + 1}</h3>
        </div>
        {shipment.payMode && (
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {shipment.payMode}
          </span>
        )}
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Value</p>
          <p className="font-medium text-gray-900">₹{shipment.shipment_value}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Customer</p>
          <p className="font-medium text-gray-900 truncate">{shipment.customer_name}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Postcode</p>
          <p className="font-medium text-gray-900">{shipment.shipping_postcode}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Weight</p>
          <p className="font-medium text-gray-900">
            {shipment.weight} {shipment.weight_unit}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Dimensions (L × B × H)</p>
          <p className="font-medium text-gray-900">
            {shipment.length} × {shipment.breadth} × {shipment.height}
          </p>
        </div>
      </div>
    </div>
  )
}

const ShipmentList = ({shipments}) => {
  return (
  <div>
    {shipments.map((shipment, index) => (
      <ShipmentCard key={index} shipment={shipment} index={index} />
    ))}
  </div>)
}

const B2CBulkShipment = () => {
  const [shipments, setShipments] = useState([
    {
      payMode: 'Prepaid',
      length: 10,
      breadth: 5,
      height: 8,
      weight: 2,
      weight_unit: 'kg',
      shipment_value: 500,
      customer_name: 'John Doe',
      shipping_address: '123 Main St, Cityville',
      customer_phone: '9876543210',
      shipping_postcode: '123456',
      cod: 0,
      discount: 0,
    }
  ])
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <ShipmentList shipments={shipments} />
    </div>
  )
}

export default B2CBulkShipment
