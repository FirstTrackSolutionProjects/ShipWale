import { useContext, useEffect, useState } from "react";
import CreateWeightDisputePopup from "./CreateWeightDisputePopup";
import ViewWeightDisputePopup from "./ViewWeightDisputePopup";
import { AuthContext } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_APP_API_URL

const Card = ({ report }) => {


  const [view, setIsView] = useState(false)
  const toggleView = () => {
    setIsView((prev) => !prev)
  }
  return (
    <>
      <ViewWeightDisputePopup open={view} onClose={toggleView} disputeId={report?.dispute_id} />
      <div className="w-full h-24 bg-white relative items-center px-4 sm:px-8 flex border-b">
        <div>
          <div className="text-sm font-bold">
            {report.ord_id}
          </div>
          <div className="text-[10px] text-gray-500">
            {report.created_at ? report.created_at.toString().split('T')[0] + ' ' + report.created_at.toString().split('T')[1].split('.')[0] : null}
          </div>
        </div>
        <div className="absolute right-4 sm:right-8 flex items-center space-x-2">
          <div className={`${report.dispute_deduction >= 0 ? 'text-red-500' : 'text-green-500'} font-bold`}>{report.dispute_deduction >= 0 ? '-':''}₹{report.dispute_deduction}</div>
          <div className="px-3 py-1 bg-red-500  rounded-3xl text-white cursor-pointer" onClick={() => setIsView(true)}>View</div>
        </div>
      </div>
    </>
  );
};

const Listing = () => {
  const [reports, setReports] = useState([])
  const {admin} = useContext(AuthContext);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    orderId: ""
  });
  const [openCreateDisputePopup, setOpenCreateDisputePopup]= useState(false);
  const toggleCreateDisputePopup = () => {
    setOpenCreateDisputePopup((prev) => !prev);
  }
  useEffect(() => {

    fetch(`${API_URL}/weight-disputes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          result.data.sort((a, b) => parseInt(a.dispute_id) - parseInt(b.dispute_id)).reverse();
          setReports(result.data);
        } else {
          alert('Fetch failed: ' + result.message)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during fetching reports');
      });
  }, []);

  useEffect(() => {
    if (!reports.length) {
      return;
    }
    const filteredData = reports.filter((report) => {
      return (
        (filters.orderId === "" || (report.ord_id.toLowerCase() == filters.orderId.toLowerCase()))
      );
    });
    setFilteredReports(filteredData)
  }, [reports, filters])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  }
  return (
    <>
      <div
        className={`w-full p-4 flex flex-col items-center space-y-6`}
      >
        <div className="w-full h-16 px-4  relative flex justify-between">
          <div className="text-2xl font-medium">WEIGHT DISPUTES</div>
          {admin ? <div><button type='button' onClick={toggleCreateDisputePopup} className="mx-2 px-5 py-1 border rounded-3xl bg-red-500 text-white">Create</button></div> : null}
        </div>

        <details className="w-full p-2 bg-red-500 rounded-xl text-white">
          <summary>Filters</summary>
          <div className="grid space-y-2 lg:grid-rows-1 lg:grid-cols-4 lg:space-y-0 lg:space-x-4 p-2 rounded-xl w-full bg-red-500 text-black justify-evenly">
            <input
              className="p-1 rounded-xl bg-white"
              type="text"
              name="orderId"
              placeholder="Order Id"
              value={filters.orderId}
              onChange={handleChange}
            />
          </div>
        </details>
        <div className="w-full">

          {filteredReports.length ? filteredReports.map((report, index) => (
            <Card key={index} report={report} />
          )): <div className="w-full text-center">Hurray! No Disputes Found!</div>}
        </div>
      </div>
      <CreateWeightDisputePopup open={openCreateDisputePopup} onClose={toggleCreateDisputePopup} />
    </>
  );
};
const WeightDisputes = () => {
  return (
    <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
      <Listing />
    </div>
  )
}

export default WeightDisputes
