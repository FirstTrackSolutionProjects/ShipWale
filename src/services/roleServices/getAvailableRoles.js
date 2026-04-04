const API_URL = import.meta.env.VITE_APP_API_URL;

const getAvailableRoles = async () => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'GET',
    headers: {
      Authorization: localStorage.getItem('token'),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to fetch roles');
  }

  const data = await response.json();
  return data?.data ?? [];
};

export default getAvailableRoles;
