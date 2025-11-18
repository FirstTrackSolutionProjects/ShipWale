import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Track = ({track, setTrack}) => {
  const navigate = useNavigate();
  const [id, setId] = useState('')
  const handleTracking = (e) => {
    e.preventDefault();
    localStorage.setItem('track',id);
    navigate('/tracking')
  }
  return (
    <div className={`absolute inset-0 z-20 flex justify-center items-center overflow-hidden transition-all duration-1000 ${track?"w-full":"w-0"} `}>
      {/* <TrackInfo/> */}
      <div className="w-full min-w-[320px] sm:w-[600px] relative bg-red-100 rounded-xl flex flex-col items-center space-y-5 p-8  text-black sm:min-w-[600px]">
        <div onClick={()=>setTrack(0)} className="absolute top-5 right-5 text-2xl font-medium">
            X
        </div>
        <img src="logo.webp" alt="" />
        <div className="text-lg sm:text-2xl font-medium my-3">
            TRACK YOUR ORDER NOW
        </div>
        {/* <div className="flex justify-evenly w-[200px] font-medium">
            <div className="space-x-2">
            <input checked type="radio" id="awb" name="idType" />
            <label htmlFor="awb">AWB</label>
            </div>
            <div className="space-x-2">
            <input type="radio" id="orderId" name="idType"/>
            <label htmlFor="orderId">OrderId</label>
            </div>
        </div> */}
        <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0" onSubmit={handleTracking}>
            <input type="text" name="id" value={id} onChange={(e)=>setId(e.target.value)} className="border py-2 px-4 sm:rounded-l-xl bg-red-50" placeholder="Enter Tracking Id" />
            <button className="border py-2 px-4 sm:rounded-r-xl bg-red-50" type="submit">Track</button>
        </form>
      </div>
    </div>
  )
}

export default Track
