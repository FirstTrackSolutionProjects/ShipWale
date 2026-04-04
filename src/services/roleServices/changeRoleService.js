const API_URL = import.meta.env.VITE_APP_API_URL;

const changeRoleService = async (userRoleId) => {
  if (!userRoleId) throw new Error('userRoleId is required');

  const response = await fetch(`${API_URL}/roles/change/${userRoleId}`, {
    method: 'PATCH',
    headers: {
      Authorization: localStorage.getItem('token'),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to change role');
  }

  const data = await response.json();
  const token = data?.data?.data;
  if (!token) {
    throw new Error('Token not returned from change role');
  }
  return token;
};

export default changeRoleService;
