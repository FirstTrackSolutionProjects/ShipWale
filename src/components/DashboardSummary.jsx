import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
const API_URL = import.meta.env.VITE_APP_API_URL

const DashboardSummaryCard = ({title, number}) => {
  return (
    <div className="rounded-xl flex-1 m-2  min-w-64 h-32 transition-all flex items-center duration-300 text-red-400 font-medium bg-white hover:text-white hover:bg-red-400">
      <img src="/image/logo-nobg.png" alt=""className="w-24" />
      <div>
        <div>{title}</div>
        <div className="text-xl">{number}</div>
      </div>
    </div>
  )
}


const DashboardSummary = () => { 
  const [summary, setSummary] = useState(null)
  const admin = jwtDecode(localStorage.getItem('token')).admin
  useEffect(() => {
      const getStatistics = async () => {
        await fetch(`${API_URL}/dashboard/statistics`, {
          method: 'POST',
          headers: { 'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'),
          }
        }).then(response => response.json()).then(response => {setSummary(response); console.log(response)});
      }
      getStatistics()
  },[])
    return (
        <div className="w-full max-w-[1220px] flex flex-wrap justify-center px-4">
            {admin ? <DashboardSummaryCard title="Total Merchants" number={summary?summary.merchant:0} /> : null}
            <DashboardSummaryCard title="Total Warehouses" number={summary?summary.warehouse:0} />
            <DashboardSummaryCard title="Total Shipments" number={summary?summary.shipment:0} />
            <DashboardSummaryCard title="Total Delivered" number={summary?summary.delivered:0} />
            <DashboardSummaryCard title="Pending Pickups" number={summary?summary.unDelivered:0} />
            <DashboardSummaryCard title={admin?`Total Revenue`:`Total Wallet Recharge`} number={summary? (admin ? summary.revenue : summary.total_recharge) :0}/>
            <DashboardSummaryCard title="Parcel on process" number={summary?summary.inTransit:0} />
            <DashboardSummaryCard title="Total RTO Shipments" number={summary?summary.rtoShipment:0} />
            {/* <DashboardSummaryCard title="NDR Parcel" number="0" /> */}
        </div>
    )
}

export default DashboardSummary