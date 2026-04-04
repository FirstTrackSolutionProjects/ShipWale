
const API_URL = import.meta.env.VITE_APP_API_URL;

const getVerifiedUserByUserRoleIdService = async (query = {}, options = {}) => {
	try {
		const url = `${API_URL}/users/verified/${query.user_role_id}`;
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
			throw new Error(data?.message || 'Failed to fetch verified user');
		}

		if (data?.success === false) {
			throw new Error(data?.message || 'Failed to fetch verified user');
		}

		return data?.data;
	} catch (error) {
		console.error(error);
		throw error instanceof Error ? error : new Error('An unexpected error occurred');
	}
};

export default getVerifiedUserByUserRoleIdService;