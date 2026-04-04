
const API_URL = import.meta.env.VITE_APP_API_URL;

const requestSubmerchantsService = async (body = {}, options = {}) => {
	try {
		const url = `${API_URL}/merchant/submerchants/request`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				"Authorization": localStorage?.getItem('token'),
                "Content-Type": 'application/json',
				"Accept": 'application/json',
			},
			signal: options?.signal,
			body: JSON.stringify(body),
		});

		let data;
		try {
			data = await response.json();
		} catch {
			data = null;
		}

		if (!response.ok) {
			throw new Error(data?.message || 'Failed to request submerchant');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to request submerchant');
		}

		return data?.data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default requestSubmerchantsService;