import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import updateWarehouseService from "../services/warehouseServices/updateWarehouseService";
import { jwtDecode } from "jwt-decode";
import { FaEye } from "react-icons/fa";
const API_URL = import.meta.env.VITE_APP_API_URL
const AddForm = ({ setMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    international_address: "",
    pin: "",
    city: "",
    state: "",
    country: "India",
    username: localStorage.getItem("username"),
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize pin to digits-only and max length 6
    if (name === 'pin') {
      const digits = (value || '').replace(/\D/g, '').slice(0, 6);
      setFormData((prevData) => ({ ...prevData, pin: digits }));
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'international_address' ? (value || '').replace(/[^A-Za-z0-9\s,.\-'/]/g, '') : value,
    }));
  };

  // Auto-complete city/state based on 6-digit pincode
  useEffect(() => {
    const fillCityState = async () => {
      try {
        const resp = await fetch(`https://api.postalpincode.in/pincode/${formData.pin}`);
        const data = await resp.json();
        const status = data?.[0]?.Status;
        const office = data?.[0]?.PostOffice?.[0];
        if (status === 'Success' && office) {
          const city = office.District || '';
          const state = office.State || '';
          setFormData((prev) => ({ ...prev, city, state }));
        } else {
          setFormData((prev) => ({ ...prev, city: '', state: '' }));
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, city: '', state: '' }));
      }
    };
    if ((formData.pin || '').length === 6) fillCityState();
  }, [formData.pin]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validatedFormData = {
      name : formData.name.trim(),
      phone : formData.phone.trim(),
      email : formData.email.trim(),
      address : formData.address.trim(),
      internationalAddress: (formData.international_address || "").replace(/[^A-Za-z0-9\s,.\-'/]/g, '').trim(),
      pin : formData.pin.trim(),
      city : formData.city.trim(),
      state : formData.state.trim(),
      country : formData.country.trim()
    }
    if (validatedFormData.phone.length !== 10) {alert("Please enter phone number with 10 digits"); return; }
    if (validatedFormData.pin.length !== 6) {alert("Please enter pincode with 6 digits"); return; }
    fetch(`${API_URL}/warehouse/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        'Authorization': localStorage.getItem("token"),
      },
      body: JSON.stringify(validatedFormData),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert("Creating Warehouse...");
          setMode(0);
        } else {
          alert(result.message);
        }
      })
      .catch((error) => alert(error.message));
  };
  return (
    <>
      <div
        className={`w-full p-4 flex flex-col items-center space-y-6`}
      >
        <div className="w-[728px] h-16 px-4  relative flex">
          <div className="text-2xl font-medium">ADD WAREHOUSE</div>
          <div
            onClick={(e) => {
              e.preventDefault();
              setMode(0);
            }}
            className="px-5 py-1 bg-red-500 absolute rounded text-white  right-4"
          >
            X
          </div>
        </div>
        <form
          action=""
          className="flex flex-col space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="name">Warehouse Name*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="name"
                name="name"
                maxLength={36}
                placeholder="Warehouse Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="phone">Mobile Number*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="phone"
                name="phone"
                minLength={10}
                maxLength={10}
                placeholder="Ex. 1234567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="email">Email*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="email"
                name="email"
                placeholder="Ex. merchant123@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="address">Address (For Domestic Shipments)*</label>
            <input required
              className="w-full border py-2 px-4 rounded"
              type="text"
              maxLength={100}
              id="address"
              name="address"
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
            <label htmlFor="international_address">Address (For International Shipments)</label>
            <input
              className="w-full border py-2 px-4 rounded"
              type="text"
              id="international_address"
              name="international_address"
              maxLength={60}
              placeholder="Allowed symbols are , . - ' /"
              value={formData.international_address}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); return; }
                // Block only characters NOT in the allowed set; let allowed ones pass
                if (e.key && e.key.length === 1 && /[^A-Za-z0-9\s,.\-'/]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="pin">Pincode*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="pin"
                name="pin"
                minLength={6}
                maxLength={6}
                placeholder="Enter Pincode"
                value={formData.pin}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyDown={(e) => {
                  const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
                  if (allowed.includes(e.key)) return;
                  if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="city">City*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="city"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2 flex flex-col justify-center">
              <label htmlFor="state">State*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="state"
                name="state"
                placeholder="Enter State"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="country">Country*</label>
              <input required
                className="w-full border py-2 px-4 rounded"
                type="text"
                id="country"
                name="country"
                placeholder="Enter Country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* <div className="flex-1 mx-2 mb-2 min-w-[300px] flex justify-center space-x-3">
            <input
                className=" border py-2 px-4 rounded"
                type="checkbox"
                id="same"
                name="same"
                value={formData.same}
                onChange={handleChange}
              />
              <label htmlFor="same">Return address is same as Pickup address</label>
              
            </div> */}
          <button
            type="submit"
            className="border bg-white mx-2  py-2 px-4 rounded"
          >
            Create Warehouse
          </button>
        </form>
      </div>
    </>
  );
};

const ManageForm = ({ isManage, setIsManage, name, address, pin, phone, city, state, wid, international_address }) => {
  const [formData, setFormData] = useState({
    name: name,
    phone: phone,
    address: address,
    international_address: international_address,
    pin: pin,
    city: city,
    state: state,
    country: "India"
  });
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const cleaned = (formData.international_address || "").replace(/[^A-Za-z0-9\s,.\-'/]/g, '').trim();
  await updateWarehouseService(wid, { internationalAddress: cleaned });
      alert("Warehouse updated successfully");
      setIsManage(0);
    } catch (err) {
      alert(err?.message || "Failed to update warehouse");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <div
        className={`fixed inset-0 bg-[rgba(0,0,0,0.4)] z-20 w-full p-4 flex flex-col items-center justify-center ${isManage ? "" : "hidden"
          }`}
      >
       <div className="p-4 bg-white rounded-lg max-h-[95%] overflow-y-auto">
       <div className="w-full md:w-[600px] h-16 px-4  relative flex">
          <div className="text-2xl font-medium">WAREHOUSE</div>
          <div
            onClick={(e) => {
              e.preventDefault();
              setIsManage(0);
            }}
            className="px-5 py-1 bg-red-500 absolute rounded text-white  right-4"
          >
            X
          </div>
        </div>
        <form
          action=""
          className="flex flex-col"
        >
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[300px] space-y-2">
              <label htmlFor="name">Warehouse Name</label>
              <TextField
                size={'small'}
                className="w-full border py-2 px-4 rounded"
                type="text"
                value={formData.name}
                InputProps={{ readOnly: true }}
              />
            </div>
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
              <label htmlFor="phone">Mobile Number</label>
              <TextField
                size={'small'}
                className="w-full border py-2 px-4 rounded"
                value={formData.phone}
                InputProps={{ readOnly: true }}
              />
            </div>
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
            <label htmlFor="address">Address (For Domestic Shipments)</label>
            <TextField
              size="small"
              className="w-full border py-2 px-4 rounded"
              type="text"
              value={formData.address}
              InputProps={{ readOnly: true, maxLength: 100 }}
            />
          </div>
          {/* Editable International Address */}
          <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
            <label htmlFor="international_address">Address (For International Shipments)</label>
            <TextField
              id="international_address"
              size="small"
              className="w-full border py-2 px-4 rounded"
              type="text"
              value={formData.international_address}
              onChange={(e) => {
                const raw = e.target.value || '';
                const cleaned = raw.replace(/[^A-Za-z0-9\s,.\-'/]/g, '');
                setFormData((prev) => ({...prev, international_address: cleaned}));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); return; }
                // Block only characters NOT in the allowed set; let allowed ones pass
                if (e.key && e.key.length === 1 && /[^A-Za-z0-9\s,.\-'/]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Allowed symbols are , . - ' /"
              inputProps={{ maxLength: 60 }}
            />
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
            <label htmlFor="state">City</label>
            <TextField
              size="small"
              className="w-full border py-2 px-4 rounded"
              type="text"
              value={formData.city}
              InputProps={{ readOnly: true }}
            />
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
            <label htmlFor="address">State</label>
            <TextField
              size="small"
              className="w-full border py-2 px-4 rounded"
              type="text"
              value={formData.state}
              InputProps={{ readOnly: true }}
            />
          </div>
          <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
            <label htmlFor="address">Country</label>
            <TextField
              size="small"
              className="w-full border py-2 px-4 rounded"
              type="text"
              value={formData.country}
              InputProps={{ readOnly: true }}
            />
          </div>
          <div className="w-full flex mb-2 flex-wrap ">
            <div className="flex-1 mx-2 mb-2 min-w-[280px] space-y-2">
              <label htmlFor="pin">Pincode</label>
              <TextField
                size="small"
                className="w-full border py-2 px-4"
                type="text"
                value={formData.pin}
                InputProps={{ readOnly: true }}
              />
            </div>
          </div>
          <div className="w-full flex justify-end px-2 mt-2">
            <button
              type="button"
              className="border bg-red-600 text-white mx-2 py-2 px-4 rounded disabled:opacity-60"
              onClick={saving ? () => {} : handleUpdate}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
       </div>
      </div>
    </>
  );
};

const WarehouseServiceCard = ({ name, id, isCreated }) => {
  return (
    <>
      <div className="text-center bg-gray-600 rounded-lg py-3 px-3 font-bold text-white">
        {name}<br />{isCreated ? <p className="text-green-400">Warehouse Online</p> : <p className="text-red-500">Failed to Create Warehouse</p>}
      </div>
    </>
  )
}

const WarehouseServiceList = ({ wid, setCheckWarehouse }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allSuccess, setAllSuccess] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryWarehouseCreation = async () => {
    setIsRetrying(true);
    const retryRequest = await fetch(`${API_URL}/warehouse/create/retry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": localStorage.getItem("token"),
      },
      body: JSON.stringify({ wid })
    })
    const retryResponse = await retryRequest.json();
    if (retryResponse.success) {
      setAllSuccess(retryResponse.all_created);
      setServices(retryResponse.response)
    }
    setIsRetrying(false)
  }
  useEffect(() => {
    const getServices = async () => {
      const checkWarehouse = await fetch(`${API_URL}/warehouse/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": localStorage.getItem("token"),
        },
        body: JSON.stringify({ wid }),
      })
        .then((response) => response.json())
        .catch((error) => console.error(error));
      setServices(checkWarehouse.response);
      setAllSuccess(checkWarehouse.all_created)
      setIsLoading(false);
    };
    getServices();
  }, [wid]);
  return (
    <>
      <div className="w-full relative pt-6">
        <div
          className="absolute top-3 right-3 w-9 h-6 bg-slate-600 text-white flex justify-center items-center rounded-lg"
          onClick={() => setCheckWarehouse(false)}
        >
          X
        </div>
        {!allSuccess ? <div className="flex items-center bg-yellow-500 px-3 justify-center">
          <div>Warehouse failed to create on some services</div>
          <div onClick={isRetrying ? () => { } : () => { retryWarehouseCreation() }} className="p-3 bg-yellow-500 font-bold">{isRetrying ? "Creating..." : "Retry"}</div>
        </div> : ""}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {(services && services.length) ? services.map((service, index) => (
            <WarehouseServiceCard key={index} name={service.service_name} id={service.service_id} isCreated={service.warehouse_created} />
          )) : isLoading ? "Loading..." : "Something went wrong while fetching services"}
        </div>
      </div>
    </>
  )
}

const Card = ({ name, address, pin, phone, wid, justCreated, state, city, international_address }) => {
  const [isManage, setIsManage] = useState(false);
  const [checkWarehouse, setCheckWarehouse] = useState(justCreated ? true : false);
  useEffect(() => {
    const seenJustCreated = async () => {
      await fetch(`${API_URL}/warehouse/new/seen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": localStorage.getItem("token"),
        },
        body: JSON.stringify({ wid }),
      })
        .then((response) => response.json())
        .catch((error) => console.error(error))
    }
    if (justCreated) {
      seenJustCreated();
    }
  }, [])
  return (
    <>
  <ManageForm isManage={isManage} setIsManage={setIsManage} name={name} address={address} pin={pin} phone={phone} wid={wid} state={state} city={city} international_address={international_address} />
      <div className="w-full h-16 bg-white relative items-center px-8 flex border-b">
        <div>{name}</div>
        <div className="absolute right-8 flex space-x-2 items-center">
          
          <div className="cursor-pointer py-1 px-2 rounded-lg bg-red-500 text-white" onClick={() => setCheckWarehouse(true)}>Check</div>
          <div className="cursor-pointer p-2 rounded-lg bg-red-500 text-white" onClick={() => setIsManage(true)}><FaEye/></div>
        </div>
      </div>
      {checkWarehouse ? <WarehouseServiceList wid={wid} setCheckWarehouse={setCheckWarehouse} /> : null}
    </>
  );
};

