const API_URL = import.meta.env.VITE_APP_API_URL;

const getSubmerchantRequestsService = async (options = {}) => {
	try {
		const url = `${API_URL}/submerchants/requests`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: localStorage?.getItem('token'),
				Accept: 'application/json',
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
			throw new Error(data?.message || 'Failed to fetch submerchant requests');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to fetch submerchant requests');
		}

		return data?.data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default getSubmerchantRequestsService;
