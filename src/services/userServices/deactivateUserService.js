
const API_URL = import.meta.env.VITE_APP_API_URL;

const deactivateUserService = async (id) => {
	try {
		if (!id) {
			throw new Error('User id is required');
		}

		const response = await fetch(`${API_URL}/users/${id}/deactivate`, {
			method: 'PATCH',
			headers: {
				Authorization: localStorage.getItem('token'),
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});

		let data;
		try {
			data = await response.json();
		} catch {
			data = null;
		}

		if (!response.ok) {
			throw new Error(data?.message || 'Failed to deactivate user');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to deactivate user');
		}

		return data?.data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default deactivateUserService;

