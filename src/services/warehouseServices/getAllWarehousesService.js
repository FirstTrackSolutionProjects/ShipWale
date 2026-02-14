

const API_URL = import.meta.env.VITE_APP_API_URL

const getAllWarehouseService = async (query, options = {}) => {
    try {
        const response = await fetch(`${API_URL}/warehouse?${new URLSearchParams(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            signal: options?.signal,
        });
        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.message || 'Failed to fetch warehouses');
        }

        if (data?.success === false) {
            throw new Error(data?.message || 'Failed to fetch warehouses');
        }

        return data?.data ?? data;
    } catch (error) {
        console.error(error);
        throw error instanceof Error ? error : new Error("An unexpected error occurred");
    }
}

export default getAllWarehouseService;