
const API_URL = import.meta.env.VITE_APP_API_URL

const getB2CBulkShipmentPriceService = async ({
    bulkShipmentsData,
    serviceId,
    vendorId
}) => {
    try {
        if (!bulkShipmentsData || !Array.isArray(bulkShipmentsData) || bulkShipmentsData.length === 0) {
            throw new Error("Invalid shipment data");
        }
        if (!serviceId) {
            throw new Error("Service ID is required");
        }
        const response = await fetch(`${API_URL}/bulk/b2c/get-price`, {
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bulkShipmentsData,
                serviceId,
                vendorId
            }),
        });
        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error("Something went wrong");
        }

        if (!data?.success) {
            throw new Error(data?.message);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error instanceof Error ? error : new Error("An unexpected error occurred");
    }
}

export default getB2CBulkShipmentPriceService;