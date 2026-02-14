const API_URL = import.meta.env.VITE_APP_API_URL;

const retryCreateWarehouseService = async (wid) => {
	try {
		const response = await fetch(`${API_URL}/warehouse/create/retry`, {
			method: 'POST',
			headers: {
				Authorization: localStorage.getItem('token'),
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ wid }),
		});

		let data;
		try {
			data = await response.json();
		} catch {
			data = null;
		}

		if (!response.ok) {
			throw new Error(data?.message || 'Failed to retry warehouse creation');
		}

		if (!data?.success) {
			throw new Error(data?.message || 'Failed to retry warehouse creation');
		}

		return data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default retryCreateWarehouseService;
