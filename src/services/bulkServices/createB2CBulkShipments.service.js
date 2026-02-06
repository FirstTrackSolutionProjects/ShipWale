
const API_URL = import.meta.env.VITE_APP_API_URL

const createB2CBulkShipmentsService = async ({
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

        const response = await fetch(`${API_URL}/bulk/b2c/create`, {
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
            // If response body is not JSON, still return a structured object
            return {
                ok: response.ok,
                status: response.status,
                message: 'Something went wrong',
            };
        }

        // Always return the parsed response along with HTTP status flags so that
        // the caller can inspect successful and failed shipments, even when the
        // API reports partial or complete failures.
        return {
            ok: response.ok,
            status: response.status,
            ...data,
        };
    } catch (error) {
        console.error(error);
        throw error instanceof Error ? error : new Error("An unexpected error occurred");
    }
}

export default createB2CBulkShipmentsService;