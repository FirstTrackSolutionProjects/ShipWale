
const API_URL = import.meta.env.VITE_APP_API_URL;

const updateSubmerchantMarginService = async ({ submerchant_id, margin } = {}, options = {}) => {
	try {
		if (!submerchant_id) {
			throw new Error('submerchant_id is required');
		}

		const url = `${API_URL}/merchant/submerchants/${submerchant_id}/margin`;
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: localStorage?.getItem('token'),
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			signal: options?.signal,
			body: JSON.stringify({ margin }),
		});

		let data;
		try {
			data = await response.json();
		} catch {
			data = null;
		}

		if (!response.ok) {
			throw new Error(data?.message || 'Failed to update submerchant margin');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to update submerchant margin');
		}

		return data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default updateSubmerchantMarginService;
