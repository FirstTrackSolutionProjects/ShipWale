
const API_URL = import.meta.env.VITE_APP_API_URL;

const checkUserExistsByEmailService = async (body = {}, options = {}) => {
	try {
		const url = `${API_URL}/users/exists`;
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
			throw new Error(data?.message || 'Failed to check user existence');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to check user existence');
		}

		return Boolean(data?.data?.exists);
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default checkUserExistsByEmailService;