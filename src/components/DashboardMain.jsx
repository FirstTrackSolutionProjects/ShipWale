// import DashboardStatement from "./DashboardStatement"
// import AnnoucementCard from "./AnnoucementCard"
import DashboardSummary from "./DashboardSummary"
import Greeting from "./Greeting"
// import Profile from "./Profile"
// import RazorpayPayment from "./Razorpay"
const DashboardMain = () => {
  return (
    <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      {/* <Profile /> */}
      {/* <AnnoucementCard /> */}
      <Greeting />
      <DashboardSummary />
      {/* <DashboardStatement /> */}
      {/* <RazorpayPayment/> */}
    </div>
  )
}

export default DashboardMain
