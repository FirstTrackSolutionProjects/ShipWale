import getAllWarehouseService from "@/services/warehouseServices/getAllWarehousesService";
import { useState, useEffect } from "react";

const WarehouseSelect = ({ onChange, isInternational=false, value, userId }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [abortController, setAbortController] = useState(null);

  useEffect(() => {
      const timerId = setTimeout(() => {
        setDebouncedQuery(query);
      }, 500);
      return () => clearTimeout(timerId);
  }, [query]);

  const getFilteredWarehouses = async ({
    WAREHOUSE_NAME,
    WAREHOUSE_ID,
    USER_ID
  }) => {
    try{
      if (abortController) abortController.abort();
			const newController = new AbortController();
			setAbortController(newController);
      const d = await getAllWarehouseService({
        WAREHOUSE_NAME: WAREHOUSE_NAME || '',
        WAREHOUSE_ID: WAREHOUSE_ID || '',
        USER_ID: USER_ID || ''
      }, { signal: newController.signal });
      setWarehouses(d.data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching filtered warehouses:", error);
        setWarehouses([]);
      }
    }
  }

  useEffect(() => {
    if (open) {
      getFilteredWarehouses({
        WAREHOUSE_NAME: debouncedQuery,
        USER_ID: userId
      })
    }
  },[debouncedQuery, open])

  const selectItem = (warehouse) => {
    setSelected(warehouse);
    setOpen(false);
    
    onChange && onChange(String(warehouse?.WAREHOUSE_ID) ?? warehouse);
  };

  const setCurrentWarehouse = async ({
    WAREHOUSE_ID
  }) => {
    try {
      const d = await getAllWarehouseService({
        WAREHOUSE_ID: WAREHOUSE_ID || '',
        USER_ID: userId || ''
      });
      const warehouse = d.data[0];
      setSelected(warehouse);
    } catch (error) {
      console.error("Error fetching current warehouse:", error);
    }
  }

  useEffect(() => {
    if (value == null || value === "") {
      setSelected(null);
      return;
    }
    setCurrentWarehouse({ WAREHOUSE_ID: value });
  }, []);

  return (
    <div className="relative w-full">
      {/* Selected box */}
      <div
        className="border p-2 rounded cursor-pointer"
        onClick={() => { setOpen(!open); if (!open) setQuery(""); }}
      >
        {selected ? (
          <div>
            <p>{selected.WAREHOUSE_NAME}</p>
          </div>
        ) : (
          <span>Select warehouse...</span>
        )}
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute mt-1 w-full border bg-white rounded shadow-lg z-10 max-h-96 overflow-x-hidden overflow-y-auto">
          <div className="p-2 border-b sticky top-0 bg-white">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border px-2 py-1 rounded text-sm"
              placeholder="Search warehouse name..."
            />
          </div>
          {warehouses.map((w) => (
            <div
              key={w.WAREHOUSE_ID}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => selectItem(w)}
            >
              <p>{w.WAREHOUSE_NAME}</p>
              <p className="text-sm text-gray-500">{isInternational ? w.WAREHOUSE_INTERNATIONAL_ADDRESS : w.WAREHOUSE_ADDRESS}</p>
              <p className="text-sm text-gray-500">{w.WAREHOUSE_CITY}, {w.WAREHOUSE_STATE}, {w.WAREHOUSE_COUNTRY} - {w.WAREHOUSE_PINCODE}</p>
            </div>
          ))}
          {warehouses.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No warehouses match "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}

export default WarehouseSelect;