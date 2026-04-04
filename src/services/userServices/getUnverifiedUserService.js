
const API_URL = import.meta.env.VITE_APP_API_URL;

const getUnverifiedUserService = async (options = {}) => {
	try {
		const response = await fetch(`${API_URL}/users/unverified`, {
			method: 'GET',
			headers: {
				Authorization: localStorage.getItem('token'),
				'Content-Type': 'application/json',
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
			throw new Error(data?.message || 'Failed to fetch unverified users');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to fetch unverified users');
		}

		return data?.data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default getUnverifiedUserService;

