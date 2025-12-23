import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
const API_URL = import.meta.env.VITE_APP_API_URL
const Tracking = () => {
  const [isTracking, setIsTracking] = useState(false)
    const [formData,setFormData] = useState({
        awb : ''
    })

    useEffect(() => {
        if (localStorage.getItem('track')){
            setFormData({id: localStorage.getItem('track'), isWaybill: true})
            localStorage.setItem('track','')
            // handleSubmit(1)
        }
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]:type === 'radio' ? checked : value
        }));
      };
    const [trackingData,setTrackingData] = useState(null)
    const closeResultModal = () => {
        setTrackingData(null)
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsTracking(true)
        try{
            const data = await fetch(`${API_URL}/shipment/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            }).then(response => response.json())
            setTrackingData(data)
        } catch (e) {
            console.log(e)
        } finally {
            setIsTracking(false)
        }
    }
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4 py-10">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md border border-red-100">
        
        <img
          src="/image/track.jpg"
          alt="Tracking"
          className="w-full max-w-2xl h-auto mx-auto mb-6 rounded-xl shadow-md"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Track Your <span className="text-red-600">Parcel</span>
        </h1>

        {/* Input + Button */}
        <form className="flex items-center border border-red-400 rounded-lg overflow-hidden shadow-sm" onSubmit={handleSubmit}>
          <span className="px-4 py-2 text-red-600 font-semibold text-sm bg-red-50 border-r border-red-400">
            AWB
          </span>

          <input
            type="text"
            name="awb"
            value={formData.awb}
            onChange={handleChange}
            placeholder="Enter Tracking ID / AWB"
            className="flex-grow px-4 py-2 text-sm outline-none focus:bg-red-50 transition-all"
          />

          <button type='submit' className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all">
            TRACK
          </button>
        </form>
      </div>
    </div>
    {trackingData && <ResultModal data={trackingData} onClose={closeResultModal} />}
    </>
  );
};

const Card = ({ scan }) => {
  return (
    <>
    <div className="w-full px-4 py-3 flex items-start gap-4">
      <div className="mt-1 w-3 h-3 rounded-full bg-red-500 shadow shadow-red-200" />
      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-semibold text-gray-800">{scan?.Instructions || scan?.Scan || '—'}</div>
        <div className="mt-1 text-xs text-gray-500">{scan?.ScannedLocation || '—'}</div>
        <div className="mt-1 text-xs text-gray-400">{scan?.ScanDateTime || '—'}</div>
      </div>
    </div>
    <div className="my-2 border-b"> </div>
    </>
  )
}

const DelhiveryB2BCard = ({ scan }) => {
  return (
    <div className="w-full px-4 py-3 flex items-start gap-4">
      <div className="mt-1 w-3 h-3 rounded-full bg-red-500 shadow shadow-red-200" />
      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-semibold text-gray-800">{scan?.scan_remark || '—'}</div>
        <div className="mt-1 text-xs text-gray-500">{scan?.location || '—'}</div>
        <div className="mt-1 text-xs text-gray-400">{scan?.scan_timestamp || '—'}</div>
      </div>
    </div>
  )
}

const TrackingCard = ({ scan }) => {
    return (
        <>
            <div className="w-full py-3 bg-white relative items-center justify-center px-8 flex border-b space-x-4">
                <div className='flex flex-col items-center justify-center'>
                    <div className='font-bold'>{scan?.status}</div>
                    {scan?.description && <div>{scan.description}</div>}
                    {scan?.location && <div>{scan.location}</div>}
                    <div>{scan.timestamp}</div>
                </div>
            </div>
        </>
    )
}

const ResultModal = ({ data, onClose }) => {
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const count = Array.isArray(data?.data) ? data.data.length : 0;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="bg-linear-to-r from-red-600 to-rose-500 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Shipment Tracking</h2>
            <p className="text-white/80 text-xs">{count} update{count === 1 ? '' : 's'} found</p>
          </div>
          <button
            className="rounded-full p-1.5 hover:bg-white/10 focus:outline-none"
            aria-label="Close modal"
            onClick={onClose}
          >
            <span className="block text-xl leading-none">×</span>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto py-2">
          {/* Vertical timeline rail */}
          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gray-200" />

            {/* Conditional Rendering for Cards */}
            {Number(data?.id) === 1 ? (
              // some providers return B2B shape
              (Array.isArray(data?.data) ? data.data : [data?.data])
                .filter(Boolean)
                .slice()
                .reverse()
                .map((scan, index) => (
                  <DelhiveryB2BCard key={index} scan={scan} />
                ))
            ) : null}
            {Number(data?.id) === 2 ? (
              data?.data?.slice()?.reverse()?.map((scan, index) => (
                <Card key={index} scan={scan?.ScanDetail ?? scan} />
              ))
            ) : null}
            {Number(data?.id) !== 1 && Number(data?.id) !== 2 ? (
              data?.data?.map((scan, index) => (
                <TrackingCard key={index} scan={scan} />
              ))
            ) : null}
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};



export default Tracking;