const Listing = ({ setMode }) => {
  const [warehouses, setWarehouses] = useState([]);
  useEffect(() => {
    const getWarehouses = async () => {
      const response = await fetch(`${API_URL}/warehouse/warehouses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .catch((error) => console.error(error));
      const rows = response.rows;
      setWarehouses(rows);
    };
    getWarehouses();
  }, []);
  return (
    <>
      <div
        className={`w-full p-4 flex flex-col items-center space-y-6`}
      >
        <div className="w-full h-16 px-4  relative flex">
          <div className="text-2xl font-medium">WAREHOUSES</div>
          <div
            onClick={(e) => {
              e.preventDefault();
              setMode(1);
            }}
            className="px-5 py-1 bg-red-500 absolute rounded text-white  right-4"
          >
            Add
          </div>
        </div>
        <div className="w-full">
          {warehouses.map((warehouse, index) => (
            <Card 
              name={warehouse.warehouseName} 
              address={warehouse.address} 
              phone={warehouse.phone} 
              pin={warehouse.pin} 
              wid={warehouse.wid} 
              justCreated={warehouse.just_created}
              state={warehouse.state}
              city={warehouse.city}
              international_address={warehouse.international_address}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const Warehouse = () => {
  const [mode, setMode] = useState(0);
  return (
    <>
      <div className=" py-16 w-full h-full flex flex-col items-center overflow-x-hidden overflow-y-auto">
        {mode == 0 ? <Listing setMode={setMode} /> : <AddForm setMode={setMode} />}
      </div>
    </>
  );
};

export default Warehouse;
