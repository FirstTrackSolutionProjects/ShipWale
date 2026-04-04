const API_URL = import.meta.env.VITE_APP_API_URL;

const acceptSubmerchantRequestService = async (requestId, options = {}) => {
	try {
		if (!requestId) throw new Error('Request ID is required');

		const url = `${API_URL}/submerchants/requests/${requestId}/accept`;
		const response = await fetch(url, {
			method: 'PATCH',
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
			throw new Error(data?.message || 'Failed to accept submerchant request');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to accept submerchant request');
		}

		return data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default acceptSubmerchantRequestService;
